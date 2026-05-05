import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    notificationPrefs?: Record<string, boolean>;
  };

  const data: { name?: string; notificationPrefs?: Record<string, boolean> } = {};
  if (body.name !== undefined) {
    const trimmed = body.name.trim();
    if (!trimmed) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
    data.name = trimmed;
  }
  if (body.notificationPrefs !== undefined) {
    const allowed = ['reportSent', 'reportFailed', 'weeklySummary'];
    const prefs: Record<string, boolean> = {};
    for (const key of allowed) {
      if (typeof body.notificationPrefs[key] === 'boolean') {
        prefs[key] = body.notificationPrefs[key];
      }
    }
    data.notificationPrefs = prefs;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true, name: true, email: true, notificationPrefs: true },
  });
  return NextResponse.json({ user: updated });
}
