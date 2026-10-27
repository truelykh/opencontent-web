"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeftRounded as ChevronLeft,
  ChevronRightRounded as ChevronRight,
  OpenInNewRounded as ExternalLink,
  AutoAwesomeRounded as Sparkles,
  VerifiedUserRounded as ShieldCheck,
  PauseRounded as Pause,
  PlayArrowRounded as Play,
  CurrencyRupeeRounded as IndianRupee,
  StarRounded as Star,
  CheckCircleRounded as CheckCircle2,
} from "@mui/icons-material";
import { AdSimulation } from "@/types";

interface HomeAdCarouselProps {
  ads: AdSimulation[];
  onAdClick?: (ad: AdSimulation) => void;
}

export function HomeAdCarouselSkeleton() {
  return (
    <div className="w-full space-y-3" aria-label="Loading sponsor carousel" aria-busy="true">
      <div className="aspect-[21/9] min-h-[180px] max-h-[300px] w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-200" />
      <div className="flex justify-center gap-2 pb-1">
        {[0, 1, 2, 3, 4].map((item) => <span key={item} className="h-2.5 w-2.5 rounded-full bg-slate-200" />)}
      </div>
    </div>
  );
}

export default function HomeAdCarousel({ ads, onAdClick }: HomeAdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reportedTokensRef = useRef<Set<string>>(new Set());

  const displayAds = ads ? ads.slice(0, 10) : [];
  const currentAd = displayAds[currentIndex] || displayAds[0];

  // Telemetry: Record impression to Go Microservice (:8090) -> PostgreSQL (openconnect_ads)
  useEffect(() => {
    if (!currentAd?.trackingToken) return;
    if (reportedTokensRef.current.has(currentAd.trackingToken)) return;

    reportedTokensRef.current.add(currentAd.trackingToken);
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "impression",
        token: currentAd.trackingToken,
        placement: "home_feed_carousel",
      }),
    }).catch(() => {
      // Telemetry failures should never disrupt user experience
    });
  }, [currentAd]);

  // Auto-advance every 5.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused || displayAds.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayAds.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, displayAds.length]);

  if (!displayAds || displayAds.length === 0 || !currentAd) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayAds.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayAds.length) % displayAds.length);
  };

  const handleCtaClick = (e: React.MouseEvent, ad: AdSimulation) => {
    e.stopPropagation();

    // Record verified click telemetry to Go Microservice (:8090) -> PostgreSQL (openconnect_ads)
    if (ad.trackingToken) {
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "click",
          token: ad.trackingToken,
          placement: "home_feed_carousel",
        }),
      }).catch(() => {});
    }

    setToastMessage("Sponsor link opened.");
    setTimeout(() => setToastMessage(null), 3500);

    if (ad.ctaUrl) {
      window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
    }

    if (onAdClick) {
      onAdClick(ad);
    }
  };

  if (!currentAd) return null;

  return (
    <div className="w-full space-y-3">
      {/* Main Ad Card */}
      <div
        className="relative rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#334155] shadow-md group select-none transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Toast Notification for ad interaction */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-40 bg-[#334155] text-white px-3.5 py-2 rounded-lg shadow-2xl text-xs flex items-center gap-2 border border-[#334155] animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Slide Presentation */}
        <div className="relative aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] min-h-[220px] max-h-[340px] w-full overflow-hidden">
          {/* Background Image with Gradient Mask */}
          <ContentImage
            src={currentAd.bannerUrl}
            alt={currentAd.title}
            className="absolute inset-0 w-full h-full object-cover object-center scale-100 transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Cinematic Backdrop Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#334155] via-[#334155]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#334155]/90 via-transparent to-black/30" />

          {/* Content Container */}
          <div className="absolute inset-0 p-5 sm:p-7 md:p-8 flex flex-col justify-between z-10 max-w-2xl">
            {/* Top Metadata Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF9933] text-white shadow-xs">
                <Sparkles className="w-3 h-3 fill-white" />
                Featured Sponsor
              </span>

              {currentAd.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                  {currentAd.badge}
                </span>
              )}

              <span className="text-[10px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                Ad {currentIndex + 1} of {displayAds.length}
              </span>
            </div>

            {/* Center Title & Tagline */}
            <div className="space-y-1.5 my-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FDBA74]">
                <span>{currentAd.advertiser}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                {currentAd.rating && (
                  <span className="flex items-center gap-0.5 text-white/80 font-semibold text-[11px] ml-1">
                    <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" />
                    {currentAd.rating}
                  </span>
                )}
              </div>

              <h2 className="text-[16px] font-normal text-white tracking-tight leading-snug drop-shadow-sm">
                {currentAd.title}
              </h2>

              <p className="text-xs text-slate-200 line-clamp-2 max-w-xl leading-relaxed hidden sm:block">
                {currentAd.tagline}
              </p>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={(e) => handleCtaClick(e, currentAd)}
                className="btn-saffron py-2 px-4 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{currentAd.ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {currentAd.cpm && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl backdrop-blur-xs">
                  <IndianRupee className="w-3 h-3" />
                  <span>₹{currentAd.cpm} CPM Sponsor Pool</span>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Prev/Next Arrow Buttons */}
          <button
            onClick={handlePrev}
            title="Previous Sponsor Ad"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-[#FF9933] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={handleNext}
            title="Next Sponsor Ad"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-[#FF9933] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Play/Pause Control in Top Right */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Auto-Slide" : "Pause Auto-Slide"}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/20 text-xs transition-colors z-20 cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
          </button>
        </div>
      </div>

      {/* Slide Indicator Dots Below Ad Carousel */}
      <div className="flex items-center justify-center gap-2 pt-0.5 pb-1">
        {displayAds.map((ad, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={ad.id}
              onClick={() => setCurrentIndex(idx)}
              title={`${idx + 1}. ${ad.advertiser} — ${ad.title}`}
              aria-label={`Go to ad ${idx + 1}: ${ad.advertiser}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? "w-8 bg-[#FF9933] shadow-sm"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
