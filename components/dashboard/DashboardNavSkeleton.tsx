import Link from 'next/link';

export function DashboardNavSkeleton() {
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
          <div className="hidden items-center gap-4 md:flex">
            <span className="h-3 w-16 rounded bg-zinc-100" />
            <span className="h-3 w-12 rounded bg-zinc-100" />
            <span className="h-3 w-14 rounded bg-zinc-100" />
            <span className="h-3 w-20 rounded bg-zinc-100" />
            <span className="h-3 w-24 rounded bg-zinc-100" />
          </div>
        </div>
        <span className="h-8 w-8 rounded-full bg-zinc-100" />
      </div>
    </header>
  );
}
