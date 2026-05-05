import Stripe from 'stripe';

import { SubscriptionTier } from '@prisma/client';

const apiKey = process.env.STRIPE_SECRET_KEY;

export const stripe = apiKey ? new Stripe(apiKey) : null;

export const STRIPE_PRICE_IDS: Partial<Record<SubscriptionTier, string | undefined>> = {
  PRO: process.env.STRIPE_PRICE_PRO,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
};

export function getPriceIdForTier(tier: SubscriptionTier): string | undefined {
  return STRIPE_PRICE_IDS[tier];
}
