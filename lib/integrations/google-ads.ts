import { createHmac, randomBytes } from 'node:crypto';

export const GOOGLE_ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

export type GoogleAdsTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
};

export function getGoogleAdsConfig() {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function buildAuthUrl(state: string, redirectUri: string): string {
  const cfg = getGoogleAdsConfig();
  if (!cfg) throw new Error('Google Ads OAuth not configured');
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: GOOGLE_ADS_SCOPE,
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<GoogleAdsTokens> {
  const cfg = getGoogleAdsConfig();
  if (!cfg) throw new Error('Google Ads OAuth not configured');
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      `Token exchange failed (${res.status}): ${JSON.stringify(json)}`,
    );
  }
  return {
    accessToken: String(json.access_token ?? ''),
    refreshToken: json.refresh_token ? String(json.refresh_token) : null,
    expiresAt: Date.now() + Number(json.expires_in ?? 0) * 1000,
    scope: String(json.scope ?? ''),
  };
}

// Signed state for CSRF + identifying the originating session.
type StatePayload = {
  userId: string;
  clientId: string;
  issuedAt: number;
  nonce: string;
};

const STATE_TTL_MS = 10 * 60 * 1000;

export function signState(payload: Omit<StatePayload, 'issuedAt' | 'nonce'>): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET not set');
  const full: StatePayload = {
    ...payload,
    issuedAt: Date.now(),
    nonce: randomBytes(8).toString('hex'),
  };
  const json = Buffer.from(JSON.stringify(full)).toString('base64url');
  const sig = createHmac('sha256', secret).update(json).digest('base64url');
  return `${json}.${sig}`;
}

export function verifyState(state: string): StatePayload {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET not set');
  const [json, sig] = state.split('.');
  if (!json || !sig) throw new Error('Invalid state');
  const expected = createHmac('sha256', secret).update(json).digest('base64url');
  if (expected !== sig) throw new Error('State signature mismatch');
  const payload = JSON.parse(Buffer.from(json, 'base64url').toString('utf8')) as StatePayload;
  if (Date.now() - payload.issuedAt > STATE_TTL_MS) throw new Error('State expired');
  return payload;
}
