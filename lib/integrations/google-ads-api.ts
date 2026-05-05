import type { DataSource } from '@prisma/client';

import { decrypt } from '@/lib/crypto';

export type GoogleAdsCredentials = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
};

export type CampaignRow = {
  id: string;
  name: string;
  status: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
};

export type GoogleAdsReport = {
  customerId: string;
  dateFrom: string;
  dateTo: string;
  campaigns: CampaignRow[];
  totals: {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
};

export function isGoogleAdsApiConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_ADS_CLIENT_ID &&
      process.env.GOOGLE_ADS_CLIENT_SECRET &&
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  );
}

function parseCredentials(encrypted: string): GoogleAdsCredentials {
  return JSON.parse(decrypt(encrypted)) as GoogleAdsCredentials;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toNumber(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  // google-ads-api returns Long for some integer fields
  if (typeof v === 'object' && v && 'toNumber' in v) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v);
}

export async function fetchCampaignPerformance(
  source: Pick<DataSource, 'credentials' | 'accountId'>,
  range: { from: Date; to: Date },
): Promise<GoogleAdsReport> {
  if (!isGoogleAdsApiConfigured()) {
    throw new Error(
      'Google Ads API not configured. Set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN.',
    );
  }

  const credentials = parseCredentials(source.credentials);
  if (!credentials.refreshToken) {
    throw new Error('Missing refresh token. Reconnect Google Ads for this client.');
  }

  const customerId = (source.accountId ?? process.env.GOOGLE_ADS_CUSTOMER_ID ?? '')
    .toString()
    .replace(/-/g, '')
    .trim();
  if (!customerId) {
    throw new Error(
      'No Google Ads customer ID. Set DataSource.accountId or GOOGLE_ADS_CUSTOMER_ID.',
    );
  }

  // Lazy-load to keep gRPC out of edge bundles and module init.
  const { GoogleAdsApi } = await import('google-ads-api');

  const api = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });

  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
    ?.toString()
    .replace(/-/g, '')
    .trim();

  const customer = api.Customer({
    customer_id: customerId,
    refresh_token: credentials.refreshToken,
    ...(loginCustomerId ? { login_customer_id: loginCustomerId } : {}),
  });

  const fromDate = isoDate(range.from);
  const toDate = isoDate(range.to);

  const rows = (await customer.report({
    entity: 'campaign',
    attributes: ['campaign.id', 'campaign.name', 'campaign.status'],
    metrics: [
      'metrics.impressions',
      'metrics.clicks',
      'metrics.cost_micros',
      'metrics.conversions',
    ],
    from_date: fromDate,
    to_date: toDate,
    order_by: 'metrics.impressions',
    limit: 100,
  })) as Array<{
    campaign?: { id?: unknown; name?: unknown; status?: unknown };
    metrics?: {
      impressions?: unknown;
      clicks?: unknown;
      cost_micros?: unknown;
      conversions?: unknown;
    };
  }>;

  const campaigns: CampaignRow[] = rows.map((r) => {
    const impressions = toNumber(r.metrics?.impressions);
    const clicks = toNumber(r.metrics?.clicks);
    const costMicros = toNumber(r.metrics?.cost_micros);
    const cost = costMicros / 1_000_000;
    const conversions = toNumber(r.metrics?.conversions);
    return {
      id: String(r.campaign?.id ?? ''),
      name: String(r.campaign?.name ?? ''),
      status: String(r.campaign?.status ?? ''),
      impressions,
      clicks,
      costMicros,
      cost,
      conversions,
      ctr: impressions > 0 ? clicks / impressions : 0,
      cpc: clicks > 0 ? cost / clicks : 0,
    };
  });

  const totals = campaigns.reduce(
    (acc, c) => {
      acc.impressions += c.impressions;
      acc.clicks += c.clicks;
      acc.cost += c.cost;
      acc.conversions += c.conversions;
      return acc;
    },
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
  );

  return {
    customerId,
    dateFrom: fromDate,
    dateTo: toDate,
    campaigns,
    totals: {
      ...totals,
      ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
      cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
    },
  };
}

export function googleAdsReportToMetrics(
  report: GoogleAdsReport,
): Array<{ label: string; value: number; display: string }> {
  const { totals } = report;
  return [
    {
      label: 'Impressions',
      value: totals.impressions,
      display: formatLargeNumber(totals.impressions),
    },
    { label: 'Clicks', value: totals.clicks, display: formatLargeNumber(totals.clicks) },
    {
      label: 'Conversions',
      value: totals.conversions,
      display: totals.conversions.toLocaleString(undefined, { maximumFractionDigits: 0 }),
    },
    {
      label: 'Spend',
      value: totals.cost,
      display: `$${totals.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    },
  ];
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}
