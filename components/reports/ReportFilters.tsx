'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { ReportStatus } from '@prisma/client';

type Props = {
  clients: { id: string; name: string }[];
};

const STATUSES: { value: ReportStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'GENERATING', label: 'Generating' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

export function ReportFilters({ clients }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === 'ALL') next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  };

  const reset = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const clientId = params.get('client') ?? 'ALL';
  const status = params.get('status') ?? 'ALL';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const hasFilters = clientId !== 'ALL' || status !== 'ALL' || from || to;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4">
      <FilterField label="Client">
        <select
          value={clientId}
          onChange={(e) => setParam('client', e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          <option value="ALL">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Status">
        <select
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="From">
        <input
          type="date"
          value={from}
          onChange={(e) => setParam('from', e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </FilterField>

      <FilterField label="To">
        <input
          type="date"
          value={to}
          onChange={(e) => setParam('to', e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
      </FilterField>

      {hasFilters ? (
        <button
          type="button"
          onClick={reset}
          className="ml-auto self-end text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Clear filters
        </button>
      ) : null}

      {pending ? (
        <span className="self-end text-xs text-zinc-500">Updating…</span>
      ) : null}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </div>
  );
}
