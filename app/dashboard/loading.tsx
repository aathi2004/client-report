import { DashboardNavSkeleton } from '@/components/dashboard/DashboardNavSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNavSkeleton />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="mt-3 h-9 w-20" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-4 w-80" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-44" />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-6 py-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
          <ul className="divide-y divide-zinc-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3 px-6 py-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
