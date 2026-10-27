import React from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/layout/BrandLogo";
import { HomeRounded, ExploreRounded } from "@mui/icons-material";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#CBD5E1] shadow-xl p-8 sm:p-10 flex flex-col items-center animate-in fade-in duration-300">
        <div className="mb-6">
          <BrandLockup size={34} />
        </div>

        <div className="text-6xl font-black text-[#FF9933] tracking-tight leading-none mb-3">
          404
        </div>
        <h1 className="text-xl font-bold text-[#334155]">Page Not Found</h1>
        <p className="text-xs text-[#64748B] mt-2 max-w-sm leading-relaxed">
          The requested page or video resource does not exist or has moved. Browse our public domain archives below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-8">
          <Link
            href="/"
            className="flex-1 btn-saffron py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <HomeRounded sx={{ fontSize: 18 }} />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/?tab=studio"
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ExploreRounded sx={{ fontSize: 18 }} />
            <span>Opencontent Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
