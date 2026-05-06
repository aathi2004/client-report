import Link from 'next/link';

import { MarketingHeader } from '@/components/layout/MarketingHeader';

export const metadata = {
  title: 'About · Client Reporting Engine',
  description: 'Built to save agencies from manual client reporting.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          About Client Reporting Engine
        </h1>
        <p className="mt-4 text-base text-zinc-600">
          We built Client Reporting Engine for the agency owners and account managers who lose
          their Friday afternoons to spreadsheets, screenshots, and copy-paste.
        </p>

        <section className="mt-10 space-y-4 text-base leading-relaxed text-zinc-700">
          <h2 className="text-xl font-semibold text-zinc-900">Our mission</h2>
          <p>
            Help small and mid-market agencies deliver beautiful, on-brand client reports without
            burning hours per account. Connect once, template once, schedule once — then get your
            time back.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-zinc-900">Who it&apos;s for</h2>
          <p>
            Marketing agencies managing 5–100 clients across paid media, organic, and analytics
            channels. If you&apos;re still rebuilding the same monthly deck for every account,
            this is for you.
          </p>

          <h2 className="pt-4 text-xl font-semibold text-zinc-900">Get in touch</h2>
          <p>
            Questions, feedback, or partnership ideas? Reach out at{' '}
            <a
              href="mailto:aathithya594@gmail.com"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              aathithya594@gmail.com
            </a>
            .
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            Start Free Trial
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            See pricing
          </Link>
        </div>
      </main>
    </div>
  );
}
