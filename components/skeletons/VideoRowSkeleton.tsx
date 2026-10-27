import React from "react";

export function VideoRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 p-3 rounded-xl border border-slate-100 bg-white" aria-hidden="true">
      {/* 16:9 Thumbnail skeleton */}
      <div className="w-full sm:w-48 aspect-video shrink-0 rounded-lg bg-slate-200 animate-pulse" />

      {/* Info column */}
      <div className="flex-1 min-w-0 space-y-2.5 w-full py-1">
        <div className="h-4 w-4/5 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-3/5 rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

export function VideoRowSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <VideoRowSkeleton key={i} />
      ))}
    </div>
  );
}

export default VideoRowSkeleton;
