import { renderToBuffer } from '@react-pdf/renderer';

import { Report, ReportStatus, ReportType } from '@prisma/client';

import {
  fetchCampaignPerformance,
  googleAdsReportToMetrics,
  isGoogleAdsApiConfigured,
} from '@/lib/integrations/google-ads-api';
import {
  PLACEHOLDER_METRICS_BY_TYPE,
  ReportDocument,
  type Source as ReportSource,
} from '@/lib/pdf/ReportDocument';
import { prisma } from '@/lib/prisma';
import { REPORTS_BUCKET, getSupabaseAdmin } from '@/lib/supabase';

export class ReportGenerateError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = 'ReportGenerateError';
  }
}

type Input = {
  userId: string;
  clientId: string;
  type: ReportType;
  dateFrom: Date;
  dateTo: Date;
  sourceIds: string[];
};

export async function generateReport(input: Input): Promise<Report> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new ReportGenerateError('Storage not configured.', 500);
  }

  const client = await prisma.client.findUnique({
    where: { id: input.clientId },
    include: {
      dataSources: true,
      user: {
        select: {
          name: true,
          email: true,
          agency: { select: { name: true, logo: true, brandColor: true } },
        },
      },
    },
  });
  if (!client || client.userId !== input.userId) {
    throw new ReportGenerateError('Client not found.', 404);
  }

  const agency = {
    name:
      client.user.agency?.name ?? client.user.name ?? client.user.email ?? 'Client Reporting',
    logo: client.user.agency?.logo ?? null,
    brandColor: client.user.agency?.brandColor ?? null,
  };

  const requested = new Set(input.sourceIds);
  const sources = client.dataSources.filter((s) => requested.has(s.id));

  const report = await prisma.report.create({
    data: {
      userId: input.userId,
      clientId: client.id,
      type: input.type,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      status: ReportStatus.GENERATING,
    },
  });

  try {
    const reportSources: ReportSource[] = await Promise.all(
      sources.map(async (s) => {
        if (s.type === 'GOOGLE_ADS' && isGoogleAdsApiConfigured()) {
          try {
            const data = await fetchCampaignPerformance(s, {
              from: input.dateFrom,
              to: input.dateTo,
            });
            await prisma.dataSource
              .update({ where: { id: s.id }, data: { lastSyncedAt: new Date() } })
              .catch(() => {});
            return {
              id: s.id,
              type: s.type,
              lastSyncedAt: new Date(),
              metrics: googleAdsReportToMetrics(data),
              isLive: true,
            };
          } catch (err) {
            console.warn(
              `[reports/generate] Google Ads fetch failed for ${s.id}; falling back:`,
              err,
            );
          }
        }
        return {
          id: s.id,
          type: s.type,
          lastSyncedAt: s.lastSyncedAt,
          metrics: PLACEHOLDER_METRICS_BY_TYPE[s.type],
          isLive: false,
        };
      }),
    );

    const pdfBuffer = await renderToBuffer(
      ReportDocument({
        client: {
          name: client.name,
          email: client.email,
          companyLogo: client.companyLogo,
        },
        agency,
        type: input.type,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        sources: reportSources,
      }),
    );

    const objectPath = `${input.userId}/${report.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(objectPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '3600',
      });
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: pub } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(objectPath);

    return prisma.report.update({
      where: { id: report.id },
      data: {
        status: ReportStatus.COMPLETED,
        pdfUrl: pub.publicUrl,
        generatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[reports/generate] failed:', err);
    await prisma.report
      .update({ where: { id: report.id }, data: { status: ReportStatus.FAILED } })
      .catch(() => {});
    throw new ReportGenerateError(
      err instanceof Error ? err.message : 'Report generation failed.',
      500,
    );
  }
}
