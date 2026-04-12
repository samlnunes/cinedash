export function DetailsSkeleton() {
  return (
    <div>
      <div className="relative -mt-6 left-1/2 -ml-[50vw] w-screen h-44 animate-pulse bg-muted sm:h-56" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="-mt-24 aspect-[2/3] w-48 shrink-0 animate-pulse rounded-lg bg-muted ring-4 ring-background sm:w-56 md:w-64" />
        <div className="flex flex-1 flex-col gap-4 pt-2 sm:pt-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="size-20 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="aspect-video animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
