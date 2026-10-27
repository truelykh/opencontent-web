"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-[#334155] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#CBD5E1] shadow-2xl p-8 text-center flex flex-col items-center">
          <div className="flex items-center gap-2.5 mb-6">
            <svg width={32} height={32} viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#FF9933" />
            </svg>
            <span style={{ fontSize: "32px", fontWeight: 400 }} className="text-[#FF9933] leading-none">
              Opencontent
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#334155]">System Alert</h2>
          <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
            A critical system exception was caught at the layout level.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#FF9933] hover:bg-[#E88520] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
