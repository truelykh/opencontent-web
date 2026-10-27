"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useMemo, useEffect } from "react";
import {
  HistoryRounded as History,
  DeleteOutlineRounded as Trash2,
  PlayArrowRounded as Play,
  AccessTimeRounded as Clock,
  SearchRounded as Search,
  CheckCircleRounded as CheckCircle2,
  CloseRounded as X,
} from "@mui/icons-material";
import { VideoItem } from "@/types";
import { apiClient } from "@/lib/apiClient";
import PageHeading from "../common/PageHeading";
import ContentEmptyState from "../common/ContentEmptyState";
import ContentErrorState from "../common/ContentErrorState";
import ContentLoadingState from "../common/ContentLoadingState";
import { stateAfterClear, stateAfterRemove } from "@/lib/libraryState";

export interface WatchHistoryItem extends VideoItem {
  historyId: string;
  watchedAt: string;
  progressPercent: number;
}

interface WatchHistoryViewProps {
  videos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onExplore?: () => void;
}

export default function WatchHistoryView({
  videos,
  onPlayVideo,
  onExplore,
}: WatchHistoryViewProps) {
  const [historyItems, setHistoryItems] = useState<WatchHistoryItem[]>([]);
  const [requestState, setRequestState] = useState<"loading" | "success" | "error">("loading");
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // O(1) video lookup map
  const videoMap = useMemo(() => new Map(videos.map((v) => [v.id, v])), [videos]);

  const fetchHistory = React.useCallback(async () => {
    setRequestState("loading");
    setMutationError(null);
    try {
      const items = await apiClient.history.list();
      const joined: WatchHistoryItem[] = [];
      let unresolved = 0;
      for (const h of items) {
        const v = videoMap.get(h.videoId);
        if (!v) {
          unresolved += 1;
          continue;
        }
        joined.push({
          ...v,
          historyId: `${h.videoId}-${h.lastWatchedAt}`,
          watchedAt: h.lastWatchedAt
            ? new Date(h.lastWatchedAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recently",
          progressPercent: h.progress || 0,
        });
      }
      setHistoryItems(joined);
      setUnavailableCount(unresolved);
      setRequestState("success");
    } catch {
      setHistoryItems([]);
      setUnavailableCount(0);
      setRequestState("error");
    }
  }, [videoMap]);

  useEffect(() => {
    void (async () => {
      await fetchHistory();
    })();
  }, [fetchHistory]);

  const [searchHistory, setSearchHistory] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Persistent removal from behaviour database
  const handleRemoveItem = async (historyId: string, videoId: string) => {
    setIsMutating(true);
    setMutationError(null);
    try {
      await apiClient.history.clear(videoId);
      setDeletedIds((prev) => new Set(prev).add(historyId));
      setHistoryItems((prev) => stateAfterRemove(prev, (item) => item.historyId === historyId, true));
      showNotification("Removed from watch history.");
    } catch {
      setMutationError("We couldn’t remove that item. Your watch history is unchanged.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleClearAllHistory = async () => {
    setIsMutating(true);
    setMutationError(null);
    try {
      await apiClient.history.clear();
      setHistoryItems((prev) => stateAfterClear(prev, true));
      setUnavailableCount(0);
      setDeletedIds(new Set());
      showNotification("Watch history cleared.");
    } catch {
      setMutationError("We couldn’t clear watch history. Your history is unchanged.");
    } finally {
      setIsMutating(false);
    }
  };

  const filteredHistory = useMemo(() => {
    const q = searchHistory.trim().toLowerCase();
    return historyItems.filter((item) => {
      if (deletedIds.has(item.historyId)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.uploader.name.toLowerCase().includes(q)
      );
    });
  }, [historyItems, deletedIds, searchHistory]);

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
        icon={History}
        title="Watch History"
        description="Revisit content you've watched and manage your viewing history."
        actions={requestState === "success" && historyItems.length > 0 ? (
          <button
            type="button"
            onClick={handleClearAllHistory}
            disabled={isMutating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--oc-border-strong)] px-3 py-2 text-xs font-semibold text-[var(--oc-destructive)] transition-colors hover:border-red-300 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear history</span>
          </button>
        ) : undefined}
      />

      {mutationError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {mutationError}
        </p>
      )}

      {/* Search within history */}
      {requestState === "success" && historyItems.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            placeholder="Search watch history..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF6F00]"
          />
        </div>
      )}

      {/* History Items List */}
      {requestState === "loading" ? (
        <ContentLoadingState variant="rows" count={5} />
      ) : requestState === "error" ? (
        <ContentErrorState
          icon={History}
          title="Unable to load watch history"
          description="We couldn’t connect to the playback history service. Please try again."
          onRetry={fetchHistory}
        />
      ) : filteredHistory.length === 0 && unavailableCount > 0 ? (
        <ContentEmptyState
          icon={History}
          title="Some history items are unavailable"
          description="Previously watched items can’t be opened because their catalogue records are no longer available."
        />
      ) : filteredHistory.length === 0 ? (
        <ContentEmptyState
          icon={History}
          title="No watch history yet"
          description="Content you watch will appear here when history is available and enabled."
          actionText={onExplore ? "Explore OpenContent" : undefined}
          onAction={onExplore}
        />
      ) : (
        <div className="oc-library-surface divide-y divide-[var(--oc-border)] overflow-hidden rounded-xl border border-[var(--oc-border)] bg-[var(--oc-background)]">
          {unavailableCount > 0 && (
            <p className="bg-[var(--oc-surface-subtle)] px-4 py-3 text-xs text-[var(--oc-text-secondary)]" role="status">
              {unavailableCount} previously watched {unavailableCount === 1 ? "item is" : "items are"} no longer available in the catalogue.
            </p>
          )}
          {filteredHistory.map((item) => (
            <div
              key={item.historyId}
              className="p-4 hover:bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group"
            >
              {/* Left: Thumbnail & Progress Bar */}
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  aria-label={`Play ${item.title}`}
                  onClick={() => onPlayVideo(item)}
                  className="group relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
                >
                  <ContentImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                    {item.duration}
                  </span>

                  {/* Red playback progress bar (YouTube style) */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#334155]/60">
                    <div
                      className="h-full bg-[#DC2626]"
                      style={{ width: `${item.progressPercent}%` }}
                    ></div>
                  </div>
                </button>

                {/* Info */}
                <div className="min-w-0">
                  <button
                    onClick={() => onPlayVideo(item)}
                    className="font-bold text-xs sm:text-sm text-[#334155] hover:text-[#FF6F00] text-left line-clamp-1 transition-colors"
                  >
                    {item.title}
                  </button>
                  <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-[#334155]">
                      {item.uploader.name}
                    </span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="text-[#FF6F00] font-bold capitalize">
                      {item.ageProfile}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#94A3B8]" />
                    <span>{item.watchedAt}</span>
                    <span>•</span>
                    <span className="text-[#16A34A] font-semibold">
                      Resumes at {item.progressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onPlayVideo(item)}
                  className="px-3 py-1.5 bg-[#FF6F00] hover:bg-[#E65100] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
                <button
                  onClick={() => handleRemoveItem(item.historyId, item.id)}
                  className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#64748B] hover:text-[#DC2626] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] transition-colors"
                  title="Remove from history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
