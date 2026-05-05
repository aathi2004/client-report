'use client';

import { signOut } from 'next-auth/react';

type Props = {
  className?: string;
  callbackUrl?: string;
  children?: React.ReactNode;
};

export function SignOutButton({
  className = 'inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50',
  callbackUrl = '/',
  children = 'Sign out',
}: Props) {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl })} className={className}>
      {children}
    </button>
  );
}
