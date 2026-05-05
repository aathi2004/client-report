'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { DataSourceType, ReportType } from '@prisma/client';

type Source = {
  id: string;
  type: DataSourceType;
  isConnected: boolean;
};

type Client = {
  id: string;
  name: string;
  dataSources: Source[];
};

type Props = {
  clients: Client[];
};

const TYPE_LABEL: Record<DataSourceType, string> = {
  GOOGLE_ADS: 'Google Ads',
  META_ADS: 'Meta Ads',
  GA4: 'Google Analytics 4',
  INSTAGRAM_INSIGHTS: 'Instagram Insights',
};

export function NewReportForm({ clients }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const presetClient = params.get('client') ?? '';

  const [clientId, setClientId] = useState(
    presetClient && clients.some((c) => c.id === presetClient) ? presetClient : clients[0]?.id ?? '',
  );
  const [type, setType] = useState<ReportType>('MONTHLY');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sourceIds, setSourceIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === clientId) ?? null,
    [clients, clientId],
  );

  useEffect(() => {
    const range = defaultRangeFor(type);
    setDateFrom(range.from);
    setDateTo(range.to);
  }, [type]);

  useEffect(() => {
    setSourceIds(new Set(selectedClient?.dataSources.map((s) => s.id) ?? []));
  }, [selectedClient]);

  const toggleSource = (id: string) => {
    setSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          type,
          dateFrom: new Date(`${dateFrom}T00:00:00Z`).toISOString(),
          dateTo: new Date(`${dateTo}T23:59:59Z`).toISOString(),
          sourceIds: Array.from(sourceIds),
        }),
      });
      const data = (await res.json()) as { report?: { id: string }; error?: string };
      if (!res.ok || !data.report) {
        setError(data.error ?? 'Could not generate report.');
        setSubmitting(false);
        return;
      }
      router.push(`/reports/${data.report.id}`);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-base font-medium text-zinc-900">Add a client first</p>
        <p className="mt-1 text-sm text-zinc-500">
          You need at least one client before you can generate a report.
        </p>
        <button
          type="button"
          onClick={() => router.push('/clients')}
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Go to clients
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Report details</h2>
        </div>
        <div className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-zinc-900">
              Client
            </label>
            <select
              id="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-zinc-900">Report type</span>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(['MONTHLY', 'WEEKLY', 'CUSTOM'] as ReportType[]).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium ${
                    type === t
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="sr-only"
                  />
                  {t === 'MONTHLY' ? 'Monthly' : t === 'WEEKLY' ? 'Weekly' : 'Custom'}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="from" className="block text-sm font-medium text-zinc-900">
                From
              </label>
              <input
                id="from"
                type="date"
                required
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={type !== 'CUSTOM'}
                className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-zinc-900">
                To
              </label>
              <input
                id="to"
                type="date"
                required
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={type !== 'CUSTOM'}
                className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
          {type !== 'CUSTOM' ? (
            <p className="-mt-3 text-xs text-zinc-500">
              {type === 'MONTHLY' ? 'Last full calendar month.' : 'Last 7 days.'} Switch to Custom to override.
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Data sources</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Pick which connected sources to include in this report.
          </p>
        </div>
        {selectedClient && selectedClient.dataSources.length > 0 ? (
          <ul className="divide-y divide-zinc-100">
            {selectedClient.dataSources.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    id={`src-${s.id}`}
                    type="checkbox"
                    checked={sourceIds.has(s.id)}
                    onChange={() => toggleSource(s.id)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <label htmlFor={`src-${s.id}`} className="text-sm font-medium text-zinc-900">
                    {TYPE_LABEL[s.type]}
                  </label>
                  {!s.isConnected ? (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      Disconnected
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-zinc-600">
            This client has no data sources yet. The report will still generate with placeholder
            content; connect sources for real metrics.
          </div>
        )}
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !clientId}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Spinner /> Generating PDF…
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 1-9 9" />
    </svg>
  );
}

function defaultRangeFor(type: ReportType): { from: string; to: string } {
  const today = new Date();
  if (type === 'WEEKLY') {
    const to = new Date(today);
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: iso(from), to: iso(to) };
  }
  if (type === 'MONTHLY') {
    const firstOfThis = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfPrev = new Date(firstOfThis);
    lastOfPrev.setDate(0);
    const firstOfPrev = new Date(lastOfPrev.getFullYear(), lastOfPrev.getMonth(), 1);
    return { from: iso(firstOfPrev), to: iso(lastOfPrev) };
  }
  // CUSTOM — default to last 30 days
  const to = new Date(today);
  const from = new Date(today);
  from.setDate(from.getDate() - 29);
  return { from: iso(from), to: iso(to) };
}

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
