import Link from 'next/link';

import { SubscriptionTier } from '@prisma/client';

import { TIERS } from '@/lib/subscription';

const PRICING_ORDER: SubscriptionTier[] = ['FREE', 'PRO', 'BUSINESS'];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <PricingPreview />
        <SocialProof />
        <FinalCTA />
      </main>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
            CR
          </span>
          <span className="font-semibold tracking-tight text-zinc-900">Client Reporting</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 sm:inline-block"
          >
            Pricing
          </Link>
          <Link
            href="/auth/signin"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu blur-3xl"
      >
        <div className="mx-auto aspect-[1155/678] w-[36rem] bg-gradient-to-tr from-indigo-300 via-violet-300 to-sky-300 opacity-40 sm:w-[72rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Built for marketing agencies
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
            Automate Client Reporting{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              for Your Agency
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Generate professional branded reports automatically. Save 10+ hours per week.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start Free Trial
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M10.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.97-3.97H3.75a.75.75 0 010-1.5h10.44l-3.97-3.97a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              See how it works →
            </a>
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            No credit card required · Free tier available
          </p>
        </div>

        <ReportPreview />
      </div>
    </section>
  );
}

function ReportPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-8 -z-10 rounded-3xl bg-gradient-to-r from-indigo-200 via-violet-200 to-sky-200 opacity-50 blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl ring-1 ring-zinc-900/5">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs font-medium text-zinc-500">
            Acme-Agency-Q2-Report.pdf
          </span>
        </div>
        <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-3 sm:p-10">
          <div className="sm:col-span-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                  A
                </span>
                <span className="text-sm font-semibold text-zinc-900">Acme Agency</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900">
                Q2 Performance Report
              </h3>
              <p className="text-xs text-zinc-500">Apr 1 – Jun 30 · Prepared for Northwind Co.</p>
            </div>
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-block">
              ↑ 24% vs Q1
            </span>
          </div>

          <StatCard label="Impressions" value="1.2M" delta="+18%" positive />
          <StatCard label="Conversions" value="3,847" delta="+24%" positive />
          <StatCard label="Cost / Lead" value="$12.40" delta="-9%" positive />

          <div className="sm:col-span-3 rounded-xl border border-zinc-100 bg-zinc-50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-600">Conversions over time</p>
              <span className="text-xs text-zinc-400">Last 90 days</span>
            </div>
            <div className="mt-4 flex h-24 items-end gap-1.5">
              {[40, 55, 48, 62, 58, 70, 65, 78, 72, 82, 76, 88, 84, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-violet-400"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
      <p
        className={`mt-1 text-xs font-medium ${
          positive ? 'text-emerald-600' : 'text-rose-600'
        }`}
      >
        {delta}
      </p>
    </div>
  );
}

const FEATURES = [
  {
    title: 'Automated PDF generation',
    description:
      'Pull live data from every channel and produce polished, multi-page PDF reports in seconds — no spreadsheets, no manual screenshots.',
    icon: (
      <path
        fill="currentColor"
        d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"
      />
    ),
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    title: 'Custom branding',
    description:
      'Upload your logo, set your brand color, and add your domain. Every report your client receives looks like it came from your agency.',
    icon: (
      <path
        fill="currentColor"
        d="M10 2a1 1 0 01.894.553l1.84 3.68 4.06.59a1 1 0 01.554 1.706l-2.94 2.866.694 4.045a1 1 0 01-1.45 1.054L10 14.55l-3.652 1.944a1 1 0 01-1.45-1.054l.693-4.045L2.652 8.529a1 1 0 01.554-1.706l4.06-.59 1.84-3.68A1 1 0 0110 2z"
      />
    ),
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    title: 'Scheduled delivery',
    description:
      'Set a weekly or monthly cadence once. Reports build themselves, land in your client’s inbox on time, and you stay focused on the work.',
    icon: (
      <path
        fill="currentColor"
        d="M5.25 2A2.25 2.25 0 003 4.25v11.5A2.25 2.25 0 005.25 18h9.5A2.25 2.25 0 0017 15.75V8.5h-3.75A2.25 2.25 0 0111 6.25V2.5H5.25zm7.25.5v3.75c0 .414.336.75.75.75H17v-.043a1.5 1.5 0 00-.44-1.06L13.06 2.94A1.5 1.5 0 0012 2.5h-.5z"
      />
    ),
    gradient: 'from-sky-500 to-indigo-600',
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold text-indigo-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Reports your clients will actually read
          </p>
          <p className="mt-4 text-base text-zinc-600">
            Stop assembling decks manually. Connect, brand, schedule — done.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-sm`}
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-base font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold text-indigo-600">Pricing</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Plans that scale with your agency
          </p>
          <p className="mt-4 text-base text-zinc-600">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_ORDER.map((tier) => {
            const plan = TIERS[tier];
            const isFeatured = tier === 'PRO';
            return (
              <div
                key={tier}
                className={`relative flex flex-col rounded-2xl border bg-white p-8 ${
                  isFeatured
                    ? 'border-indigo-600 shadow-xl ring-1 ring-indigo-600'
                    : 'border-zinc-200'
                }`}
              >
                {isFeatured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-zinc-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-zinc-600">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-zinc-900">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-sm text-zinc-500">/month</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                      <svg
                        viewBox="0 0 20 20"
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4L8.5 12.1l6.8-6.8a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            See Full Pricing
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.97-3.97H3.75a.75.75 0 010-1.5h10.44l-3.97-3.97a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="border-t border-zinc-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Built for agencies managing 5–100 clients
          </p>
          <p className="mt-4 text-base text-zinc-600">
            From boutique studios to mid-market agencies — Client Reporting handles every account
            from one workspace.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <Stat label="hours saved per week" value="10+" />
          <Stat label="clients per workspace" value="5–100" />
          <Stat label="reports automated monthly" value="Unlimited" />
        </div>

        <figure className="mx-auto mt-14 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
          <svg
            viewBox="0 0 32 32"
            className="h-8 w-8 text-indigo-500"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M9 8C5.7 8 3 10.7 3 14v10h10V14H7c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"
            />
          </svg>
          <blockquote className="mt-4 text-xl font-medium leading-relaxed tracking-tight text-zinc-900 sm:text-2xl">
            “This saves me 12 hours every month. Game changer!”
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
              MA
            </span>
            <div className="text-sm">
              <p className="font-semibold text-zinc-900">Marketing Agency Owner</p>
              <p className="text-zinc-500">Verified customer</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-600">{label}</p>
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-violet-950 px-6 py-20 text-center shadow-xl sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          >
            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-500 blur-3xl" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start Your Free Trial
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-300">
            Join agencies saving 10+ hours every week on reporting. No credit card required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-900 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start Free Trial
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M10.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.97-3.97H3.75a.75.75 0 010-1.5h10.44l-3.97-3.97a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              View pricing →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

