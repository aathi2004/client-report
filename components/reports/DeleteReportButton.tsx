'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = { id: string };

export function DeleteReportButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    setLoading(true);
    const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Could not delete report.');
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-60"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
