import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import {
  buildAuthUrl,
  getGoogleAdsConfig,
  signState,
} from '@/lib/integrations/google-ads';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  if (!getGoogleAdsConfig()) {
    return NextResponse.redirect(
      new URL('/data-sources?error=google_ads_not_configured', req.url),
    );
  }

  const url = new URL(req.url);
  const clientId = url.searchParams.get('client');
  if (!clientId) {
    return NextResponse.json(
      { error: 'client query param required' },
      { status: 400 },
    );
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== user.id) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const redirectUri = `${url.origin}/api/sources/google-ads/callback`;
  const state = signState({ userId: user.id, clientId });
  const authUrl = buildAuthUrl(state, redirectUri);
  return NextResponse.redirect(authUrl);
}
