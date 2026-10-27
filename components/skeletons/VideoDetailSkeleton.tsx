import React from "react";

export function VideoDetailSkeleton() {
  return (
    <div className="w-full space-y-4" aria-hidden="true">
      {/* 16:9 Player Viewport Placeholder */}
      <div className="aspect-video w-full rounded-2xl bg-slate-900/90 animate-pulse flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/10" />
      </div>

      {/* Video Title Line */}
      <div className="space-y-2 pt-2">
        <div className="h-6 w-3/4 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
      </div>

      {/* Channel info and Actions row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-9 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-20 h-9 rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>

      {/* Description Box Placeholder */}
      <div className="h-28 w-full rounded-xl bg-slate-100 animate-pulse" />
    </div>
  );
}

export default VideoDetailSkeleton;
