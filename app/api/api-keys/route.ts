import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { generateApiKey } from '@/lib/api-keys';
import { prisma } from '@/lib/prisma';
import { canUseFeature } from '@/lib/subscription';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!canUseFeature(user.subscriptionTier, 'apiAccess')) {
    return NextResponse.json(
      { error: 'API access requires a Business plan.', code: 'FEATURE_LOCKED' },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim() || 'Untitled key';

  const generated = generateApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      hashedKey: generated.hashedKey,
      lastFour: generated.lastFour,
    },
    select: { id: true, name: true, lastFour: true, createdAt: true },
  });

  // The raw key is only ever returned here. Hashed value is what's persisted.
  return NextResponse.json({ apiKey, rawKey: generated.rawKey }, { status: 201 });
}
