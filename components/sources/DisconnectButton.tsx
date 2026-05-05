'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = { id: string; platform: string; clientName: string };

export function DisconnectButton({ id, platform, clientName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (!confirm(`Disconnect ${platform} from ${clientName}?`)) return;
    setLoading(true);
    const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Could not disconnect.');
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
      className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
    >
      {loading ? 'Disconnecting…' : 'Disconnect'}
    </button>
  );
}
