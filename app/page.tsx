import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <CallToAction />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-zinc-100">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white">
            CR
          </span>
          <span className="font-semibold tracking-tight text-zinc-900">Client Reporting</span>
        </Link>
        <div className="flex items-center gap-3">
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
            Get Started
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
        <div className="mx-auto aspect-[1155/678] w-[36rem] bg-gradient-to-tr from-violet-200 via-sky-200 to-emerald-200 opacity-40 sm:w-[72rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Built for marketing agencies
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
            Automate Client Reporting
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Pull data from Google Ads, Meta, GA4, and Instagram. Generate beautiful, white-labeled
            PDF reports on autopilot — and stop spending Friday afternoons in spreadsheets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Get Started
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
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: 'Connect every channel',
    description:
      'Plug into Google Ads, Meta Ads, GA4, and Instagram Insights in minutes. Data syncs automatically.',
    icon: (
      <path
        fill="currentColor"
        d="M11 3a1 1 0 10-2 0v6H3a1 1 0 100 2h6v6a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3z"
      />
    ),
  },
  {
    title: 'White-labeled PDFs',
    description:
      'Reports use your agency logo, brand color, and custom domain — your clients never see ours.',
    icon: (
      <path
        fill="currentColor"
        d="M4 3a2 2 0 012-2h6.586A2 2 0 0114 1.586L17.414 5A2 2 0 0118 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z"
      />
    ),
  },
  {
    title: 'Scheduled delivery',
    description:
      'Send weekly or monthly reports on a fixed cadence. Set it once, and your inbox does the rest.',
    icon: (
      <path
        fill="currentColor"
        d="M5.25 2A2.25 2.25 0 003 4.25v11.5A2.25 2.25 0 005.25 18h9.5A2.25 2.25 0 0017 15.75V8.5h-3.75A2.25 2.25 0 0111 6.25V2.5H5.25zm7.25.5v3.75c0 .414.336.75.75.75H17v-.043a1.5 1.5 0 00-.44-1.06L13.06 2.94A1.5 1.5 0 0012 2.5h-.5z"
      />
    ),
  },
  {
    title: 'Reusable templates',
    description:
      'Build a template once and reuse it across every client. Customize sections per account when you need to.',
    icon: (
      <path
        fill="currentColor"
        d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm10-10a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zm-2 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    ),
  },
  {
    title: 'Insights, not just numbers',
    description:
      'AI-generated commentary explains what changed and why — so you spend less time writing wrap-ups.',
    icon: (
      <path
        fill="currentColor"
        d="M10 2a1 1 0 011 1v1a6 6 0 016 6h1a1 1 0 110 2h-1a6 6 0 01-6 6v1a1 1 0 11-2 0v-1a6 6 0 01-6-6H2a1 1 0 110-2h1a6 6 0 016-6V3a1 1 0 011-1zm0 5a3 3 0 100 6 3 3 0 000-6z"
      />
    ),
  },
  {
    title: 'Built for agencies',
    description:
      'Manage every client from one workspace. Add team members and scale from 1 to 100 accounts.',
    icon: (
      <path
        fill="currentColor"
        d="M7 8a3 3 0 100-6 3 3 0 000 6zm6 1a2 2 0 100-4 2 2 0 000 4zm-6 1a5 5 0 00-5 5 1 1 0 001 1h8a1 1 0 001-1 5 5 0 00-5-5zm6 1a4 4 0 00-1.5.29A6 6 0 0113 15v1h4a1 1 0 001-1 4 4 0 00-4-4z"
      />
    ),
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-zinc-100 bg-zinc-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold text-zinc-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Reports your clients will actually read
          </p>
          <p className="mt-4 text-base text-zinc-600">
            Stop assembling decks manually. Connect, template, schedule — done.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-zinc-900 px-6 py-20 text-center shadow-xl sm:px-16">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ship your next client report this week
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-300">
            Join agencies saving 8+ hours every month on reporting. Free to start, no credit card.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
            >
              Get Started
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
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Client Reporting. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-zinc-900">
            Privacy
          </a>
          <a href="#" className="hover:text-zinc-900">
            Terms
          </a>
          <a href="#" className="hover:text-zinc-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
