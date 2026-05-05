import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ReportStatus } from '@prisma/client';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DeleteReportButton } from '@/components/reports/DeleteReportButton';
import { EmailReportButton } from '@/components/reports/EmailReportButton';
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

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true, email: true } } },
  });
  if (!report || report.userId !== user.id) notFound();

  const generated = report.generatedAt ?? report.createdAt;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/reports"
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
          Back to reports
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {titleCase(report.type)} report
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              <Link
                href={`/clients/${report.client.id}`}
                className="font-medium text-zinc-700 hover:text-zinc-900"
              >
                {report.client.name}
              </Link>
              {' · '}
              {formatDate(report.dateFrom)} – {formatDate(report.dateTo)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[report.status]}`}
            >
              {STATUS_LABEL[report.status]}
            </span>
            {report.pdfUrl ? (
              <>
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  Open in new tab
                </a>
                <EmailReportButton
                  id={report.id}
                  defaultTo={report.client.email}
                  clientName={report.client.name}
                  disabled={report.status !== 'COMPLETED'}
                />
                <a
                  href={report.pdfUrl}
                  download
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Download PDF
                </a>
              </>
            ) : null}
            <DeleteReportButton id={report.id} />
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Generated" value={formatDate(generated)} />
          <Stat
            label="Period"
            value={`${formatDate(report.dateFrom)} – ${formatDate(report.dateTo)}`}
          />
          <Stat label="Status" value={STATUS_LABEL[report.status]} />
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-900">
            Preview
          </div>
          {report.status === 'COMPLETED' && report.pdfUrl ? (
            <iframe
              src={report.pdfUrl}
              title={`${report.client.name} report`}
              className="h-[80vh] w-full"
            />
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-zinc-900">
                {report.status === 'FAILED'
                  ? 'Report generation failed'
                  : 'Report is still being generated'}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {report.status === 'FAILED'
                  ? 'Try generating a new report or check the server logs for details.'
                  : 'Refresh the page in a moment.'}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
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
    .map((w) => (w[0] ?? '').toUpperCase() + w.slice(1))
    .join(' ');
}
