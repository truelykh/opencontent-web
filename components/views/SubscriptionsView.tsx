"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useEffect } from "react";
import {
  LiveTvRounded as Tv,
  NotificationsNoneRounded as Bell,
  NotificationsActiveRounded as BellRing,
  CheckCircleRounded as CheckCircle2,
  PeopleRounded as Users,
  PlayArrowRounded as Play,
  AutoAwesomeRounded as Sparkles,
} from "@mui/icons-material";
import { VideoItem } from "@/types";
import PageHeading from "../common/PageHeading";
import ContentEmptyState from "../common/ContentEmptyState";
import ContentErrorState from "../common/ContentErrorState";
import ContentLoadingState from "../common/ContentLoadingState";
import { verifiedItemCount } from "@/lib/libraryState";

interface SubscriptionsViewProps {
  videos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onExplore?: () => void;
}

interface ChannelRecord {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: string;
  subscribersCount: number;
  videosCount: number;
  verified: boolean;
  bellStatus: "all" | "none";
  isSubscribed: boolean;
  description: string;
}

export default function SubscriptionsView({
  videos,
  onPlayVideo,
  onExplore,
}: SubscriptionsViewProps) {
  const [channels, setChannels] = useState<ChannelRecord[]>([]);
  const [requestState, setRequestState] = useState<"loading" | "success" | "error">("loading");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSubscriptions = React.useCallback(async () => {
    setRequestState("loading");
    try {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Failed to load subscriptions");
      const data = await res.json();
      setChannels(data?.channels && Array.isArray(data.channels) ? data.channels : []);
      setRequestState("success");
    } catch {
      setChannels([]);
      setRequestState("error");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchSubscriptions();
    })();
  }, [fetchSubscriptions]);

  const handleToggleSubscribe = async (id: string) => {
    const target = channels.find((ch) => ch.id === id);
    if (!target) return;

    const action = target.isSubscribed ? "unsubscribe" : "subscribe";
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: id, action }),
      });

      if (res.ok) {
        setChannels((prev) =>
          prev.map((ch) => {
            if (ch.id === id) {
              const newState = !ch.isSubscribed;
              showNotification(
                newState
                  ? `Subscribed to ${ch.name}`
                  : `Unsubscribed from ${ch.name}`
              );
              return { ...ch, isSubscribed: newState };
            }
            return ch;
          })
        );
      } else {
        showNotification("Failed to update subscription. Please try again.");
      }
    } catch {
      showNotification("Failed to update subscription. Please try again.");
    }
  };

  const handleToggleBell = async (id: string) => {
    const target = channels.find((ch) => ch.id === id);
    if (!target) return;

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: id, action: "toggle_bell" }),
      });

      if (res.ok) {
        setChannels((prev) =>
          prev.map((ch) => {
            if (ch.id === id) {
              const newBell = ch.bellStatus === "all" ? "none" : "all";
              showNotification(
                newBell === "all"
                  ? `All notifications turned on for ${ch.name}`
                  : `Notifications silenced for ${ch.name}`
              );
              return { ...ch, bellStatus: newBell };
            }
            return ch;
          })
        );
      } else {
        showNotification("Failed to update notification settings.");
      }
    } catch {
      showNotification("Failed to update notification settings.");
    }
  };

  // Only show uploads from genuinely subscribed channels
  const subscribedHandles = new Set(
    channels.filter((c) => c.isSubscribed).map((c) => c.handle.toLowerCase().replace(/^@/, ""))
  );
  const subscribedNames = new Set(
    channels.filter((c) => c.isSubscribed).map((c) => c.name.toLowerCase())
  );

  const subscriptionVideos = videos.filter((v) => {
    const uploaderName = (v.uploader?.name || "").toLowerCase();
    return subscribedHandles.has(uploaderName) || subscribedNames.has(uploaderName);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#334155] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl border border-white/10 animate-slideUp">
          {notification}
        </div>
      )}

      {/* Header */}
      <PageHeading
        icon={Tv}
        title="Subscriptions"
        description="Manage your subscribed channels and watch the latest releases from creators you follow."
        actions={requestState === "success" ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--oc-border)] bg-[var(--oc-background)] px-3 py-2 text-xs text-[var(--oc-text-secondary)] oc-library-surface">
            <Users className="h-4 w-4 text-[var(--oc-brand)]" aria-hidden="true" />
            <span><span className="font-semibold text-[var(--oc-text-primary)]">{verifiedItemCount(requestState, channels.length)}</span> active subscriptions</span>
          </div>
        ) : requestState === "loading" ? (
          <span className="text-xs text-[var(--oc-text-secondary)]" role="status">Loading subscriptions…</span>
        ) : undefined}
      />

      {/* Subscribed Channels List */}
      {requestState === "loading" ? (
        <ContentLoadingState variant="channels" count={6} />
      ) : requestState === "error" ? (
        <ContentErrorState
          icon={Bell}
          title="Subscriptions are temporarily unavailable"
          description="We couldn’t retrieve your subscriptions right now. Please try again when the service is available."
          onRetry={fetchSubscriptions}
        />
      ) : channels.length === 0 ? (
        <ContentEmptyState
          icon={Tv}
          title="No subscriptions yet"
          description="Discover creators and subscribe to channels you enjoy."
          actionText={onExplore ? "Explore OpenContent" : undefined}
          onAction={onExplore}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="oc-library-surface flex flex-col justify-between rounded-xl border border-[var(--oc-border)] bg-[var(--oc-background)] p-4 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--oc-brand)]/40"
            >
              <div>
                <div className="flex items-start gap-3">
                  <ContentImage
                    src={ch.avatar}
                    alt={ch.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-[#334155] truncate">
                        {ch.name}
                      </span>
                      {ch.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-[#64748B] font-mono">
                      {ch.handle}
                    </div>
                    <div className="text-[11px] font-medium text-[#16A34A] mt-0.5">
                      {ch.subscribers} subscribers
                    </div>
                  </div>
                </div>

                {ch.description && (
                  <p className="text-xs text-[#475569] mt-3 line-clamp-2 leading-relaxed">
                    {ch.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                <div className="text-[11px] text-[#64748B]">
                  {ch.videosCount > 0 ? `${ch.videosCount} public videos` : "Channel active"}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBell(ch.id)}
                    title="Toggle Notifications"
                    className={`rounded-lg border p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2 ${
                      ch.bellStatus === "all"
                        ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                        : "bg-white text-[#94A3B8] border-[#CBD5E1]"
                    }`}
                  >
                    {ch.bellStatus === "all" ? (
                      <BellRing className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleSubscribe(ch.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2 ${
                      ch.isSubscribed
                        ? "bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#FCA5A5]"
                        : "bg-[#FF6F00] text-white hover:bg-[#E65100]"
                    }`}
                  >
                    {ch.isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latest Videos from Subscribed Channels */}
      {subscriptionVideos.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-sm text-[#334155] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6F00]" />
            <span>Latest Uploads from Your Subscriptions</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subscriptionVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => onPlayVideo(v)}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs hover:border-[#CBD5E1] cursor-pointer group transition-all"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <ContentImage
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    {v.duration}
                  </span>
                </div>
                <div className="p-3">
                  <div className="font-medium text-xs text-[#334155] line-clamp-1 group-hover:text-[#FF6F00] transition-colors">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1 flex items-center justify-between">
                    <span>{v.uploader?.name || "OpenContent Creator"}</span>
                    <span className="font-semibold text-[#16A34A]">
                      {v.views.toLocaleString()} plays
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
