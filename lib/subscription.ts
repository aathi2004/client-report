import { SubscriptionTier } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export type TierLimits = {
  maxClients: number;
  maxReportsPerMonth: number;
  scheduledReports: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
};

export const UNLIMITED = Number.POSITIVE_INFINITY;

export const TIERS: Record<
  SubscriptionTier,
  {
    name: string;
    priceMonthly: number;
    description: string;
    limits: TierLimits;
    features: string[];
  }
> = {
  FREE: {
    name: 'Free',
    priceMonthly: 0,
    description: 'Get started with reporting for a few clients.',
    limits: {
      maxClients: 3,
      maxReportsPerMonth: 10,
      scheduledReports: false,
      customBranding: false,
      apiAccess: false,
      whiteLabel: false,
    },
    features: [
      'Up to 3 clients',
      'Up to 10 reports per month',
      'Email delivery only',
      'Standard templates',
    ],
  },
  PRO: {
    name: 'Pro',
    priceMonthly: 49,
    description: 'For growing agencies that need automation.',
    limits: {
      maxClients: 20,
      maxReportsPerMonth: UNLIMITED,
      scheduledReports: true,
      customBranding: true,
      apiAccess: false,
      whiteLabel: false,
    },
    features: [
      'Up to 20 clients',
      'Unlimited reports',
      'Scheduled reports',
      'Custom branding',
    ],
  },
  BUSINESS: {
    name: 'Business',
    priceMonthly: 99,
    description: 'Scale without limits, with full white-label and API access.',
    limits: {
      maxClients: UNLIMITED,
      maxReportsPerMonth: UNLIMITED,
      scheduledReports: true,
      customBranding: true,
      apiAccess: true,
      whiteLabel: true,
    },
    features: [
      'Unlimited clients',
      'Unlimited reports',
      'API access',
      'Full white-label',
    ],
  },
};

export function getLimits(tier: SubscriptionTier): TierLimits {
  return TIERS[tier].limits;
}

export function isUnlimited(value: number): boolean {
  return value === UNLIMITED;
}

export type ClientLimitCheck =
  | { ok: true; used: number; limit: number }
  | { ok: false; used: number; limit: number; reason: string };

export async function checkClientLimit(
  userId: string,
  tier: SubscriptionTier,
): Promise<ClientLimitCheck> {
  const { maxClients } = getLimits(tier);
  const used = await prisma.client.count({ where: { userId } });
  if (used >= maxClients) {
    return {
      ok: false,
      used,
      limit: maxClients,
      reason: `You've reached your ${TIERS[tier].name} plan limit of ${maxClients} clients.`,
    };
  }
  return { ok: true, used, limit: maxClients };
}

export type ReportLimitCheck =
  | { ok: true; used: number; limit: number }
  | { ok: false; used: number; limit: number; reason: string };

export async function checkReportLimit(
  userId: string,
  tier: SubscriptionTier,
): Promise<ReportLimitCheck> {
  const { maxReportsPerMonth } = getLimits(tier);
  if (isUnlimited(maxReportsPerMonth)) {
    return { ok: true, used: 0, limit: maxReportsPerMonth };
  }
  const since = new Date();
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);
  const used = await prisma.report.count({
    where: { userId, createdAt: { gte: since } },
  });
  if (used >= maxReportsPerMonth) {
    return {
      ok: false,
      used,
      limit: maxReportsPerMonth,
      reason: `You've reached your ${TIERS[tier].name} plan limit of ${maxReportsPerMonth} reports this month.`,
    };
  }
  return { ok: true, used, limit: maxReportsPerMonth };
}

export function canUseFeature(
  tier: SubscriptionTier,
  feature: keyof Omit<TierLimits, 'maxClients' | 'maxReportsPerMonth'>,
): boolean {
  return getLimits(tier)[feature] === true;
}
