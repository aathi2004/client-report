import { NextResponse } from 'next/server';

import Stripe from 'stripe';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!stripe) {
      console.error('[stripe/portal] STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 },
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer on file.' }, { status: 400 });
    }

    const origin =
      req.headers.get('origin') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[stripe/portal] Stripe error:', {
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
    console.error('[stripe/portal] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong opening the billing portal.' },
      { status: 500 },
    );
  }
}
