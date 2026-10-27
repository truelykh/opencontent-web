import React from "react";
import { VideoCardSkeleton } from "./VideoCardSkeleton";

export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {/* Search Header summary placeholder */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
      </div>

      {/* Results list */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default SearchResultsSkeleton;
