import Link from 'next/link';

type Props = {
  title: string;
  description: string;
  requiredTier: 'PRO' | 'BUSINESS';
};

export function FeatureLock({ title, description, requiredTier }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10 1a4 4 0 00-4 4v3H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4zm2 7V5a2 2 0 10-4 0v3h4z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <h2 className="mt-4 text-base font-semibold text-zinc-900">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">{description}</p>
      <Link
        href="/pricing"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Upgrade to {requiredTier === 'PRO' ? 'Pro' : 'Business'}
      </Link>
    </div>
  );
}
