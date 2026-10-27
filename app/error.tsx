"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandLockup } from "@/components/layout/BrandLogo";
import { RefreshRounded, HomeRounded, WarningAmberRounded } from "@mui/icons-material";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    // Log exception to console in production
    console.error("Opencontent Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 selection:bg-[#FED7AA]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#CBD5E1] shadow-xl p-8 text-center flex flex-col items-center animate-in fade-in duration-300">
        <div className="mb-6">
          <BrandLockup size={32} />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] text-[#FF9933] flex items-center justify-center mb-4 shadow-xs">
          <WarningAmberRounded sx={{ fontSize: 32 }} />
        </div>

        <h1 className="text-xl font-bold text-[#334155] tracking-tight">
          Application encountered an error
        </h1>
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          An unexpected issue prevented this view from rendering. Your data is secure and no state was lost.
        </p>

        {error?.digest && (
          <div className="mt-4 px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-[11px] font-mono text-[#475569] border border-[#E2E8F0]">
            Incident Ref: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 btn-saffron py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RefreshRounded sx={{ fontSize: 18 }} />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={() => {
              router.push("/");
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <HomeRounded sx={{ fontSize: 18 }} />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
