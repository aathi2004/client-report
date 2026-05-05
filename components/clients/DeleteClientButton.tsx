'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  id: string;
  name: string;
  redirectTo?: string;
  variant?: 'inline' | 'button';
  label?: string;
};

export function DeleteClientButton({
  id,
  name,
  redirectTo,
  variant = 'inline',
  label = 'Delete',
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm(`Delete "${name}"? This will also remove their data sources and reports.`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Could not delete client.');
      setLoading(false);
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  };

  const className =
    variant === 'button'
      ? 'inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60'
      : 'text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-60';

  return (
    <button type="button" onClick={onClick} disabled={loading} className={className}>
      {loading ? 'Deleting…' : label}
    </button>
  );
}
