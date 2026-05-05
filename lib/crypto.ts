import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY_HEX = process.env.DATA_SOURCE_ENCRYPTION_KEY ?? '';

function getKey(): Buffer {
  if (!KEY_HEX) {
    throw new Error(
      'DATA_SOURCE_ENCRYPTION_KEY is not set. Generate with: ' +
        'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  if (KEY_HEX.length !== 64) {
    throw new Error('DATA_SOURCE_ENCRYPTION_KEY must be 32 bytes (64 hex chars).');
  }
  return Buffer.from(KEY_HEX, 'hex');
}

// AES-256-GCM with random 96-bit IV. Output: iv:tag:ciphertext (all base64url).
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString('base64url')).join(':');
}

export function decrypt(payload: string): string {
  const parts = payload.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted payload format.');
  const [iv, tag, enc] = parts.map((p) => Buffer.from(p, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
