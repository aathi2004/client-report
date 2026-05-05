import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nextScheduledAt } from '@/lib/scheduling';

export const runtime = 'nodejs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { isActive?: boolean };

  const data: { isActive?: boolean; nextScheduledAt?: Date } = {};
  if (typeof body.isActive === 'boolean') {
    data.isActive = body.isActive;
    if (body.isActive) {
      data.nextScheduledAt = nextScheduledAt({
        frequency: existing.frequency,
        dayOfWeek: existing.dayOfWeek,
        dayOfMonth: existing.dayOfMonth,
      });
    }
  }

  const schedule = await prisma.schedule.update({ where: { id }, data });
  return NextResponse.json({ schedule });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.schedule.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.schedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
