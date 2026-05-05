'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ApiKey = {
  id: string;
  name: string;
  lastFour: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
};

type Props = {
  apiKeys: ApiKey[];
};

export function ApiKeysPanel({ apiKeys }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ id: string; rawKey: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Untitled key' }),
      });
      const data = (await res.json()) as {
        apiKey?: { id: string };
        rawKey?: string;
        error?: string;
      };
      if (!res.ok || !data.rawKey || !data.apiKey) {
        setError(data.error ?? 'Could not create API key.');
        return;
      }
      setRevealedKey({ id: data.apiKey.id, rawKey: data.rawKey });
      setName('');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const onRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? Any apps using it will lose access immediately.')) return;
    const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Could not revoke key.');
      return;
    }
    router.refresh();
  };

  const visibleKeys = apiKeys.filter((k) => !k.revokedAt);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Generate a new key</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Keys are shown only once on creation. Store them somewhere safe.
          </p>
        </div>
        <div className="space-y-3 px-6 py-5">
          <input
            type="text"
            placeholder="Key name (e.g. Zapier integration)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {creating ? 'Creating…' : 'Generate key'}
          </button>
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
        </div>
      </div>

      {revealedKey ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">Your new API key</p>
          <p className="mt-1 text-xs text-emerald-800/80">
            Copy it now — you won't see it again.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2">
            <code className="flex-1 break-all text-sm text-zinc-900">{revealedKey.rawKey}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(revealedKey.rawKey)}
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Copy
            </button>
          </div>
          <button
            type="button"
            onClick={() => setRevealedKey(null)}
            className="mt-3 text-xs font-medium text-emerald-900 hover:underline"
          >
            I've saved it, dismiss
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Active keys</h2>
        </div>
        {visibleKeys.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-zinc-500">
            No active API keys. Generate one above to get started.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {visibleKeys.map((k) => (
              <li
                key={k.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{k.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    <code className="font-mono">crp_live_…{k.lastFour}</code>
                    {' · '}
                    Created {formatDate(k.createdAt)}
                    {' · '}
                    {k.lastUsedAt ? `last used ${formatDate(k.lastUsedAt)}` : 'not used yet'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRevoke(k.id)}
                  className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
