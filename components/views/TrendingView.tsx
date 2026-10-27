"use client";

import React from "react";
import {
  ArrowBackRounded as ArrowBack,
  ExploreRounded as Explore,
  RefreshRounded as Refresh,
} from "@mui/icons-material";
import { VideoItem } from "@/types";
import VideoCard from "../video/VideoCard";
import { VideoCardSkeletonGrid } from "../skeletons";
import { TrendingCometIcon } from "../common/CategoryIcons";
import HorizontalPageHeader from "../common/HorizontalPageHeader";

interface TrendingViewProps {
  videos: VideoItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onExplore: () => void;
  onBackToHome: () => void;
  onPlay: (video: VideoItem) => void;
}

export default function TrendingView({
  videos,
  isLoading,
  error,
  onRetry,
  onExplore,
  onBackToHome,
  onPlay,
}: TrendingViewProps) {
  return (
    <section className="trending-view mx-auto w-full max-w-6xl" aria-labelledby="trending-title">
      <HorizontalPageHeader
        icon={TrendingCometIcon}
        title="Trending on OpenContent"
        description="Discover what's gaining attention across OpenContent."
        className="trending-page-header"
      />

      {isLoading && (
        <div className="pt-6" role="status" aria-live="polite" aria-label="Loading trending content">
          <p className="sr-only">Loading trending content</p>
          <VideoCardSkeletonGrid count={4} />
        </div>
      )}

      {!isLoading && error && (
        <div className="flex min-h-[360px] flex-col items-center justify-center py-12 text-center" role="alert">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--oc-surface-subtle)] text-[var(--oc-error)]">
            <Refresh className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[var(--oc-text-primary)]">
            Trending is temporarily unavailable
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--oc-text-secondary)]">
            We couldn&apos;t retrieve the recent activity needed to calculate trends. Please try again.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="btn-saffron inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Refresh className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--oc-border)] px-4 py-2.5 text-sm font-semibold text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
            >
              <ArrowBack className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && videos.length === 0 && (
        <div className="flex min-h-[360px] flex-col items-center justify-center py-12 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-dashed border-[var(--oc-brand)]/35" aria-hidden="true" />
            <span className="absolute inset-3 rounded-full border border-[var(--oc-border)]" aria-hidden="true" />
            <TrendingCometIcon className="relative h-8 w-8 text-[var(--oc-brand)]" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-[var(--oc-text-primary)] sm:text-2xl">
            Not enough verified activity yet
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--oc-text-secondary)] sm:text-base">
            There isn&apos;t enough recent, verified activity to calculate trends right now. Explore OpenContent to discover what is available.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onExplore}
              className="btn-saffron inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Explore className="h-4 w-4" aria-hidden="true" />
              Explore OpenContent
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--oc-border)] px-4 py-2.5 text-sm font-semibold text-[var(--oc-text-secondary)] transition-colors hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
            >
              <ArrowBack className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && videos.length > 0 && (
        <div className="pt-6">
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onPlay={onPlay} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
