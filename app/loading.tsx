import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Header Skeleton */}
      <header className="sticky top-0 z-40 h-14 w-full border-b border-[#CBD5E1] bg-white/95 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF9933]/20 animate-pulse" />
          <div className="w-28 h-6 rounded-md bg-[#E2E8F0] animate-pulse" />
        </div>
        <div className="w-72 max-w-md h-9 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] animate-pulse hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 rounded-full bg-[#FF9933]/30 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-[#E2E8F0] animate-pulse" />
        </div>
      </header>

      {/* Main Body Skeleton */}
      <div className="flex-1 flex max-w-[1920px] mx-auto w-full">
        {/* Sidebar skeleton */}
        <aside className="w-56 border-r border-[#CBD5E1] bg-white p-4 hidden md:block space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-5 h-5 rounded-md bg-[#F1F5F9] animate-pulse" />
              <div
                className="h-4 rounded bg-[#E2E8F0] animate-pulse"
                style={{ width: `${60 + (i % 4) * 20}px` }}
              />
            </div>
          ))}
        </aside>

        {/* Content feed skeleton */}
        <main className="flex-1 p-6 space-y-8">
          {/* Hero Banner skeleton */}
          <div className="w-full h-44 rounded-2xl bg-gradient-to-r from-orange-50 to-slate-100 border border-[#FED7AA]/40 animate-pulse p-6 flex flex-col justify-end">
            <div className="w-48 h-6 rounded bg-[#FF9933]/30 mb-2" />
            <div className="w-80 h-4 rounded bg-[#CBD5E1]/60" />
          </div>

          {/* Video shelf skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF9933]/20 animate-pulse" />
              <div className="w-36 h-5 rounded bg-[#E2E8F0] animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="aspect-video w-full rounded-xl bg-[#E2E8F0] animate-pulse" />
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#CBD5E1] shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-1.5 py-1">
                      <div className="w-full h-3.5 rounded bg-[#E2E8F0] animate-pulse" />
                      <div className="w-2/3 h-3 rounded bg-[#F1F5F9] animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
