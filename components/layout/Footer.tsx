import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© 2026 Client Reporting Engine</p>

        <nav className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-zinc-900">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-zinc-900">
            Documentation
          </Link>
          <a href="mailto:aathithya594@gmail.com" className="hover:text-zinc-900">
            Support
          </a>
        </nav>

        <p>Built by Aathithya S</p>
      </div>
    </footer>
  );
}
