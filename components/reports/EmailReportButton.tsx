'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { useToast } from '@/components/ui/Toast';

type Props = {
  id: string;
  defaultTo: string;
  clientName: string;
  variant?: 'inline' | 'button';
  label?: string;
  disabled?: boolean;
};

export function EmailReportButton({
  id,
  defaultTo,
  clientName,
  variant = 'button',
  label = 'Email to client',
  disabled,
}: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTo(defaultTo);
    setNote('');
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, defaultTo]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, note: note || undefined }),
      });
      const data = (await res.json()) as { error?: string; sentTo?: string };
      if (!res.ok) {
        setError(data.error ?? 'Could not send email.');
        return;
      }
      const sentTo = data.sentTo ?? to;
      toast.success(`Report emailed to ${sentTo}`);
      setOpen(false);
    } catch {
      toast.error('Connection issue. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const triggerClass =
    variant === 'inline'
      ? 'text-sm font-medium text-zinc-700 hover:text-zinc-900 disabled:opacity-60'
      : 'inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={triggerClass}
      >
        {variant === 'button' ? (
          <>
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M2.94 5.5A2 2 0 014.93 4h10.14a2 2 0 011.99 1.5L10 11 2.94 5.5zM18 7.06v6.94A2 2 0 0116 16H4a2 2 0 01-2-2V7.06l7.4 5.76a1 1 0 001.2 0L18 7.06z"
              />
            </svg>
            {label}
          </>
        ) : (
          label
        )}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-zinc-100 px-6 py-4">
              <h2 className="text-base font-semibold text-zinc-900">Email report</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Sends the PDF to {clientName}. You can edit the recipient and add a note.
              </p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-zinc-900">
                  Recipient
                </label>
                <input
                  id="to"
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-zinc-900">
                  Note (optional)
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a short message to the email body."
                  className="mt-1.5 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {error ? (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {sending ? 'Sending…' : 'Send email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
