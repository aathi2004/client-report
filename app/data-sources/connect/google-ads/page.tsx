import Link from 'next/link';

import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { requireAuth } from '@/lib/auth';
import { getGoogleAdsConfig } from '@/lib/integrations/google-ads';
import { prisma } from '@/lib/prisma';

export default async function ConnectGoogleAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const presetClientId = params.client ?? null;
  const configured = !!getGoogleAdsConfig();

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      companyLogo: true,
      dataSources: {
        where: { type: 'GOOGLE_ADS' },
        select: { id: true, isConnected: true, createdAt: true },
      },
    },
  });

  const visible = presetClientId
    ? clients.filter((c) => c.id === presetClientId)
    : clients;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/data-sources"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 010 1.06L5.81 9.25H17a.75.75 0 010 1.5H5.81l3.97 3.97a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to data sources
        </Link>

        <header className="mt-4 flex items-center gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-base font-bold text-white"
            aria-hidden="true"
          >
            GA
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Connect Google Ads
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Authorize access to pull campaigns, spend, and conversion metrics into reports.
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">What we'll request</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            <Bullet>Read access to your Google Ads account (`adwords` scope).</Bullet>
            <Bullet>An offline refresh token so reports can sync without re-authorizing.</Bullet>
            <Bullet>Tokens are encrypted at rest in our database.</Bullet>
          </ul>
        </section>

        {!configured ? (
          <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-sm font-semibold text-amber-900">
              Google Ads OAuth is not configured yet
            </h2>
            <p className="mt-1 text-sm text-amber-900/80">
              Set <code>GOOGLE_ADS_CLIENT_ID</code>, <code>GOOGLE_ADS_CLIENT_SECRET</code>,
              and <code>DATA_SOURCE_ENCRYPTION_KEY</code> in <code>.env</code>, then restart
              the dev server.
            </p>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            {presetClientId ? 'Connect for this client' : 'Pick a client'}
          </h2>
          {visible.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-zinc-900">No clients available</p>
              <p className="mt-1 text-sm text-zinc-500">
                Add a client first, then connect their Google Ads account.
              </p>
              <Link
                href="/clients"
                className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Go to clients
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
              {visible.map((c) => {
                const existing = c.dataSources[0];
                return (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {c.companyLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.companyLogo}
                          alt=""
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                        <p className="text-xs text-zinc-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {existing?.isConnected ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Already connected
                        </span>
                      ) : null}
                      <Link
                        href={`/api/sources/google-ads/connect?client=${c.id}`}
                        prefetch={false}
                        aria-disabled={!configured}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          configured
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                            : 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                        }`}
                      >
                        {existing ? 'Reconnect' : 'Connect with Google'}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
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
      <span>{children}</span>
    </li>
  );
}
