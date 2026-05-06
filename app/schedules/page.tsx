import Link from 'next/link';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import {
  DeleteScheduleButton,
  ToggleScheduleButton,
} from '@/components/schedules/ScheduleActions';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { describeSchedule } from '@/lib/scheduling';

export default async function SchedulesPage() {
  const user = await requireAuth();

  const schedules = await prisma.schedule.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { id: true, name: true } } },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Schedules</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Generate and email reports automatically on a recurring cadence.
            </p>
          </div>
          <Link
            href="/schedules/new"
            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New schedule
          </Link>
        </div>

        {schedules.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
              <svg viewBox="0 0 20 20" className="h-7 w-7" aria-hidden="true">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 101.06-1.06L10.75 9.69V5z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <p className="mt-5 text-lg font-semibold text-zinc-900">No scheduled reports</p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">Set up automation!</p>
            <Link
              href="/schedules/new"
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
              Create Schedule
            </Link>
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <ul className="divide-y divide-zinc-100">
              {schedules.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/clients/${s.client.id}`}
                        className="text-sm font-semibold text-zinc-900 hover:underline"
                      >
                        {s.client.name}
                      </Link>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {describeSchedule({
                        frequency: s.frequency,
                        dayOfWeek: s.dayOfWeek,
                        dayOfMonth: s.dayOfMonth,
                      })}
                      {' · '}
                      {s.recipientEmails.length === 0
                        ? 'sends to client email'
                        : `to ${s.recipientEmails.join(', ')}`}
                      {' · '}
                      {s.lastSentAt
                        ? `last sent ${formatDate(s.lastSentAt)}`
                        : 'not sent yet'}
                      {s.nextScheduledAt && s.isActive
                        ? ` · next ${formatDate(s.nextScheduledAt)}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ToggleScheduleButton id={s.id} isActive={s.isActive} />
                    <DeleteScheduleButton id={s.id} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
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
