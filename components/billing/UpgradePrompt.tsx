import Link from 'next/link';

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: 'banner' | 'card';
};

export function UpgradePrompt({
  title,
  description,
  ctaLabel = 'Upgrade plan',
  ctaHref = '/pricing',
  variant = 'banner',
}: Props) {
  if (variant === 'card') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10 2.75a.75.75 0 01.75.75V10l3.22-3.22a.75.75 0 011.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 011.06-1.06L9.25 10V3.5A.75.75 0 0110 2.75z"
                transform="rotate(180 10 10)"
              />
            </svg>
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-amber-800/80">{description}</p>
            ) : null}
            <Link
              href={ctaHref}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              {ctaLabel}
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
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 11a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM10 5.25a.75.75 0 01.75.75v4a.75.75 0 11-1.5 0V6a.75.75 0 01.75-.75z"
            />
          </svg>
        </span>
        <p className="text-sm text-amber-900">
          <span className="font-medium">{title}</span>
          {description ? <span className="text-amber-800/80"> — {description}</span> : null}
        </p>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
