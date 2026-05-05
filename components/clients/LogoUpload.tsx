'use client';

import { useRef, useState, type ChangeEvent } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 20 * 1024 * 1024;

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function LogoUpload({ value, onChange, label = 'Company logo' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = () => inputRef.current?.click();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large. Max size is 20 MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/uploads/logo', { method: 'POST', body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Upload failed.');
        return;
      }
      onChange(data.url);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-900">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={onFile}
        className="hidden"
      />
      <div className="mt-1.5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 20 20" className="h-6 w-6 text-zinc-400" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 5a2 2 0 100-4 2 2 0 000 4zm9 7H4v-2l3-3 2 2 4-4 3 3v4z"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onPick}
            disabled={uploading}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={uploading}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-60"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">JPG, PNG, or WebP · max 20 MB</p>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
