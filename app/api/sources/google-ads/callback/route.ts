import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import {
  exchangeCodeForTokens,
  verifyState,
} from '@/lib/integrations/google-ads';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const url = new URL(req.url);

  const error = url.searchParams.get('error');
  if (error) {
    console.warn('[google-ads/callback] consent denied or error:', error);
    return NextResponse.redirect(
      new URL(`/data-sources?error=${encodeURIComponent(error)}`, req.url),
    );
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    return NextResponse.redirect(new URL('/data-sources?error=missing_params', req.url));
  }

  let payload;
  try {
    payload = verifyState(state);
  } catch (err) {
    console.warn('[google-ads/callback] state verification failed:', err);
    return NextResponse.redirect(new URL('/data-sources?error=invalid_state', req.url));
  }

  if (!user || user.id !== payload.userId) {
    return NextResponse.redirect(
      new URL('/auth/signin?callbackUrl=/data-sources', req.url),
    );
  }

  const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
  if (!client || client.userId !== user.id) {
    return NextResponse.redirect(
      new URL('/data-sources?error=client_not_found', req.url),
    );
  }

  const redirectUri = `${url.origin}/api/sources/google-ads/callback`;
  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code, redirectUri);
  } catch (err) {
    console.error('[google-ads/callback] token exchange failed:', err);
    return NextResponse.redirect(
      new URL('/data-sources?error=token_exchange_failed', req.url),
    );
  }

  if (!tokens.accessToken) {
    return NextResponse.redirect(
      new URL('/data-sources?error=no_access_token', req.url),
    );
  }

  let credentials: string;
  try {
    credentials = encrypt(JSON.stringify(tokens));
  } catch (err) {
    console.error('[google-ads/callback] encryption failed:', err);
    return NextResponse.redirect(
      new URL('/data-sources?error=encryption_failed', req.url),
    );
  }

  // Upsert by (clientId, type=GOOGLE_ADS).
  const existing = await prisma.dataSource.findFirst({
    where: { clientId: client.id, type: 'GOOGLE_ADS' },
  });
  if (existing) {
    await prisma.dataSource.update({
      where: { id: existing.id },
      data: { credentials, isConnected: true, lastSyncedAt: null },
    });
  } else {
    await prisma.dataSource.create({
      data: {
        clientId: client.id,
        type: 'GOOGLE_ADS',
        credentials,
        isConnected: true,
      },
    });
  }

  return NextResponse.redirect(
    new URL(`/clients/${client.id}?connected=google_ads`, req.url),
  );
}
