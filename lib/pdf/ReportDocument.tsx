import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import { DataSourceType } from '@prisma/client';

const DEFAULT_ACCENT = '#111111';

const COLORS = {
  text: '#0f0f0f',
  muted: '#666',
  border: '#e4e4e7',
  bgMuted: '#fafafa',
  accent: DEFAULT_ACCENT,
  bar: DEFAULT_ACCENT,
};

function normalizeHex(input: string | null | undefined): string {
  if (!input) return DEFAULT_ACCENT;
  const trimmed = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    // expand #abc -> #aabbcc
    return `#${trimmed
      .slice(1)
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return DEFAULT_ACCENT;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 24,
  },
  logo: {
    width: 56,
    height: 56,
    objectFit: 'cover',
    borderRadius: 8,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
  },
  clientName: { fontSize: 18, fontWeight: 700 },
  clientSub: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  reportLabel: {
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reportTitle: { fontSize: 14, fontWeight: 700 },
  metaGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  metaCell: { flexDirection: 'column' },
  metaLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: { fontSize: 11, fontWeight: 700 },
  sectionHeading: { fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 12 },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.bgMuted,
  },
  metricLabel: { fontSize: 8, color: COLORS.muted, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: 700 },
  metricDelta: { fontSize: 8, color: COLORS.muted, marginTop: 2 },
  bars: { marginTop: 8, gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 88, fontSize: 9, color: COLORS.muted },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: 8, backgroundColor: COLORS.bar, borderRadius: 4 },
  barValue: { width: 56, fontSize: 9, textAlign: 'right' },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginVertical: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 8,
    color: COLORS.muted,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLogo: {
    width: 16,
    height: 16,
    objectFit: 'contain',
  },
});

const TYPE_LABEL: Record<DataSourceType, string> = {
  GOOGLE_ADS: 'Google Ads',
  META_ADS: 'Meta Ads',
  GA4: 'Google Analytics 4',
  INSTAGRAM_INSIGHTS: 'Instagram Insights',
};

export type MetricRow = { label: string; value: number; display: string };

export type Source = {
  id: string;
  type: DataSourceType;
  lastSyncedAt: Date | null;
  metrics: MetricRow[];
  isLive?: boolean;
};

export type ReportDocumentProps = {
  client: {
    name: string;
    email: string;
    companyLogo: string | null;
  };
  agency: {
    name: string;
    logo: string | null;
    brandColor: string | null;
  };
  type: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  dateFrom: Date;
  dateTo: Date;
  sources: Source[];
};

export const PLACEHOLDER_METRICS_BY_TYPE: Record<DataSourceType, MetricRow[]> = {
  GOOGLE_ADS: [
    { label: 'Impressions', value: 248_000, display: '248k' },
    { label: 'Clicks', value: 9_800, display: '9.8k' },
    { label: 'Conversions', value: 312, display: '312' },
    { label: 'Spend', value: 2450, display: '$2,450' },
  ],
  META_ADS: [
    { label: 'Impressions', value: 162_000, display: '162k' },
    { label: 'Clicks', value: 7_200, display: '7.2k' },
    { label: 'Leads', value: 184, display: '184' },
    { label: 'Spend', value: 1820, display: '$1,820' },
  ],
  GA4: [
    { label: 'Sessions', value: 12_400, display: '12.4k' },
    { label: 'Users', value: 8_700, display: '8.7k' },
    { label: 'Conversions', value: 410, display: '410' },
    { label: 'Bounce rate', value: 38, display: '38%' },
  ],
  INSTAGRAM_INSIGHTS: [
    { label: 'Reach', value: 84_000, display: '84k' },
    { label: 'Engagement', value: 5_600, display: '5.6k' },
    { label: 'Followers gained', value: 320, display: '+320' },
    { label: 'Story views', value: 21_400, display: '21.4k' },
  ],
};

export function ReportDocument(props: ReportDocumentProps) {
  const { client, agency, type, dateFrom, dateTo, sources } = props;
  const periodLabel = `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;
  const typeLabel = type === 'MONTHLY' ? 'Monthly' : type === 'WEEKLY' ? 'Weekly' : 'Custom';
  const accent = normalizeHex(agency.brandColor);

  return (
    <Document
      title={`${client.name} – ${typeLabel} report`}
      author={agency.name}
      creator="Client Reporting"
      producer="Client Reporting"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={[styles.header, { borderBottomColor: accent, borderBottomWidth: 2 }]} fixed>
          {client.companyLogo ? (
            <Image src={client.companyLogo} style={styles.logo} />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: accent }]}>
              <Text style={styles.logoFallbackText}>
                {client.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientSub}>{client.email}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.reportLabel, { color: accent }]}>{typeLabel} report</Text>
            <Text style={styles.reportTitle}>{periodLabel}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Period</Text>
            <Text style={styles.metaValue}>{periodLabel}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{formatDate(new Date())}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Sources</Text>
            <Text style={styles.metaValue}>
              {sources.length === 0 ? 'None selected' : `${sources.length} connected`}
            </Text>
          </View>
        </View>

        <SectionHeading accent={accent}>Performance summary</SectionHeading>
        <SummaryMetrics sources={sources} />

        {sources.length === 0 ? (
          <View
            style={{
              padding: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
              No data sources selected
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.muted, textAlign: 'center' }}>
              Connect a data source for this client and include it when generating the next report.
            </Text>
          </View>
        ) : (
          sources.map((s, i) => (
            <View key={s.id} wrap={false}>
              {i > 0 ? (
                <View style={[styles.divider, { borderBottomColor: accent }]} />
              ) : null}
              <SourceSection source={s} accent={accent} />
            </View>
          ))
        )}

        <View
          style={[styles.footer, { borderTopColor: accent }]}
          fixed
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {agency.logo ? (
              <Image src={agency.logo} style={styles.footerLogo} />
            ) : null}
            <Text>{agency.name}</Text>
          </View>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

