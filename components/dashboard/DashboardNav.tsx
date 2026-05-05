import Link from 'next/link';

import { SubscriptionTier } from '@prisma/client';

import { UserMenu } from './UserMenu';

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    subscriptionTier?: SubscriptionTier;
  };
};

export function DashboardNav({ user }: Props) {
  const showUpgrade = user.subscriptionTier && user.subscriptionTier !== 'BUSINESS';
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white">
              CR
            </span>
            <span className="font-semibold tracking-tight text-zinc-900">Client Reporting</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/clients">Clients</NavLink>
            <NavLink href="/reports">Reports</NavLink>
            <NavLink href="/schedules">Schedules</NavLink>
            <NavLink href="/data-sources">Data Sources</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {showUpgrade ? (
            <Link
              href="/pricing"
              className="hidden items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 sm:inline-flex"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M10 2a1 1 0 01.78.375l5 6.25A1 1 0 0115 10.25h-3v6.5a1 1 0 01-1 1H9a1 1 0 01-1-1v-6.5H5a1 1 0 01-.78-1.625l5-6.25A1 1 0 0110 2z"
                />
              </svg>
              Upgrade
            </Link>
          ) : null}
          <UserMenu name={user.name} email={user.email} image={user.image} />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
    >
      {children}
    </Link>
  );
}
