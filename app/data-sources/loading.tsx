import { DashboardNavSkeleton } from '@/components/dashboard/DashboardNavSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNavSkeleton />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-4 w-44" />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <article
                key={i}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5"
              >
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="mt-4 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-5/6" />
                <Skeleton className="mt-4 h-8 w-20" />
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Skeleton className="h-4 w-40" />
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <ul className="divide-y divide-zinc-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
