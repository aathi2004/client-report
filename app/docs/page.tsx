import Link from 'next/link';

import { MarketingHeader } from '@/components/layout/MarketingHeader';

export const metadata = {
  title: 'Documentation · Client Reporting Engine',
  description: 'Learn how to set up clients, connect data sources, and automate reports.',
};

const SECTIONS = [
  {
    title: 'Getting started',
    items: [
      { label: 'Create your account', href: '/auth/signin' },
      { label: 'Add your first client', href: '/clients' },
      { label: 'Connect a data source', href: '/data-sources' },
      { label: 'Generate your first report', href: '/reports/new' },
    ],
  },
  {
    title: 'Reports & schedules',
    items: [
      { label: 'Generating reports manually', href: '/reports/new' },
      { label: 'Setting up scheduled reports', href: '/schedules/new' },
      { label: 'Emailing a report to a client', href: '/reports' },
    ],
  },
  {
    title: 'Branding & workspace',
    items: [
      { label: 'Customize your agency branding', href: '/settings' },
      { label: 'Notification preferences', href: '/settings' },
      { label: 'API keys (Business plan)', href: '/settings' },
    ],
  },
  {
    title: 'Billing',
    items: [
      { label: 'Plans and pricing', href: '/pricing' },
      { label: 'Upgrade or downgrade', href: '/pricing' },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Documentation
        </h1>
        <p className="mt-3 text-base text-zinc-600">
          Quick links to the most common tasks. Full guides are coming soon — for anything not
          covered here, email{' '}
          <a
            href="mailto:aathithya594@gmail.com"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            aathithya594@gmail.com
          </a>
          .
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <h2 className="text-base font-semibold text-zinc-900">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-zinc-700 hover:text-indigo-600"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
