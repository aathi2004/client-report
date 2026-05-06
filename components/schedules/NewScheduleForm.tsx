'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { ScheduleFrequency } from '@prisma/client';

import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

type Client = { id: string; name: string; email: string };

type Props = { clients: Client[] };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function NewScheduleForm({ clients }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('MONTHLY');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [recipients, setRecipients] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          frequency,
          dayOfWeek: frequency === 'WEEKLY' ? dayOfWeek : undefined,
          dayOfMonth: frequency === 'MONTHLY' ? dayOfMonth : undefined,
          recipientEmails: recipients
            .split(/[,\n]/)
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not create schedule.');
        setSubmitting(false);
        return;
      }
      router.push('/schedules');
      router.refresh();
    } catch {
      toast.error('Connection issue. Please try again.');
      setSubmitting(false);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-base font-medium text-zinc-900">Add a client first</p>
        <p className="mt-1 text-sm text-zinc-500">
          You need at least one client before scheduling automated reports.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Schedule</h2>
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
            <span className="block text-sm font-medium text-zinc-900">Frequency</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['WEEKLY', 'MONTHLY'] as ScheduleFrequency[]).map((f) => (
                <label
                  key={f}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium ${
                    frequency === f
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={f}
                    checked={frequency === f}
                    onChange={() => setFrequency(f)}
                    className="sr-only"
                  />
                  {f === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                </label>
              ))}
            </div>
          </div>

          {frequency === 'WEEKLY' ? (
            <div>
              <label htmlFor="dow" className="block text-sm font-medium text-zinc-900">
                Day of week
              </label>
              <select
                id="dow"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-zinc-500">Sends at 09:00 UTC.</p>
            </div>
          ) : (
            <div>
              <label htmlFor="dom" className="block text-sm font-medium text-zinc-900">
                Day of month
              </label>
              <input
                id="dom"
                type="number"
                min={1}
                max={28}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="mt-1.5 w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <p className="mt-1 text-xs text-zinc-500">
                1–28. Sends at 09:00 UTC. Reports cover the previous calendar month.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-zinc-900">
              Recipients
            </label>
            <textarea
              id="recipients"
              rows={2}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="leave empty to send to client.email"
              className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Comma- or newline-separated emails. Leave blank to send to the client's contact email.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
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
              <Spinner /> Saving…
            </>
          ) : (
            'Create schedule'
          )}
        </button>
      </div>
    </form>
  );
}
