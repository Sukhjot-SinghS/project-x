export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-charcoal/5">
      <div className="h-32 skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 rounded-lg skeleton-shimmer" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full skeleton-shimmer" />
          <div className="h-3 w-24 rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full skeleton-shimmer" />
          <div className="h-6 w-16 rounded-full skeleton-shimmer" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-28 rounded skeleton-shimmer" />
          <div className="h-3 w-16 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function TripCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}
