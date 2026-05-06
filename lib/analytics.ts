import { track } from '@vercel/analytics/server';

type AllowedValue = string | number | boolean | null;

export async function trackEvent(
  event: string,
  properties: Record<string, AllowedValue> = {},
): Promise<void> {
  try {
    await track(event, properties);
  } catch (err) {
    console.warn(`[analytics] failed to track ${event}:`, err);
  }
}
