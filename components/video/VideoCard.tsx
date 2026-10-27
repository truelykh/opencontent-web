"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState } from "react";
import {
  PlayArrowRounded as Play,
  ChildCareRounded as Baby,
  SportsEsportsRounded as Gamepad2,
  WarningAmberRounded as AlertTriangle,
  CheckCircleRounded as CheckCircle2,
} from "@mui/icons-material";
import { VideoItem } from "@/types";

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  rankBadge?: number;
  highlightBadge?: string;
  showLikes?: boolean;
}

/** 894100 -> "894K", 1250000 -> "1.3M" — keeps meta clean like YouTube */
function compactCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${
      thousands >= 100
        ? Math.round(thousands)
        : thousands.toFixed(1).replace(/\.0$/, "")
    }K`;
  }
  return `${value}`;
}

export default function VideoCard({
  video,
  onPlay,
  highlightBadge,
}: VideoCardProps) {
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const getAgeBadge = () => {
    switch (video.ageProfile) {
      case "kids":
        return (
          <span className="badge badge-sm badge-success gap-1 text-[10px] font-bold shadow-xs">
            <Baby className="w-3 h-3" />
            Kids Safe
          </span>
        );
      case "teen":
        return (
          <span className="badge badge-sm badge-info gap-1 text-[10px] font-bold shadow-xs">
            <Gamepad2 className="w-3 h-3" />
            Teen 13+
          </span>
        );
      case "adult":
        return (
          <span className="badge badge-sm badge-error gap-1 text-[10px] font-bold shadow-xs">
            <AlertTriangle className="w-3 h-3" />
            Adult 18+
          </span>
        );
      default:
        return null;
    }
  };

  const uploaderInitials = (video.uploader?.name || "OC")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      onClick={() => onPlay(video)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPlay(video);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Play ${video.title}`}
      className="group flex w-full cursor-pointer select-none flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
    >
      {/* 16:9 Thumbnail with YouTube style duration badge */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--oc-text-primary)]">
        {thumbError || !video.thumbnail ? (
          <div className="flex h-full w-full items-center justify-center bg-[var(--oc-text-primary)] text-[var(--oc-text-secondary)]">
            <Play className="h-10 w-10 text-white opacity-30" />
          </div>
        ) : (
          <ContentImage
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            decoding="async"
            onError={() => setThumbError(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        )}

        {/* Subtle Dark gradient on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Play affordance appears on hover and keyboard focus without hiding the title. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-white text-[var(--oc-text-primary)] shadow-sm ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-100">
            <Play className="w-4.5 h-4.5 fill-white ml-0.5" />
          </span>
        </div>

        {/* Top badges use semantic status colors only where the content requires them. */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap max-w-[85%]">
          {video.category === "Live Channels" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#DC2626] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Live
            </span>
          )}
          {getAgeBadge()}
          {highlightBadge && (
            <span className="badge badge-sm badge-neutral gap-1 text-[10px] font-extrabold border border-white/20 backdrop-blur-xs shadow-xs">
              {highlightBadge}
            </span>
          )}
        </div>

        {/* Ad Tag on top right */}
        {video.adSettings?.monetizationEnabled && (
          <div className="absolute top-2 right-2 badge badge-sm bg-black/70 text-white border border-white/20 gap-1 text-[9.5px] font-bold backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Free · Ads
          </div>
        )}

        {/* YouTube Duration badge in bottom right (e.g. 27:46) */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 inline-flex items-center rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">
            {video.duration}
          </div>
        )}
      </div>

      {/* Video info row */}
      <div className="mt-3 flex items-start gap-3">
        {/* Channel Avatar */}
        {avatarError || !video.uploader?.avatar ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--oc-surface-subtle)] text-xs font-bold text-[var(--oc-text-secondary)] ring-1 ring-black/5 select-none">
            {uploaderInitials || "OC"}
          </div>
        ) : (
          <ContentImage
            src={video.uploader.avatar}
            alt={video.uploader.name}
            loading="lazy"
            decoding="async"
            onError={() => setAvatarError(true)}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-black/5"
          />
        )}

        {/* Title & Metadata */}
        <div className="flex-1 min-w-0 pr-0.5">
          <div className="flex items-start justify-between gap-1">
            <h3
              title={video.title}
              className="line-clamp-2 text-[14.5px] font-medium leading-snug text-[var(--oc-text-primary)] transition-colors group-hover:text-[var(--oc-action)]"
            >
              {video.title}
            </h3>

          </div>

          {/* Channel Name with Verified Badge */}
          <div className="mt-1 flex items-center gap-1 text-[12.5px] font-normal text-[var(--oc-text-secondary)]">
            <span className="truncate transition-colors group-hover:text-[var(--oc-text-primary)]">
              {video.uploader?.name}
            </span>
            {video.uploader?.verified && (
              <CheckCircle2
                className="h-3.5 w-3.5 shrink-0 text-[var(--oc-text-secondary)]"
                aria-label="Verified channel"
              />
            )}
          </div>

          {/* Views & Date Meta Row */}
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-normal text-[var(--oc-text-secondary)]">
            <span className="tabular-nums">
              {compactCount(video.views)} views
            </span>
            <span>•</span>
            <span>{video.publishedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
