import Link from 'next/link';

import { Prisma, ReportStatus } from '@prisma/client';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DeleteReportButton } from '@/components/reports/DeleteReportButton';
import { EmailReportButton } from '@/components/reports/EmailReportButton';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; status?: string; from?: string; to?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const where: Prisma.ReportWhereInput = { userId: user.id };
  if (params.client) where.clientId = params.client;
  if (params.status && params.status in STATUS_BADGE) {
    where.status = params.status as ReportStatus;
  }
  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) where.createdAt.gte = new Date(params.from);
    if (params.to) {
      const end = new Date(params.to);
      end.setUTCHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [clients, reports] = await Promise.all([
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { id: true, name: true, email: true } } },
      take: 100,
    }),
  ]);

  const hasFilters = Boolean(params.client || params.status || params.from || params.to);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Reports</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Generated client reports and their delivery status.
            </p>
          </div>
          <Link
            href="/reports/new"
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
        </div>

        <div className="mt-6">
          <ReportFilters clients={clients} />
        </div>

        {reports.length === 0 ? (
          <EmptyState filtered={hasFilters} />
        ) : (
          <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <Th>Client</Th>
                    <Th>Type</Th>
                    <Th>Period</Th>
                    <Th>Generated</Th>
                    <Th>Last sent</Th>
                    <Th>Status</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {reports.map((r) => {
                    const generated = r.generatedAt ?? r.createdAt;
                    return (
                      <tr key={r.id} className="text-sm">
                        <Td>
                          <Link
                            href={`/reports/${r.id}`}
                            className="font-medium text-zinc-900 hover:underline"
                          >
                            {r.client.name}
                          </Link>
                        </Td>
                        <Td>
                          <span className="text-zinc-700">{titleCase(r.type)}</span>
                        </Td>
                        <Td>
                          <span className="text-zinc-700">
                            {formatRange(r.dateFrom, r.dateTo)}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-zinc-700">{formatDate(generated)}</span>
                        </Td>
                        <Td>
                          {r.sentAt ? (
                            <span
                              className="text-zinc-700"
                              title={r.lastSentTo ? `Sent to ${r.lastSentTo}` : undefined}
                            >
                              {formatDate(r.sentAt)}
                            </span>
                          ) : (
                            <span className="text-zinc-400">Not sent</span>
                          )}
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}
                          >
                            {STATUS_LABEL[r.status]}
                          </span>
                        </Td>
                        <Td align="right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/reports/${r.id}`}
                              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                            >
                              View
                            </Link>
                            {r.pdfUrl ? (
                              <a
                                href={r.pdfUrl}
                                download
                                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-sm text-zinc-400">—</span>
                            )}
                            {r.status === 'COMPLETED' && r.pdfUrl ? (
                              <EmailReportButton
                                id={r.id}
                                defaultTo={r.client.email}
                                clientName={r.client.name}
                                variant="inline"
                                label="Email"
                              />
                            ) : null}
                            <DeleteReportButton id={r.id} />
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <td
      className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </td>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  if (filtered) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
            <path
              fill="currentColor"
              d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"
            />
          </svg>
        </span>
        <p className="mt-3 text-base font-medium text-zinc-900">
          No reports match these filters
        </p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          Try clearing or adjusting the filters above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm">
        <svg viewBox="0 0 20 20" className="h-7 w-7" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm6 5a1 1 0 10-2 0v2H6a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
          />
        </svg>
      </span>
      <p className="mt-5 text-lg font-semibold text-zinc-900">No reports generated yet</p>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">Create your first report!</p>
      <Link
        href="/reports/new"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.75.75v5.5h5.5a.75.75 0 010 1.5h-5.5v5.5a.75.75 0 01-1.5 0v-5.5h-5.5a.75.75 0 010-1.5h5.5v-5.5A.75.75 0 0110 3z"
            clipRule="evenodd"
          />
        </svg>
        Generate Report
      </Link>
    </div>
  );
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split('_')
    .map((w) => (w[0] ?? '').toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRange(from: Date, to: Date) {
  return `${formatDate(from)} – ${formatDate(to)}`;
}
