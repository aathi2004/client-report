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

const AVG_BYTES_PER_PDF = 350 * 1024;

export default async function DashboardPage() {
  const user = await requireAuth();

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const [
    clientCount,
    dataSourceCount,
    reportsThisMonth,
    emailsSent,
    storedPdfCount,
    recentReports,
    recentClients,
    agency,
  ] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.dataSource.count({ where: { client: { userId: user.id } } }),
    prisma.report.count({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
    }),
    prisma.report.count({ where: { userId: user.id, sentAt: { not: null } } }),
    prisma.report.count({ where: { userId: user.id, pdfUrl: { not: null } } }),
    prisma.report.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { client: { select: { name: true } } },
    }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.agency.findUnique({ where: { userId: user.id } }),
  ]);

  const tier = user.subscriptionTier;
  const plan = TIERS[tier];
  const limits = getLimits(tier);
  const tierColor = TIER_BADGE[tier] ?? TIER_BADGE.FREE;
  const firstName = user.name?.split(' ')[0] ?? 'there';
  const atClientLimit = !isUnlimited(limits.maxClients) && clientCount >= limits.maxClients;

  const hasAnyReport = recentReports.length > 0;
  const hasBranding = Boolean(agency?.logo || agency?.brandColor);

  const checklist = [
    {
      key: 'client',
      label: 'Add your first client',
      done: clientCount > 0,
      href: '/clients',
      pro: false,
    },
    {
      key: 'source',
      label: 'Connect a data source',
      done: dataSourceCount > 0,
      href: '/data-sources',
      pro: false,
    },
    {
      key: 'report',
      label: 'Generate a report',
      done: hasAnyReport,
      href: '/reports/new',
      pro: false,
    },
    {
      key: 'branding',
      label: 'Set up branding',
      done: hasBranding,
      href: '/settings',
      pro: true,
    },
  ];

  const isFree = tier === 'FREE';
  const freeAccessibleDone =
    isFree && checklist.filter((i) => !i.pro).every((i) => i.done);
  const allDone = checklist.every((i) => i.done);
  const showChecklist = !allDone && !freeAccessibleDone;

  const activity = buildActivity(recentReports, recentClients).slice(0, 6);

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
              Here&apos;s what&apos;s happening with your reporting workspace today.
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

        {showChecklist ? (
          <GettingStarted items={checklist} isFree={isFree} />
        ) : null}

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Reports this month"
            value={String(reportsThisMonth)}
            gradient="from-indigo-500 to-violet-600"
            icon={
              <path
                fill="currentColor"
                d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"
              />
            }
          />
          <StatCard
            label="Emails sent"
            value={String(emailsSent)}
            gradient="from-violet-500 to-fuchsia-600"
            icon={
              <path
                fill="currentColor"
                d="M2.94 5.5A2 2 0 014.93 4h10.14a2 2 0 011.99 1.5L10 11 2.94 5.5zM18 7.06v6.94A2 2 0 0116 16H4a2 2 0 01-2-2V7.06l7.4 5.76a1 1 0 001.2 0L18 7.06z"
              />
            }
          />
          <StatCard
            label="Storage used"
            value={formatBytes(storedPdfCount * AVG_BYTES_PER_PDF)}
            sublabel={`${storedPdfCount} PDF${storedPdfCount === 1 ? '' : 's'} stored`}
            gradient="from-sky-500 to-indigo-600"
            icon={
              <path
                fill="currentColor"
                d="M3 5a2 2 0 012-2h10a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 7a2 2 0 012-2h10a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3zm3-7a1 1 0 100 2h1a1 1 0 100-2H6zm0 7a1 1 0 100 2h1a1 1 0 100-2H6z"
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
                href="/clients"
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
              href="/data-sources"
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
              Reports, emails, and client updates from across your workspace.
            </p>
          </div>
          {activity.length === 0 ? (
            <EmptyActivity />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-6 py-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${ACTIVITY_STYLES[a.icon]} text-white`}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                      {ACTIVITY_ICONS[a.icon]}
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-900">{a.text}</p>
                    <p className="text-xs text-zinc-500">{timeAgo(a.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

type ActivityKind = 'report' | 'email' | 'client';
type Activity = {
  id: string;
  icon: ActivityKind;
  text: React.ReactNode;
  date: Date;
};

type RecentReport = {
  id: string;
  generatedAt: Date | null;
  createdAt: Date;
  sentAt: Date | null;
  lastSentTo: string | null;
  client: { name: string };
};

type RecentClient = { id: string; name: string; createdAt: Date };

function buildActivity(reports: RecentReport[], clients: RecentClient[]): Activity[] {
  const items: Activity[] = [];
  for (const r of reports) {
    items.push({
      id: `report-${r.id}`,
      icon: 'report',
      text: (
        <>
          Report generated for <strong className="font-medium">{r.client.name}</strong>
        </>
      ),
      date: r.generatedAt ?? r.createdAt,
    });
    if (r.sentAt && r.lastSentTo) {
      items.push({
        id: `email-${r.id}`,
        icon: 'email',
        text: (
          <>
            Report emailed to <strong className="font-medium">{r.lastSentTo}</strong>
          </>
        ),
        date: r.sentAt,
      });
    }
  }
  for (const c of clients) {
    items.push({
      id: `client-${c.id}`,
      icon: 'client',
      text: (
        <>
          New client added: <strong className="font-medium">{c.name}</strong>
        </>
      ),
      date: c.createdAt,
    });
  }
  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

const ACTIVITY_STYLES: Record<ActivityKind, string> = {
  report: 'from-indigo-500 to-violet-600',
  email: 'from-violet-500 to-fuchsia-600',
  client: 'from-emerald-500 to-teal-600',
};

const ACTIVITY_ICONS: Record<ActivityKind, React.ReactNode> = {
  report: (
    <path
      fill="currentColor"
      d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"
    />
  ),
  email: (
    <path
      fill="currentColor"
      d="M2.94 5.5A2 2 0 014.93 4h10.14a2 2 0 011.99 1.5L10 11 2.94 5.5zM18 7.06v6.94A2 2 0 0116 16H4a2 2 0 01-2-2V7.06l7.4 5.76a1 1 0 001.2 0L18 7.06z"
    />
  ),
  client: (
    <path
      fill="currentColor"
      d="M10 9a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0H2z"
    />
  ),
};

function StatCard({
  label,
  value,
  sublabel,
  gradient,
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white`}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            {icon}
          </svg>
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {sublabel ? <p className="mt-1 text-xs text-zinc-500">{sublabel}</p> : null}
    </div>
  );
}

