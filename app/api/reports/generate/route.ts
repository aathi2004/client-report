import { NextResponse } from 'next/server';

import { ReportType } from '@prisma/client';

import { trackEvent } from '@/lib/analytics';
import { getCurrentUser } from '@/lib/auth';
import { ReportGenerateError, generateReport } from '@/lib/reports/generate';
import { checkReportLimit } from '@/lib/subscription';

export const runtime = 'nodejs';
export const maxDuration = 60;

const VALID_TYPES: ReportType[] = ['MONTHLY', 'WEEKLY', 'CUSTOM'];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string;
    type?: ReportType;
    dateFrom?: string;
    dateTo?: string;
    sourceIds?: string[];
  };

  if (!body.clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
  }
  if (!body.type || !VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  }
  if (!body.dateFrom || !body.dateTo) {
    return NextResponse.json({ error: 'dateFrom and dateTo are required' }, { status: 400 });
  }
  const dateFrom = new Date(body.dateFrom);
  const dateTo = new Date(body.dateTo);
  if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }
  if (dateTo < dateFrom) {
    return NextResponse.json({ error: 'dateTo must be after dateFrom' }, { status: 400 });
  }

  const limit = await checkReportLimit(user.id, user.subscriptionTier);
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.reason, used: limit.used, limit: limit.limit, code: 'LIMIT_REACHED' },
      { status: 403 },
    );
  }

  try {
    const report = await generateReport({
      userId: user.id,
      clientId: body.clientId,
      type: body.type,
      dateFrom,
      dateTo,
      sourceIds: body.sourceIds ?? [],
    });
    await trackEvent('report_generated', {
      userId: user.id,
      reportId: report.id,
      clientId: body.clientId,
      type: body.type,
      tier: user.subscriptionTier,
    });
    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof ReportGenerateError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[reports/generate] route error:', err);
    return NextResponse.json({ error: 'Report generation failed.' }, { status: 500 });
  }
}
