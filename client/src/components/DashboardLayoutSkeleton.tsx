import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-parchment">
      <div className="w-[280px] border-r border-gold/20 bg-cream/50 p-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-8 w-8 rounded-md bg-gold/15" />
          <Skeleton className="h-4 w-32 bg-gold/15" />
        </div>

        <div className="space-y-2 px-2">
          <Skeleton className="h-10 w-full rounded-lg bg-gold/15" />
          <Skeleton className="h-10 w-full rounded-lg bg-gold/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-gold/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-gold/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-gold/10" />
          <Skeleton className="h-10 w-full rounded-lg bg-gold/10" />
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-1">
            <Skeleton className="h-9 w-9 rounded-full bg-burgundy/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20 bg-gold/15" />
              <Skeleton className="h-2 w-32 bg-gold/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 bg-parchment/50">
        <Skeleton className="h-12 w-48 rounded-lg bg-gold/15" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl bg-cream" />
          <Skeleton className="h-32 rounded-xl bg-cream" />
          <Skeleton className="h-32 rounded-xl bg-cream" />
        </div>
        <Skeleton className="h-64 rounded-xl bg-cream" />
      </div>
    </div>
  );
}
