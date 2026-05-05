import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { fetchCampaignPerformance } from '@/lib/integrations/google-ads-api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  if (!body.clientId || !body.dateFrom || !body.dateTo) {
    return NextResponse.json(
      { error: 'clientId, dateFrom, and dateTo are required.' },
      { status: 400 },
    );
  }

  const dateFrom = new Date(body.dateFrom);
  const dateTo = new Date(body.dateTo);
  if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
    return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 });
  }

  const client = await prisma.client.findUnique({
    where: { id: body.clientId },
    include: {
      dataSources: { where: { type: 'GOOGLE_ADS' }, take: 1 },
    },
  });
  if (!client || client.userId !== user.id) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  const source = client.dataSources[0];
  if (!source) {
    return NextResponse.json(
      { error: 'No Google Ads connection for this client.' },
      { status: 404 },
    );
  }

  try {
    const report = await fetchCampaignPerformance(source, { from: dateFrom, to: dateTo });
    await prisma.dataSource.update({
      where: { id: source.id },
      data: { lastSyncedAt: new Date() },
    });
    return NextResponse.json({ report });
  } catch (err) {
    console.error('[google-ads/fetch] failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Google Ads fetch failed.' },
      { status: 502 },
    );
  }
}
