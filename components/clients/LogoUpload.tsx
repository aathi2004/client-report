'use client';

import { useRef, useState, type ChangeEvent } from 'react';

import { useToast } from '@/components/ui/Toast';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 20 * 1024 * 1024;

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

type UploadResult = { url?: string; error?: string };

function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ ok: boolean; data: UploadResult }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      let parsed: UploadResult = {};
      try {
        parsed = JSON.parse(xhr.responseText) as UploadResult;
      } catch {
        parsed = { error: 'Unexpected server response.' };
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, data: parsed });
    });

    xhr.addEventListener('error', () => {
      resolve({ ok: false, data: { error: 'Network error. Please try again.' } });
    });

    xhr.open('POST', '/api/uploads/logo');
    xhr.send(body);
  });
}

export function LogoUpload({ value, onChange, label = 'Company logo' }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onPick = () => inputRef.current?.click();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      const msg = 'Unsupported format. Use JPG, PNG, or WebP.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (file.size > MAX_BYTES) {
      const msg = 'File too large. Max 20MB.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setProgress(0);
    setUploading(true);
    try {
      const { ok, data } = await uploadWithProgress(file, setProgress);
      if (!ok || !data.url) {
        const msg = data.error ?? 'Failed to upload file.';
        setError(msg);
        toast.error(msg);
        return;
      }
      onChange(data.url);
    } finally {
      setUploading(false);
      setProgress(0);
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
      {uploading ? (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">Uploading… {progress}%</p>
        </div>
      ) : (
        <p className="mt-1.5 text-xs text-zinc-500">JPG, PNG, or WebP · max 20 MB</p>
      )}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
