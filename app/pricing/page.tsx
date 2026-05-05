import Link from 'next/link';

import { SubscriptionTier } from '@prisma/client';

import { CheckoutButton } from '@/components/billing/CheckoutButton';
import { getCurrentUser } from '@/lib/auth';
import { TIERS } from '@/lib/subscription';

const ORDER: SubscriptionTier[] = ['FREE', 'PRO', 'BUSINESS'];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const currentTier = user?.subscriptionTier ?? null;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white">
              CR
            </span>
            <span className="font-semibold tracking-tight text-zinc-900">Client Reporting</span>
          </Link>
          <Link
            href={user ? '/dashboard' : '/auth/signin'}
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            {user ? 'Back to dashboard' : 'Sign in'}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-base text-zinc-600">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>

        {params.canceled ? (
          <div className="mx-auto mt-8 max-w-xl rounded-lg border border-zinc-200 bg-white p-4 text-center text-sm text-zinc-700">
            Checkout was canceled. You can try again any time.
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {ORDER.map((tier) => {
            const plan = TIERS[tier];
            const isCurrent = currentTier === tier;
            const isFeatured = tier === 'PRO';
            return (
              <div
                key={tier}
                className={`flex flex-col rounded-2xl border bg-white p-8 ${
                  isFeatured
                    ? 'border-zinc-900 shadow-lg ring-1 ring-zinc-900'
                    : 'border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">{plan.name}</h2>
                  {isFeatured ? (
                    <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">
                      Most popular
                    </span>
                  ) : null}
                </div>
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

                <div className="mt-8">
                  {tier === 'FREE' ? (
                    <Link
                      href={user ? '/dashboard' : '/auth/signin'}
                      className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                    >
                      {isCurrent ? 'Current plan' : 'Get started'}
                    </Link>
                  ) : isCurrent ? (
                    <span className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-500">
                      Current plan
                    </span>
                  ) : user ? (
                    <CheckoutButton
                      tier={tier as 'PRO' | 'BUSINESS'}
                      className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                        isFeatured
                          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                          : 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </CheckoutButton>
                  ) : (
                    <Link
                      href={`/auth/signin?callbackUrl=${encodeURIComponent('/pricing')}`}
                      className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                        isFeatured
                          ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                          : 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      Get started
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-500">
          All prices in USD. Taxes may apply at checkout.
        </p>
      </main>
    </div>
  );
}
