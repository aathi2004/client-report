import Link from 'next/link';

import { DataSourceType } from '@prisma/client';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DisconnectButton } from '@/components/sources/DisconnectButton';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const INTEGRATIONS: Array<{
  type: DataSourceType;
  name: string;
  description: string;
  initials: string;
  bg: string;
}> = [
  {
    type: 'GOOGLE_ADS',
    name: 'Google Ads',
    description: 'Campaigns, ad groups, keywords, conversion tracking.',
    initials: 'GA',
    bg: 'bg-blue-500',
  },
  {
    type: 'META_ADS',
    name: 'Meta Ads',
    description: 'Facebook + Instagram campaign performance and audiences.',
    initials: 'M',
    bg: 'bg-sky-600',
  },
  {
    type: 'GA4',
    name: 'Google Analytics 4',
    description: 'Sessions, conversions, attribution, funnels.',
    initials: 'G4',
    bg: 'bg-amber-500',
  },
  {
    type: 'INSTAGRAM_INSIGHTS',
    name: 'Instagram Insights',
    description: 'Organic reach, engagement, follower growth, story metrics.',
    initials: 'IG',
    bg: 'bg-pink-500',
  },
];

const TYPE_LABEL: Record<DataSourceType, string> = {
  GOOGLE_ADS: 'Google Ads',
  META_ADS: 'Meta Ads',
  GA4: 'Google Analytics 4',
  INSTAGRAM_INSIGHTS: 'Instagram Insights',
};

export default async function DataSourcesPage() {
  const user = await requireAuth();

  const sources = await prisma.dataSource.findMany({
    where: { client: { userId: user.id } },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { id: true, name: true } } },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Data Sources</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Connect ad platforms and analytics to pull metrics into your reports.
          </p>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-900">Available integrations</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INTEGRATIONS.map((it) => (
              <article
                key={it.type}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white ${it.bg}`}
                  aria-hidden="true"
                >
                  {it.initials}
                </span>
                <h3 className="mt-4 text-sm font-semibold text-zinc-900">{it.name}</h3>
                <p className="mt-1 flex-1 text-sm text-zinc-600">{it.description}</p>
                <Link
                  href={`/data-sources/connect/${it.type.toLowerCase().replace(/_/g, '-')}`}
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  Connect
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-900">Connected sources</h2>
          {sources.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <ul className="divide-y divide-zinc-100">
                {sources.map((s) => {
                  const lastSync = s.lastSyncedAt
                    ? formatDate(s.lastSyncedAt)
                    : 'Never';
                  return (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              s.isConnected
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {s.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                          <p className="text-sm font-semibold text-zinc-900">
                            {TYPE_LABEL[s.type]}
                          </p>
                          <span className="text-sm text-zinc-500">·</span>
                          <Link
                            href={`/clients/${s.client.id}`}
                            className="text-sm text-zinc-700 hover:text-zinc-900"
                          >
                            {s.client.name}
                          </Link>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          Connected {formatDate(s.createdAt)} · Last sync {lastSync}
                        </p>
                      </div>
                      <DisconnectButton
                        id={s.id}
                        platform={TYPE_LABEL[s.type]}
                        clientName={s.client.name}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M3 4a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm0 6a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm2 4a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2H5z"
          />
        </svg>
      </span>
      <p className="mt-3 text-base font-medium text-zinc-900">No data sources connected yet</p>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Pick an integration above to start pulling metrics into your client reports.
      </p>
    </div>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
