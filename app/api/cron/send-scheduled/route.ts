import { NextResponse } from 'next/server';

import { generateReport } from '@/lib/reports/generate';
import { sendReportEmail } from '@/lib/reports/send';
import { prisma } from '@/lib/prisma';
import { nextScheduledAt, periodForSchedule } from '@/lib/scheduling';

export const runtime = 'nodejs';
export const maxDuration = 300;

type Result = {
  scheduleId: string;
  clientId: string;
  status: 'sent' | 'skipped' | 'failed';
  error?: string;
};

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[cron/send-scheduled] CRON_SECRET not set');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  const auth = req.headers.get('authorization');
  const url = new URL(req.url);
  const queryToken = url.searchParams.get('token');
  const provided =
    (auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null) ?? queryToken;
  if (provided !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const due = await prisma.schedule.findMany({
    where: {
      isActive: true,
      OR: [{ nextScheduledAt: { lte: now } }, { nextScheduledAt: null }],
    },
    include: { client: { include: { dataSources: true } } },
    take: 50,
  });

  const results: Result[] = [];

  for (const schedule of due) {
    try {
      if (!schedule.client) {
        results.push({
          scheduleId: schedule.id,
          clientId: schedule.clientId,
          status: 'skipped',
          error: 'client missing',
        });
        continue;
      }

      const period = periodForSchedule(schedule.frequency, now);
      const sourceIds = schedule.client.dataSources.map((s) => s.id);

      const report = await generateReport({
        userId: schedule.userId,
        clientId: schedule.clientId,
        type: period.type,
        dateFrom: period.dateFrom,
        dateTo: period.dateTo,
        sourceIds,
      });

      const recipients =
        schedule.recipientEmails.length > 0
          ? schedule.recipientEmails
          : [schedule.client.email];

      for (const to of recipients) {
        await sendReportEmail({ reportId: report.id, to });
      }

      const next = nextScheduledAt({
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek,
        dayOfMonth: schedule.dayOfMonth,
        from: now,
      });
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: { lastSentAt: now, nextScheduledAt: next },
      });

      results.push({
        scheduleId: schedule.id,
        clientId: schedule.clientId,
        status: 'sent',
      });
    } catch (err) {
      console.error(`[cron/send-scheduled] schedule ${schedule.id} failed:`, err);
      // Push next attempt forward so we don't hammer it; manual reset clears.
      const next = nextScheduledAt({
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek,
        dayOfMonth: schedule.dayOfMonth,
        from: now,
      });
      await prisma.schedule
        .update({ where: { id: schedule.id }, data: { nextScheduledAt: next } })
        .catch(() => {});
      results.push({
        scheduleId: schedule.id,
        clientId: schedule.clientId,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({
    ranAt: now.toISOString(),
    processed: results.length,
    results,
  });
}
