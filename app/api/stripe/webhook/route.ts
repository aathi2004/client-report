import { NextResponse } from 'next/server';

import Stripe from 'stripe';

import { SubscriptionTier } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!stripe) {
    console.error('[stripe/webhook] STRIPE_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[stripe/webhook] ${event.id} ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      default:
        // ignore other events
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] ${event.id} handler failed for ${event.type}:`, err);
    // Return 500 so Stripe retries — handlers are idempotent.
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as SubscriptionTier | undefined;
  if (!userId || (tier !== 'PRO' && tier !== 'BUSINESS')) {
    console.warn(
      `[stripe/webhook] ${event.id} checkout.session.completed missing/invalid metadata`,
      { sessionId: session.id, metadata: session.metadata },
    );
    return;
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  let periodEnd: Date | null = null;
  if (subscriptionId && stripe) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    periodEnd = subscriptionPeriodEnd(sub);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeCurrentPeriodEnd: periodEnd,
    },
  });

  console.log(
    `[stripe/webhook] ${event.id} upgraded user ${userId} to ${tier}` +
      (periodEnd ? ` (renews ${periodEnd.toISOString()})` : ''),
  );
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) {
    console.warn(
      `[stripe/webhook] ${event.id} subscription.updated for unknown customer ${customerId}`,
    );
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  let tier: SubscriptionTier | undefined;
  if (priceId === process.env.STRIPE_PRICE_PRO) tier = 'PRO';
  else if (priceId === process.env.STRIPE_PRICE_BUSINESS) tier = 'BUSINESS';

  // If Stripe marks the subscription as canceled or past_due-then-canceled, treat as deletion.
  const isTerminal = sub.status === 'canceled' || sub.status === 'unpaid';

  await prisma.user.update({
    where: { id: user.id },
    data: isTerminal
      ? {
          subscriptionTier: 'FREE',
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
        }
      : {
          ...(tier ? { subscriptionTier: tier } : {}),
          stripeSubscriptionId: sub.id,
          stripeCurrentPeriodEnd: subscriptionPeriodEnd(sub),
        },
  });

  console.log(
    `[stripe/webhook] ${event.id} subscription.updated user=${user.id} status=${sub.status}` +
      (tier ? ` tier=${tier}` : '') +
      (isTerminal ? ' → downgraded to FREE' : ''),
  );
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const sub = event.data.object as Stripe.Subscription;
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) {
    console.warn(
      `[stripe/webhook] ${event.id} subscription.deleted for unknown customer ${customerId}`,
    );
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'FREE',
      stripeSubscriptionId: null,
      stripeCurrentPeriodEnd: null,
    },
  });

  console.log(`[stripe/webhook] ${event.id} subscription.deleted user=${user.id} → FREE`);
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) {
    console.warn(
      `[stripe/webhook] ${event.id} invoice.payment_failed for unknown customer ${customerId}`,
    );
    return;
  }

  console.warn(
    `[stripe/webhook] ${event.id} invoice.payment_failed user=${user.id}` +
      ` invoice=${invoice.id} amount_due=${invoice.amount_due} attempt=${invoice.attempt_count}`,
  );

  // Stripe will retry the invoice automatically; if it ultimately fails the
  // subscription transitions to `unpaid`/`canceled` and we'll downgrade via
  // customer.subscription.updated/deleted. No DB change needed here yet —
  // hook this up to an email notifier when ready.
}

// In Stripe API 2025+, `current_period_end` was moved from Subscription to
// SubscriptionItem. Read from the first item with a fallback for older API versions.
function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const fromItem = sub.items?.data?.[0]?.current_period_end;
  if (typeof fromItem === 'number' && fromItem > 0) {
    return new Date(fromItem * 1000);
  }
  // Fallback for older Stripe API versions that still expose it on the subscription.
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof legacy === 'number' && legacy > 0) {
    return new Date(legacy * 1000);
  }
  return null;
}
