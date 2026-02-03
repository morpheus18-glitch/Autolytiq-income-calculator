import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <Skeleton className="h-24 rounded-lg" />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <Skeleton className="h-4 w-24 mx-auto mb-2" />
        <Skeleton className="h-10 w-40 mx-auto" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border">
            <Skeleton className="h-3 w-16 mx-auto mb-2" />
            <Skeleton className="h-6 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-32 w-32 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
