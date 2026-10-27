import React from "react";

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 pb-4 border-b border-slate-100" aria-hidden="true">
      <div className="h-3.5 w-24 rounded bg-slate-100 animate-pulse" />
      <div className="h-7 w-56 rounded bg-slate-200 animate-pulse" />
      <div className="h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

export default PageHeaderSkeleton;
