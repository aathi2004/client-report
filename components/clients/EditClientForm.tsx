'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { ClientStatus } from '@prisma/client';

import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

import { LogoUpload } from './LogoUpload';

type Props = {
  client: {
    id: string;
    name: string;
    email: string;
    companyLogo: string | null;
    status: ClientStatus;
  };
};

export function EditClientForm({ client }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [companyLogo, setCompanyLogo] = useState(client.companyLogo ?? '');
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          companyLogo: companyLogo || null,
          status,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not save changes.');
        setSaving(false);
        return;
      }
      router.push(`/clients/${client.id}`);
      router.refresh();
    } catch {
      toast.error('Connection issue. Please try again.');
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm(`Delete "${client.name}"? This will also remove their data sources and reports.`)) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Could not delete client.');
      setDeleting(false);
      return;
    }
    router.push('/clients');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-base font-semibold text-zinc-900">Client details</h2>
        </div>
        <div className="space-y-5 px-6 py-5">
          <Field
            label="Client name"
            id="name"
            value={name}
            onChange={setName}
            required
          />
          <Field
            label="Contact email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          <LogoUpload value={companyLogo || null} onChange={(v) => setCompanyLogo(v ?? '')} />
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-zinc-900">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Paused clients are excluded from scheduled reports.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Spinner /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50">
        <div className="border-b border-red-100 px-6 py-4">
          <h2 className="text-base font-semibold text-red-900">Danger zone</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-red-900">Delete this client</p>
            <p className="mt-1 text-xs text-red-800/80">
              Permanently removes the client along with all data sources and reports.
            </p>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete client'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  hint,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-900">
        {label}
        {required ? <span className="ml-1 text-zinc-400">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
      />
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
