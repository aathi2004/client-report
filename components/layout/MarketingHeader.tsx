import Link from 'next/link';

export function MarketingHeader() {
  return (
    <header className="border-b border-zinc-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
            CR
          </span>
          <span className="font-semibold tracking-tight text-zinc-900">Client Reporting</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/pricing"
            className="hidden rounded-md px-3 py-2 font-medium text-zinc-700 hover:text-zinc-900 sm:inline-block"
          >
            Pricing
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
