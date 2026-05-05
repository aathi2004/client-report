import { NextResponse } from 'next/server';

import { ClientStatus } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    companyLogo?: string | null;
    status?: ClientStatus;
  };

  const data: {
    name?: string;
    email?: string;
    companyLogo?: string | null;
    status?: ClientStatus;
  } = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    data.name = name;
  }
  if (body.email !== undefined) {
    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
    data.email = email;
  }
  if (body.companyLogo !== undefined) {
    const trimmed = body.companyLogo?.trim();
    data.companyLogo = trimmed ? trimmed : null;
  }
  if (body.status === 'ACTIVE' || body.status === 'PAUSED') {
    data.status = body.status;
  }

  const client = await prisma.client.update({ where: { id }, data });
  return NextResponse.json({ client });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
