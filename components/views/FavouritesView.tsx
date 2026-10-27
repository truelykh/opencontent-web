"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useMemo, useEffect } from "react";
import {
  FavoriteRounded as Heart,
  PlayArrowRounded as Play,
  CheckCircleRounded as CheckCircle2,
} from "@mui/icons-material";
import { VideoItem } from "@/types";
import { apiClient } from "@/lib/apiClient";
import PageHeading from "../common/PageHeading";
import ContentEmptyState from "../common/ContentEmptyState";
import ContentErrorState from "../common/ContentErrorState";
import ContentLoadingState from "../common/ContentLoadingState";
import { verifiedItemCount } from "@/lib/libraryState";

interface FavouritesViewProps {
  videos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onExplore?: () => void;
}

export default function FavouritesView({
  videos,
  onPlayVideo,
  onExplore,
}: FavouritesViewProps) {
  // O(1) ID Map for constant-time video retrieval
  const videoMap = useMemo(() => new Map(videos.map((v) => [v.id, v])), [videos]);

  // Real database persistent favourites storage
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(() => new Set<string>());
  const [requestState, setRequestState] = useState<"loading" | "success" | "error">("loading");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchFavourites = React.useCallback(async () => {
    setRequestState("loading");
    try {
      const ids = await apiClient.favourites.list();
      setFavouriteIds(new Set(ids));
      setRequestState("success");
    } catch {
      setFavouriteIds(new Set());
      setRequestState("error");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchFavourites();
    })();
  }, [fetchFavourites]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Persistent removal
  const handleRemoveFavourite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await apiClient.favourites.remove(id);
    if (success) {
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showNotification("Removed from Favourites.");
    } else {
      showNotification("Failed to remove favourite from database.");
    }
  };

  // O(K) lookup where K is count of favourites (independent of total videos N)
  const favVideos = useMemo(() => {
    const list: VideoItem[] = [];
    favouriteIds.forEach((id) => {
      const item = videoMap.get(id);
      if (item) list.push(item);
    });
    return list;
  }, [favouriteIds, videoMap]);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="bg-[#334155] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-[#334155] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <PageHeading
        icon={Heart}
        title="Favourites"
        description="Find the content you've saved for later."
        actions={requestState === "success" ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--oc-border)] bg-[var(--oc-background)] px-3 py-2 text-xs text-[var(--oc-text-secondary)] oc-library-surface">
            <Heart className="h-4 w-4 text-[var(--oc-brand)]" aria-hidden="true" />
            <span><span className="font-semibold text-[var(--oc-text-primary)]">{verifiedItemCount(requestState, favVideos.length)}</span> saved items</span>
          </div>
        ) : requestState === "loading" ? (
          <span className="text-xs text-[var(--oc-text-secondary)]" role="status">Loading favourites…</span>
        ) : undefined}
      />

      {/* Favourites Grid */}
      {requestState === "loading" ? (
        <ContentLoadingState variant="videos" count={8} />
      ) : requestState === "error" ? (
        <ContentErrorState
          icon={Heart}
          title="Unable to load favourites"
          description="We couldn’t connect to the favourites service. Please try again."
          onRetry={fetchFavourites}
        />
      ) : favVideos.length === 0 ? (
        <ContentEmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Save content you enjoy to find it here later."
          actionText={onExplore ? "Explore OpenContent" : undefined}
          onAction={onExplore}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favVideos.map((v: VideoItem) => (
            <article
              key={v.id}
              className="oc-library-surface overflow-hidden rounded-xl border border-[var(--oc-border)] bg-[var(--oc-background)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--oc-brand)]/40"
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <button
                  type="button"
                  onClick={() => onPlayVideo(v)}
                  aria-label={`Play ${v.title}`}
                  className="group absolute inset-0 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--oc-action)]"
                >
                  <ContentImage
                    src={v.thumbnail}
                    alt={v.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Play className="h-8 w-8 fill-white text-white" aria-hidden="true" />
                  </span>
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {v.duration}
                  </span>
                </button>

                {/* Remove heart button */}
                <button
                  onClick={(e) => handleRemoveFavourite(v.id, e)}
                  title="Remove from favourites"
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <Heart className="w-3.5 h-3.5 fill-white text-white" />
                </button>
              </div>

              <div className="p-3">
                <button
                  type="button"
                  onClick={() => onPlayVideo(v)}
                  className="block w-full truncate text-left text-xs font-medium text-[var(--oc-text-primary)] transition-colors hover:text-[var(--oc-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
                >
                  {v.title}
                </button>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--oc-text-secondary)]">
                  <span>{v.uploader.name}</span>
                  <span className="font-semibold text-[var(--oc-brand)]">
                    {v.category}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
