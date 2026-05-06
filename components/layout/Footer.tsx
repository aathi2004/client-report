import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: 'mailto:aathithya594@gmail.com' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const RESOURCE_LINKS = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Support', href: 'mailto:aathithya594@gmail.com' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                CR
              </span>
              <span className="text-base font-semibold text-white">Client Reporting Engine</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">Automate your agency reporting</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterColumn title="Product" links={PRODUCT_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
            <FooterColumn title="Resources" links={RESOURCE_LINKS} />
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">
              Follow
            </p>
            <div className="mt-3 flex items-center gap-3">
              <SocialLink href="#" label="Twitter">
                <path
                  fill="currentColor"
                  d="M18.244 2H21.5l-7.5 8.57L23 22h-6.812l-5.34-6.98L4.74 22H1.48l8.02-9.165L1 2h6.914l4.83 6.39L18.244 2zm-1.197 18h1.832L7.06 4H5.094l11.953 16z"
                />
              </SocialLink>
              <SocialLink href="#" label="LinkedIn">
                <path
                  fill="currentColor"
                  d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.5 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 6.99V22h-4.56v-6.2c0-1.48-.03-3.39-2.07-3.39-2.07 0-2.39 1.62-2.39 3.29V22H7.72V8z"
                />
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© 2026 Client Reporting Engine. All rights reserved.</p>
          <p>Built by Aathithya S</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith('mailto:') ? (
              <a href={l.href} className="text-gray-400 transition-colors hover:text-white">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-gray-400 transition-colors hover:text-white">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        {children}
      </svg>
    </a>
  );
}
