export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Thumbnail skeleton with glass effect */}
      <div className="aspect-video rounded-xl skeleton-glass" />

      {/* Info skeleton */}
      <div className="mt-3 flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full skeleton-glass flex-shrink-0" />

        <div className="flex-1 space-y-2.5">
          {/* Title lines */}
          <div className="h-4 rounded-lg skeleton-glass w-full" />
          <div className="h-4 rounded-lg skeleton-glass w-4/5" />

          {/* Channel */}
          <div className="h-3 rounded-md skeleton-glass w-1/2 mt-3" />

          {/* Stats */}
          <div className="h-3 rounded-md skeleton-glass w-2/3" />
        </div>
      </div>
    </div>
  );
}
