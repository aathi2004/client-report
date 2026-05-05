import { createHash, randomBytes } from 'node:crypto';

const PREFIX = 'crp_live_';

export type GeneratedKey = {
  rawKey: string;
  hashedKey: string;
  lastFour: string;
};

export function generateApiKey(): GeneratedKey {
  const raw = `${PREFIX}${randomBytes(24).toString('base64url')}`;
  return {
    rawKey: raw,
    hashedKey: hashApiKey(raw),
    lastFour: raw.slice(-4),
  };
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
