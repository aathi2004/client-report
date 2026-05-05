import type { ScheduleFrequency } from '@prisma/client';

export type RangeAndType = {
  type: 'WEEKLY' | 'MONTHLY';
  dateFrom: Date;
  dateTo: Date;
};

// Compute the period covered by the schedule when fired at `now`.
// Weekly: previous 7 days ending yesterday (UTC).
// Monthly: previous full calendar month.
export function periodForSchedule(frequency: ScheduleFrequency, now: Date): RangeAndType {
  if (frequency === 'WEEKLY') {
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    end.setUTCDate(end.getUTCDate() - 1);
    end.setUTCHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);
    start.setUTCHours(0, 0, 0, 0);
    return { type: 'WEEKLY', dateFrom: start, dateTo: end };
  }
  // MONTHLY — last full calendar month
  const firstOfThis = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastOfPrev = new Date(firstOfThis);
  lastOfPrev.setUTCDate(0);
  lastOfPrev.setUTCHours(23, 59, 59, 999);
  const firstOfPrev = new Date(Date.UTC(lastOfPrev.getUTCFullYear(), lastOfPrev.getUTCMonth(), 1));
  return { type: 'MONTHLY', dateFrom: firstOfPrev, dateTo: lastOfPrev };
}

// Next firing time. WEEKLY runs once a week on `dayOfWeek` (0=Sun..6=Sat) at 09:00 UTC.
// MONTHLY runs on `dayOfMonth` (1..28) at 09:00 UTC.
export function nextScheduledAt(args: {
  frequency: ScheduleFrequency;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  from?: Date;
}): Date {
  const now = args.from ?? new Date();
  const HOUR = 9; // UTC

  if (args.frequency === 'WEEKLY') {
    const dow = clamp(args.dayOfWeek ?? 1, 0, 6); // default Monday
    const next = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), HOUR, 0, 0, 0),
    );
    const delta = (dow - next.getUTCDay() + 7) % 7;
    next.setUTCDate(next.getUTCDate() + delta);
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }

  // MONTHLY
  const dom = clamp(args.dayOfMonth ?? 1, 1, 28);
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), dom, HOUR, 0, 0, 0),
  );
  if (next.getTime() <= now.getTime()) {
    next.setUTCMonth(next.getUTCMonth() + 1);
  }
  return next;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function describeSchedule(args: {
  frequency: ScheduleFrequency;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
}): string {
  if (args.frequency === 'WEEKLY') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `Every ${days[clamp(args.dayOfWeek ?? 1, 0, 6)]} at 09:00 UTC`;
  }
  const dom = clamp(args.dayOfMonth ?? 1, 1, 28);
  const suffix =
    dom === 1 || dom === 21 || dom === 31
      ? 'st'
      : dom === 2 || dom === 22
        ? 'nd'
        : dom === 3 || dom === 23
          ? 'rd'
          : 'th';
  return `Monthly on the ${dom}${suffix} at 09:00 UTC`;
}
