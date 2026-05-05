import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkClientLimit } from '@/lib/subscription';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    companyLogo?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const limit = await checkClientLimit(user.id, user.subscriptionTier);
  if (!limit.ok) {
    return NextResponse.json(
      { error: limit.reason, used: limit.used, limit: limit.limit, code: 'LIMIT_REACHED' },
      { status: 403 },
    );
  }

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      name,
      email,
      companyLogo: body.companyLogo?.trim() || null,
    },
  });

  return NextResponse.json({ client }, { status: 201 });
}
