import { NextResponse } from 'next/server';

import Stripe from 'stripe';

import { SubscriptionTier } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPriceIdForTier, stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!stripe) {
      console.error('[stripe/checkout] STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in .env.' },
        { status: 500 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { tier?: SubscriptionTier };
    const tier = body.tier;
    if (tier !== 'PRO' && tier !== 'BUSINESS') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = getPriceIdForTier(tier);
    if (!priceId) {
      console.error(`[stripe/checkout] Missing STRIPE_PRICE_${tier} env var`);
      return NextResponse.json(
        { error: `Missing STRIPE_PRICE_${tier} env var.` },
        { status: 500 },
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let customerId = await resolveCustomerId(dbUser.id, dbUser.stripeCustomerId);

    const origin =
      req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ...(customerId
        ? { customer: customerId }
        : { customer_email: dbUser.email }),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
      metadata: { userId: dbUser.id, tier },
      subscription_data: {
        metadata: { userId: dbUser.id, tier },
      },
    });

    if (!session.url) {
      console.error('[stripe/checkout] Stripe returned a session without a URL', session.id);
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[stripe/checkout] Stripe error:', {
        type: err.type,
        code: err.code,
        statusCode: err.statusCode,
        message: err.message,
      });
      return NextResponse.json(
        { error: err.message, code: err.code ?? err.type },
        { status: err.statusCode ?? 500 },
      );
    }
    console.error('[stripe/checkout] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong starting checkout.' },
      { status: 500 },
    );
  }
}

async function resolveCustomerId(
  userId: string,
  storedId: string | null,
): Promise<string | null> {
  if (!stripe || !storedId) return null;
  try {
    const customer = await stripe.customers.retrieve(storedId);
    if ('deleted' in customer && customer.deleted) {
      await clearCustomerId(userId, storedId, 'deleted');
      return null;
    }
    return storedId;
  } catch (err) {
    if (
      err instanceof Stripe.errors.StripeError &&
      (err.code === 'resource_missing' || err.statusCode === 404)
    ) {
      await clearCustomerId(userId, storedId, 'missing');
      return null;
    }
    throw err;
  }
}

async function clearCustomerId(userId: string, oldId: string, reason: string) {
  console.warn(`[stripe/checkout] clearing stale customer ${oldId} (${reason}) for user ${userId}`);
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: null, stripeSubscriptionId: null, stripeCurrentPeriodEnd: null },
  });
}
