import { DashboardNavSkeleton } from '@/components/dashboard/DashboardNavSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNavSkeleton />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-72" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
