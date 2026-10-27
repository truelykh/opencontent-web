import React from "react";

export function ChannelSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white" aria-hidden="true">
      {/* Avatar Circle */}
      <div className="w-16 h-16 shrink-0 rounded-full bg-slate-200 animate-pulse" />

      {/* Channel info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
        <div className="h-3.5 w-28 rounded bg-slate-100 animate-pulse" />
        <div className="h-3 w-36 rounded bg-slate-100 animate-pulse" />
      </div>

      {/* Button placeholder */}
      <div className="hidden sm:block w-28 h-9 rounded-full bg-slate-200 animate-pulse" />
    </div>
  );
}

export function ChannelSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChannelSkeleton key={i} />
      ))}
    </div>
  );
}

export default ChannelSkeleton;
