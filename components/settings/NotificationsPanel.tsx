'use client';

import { useState } from 'react';

type Prefs = {
  reportSent: boolean;
  reportFailed: boolean;
  weeklySummary: boolean;
};

type Props = {
  initial: Prefs;
};

const ITEMS: Array<{ key: keyof Prefs; label: string; description: string }> = [
  {
    key: 'reportSent',
    label: 'Report sent to client',
    description: 'Email me whenever a scheduled report is delivered to a client.',
  },
  {
    key: 'reportFailed',
    label: 'Report failed',
    description: 'Email me if PDF generation or email delivery fails for a client report.',
  },
  {
    key: 'weeklySummary',
    label: 'Weekly summary',
    description: 'A short Monday digest of reports sent and any data source issues.',
  },
];

export function NotificationsPanel({ initial }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (key: keyof Prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPrefs: next }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'Could not save preferences.');
        // revert on failure
        setPrefs(prefs);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error.');
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Email notifications</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Control when we email you about activity in your workspace.
          </p>
        </div>
        <ul className="divide-y divide-zinc-100">
          {ITEMS.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">{item.label}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
              </div>
              <Toggle
                checked={prefs[item.key]}
                onChange={(v) => update(item.key, v)}
                disabled={saving}
              />
            </li>
          ))}
        </ul>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : success ? (
        <p className="text-xs text-zinc-500">Preferences saved.</p>
      ) : null}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
        checked ? 'bg-zinc-900' : 'bg-zinc-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
