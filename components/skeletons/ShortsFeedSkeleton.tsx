import React from "react";

export function ShortsFeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-2">
          {/* 9:16 Vertical Card */}
          <div className="aspect-[9/16] w-full rounded-2xl bg-slate-200 animate-pulse relative overflow-hidden">
            <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
              <div className="h-3 w-4/5 rounded bg-slate-300" />
              <div className="h-2.5 w-1/2 rounded bg-slate-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShortsFeedSkeleton;
