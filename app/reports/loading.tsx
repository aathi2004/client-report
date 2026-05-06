import { DashboardNavSkeleton } from '@/components/dashboard/DashboardNavSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50">
      <DashboardNavSkeleton />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-7 gap-4 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-7 items-center gap-4 border-b border-zinc-100 px-4 py-4 last:border-b-0"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <div className="flex justify-end gap-3">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
