"use client";

import React from "react";
import { ArrowForwardRounded as ArrowRight } from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { VideoItem } from "@/types";
import VideoCard from "./VideoCard";

export type ShelfTone =
  | "orange"
  | "emerald"
  | "red"
  | "pink"
  | "blue"
  | "cyan"
  | "violet"
  | "amber"
  | "indigo"
  | "rose"
  | "purple"
  | "sky"
  | "teal"
  | "slate";

const TONES: Record<ShelfTone, { tile: string; icon: string }> = {
  orange: { tile: "", icon: "text-[var(--oc-action)]" },
  emerald: { tile: "", icon: "text-[var(--oc-action)]" },
  red: { tile: "", icon: "text-[var(--oc-action)]" },
  pink: { tile: "", icon: "text-[var(--oc-action)]" },
  blue: { tile: "", icon: "text-[var(--oc-action)]" },
  cyan: { tile: "", icon: "text-[var(--oc-action)]" },
  violet: { tile: "", icon: "text-[var(--oc-action)]" },
  amber: { tile: "", icon: "text-[var(--oc-action)]" },
  indigo: { tile: "", icon: "text-[var(--oc-action)]" },
  rose: { tile: "", icon: "text-[var(--oc-action)]" },
  purple: { tile: "", icon: "text-[var(--oc-action)]" },
  sky: { tile: "", icon: "text-[var(--oc-action)]" },
  teal: { tile: "", icon: "text-[var(--oc-action)]" },
  slate: { tile: "", icon: "text-[var(--oc-action)]" },
};

interface ShelfProps {
  title: string;
  icon: React.ComponentType<SvgIconProps>;
  tone: ShelfTone;
  videos: VideoItem[];
  onPlay: (video: VideoItem) => void;
  onSeeAll?: () => void;
  onOpenUpload?: (category: string) => void;
  showRank?: boolean;
  showLikes?: boolean;
  pulse?: boolean;
  subtitle?: string;
  category?: string;
}

export default function Shelf({
  title,
  icon: Icon,
  tone,
  videos,
  onPlay,
  onSeeAll,
  showLikes = false,
  pulse = false,
  subtitle,
}: ShelfProps) {
  const palette = TONES[tone] || TONES.slate;

  return (
    <section className="border-t border-[var(--oc-border)] py-5 first:border-t-0 first:pt-1">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className={`h-4 w-4 shrink-0 ${palette.icon} ${pulse ? "animate-pulse" : ""}`} />
          <div className="flex min-w-0 items-baseline gap-2 overflow-hidden">
            <h2 className="shrink-0 text-[16px] font-medium tracking-tight text-[var(--oc-text-primary)] leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-[13px] font-normal leading-tight text-[var(--oc-text-secondary)]">{subtitle}</p>
            )}
          </div>
        </div>

        {onSeeAll && videos.length > 0 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="group/see flex shrink-0 items-center gap-1 rounded-md border border-[var(--oc-border)] bg-[var(--oc-background)] px-3 py-1.5 text-xs font-medium text-[var(--oc-text-secondary)] transition-colors hover:border-[var(--oc-border-strong)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
          >
            See all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/see:translate-x-0.5" />
          </button>
        )}
      </div>

      {videos.length > 0 && (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlay}
              showLikes={showLikes}
            />
          ))}
        </div>
      )}

    </section>
  );
}
