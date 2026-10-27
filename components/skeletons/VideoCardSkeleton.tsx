import React from "react";

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col w-full select-none" aria-hidden="true">
      {/* 16:9 Thumbnail skeleton */}
      <div className="aspect-video w-full rounded-lg bg-[var(--oc-surface-subtle)] animate-pulse" />

      {/* Info Row skeleton */}
      <div className="mt-3 flex items-start gap-3">
        {/* Channel Avatar circle */}
        <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--oc-surface-subtle)] animate-pulse" />

        {/* Title and metadata lines */}
        <div className="flex-1 min-w-0 space-y-2 py-0.5">
          <div className="h-4 w-full rounded bg-[var(--oc-surface-subtle)] animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-[var(--oc-surface-subtle)] animate-pulse" />
          <div className="mt-1 h-3 w-1/2 rounded bg-[var(--oc-surface-subtle)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function VideoCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default VideoCardSkeleton;
