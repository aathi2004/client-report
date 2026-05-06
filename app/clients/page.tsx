import Link from 'next/link';

import { AddClientModal } from '@/components/clients/AddClientModal';
import { DeleteClientButton } from '@/components/clients/DeleteClientButton';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { UpgradePrompt } from '@/components/billing/UpgradePrompt';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TIERS, getLimits, isUnlimited } from '@/lib/subscription';

export default async function ClientsPage() {
  const user = await requireAuth();

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { dataSources: true } },
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { generatedAt: true, createdAt: true, status: true },
      },
    },
  });

  const limits = getLimits(user.subscriptionTier);
  const atLimit =
    !isUnlimited(limits.maxClients) && clients.length >= limits.maxClients;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNav user={user} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Clients</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {isUnlimited(limits.maxClients)
                ? `${clients.length} ${clients.length === 1 ? 'client' : 'clients'}`
                : `${clients.length} of ${limits.maxClients} clients used on the ${TIERS[user.subscriptionTier].name} plan`}
            </p>
          </div>
          <AddClientModal
            disabled={atLimit}
            disabledReason={`You've reached the ${TIERS[user.subscriptionTier].name} plan limit.`}
            currentCount={clients.length}
            limit={isUnlimited(limits.maxClients) ? undefined : limits.maxClients}
          />
        </div>

        {atLimit ? (
          <div className="mt-6">
            <UpgradePrompt
              title="Upgrade to add more clients"
              description={`The ${TIERS[user.subscriptionTier].name} plan is limited to ${limits.maxClients} clients.`}
              ctaLabel="See plans"
            />
          </div>
        ) : null}

        {clients.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => {
              const lastReport = c.reports[0];
              const lastReportLabel = lastReport
                ? (lastReport.generatedAt ?? lastReport.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;
              return (
                <article
                  key={c.id}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {c.companyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.companyLogo}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-700">
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-zinc-900">{c.name}</h3>
                      <p className="truncate text-xs text-zinc-500">{c.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-sm">
                    <div>
                      <dt className="text-xs text-zinc-500">Data sources</dt>
                      <dd className="mt-0.5 font-medium text-zinc-900">
                        {c._count.dataSources}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-500">Last report</dt>
                      <dd className="mt-0.5 font-medium text-zinc-900">
                        {lastReportLabel ?? '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-medium text-zinc-700 hover:text-zinc-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/clients/${c.id}/edit`}
                        className="font-medium text-zinc-700 hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                    </div>
                    <DeleteClientButton id={c.id} name={c.name} />
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <svg viewBox="0 0 20 20" className="h-8 w-8" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 8a3 3 0 100-6 3 3 0 000 6zm6 1a2 2 0 100-4 2 2 0 000 4zm-6 1a5 5 0 00-5 5 1 1 0 001 1h8a1 1 0 001-1 5 5 0 00-5-5zm6 1a4 4 0 00-1.5.29A6 6 0 0113 15v1h4a1 1 0 001-1 4 4 0 00-4-4z"
          />
        </svg>
      </span>
      <p className="mt-6 text-xl font-semibold text-zinc-900">No clients yet</p>
      <p className="mt-2 max-w-sm text-sm text-zinc-600">
        Add your first client to start generating reports
      </p>
      <div className="mt-8">
        <AddClientModal size="large" />
      </div>
    </div>
  );
}
