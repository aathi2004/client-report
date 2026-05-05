'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  id: string;
  isActive: boolean;
};

export function ToggleScheduleButton({ id, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const res = await fetch(`/api/schedules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (!res.ok) {
      alert('Could not update schedule.');
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
      className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 disabled:opacity-60"
    >
      {loading ? '…' : isActive ? 'Pause' : 'Resume'}
    </button>
  );
}

export function DeleteScheduleButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm('Delete this schedule? Future reports will not be sent.')) return;
    setLoading(true);
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Could not delete schedule.');
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
