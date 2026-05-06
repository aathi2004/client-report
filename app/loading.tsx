export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <div className="h-16 border-b border-zinc-100 bg-white" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-7 w-48 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-white"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
