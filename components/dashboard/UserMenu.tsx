'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Props = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function UserMenu({ name, email, image }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initials = (name || email || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-3 text-sm transition-colors hover:bg-zinc-50"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
            {initials}
          </span>
        )}
        <span className="hidden font-medium text-zinc-900 sm:inline">{name ?? email}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-zinc-500" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-zinc-900">{name ?? 'Account'}</p>
            <p className="truncate text-xs text-zinc-500">{email}</p>
          </div>
          <Link
            href="/settings"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-zinc-500" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10 13a3 3 0 100-6 3 3 0 000 6zm7.94-2.06a.75.75 0 00.06-.94l-1.2-1.66a.75.75 0 01-.13-.55l.31-2.04a.75.75 0 00-.55-.84l-1.96-.5a.75.75 0 01-.46-.34L12.83 2.4a.75.75 0 00-.9-.32l-1.93.71a.75.75 0 01-.5 0l-1.93-.71a.75.75 0 00-.9.32L5.5 4.07a.75.75 0 01-.46.34l-1.96.5a.75.75 0 00-.55.84l.31 2.04a.75.75 0 01-.13.55L1.5 10a.75.75 0 000 .94l1.2 1.66a.75.75 0 01.13.55l-.31 2.04a.75.75 0 00.55.84l1.96.5a.75.75 0 01.46.34l1.17 1.67a.75.75 0 00.9.32l1.93-.71a.75.75 0 01.5 0l1.93.71a.75.75 0 00.9-.32l1.17-1.67a.75.75 0 01.46-.34l1.96-.5a.75.75 0 00.55-.84l-.31-2.04a.75.75 0 01.13-.55l1.14-1.6z"
              />
            </svg>
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-2 border-t border-zinc-100 px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-zinc-500" aria-hidden="true">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M3 4.75A2.75 2.75 0 015.75 2h5.5A2.75 2.75 0 0114 4.75v1a.75.75 0 01-1.5 0v-1c0-.69-.56-1.25-1.25-1.25h-5.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h5.5c.69 0 1.25-.56 1.25-1.25v-1a.75.75 0 011.5 0v1A2.75 2.75 0 0111.25 18h-5.5A2.75 2.75 0 013 15.25V4.75zm14.28 5.78a.75.75 0 000-1.06l-2.5-2.5a.75.75 0 10-1.06 1.06l1.22 1.22H8.75a.75.75 0 000 1.5h6.19l-1.22 1.22a.75.75 0 101.06 1.06l2.5-2.5z"
                clipRule="evenodd"
              />
            </svg>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
