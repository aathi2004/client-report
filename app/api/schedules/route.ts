import { NextResponse } from 'next/server';

import { ScheduleFrequency } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nextScheduledAt } from '@/lib/scheduling';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string;
    frequency?: ScheduleFrequency;
    dayOfWeek?: number;
    dayOfMonth?: number;
    recipientEmails?: string[];
  };

  if (!body.clientId) {
    return NextResponse.json({ error: 'clientId is required.' }, { status: 400 });
  }
  if (body.frequency !== 'WEEKLY' && body.frequency !== 'MONTHLY') {
    return NextResponse.json({ error: 'frequency must be WEEKLY or MONTHLY.' }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: body.clientId } });
  if (!client || client.userId !== user.id) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  const recipients = (body.recipientEmails ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));

  if (recipients.length === 0) {
    recipients.push(client.email);
  }

  const next = nextScheduledAt({
    frequency: body.frequency,
    dayOfWeek: body.dayOfWeek ?? null,
    dayOfMonth: body.dayOfMonth ?? null,
  });

  const schedule = await prisma.schedule.create({
    data: {
      userId: user.id,
      clientId: client.id,
      frequency: body.frequency,
      dayOfWeek: body.frequency === 'WEEKLY' ? body.dayOfWeek ?? 1 : null,
      dayOfMonth: body.frequency === 'MONTHLY' ? body.dayOfMonth ?? 1 : null,
      recipientEmails: recipients,
      isActive: true,
      nextScheduledAt: next,
    },
  });

  return NextResponse.json({ schedule }, { status: 201 });
}
