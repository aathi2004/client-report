import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReportSendError, sendReportEmail } from '@/lib/reports/send';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const owner = await prisma.report.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!owner || owner.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { to?: string; note?: string };

  try {
    const result = await sendReportEmail({
      reportId: id,
      to: body.to,
      note: body.note,
    });
    return NextResponse.json({ ok: true, sentTo: result.sentTo });
  } catch (err) {
    if (err instanceof ReportSendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[reports/email] unexpected error:', err);
    return NextResponse.json({ error: 'Send failed.' }, { status: 500 });
  }
}
