'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { LogoUpload } from '@/components/clients/LogoUpload';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

type Props = {
  agency: {
    name: string;
    logo: string | null;
    brandColor: string | null;
  };
};

export function BrandingPanel({ agency }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(agency.name);
  const [logo, setLogo] = useState<string | null>(agency.logo);
  const [brandColor, setBrandColor] = useState(agency.brandColor ?? '#18181b');
  const [saving, setSaving] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = async (
    next: { name?: string; logo?: string | null; brandColor?: string },
  ): Promise<boolean> => {
    const res = await fetch('/api/agency', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: next.name ?? name,
        logo: next.logo === undefined ? logo : next.logo,
        brandColor: next.brandColor ?? brandColor,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? 'Could not save branding.');
      return false;
    }
    return true;
  };

  const onLogoChange = async (url: string | null) => {
    setLogo(url);
    setError(null);
    if (!name.trim()) return; // no name yet, defer to manual save
    setLogoSaving(true);
    try {
      const ok = await persist({ logo: url });
      if (ok) {
        toast.success('Branding updated');
        router.refresh();
      }
    } finally {
      setLogoSaving(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const ok = await persist({});
      if (ok) {
        toast.success('Branding updated');
        router.refresh();
      }
    } catch {
      toast.error('Connection issue. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Agency branding</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Used in PDF reports and outgoing emails.
          </p>
        </div>
        <div className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="agency-name" className="block text-sm font-medium text-zinc-900">
              Agency name
            </label>
            <input
              id="agency-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          <div>
            <LogoUpload value={logo} onChange={onLogoChange} label="Agency logo" />
            {logoSaving ? (
              <p className="mt-2 text-xs text-zinc-500">Saving logo…</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="agency-color" className="block text-sm font-medium text-zinc-900">
              Brand color
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                id="agency-color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-zinc-300 bg-white"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                pattern="^#[0-9a-fA-F]{6}$"
                className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-mono text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || logoSaving}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Spinner /> Saving…
            </>
          ) : (
            'Save branding'
          )}
        </button>
      </div>
    </form>
  );
}
