import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReportSendError, sendReportEmail } from '@/lib/reports/send';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    reportId?: string;
    to?: string;
    note?: string;
  };

  if (!body.reportId) {
    return NextResponse.json({ error: 'reportId is required.' }, { status: 400 });
  }

  const owner = await prisma.report.findUnique({
    where: { id: body.reportId },
    select: { userId: true },
  });
  if (!owner || owner.userId !== user.id) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  try {
    const result = await sendReportEmail({
      reportId: body.reportId,
      to: body.to,
      note: body.note,
    });
    return NextResponse.json({ ok: true, sentTo: result.sentTo, reportId: result.reportId });
  } catch (err) {
    if (err instanceof ReportSendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[reports/send] unexpected error:', err);
    return NextResponse.json({ error: 'Send failed.' }, { status: 500 });
  }
}
