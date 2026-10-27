"use client";

import React from "react";
import { ChannelSkeletonGrid } from "../skeletons/ChannelSkeleton";
import { VideoCardSkeletonGrid } from "../skeletons/VideoCardSkeleton";
import { VideoRowSkeletonList } from "../skeletons/VideoRowSkeleton";

type LoadingVariant = "channels" | "videos" | "rows";

interface ContentLoadingStateProps {
  variant: LoadingVariant;
  count?: number;
}

export default function ContentLoadingState({ variant, count }: ContentLoadingStateProps) {
  return (
    <div role="status" aria-label="Loading content" aria-busy="true">
      <span className="sr-only">Loading content</span>
      {variant === "channels" && <ChannelSkeletonGrid count={count ?? 6} />}
      {variant === "videos" && <VideoCardSkeletonGrid count={count ?? 8} />}
      {variant === "rows" && <VideoRowSkeletonList count={count ?? 5} />}
    </div>
  );
}
