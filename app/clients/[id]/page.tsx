import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DataSourceType, ReportStatus } from '@prisma/client';

import { DeleteClientButton } from '@/components/clients/DeleteClientButton';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DisconnectButton } from '@/components/sources/DisconnectButton';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TYPE_LABEL: Record<DataSourceType, string> = {
  GOOGLE_ADS: 'Google Ads',
  META_ADS: 'Meta Ads',
  GA4: 'Google Analytics 4',
  INSTAGRAM_INSIGHTS: 'Instagram Insights',
};

const TYPE_ICON: Record<DataSourceType, { initials: string; bg: string }> = {
  GOOGLE_ADS: { initials: 'GA', bg: 'bg-blue-500' },
  META_ADS: { initials: 'M', bg: 'bg-sky-600' },
  GA4: { initials: 'G4', bg: 'bg-amber-500' },
  INSTAGRAM_INSIGHTS: { initials: 'IG', bg: 'bg-pink-500' },
};

const STATUS_BADGE: Record<ReportStatus, string> = {
  PENDING: 'bg-zinc-100 text-zinc-700',
  GENERATING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  GENERATING: 'Generating',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      dataSources: { orderBy: { createdAt: 'desc' } },
      reports: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!client || client.userId !== user.id) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 010 1.06L5.81 9.25H17a.75.75 0 010 1.5H5.81l3.97 3.97a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to clients
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {client.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={client.companyLogo}
                alt=""
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-base font-semibold text-white">
                {client.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {client.name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    client.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {client.status === 'ACTIVE' ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">{client.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/data-sources/connect?client=${client.id}`}
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
            <Link
              href={`/reports/new?client=${client.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm6 5a1 1 0 10-2 0v2H6a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
                />
              </svg>
              Generate Report
            </Link>
            <Link
              href={`/clients/${client.id}/edit`}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              Edit Client
            </Link>
            <DeleteClientButton
              id={client.id}
              name={client.name}
              redirectTo="/clients"
              variant="button"
              label="Delete Client"
            />
          </div>
        </header>

        <section className="mt-8 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Data sources</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {client.dataSources.length}{' '}
                {client.dataSources.length === 1 ? 'source' : 'sources'} connected
              </p>
            </div>
          </div>
          {client.dataSources.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-zinc-900">No data sources connected</p>
              <p className="mt-1 text-sm text-zinc-500">
                Connect a platform to pull metrics into reports for this client.
              </p>
              <Link
                href={`/data-sources/connect?client=${client.id}`}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Connect Data Source
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {client.dataSources.map((s) => {
                const icon = TYPE_ICON[s.type];
                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${icon.bg}`}
                        aria-hidden="true"
                      >
                        {icon.initials}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-900">
                            {TYPE_LABEL[s.type]}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              s.isConnected
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {s.isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          Connected {formatDate(s.createdAt)} · Last sync{' '}
                          {s.lastSyncedAt ? formatDate(s.lastSyncedAt) : 'never'}
                        </p>
                      </div>
                    </div>
                    <DisconnectButton
                      id={s.id}
                      platform={TYPE_LABEL[s.type]}
                      clientName={client.name}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Reports history</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {client.reports.length === 0
                  ? 'No reports yet'
                  : `Showing the latest ${client.reports.length}`}
              </p>
            </div>
            <Link
              href={`/reports?client=${client.id}`}
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              View all →
            </Link>
          </div>
          {client.reports.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-zinc-900">No reports generated yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Generate your first report for {client.name}.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {client.reports.map((r) => {
                const generated = r.generatedAt ?? r.createdAt;
                return (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                        <p className="text-sm font-semibold text-zinc-900">
                          {titleCase(r.type)} report
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatDate(r.dateFrom)} – {formatDate(r.dateTo)} · Generated{' '}
                        {formatDate(generated)}
                      </p>
                    </div>
                    {r.pdfUrl ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={r.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                        >
                          View PDF
                        </a>
                        <a
                          href={r.pdfUrl}
                          download
                          className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-400">—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
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

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