function GettingStarted({
  items,
  isFree,
}: {
  items: {
    key: string;
    label: string;
    done: boolean;
    href: string;
    pro: boolean;
  }[];
  isFree: boolean;
}) {
  const completed = items.filter((i) => i.done).length;
  const pct = Math.round((completed / items.length) * 100);
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-indigo-100 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Getting started</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Finish setup to start sending reports automatically.
          </p>
        </div>
        <span className="text-xs font-medium text-zinc-700">
          {completed} of {items.length} complete
        </span>
      </div>
      <div className="px-6 pt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <ul className="space-y-2 px-6 py-4">
        {items.map((item) => {
          const locked = item.pro && isFree && !item.done;
          const href = locked ? '/pricing' : item.href;
          return (
            <li key={item.key}>
              <Link
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  item.done ? 'bg-white/60' : 'hover:bg-white'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    item.done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-zinc-300 bg-white'
                  }`}
                  aria-hidden="true"
                >
                  {item.done ? (
                    <svg viewBox="0 0 20 20" className="h-3 w-3">
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12.1l6.8-6.8a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                </span>
                <span
                  className={`flex-1 text-sm ${
                    item.done ? 'text-zinc-500 line-through' : 'text-zinc-900'
                  }`}
                >
                  {item.label}
                </span>
                {item.pro ? (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700">
                    {locked ? 'Pro' : 'Pro'}
                  </span>
                ) : null}
                {!item.done ? (
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 text-zinc-400"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
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

function timeAgo(date: Date): string {
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
