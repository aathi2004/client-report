import Link from 'next/link';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TIERS, getLimits, isUnlimited } from '@/lib/subscription';

const TIER_BADGE: Record<string, string> = {
  FREE: 'bg-zinc-100 text-zinc-700',
  PRO: 'bg-violet-100 text-violet-700',
  BUSINESS: 'bg-amber-100 text-amber-700',
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const [clientCount, reportCount, dataSourceCount] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.report.count({ where: { userId: user.id } }),
    prisma.dataSource.count({ where: { client: { userId: user.id } } }),
  ]);

  const tier = user.subscriptionTier;
  const plan = TIERS[tier];
  const limits = getLimits(tier);
  const tierColor = TIER_BADGE[tier] ?? TIER_BADGE.FREE;
  const firstName = user.name?.split(' ')[0] ?? 'there';
  const atClientLimit = !isUnlimited(limits.maxClients) && clientCount >= limits.maxClients;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Here's what's happening with your reporting workspace today.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${tierColor}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {plan.name} plan
          </span>
        </div>

        {atClientLimit ? (
          <div className="mt-6">
            <UpgradePrompt
              title="Upgrade to add more clients"
              description={`You're using ${clientCount} of ${limits.maxClients} clients on the ${plan.name} plan.`}
              ctaLabel="See plans"
            />
          </div>
        ) : null}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total clients"
            value={clientCount}
            icon={
              <path
                fill="currentColor"
                d="M10 9a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0H2z"
              />
            }
          />
          <StatCard
            label="Reports generated"
            value={reportCount}
            icon={
              <path
                fill="currentColor"
                d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"
              />
            }
          />
          <StatCard
            label="Data sources connected"
            value={dataSourceCount}
            icon={
              <path
                fill="currentColor"
                d="M3 4a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm0 6a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm2 4a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2H5z"
              />
            }
          />
        </section>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">Quick actions</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Get started by adding a client and connecting their data sources.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {atClientLimit ? (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10 2a1 1 0 01.78.375l5 6.25A1 1 0 0115 10.25h-3v6.5a1 1 0 01-1 1H9a1 1 0 01-1-1v-6.5H5a1 1 0 01-.78-1.625l5-6.25A1 1 0 0110 2z"
                  />
                </svg>
                Upgrade to add more clients
              </Link>
            ) : (
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Client
              </Link>
            )}
            <Link
              href="/data-sources/new"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11 3a1 1 0 10-2 0v6H3a1 1 0 100 2h6v6a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3z"
                />
              </svg>
              Connect Data Source
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Recent activity</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Reports, syncs, and client updates will appear here.
            </p>
          </div>
          <EmptyActivity />
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            {icon}
          </svg>
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12.25a.75.75 0 00-1.5 0V10c0 .2.08.39.22.53l3 3a.75.75 0 101.06-1.06L10.75 9.69V5.75z"
          />
        </svg>
      </span>
      <p className="mt-3 text-sm font-medium text-zinc-900">No activity yet</p>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Add your first client and connect a data source to start generating reports.
      </p>
    </div>
  );
}
