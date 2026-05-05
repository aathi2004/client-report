import Link from 'next/link';

import { SubscriptionTier } from '@prisma/client';

import { PortalButton } from '@/components/billing/PortalButton';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { ApiKeysPanel } from '@/components/settings/ApiKeysPanel';
import { BrandingPanel } from '@/components/settings/BrandingPanel';
import { FeatureLock } from '@/components/settings/FeatureLock';
import { NotificationsPanel } from '@/components/settings/NotificationsPanel';
import { ProfilePanel } from '@/components/settings/ProfilePanel';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TIERS, canUseFeature, getLimits, isUnlimited } from '@/lib/subscription';

const TABS = ['profile', 'billing', 'branding', 'api-keys', 'notifications'] as const;
type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { label: string; lockedFor?: SubscriptionTier[] }> = {
  profile: { label: 'Profile' },
  billing: { label: 'Billing' },
  branding: { label: 'Branding', lockedFor: ['FREE'] },
  'api-keys': { label: 'API Keys', lockedFor: ['FREE', 'PRO'] },
  notifications: { label: 'Notifications' },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const tab: Tab = TABS.includes(params.tab as Tab) ? (params.tab as Tab) : 'profile';

  const [dbUser, agency, apiKeys] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        notificationPrefs: true,
        stripeCustomerId: true,
        stripeCurrentPeriodEnd: true,
      },
    }),
    prisma.agency.findUnique({ where: { userId: user.id } }),
    prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        lastFour: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
      },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage your account, billing, and integrations.
          </p>
        </div>

        <nav className="mt-6 flex flex-wrap gap-1 border-b border-zinc-200">
          {TABS.map((t) => {
            const meta = TAB_META[t];
            const isLocked = meta.lockedFor?.includes(user.subscriptionTier) ?? false;
            const isActive = tab === t;
            return (
              <Link
                key={t}
                href={`/settings?tab=${t}`}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {meta.label}
                {isLocked ? (
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true">
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M10 1a4 4 0 00-4 4v3H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          {tab === 'profile' && (
            <ProfilePanel user={{ name: dbUser?.name ?? null, email: dbUser?.email ?? '' }} />
          )}

          {tab === 'billing' && (
            <BillingTab
              tier={user.subscriptionTier}
              hasStripeCustomer={Boolean(dbUser?.stripeCustomerId)}
              renewsAt={dbUser?.stripeCurrentPeriodEnd ?? null}
              userId={user.id}
            />
          )}

          {tab === 'branding' &&
            (canUseFeature(user.subscriptionTier, 'customBranding') ? (
              <BrandingPanel
                agency={{
                  name: agency?.name ?? user.name ?? '',
                  logo: agency?.logo ?? null,
                  brandColor: agency?.brandColor ?? null,
                }}
              />
            ) : (
              <FeatureLock
                title="Custom branding is a Pro feature"
                description="Upload your agency logo, set a brand color, and ship reports with your name on them."
                requiredTier="PRO"
              />
            ))}

          {tab === 'api-keys' &&
            (canUseFeature(user.subscriptionTier, 'apiAccess') ? (
              <ApiKeysPanel
                apiKeys={apiKeys.map((k) => ({
                  ...k,
                  createdAt: k.createdAt,
                  lastUsedAt: k.lastUsedAt,
                  revokedAt: k.revokedAt,
                }))}
              />
            ) : (
              <FeatureLock
                title="API access is a Business feature"
                description="Generate API keys to integrate Client Reporting with your own tools, dashboards, or automations."
                requiredTier="BUSINESS"
              />
            ))}

          {tab === 'notifications' && (
            <NotificationsPanel
              initial={parsePrefs(dbUser?.notificationPrefs)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

async function BillingTab({
  tier,
  hasStripeCustomer,
  renewsAt,
  userId,
}: {
  tier: SubscriptionTier;
  hasStripeCustomer: boolean;
  renewsAt: Date | null;
  userId: string;
}) {
  const plan = TIERS[tier];
  const limits = getLimits(tier);

  const [clientCount, monthReportCount] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    (async () => {
      const since = new Date();
      since.setUTCDate(1);
      since.setUTCHours(0, 0, 0, 0);
      return prisma.report.count({
        where: { userId, createdAt: { gte: since } },
      });
    })(),
  ]);

  const renewsLabel = renewsAt
    ? renewsAt.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Current plan</h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
            {plan.name}
          </span>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-600">{plan.description}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Stat label="Price" value={`$${plan.priceMonthly}/month`} />
            {renewsLabel ? <Stat label="Renews" value={renewsLabel} /> : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {tier === 'BUSINESS' ? null : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {tier === 'FREE' ? 'Upgrade plan' : 'Change plan'}
              </Link>
            )}
            {hasStripeCustomer ? <PortalButton /> : null}
          </div>
          {!hasStripeCustomer ? (
            <p className="mt-3 text-xs text-zinc-500">
              You're on the Free plan. Upgrade to manage billing in the customer portal.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Usage this month</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          <UsageRow
            label="Clients"
            used={clientCount}
            limit={limits.maxClients}
          />
          <UsageRow
            label="Reports"
            used={monthReportCount}
            limit={limits.maxReportsPerMonth}
          />
        </div>
      </section>
    </div>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const limitLabel = isUnlimited(limit) ? 'Unlimited' : limit.toLocaleString();
  const pct = isUnlimited(limit) ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-900">{label}</span>
        <span className="text-zinc-600">
          {used.toLocaleString()} / {limitLabel}
        </span>
      </div>
      {!isUnlimited(limit) ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-zinc-900'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}

function parsePrefs(value: unknown): {
  reportSent: boolean;
  reportFailed: boolean;
  weeklySummary: boolean;
} {
  const defaults = { reportSent: true, reportFailed: true, weeklySummary: true };
  if (!value || typeof value !== 'object') return defaults;
  const v = value as Record<string, unknown>;
  return {
    reportSent: typeof v.reportSent === 'boolean' ? v.reportSent : defaults.reportSent,
    reportFailed: typeof v.reportFailed === 'boolean' ? v.reportFailed : defaults.reportFailed,
    weeklySummary:
      typeof v.weeklySummary === 'boolean' ? v.weeklySummary : defaults.weeklySummary,
  };
}