function SectionHeading({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <View style={{ marginTop: 8, marginBottom: 12 }}>
      <Text style={[styles.sectionHeading, { color: accent, marginTop: 0, marginBottom: 4 }]}>
        {children}
      </Text>
      <View style={{ height: 2, width: 28, backgroundColor: accent, borderRadius: 1 }} />
    </View>
  );
}

function SummaryMetrics({ sources }: { sources: Source[] }) {
  const seed = sources.length || 1;
  const cards = [
    { label: 'Sessions', value: 12_400 + seed * 350, delta: '+8.2% vs prev' },
    { label: 'Conversions', value: 312 + seed * 11, delta: '+4.1% vs prev' },
    { label: 'Spend', value: `$${(2_450 + seed * 110).toLocaleString()}`, delta: 'on track' },
    { label: 'CTR', value: '3.4%', delta: '+0.3pp vs prev' },
  ];

  return (
    <View style={styles.metricRow}>
      {cards.map((c) => (
        <View key={c.label} style={styles.metricCard}>
          <Text style={styles.metricLabel}>{c.label}</Text>
          <Text style={styles.metricValue}>{c.value}</Text>
          <Text style={styles.metricDelta}>{c.delta}</Text>
        </View>
      ))}
    </View>
  );
}

function SourceSection({ source, accent }: { source: Source; accent: string }) {
  const rows = source.metrics;
  const max = rows.length > 0 ? Math.max(...rows.map((r) => Math.max(r.value, 1))) : 1;
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <SectionHeading accent={accent}>{TYPE_LABEL[source.type]}</SectionHeading>
        <Text
          style={{
            fontSize: 8,
            color: source.isLive ? '#047857' : COLORS.muted,
            backgroundColor: source.isLive ? '#d1fae5' : COLORS.bgMuted,
            paddingVertical: 2,
            paddingHorizontal: 6,
            borderRadius: 999,
          }}
        >
          {source.isLive ? 'Live data' : 'Sample data'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 24, marginBottom: 8 }}>
        <View>
          <Text style={styles.metaLabel}>Last sync</Text>
          <Text style={{ fontSize: 10 }}>
            {source.lastSyncedAt ? formatDate(source.lastSyncedAt) : 'Not yet synced'}
          </Text>
        </View>
      </View>
      <View style={styles.bars}>
        {rows.map((r) => (
          <View key={r.label} style={styles.barRow}>
            <Text style={styles.barLabel}>{r.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(r.value / max) * 100}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <Text style={styles.barValue}>{r.display}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
