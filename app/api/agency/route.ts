import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canUseFeature } from '@/lib/subscription';

export const runtime = 'nodejs';

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!canUseFeature(user.subscriptionTier, 'customBranding')) {
    return NextResponse.json(
      { error: 'Custom branding requires a Pro plan.', code: 'FEATURE_LOCKED' },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    logo?: string | null;
    brandColor?: string | null;
  };

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Agency name is required.' }, { status: 400 });
  }

  const brandColor = body.brandColor?.trim() ?? null;
  if (brandColor && !/^#[0-9a-fA-F]{6}$/.test(brandColor)) {
    return NextResponse.json(
      { error: 'Brand color must be a 6-digit hex (e.g. #18181b).' },
      { status: 400 },
    );
  }

  const logo = body.logo?.trim() || null;

  const agency = await prisma.agency.upsert({
    where: { userId: user.id },
    update: { name, logo, brandColor },
    create: { userId: user.id, name, logo, brandColor },
  });
  return NextResponse.json({ agency });
}
