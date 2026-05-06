'use client';

import { Spinner } from '@/components/ui/Spinner';

export function ReportGeneratingOverlay({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Spinner className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-zinc-900">Generating PDF report…</h3>
        <p className="mt-2 text-sm text-zinc-600">This may take 10–15 seconds.</p>
      </div>
    </div>
  );
}
