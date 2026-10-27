"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useEffect, useCallback } from "react";
import {
  LiveTvRounded as Tv,
  AddRounded as Plus,
  DeleteOutlineRounded as Trash2,
  CheckCircleRounded as CheckCircle2,
  RadioRounded as Radio,
  OpenInNewRounded as ExternalLink,
  MovieRounded as Film,
  CheckRounded as Check,
  LocalOfferRounded as Tag,
} from "@mui/icons-material";
import { CreatorChannel } from "@/types";
import { apiClient } from "@/lib/apiClient";
import HowYoullAppearModal from "./HowYoullAppearModal";
import { ChannelSkeletonGrid } from "../skeletons/ChannelSkeleton";

interface ChannelsViewProps {
  onOpenUpload?: () => void;
  onNavigateToVideos?: () => void;
}

export default function ChannelsView({
  onOpenUpload,
}: ChannelsViewProps) {
  const [channels, setChannels] = useState<CreatorChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.channels.list();
      if (data && data.channels) {
        setChannels(data.channels);
        const primary = data.channels.find((c: CreatorChannel) => c.isPrimary);
        if (primary) setActiveChannelId(primary.id);
        else if (data.channels.length > 0) setActiveChannelId(data.channels[0].id);
      }
    } catch (err) {
      console.error("Failed to load creator channels:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitialChannels() {
      await fetchChannels();
    }
    void loadInitialChannels();
  }, [fetchChannels]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (channels.length <= 1) {
      alert("You must keep at least one active channel.");
      return;
    }

    if (!confirm(`Are you sure you want to delete channel "${channelName}"? This will free up 1 channel slot.`)) {
      return;
    }

    try {
      await apiClient.channels.delete(channelId);
      showToast(`Channel "${channelName}" deleted. Available slot restored.`);
      await fetchChannels();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete channel";
      alert(msg);
    }
  };

  const handleSetActive = async (channelId: string, channelName: string) => {
    try {
      await apiClient.channels.setActive(channelId);
      setActiveChannelId(channelId);
      showToast(`Switched active broadcasting channel to "${channelName}".`);
      await fetchChannels();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to set active channel";
      alert(msg);
    }
  };

  const remainingSlots = Math.max(0, 5 - channels.length);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#334155] text-white px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-2.5 border border-[#334155] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-[#E2E8F0] pb-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-[16px] font-medium tracking-tight text-[#334155] leading-none">
            <Tv className="h-3.5 w-3.5 text-[#64748B]" />
            Channels
          </h1>
        </div>

        {/* Centered quota tracker */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#334155]">
                {channels.length} <span className="text-[#94A3B8] font-normal">/ 5</span>
              </span>
              <div className="flex items-center gap-1 ml-1">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <div
                    key={slot}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      slot <= channels.length
                        ? "bg-[#FF9933]"
                        : "bg-[#E2E8F0] border border-[#CBD5E1]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Primary action at the end of the header */}
        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => {
              if (channels.length >= 5) {
                alert("Channel limit reached: You have already created 5 channels (the maximum allowed).");
                return;
              }
              setIsModalOpen(true);
            }}
            disabled={channels.length >= 5}
            className={`btn-saffron py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all ${
              channels.length >= 5
                ? "opacity-60 cursor-not-allowed bg-slate-300 text-slate-600 hover:bg-slate-300"
                : "hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>
              {channels.length >= 5 ? "Limit Reached (5/5)" : "Create Channel"}
            </span>
          </button>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#334155] flex items-center gap-2">
            <span>Your Active Channels ({channels.length})</span>
            <span className="text-[11px] font-normal text-[#64748B]">
              · {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} remaining
            </span>
          </h2>
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="text-xs font-semibold text-[#FF9933] hover:text-[#E88520] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Upload Video with Active Channel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <ChannelSkeletonGrid count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((chan) => {
              const isPrimary = chan.isPrimary || chan.id === activeChannelId;
              return (
                <div
                  key={chan.id}
                  className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between gap-4 ${
                    isPrimary
                      ? "border-[#FF9933] ring-2 ring-[#FF9933]/15 shadow-sm"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Avatar, Info, and Primary Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ContentImage
                          src={chan.avatar}
                          alt={chan.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E2E8F0] shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-[16px] font-normal leading-snug text-[#334155] truncate">
                            {chan.name}
                          </h3>
                          <p className="text-xs text-[#64748B] truncate font-medium">
                            {chan.handle}
                          </p>
                        </div>
                      </div>

                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-2 py-0.5 text-[10.5px] font-semibold text-[#DC2626] shrink-0">
                          <Check className="w-3 h-3 text-[#DC2626]" />
                          Primary
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 text-[10.5px] font-medium text-[#64748B] shrink-0">
                          Channel
                        </span>
                      )}
                    </div>

                    {/* Category & Subcategory Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF7ED] border border-[#FED7AA] px-2 py-0.5 text-[11px] font-semibold text-[#DC2626]">
                        <Film className="w-3 h-3 text-[#FF9933]" />
                        {chan.category}
                      </span>
                      {chan.subcategory && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 text-[10.5px] font-medium text-[#475569]">
                          <Tag className="w-2.5 h-2.5 text-[#94A3B8]" />
                          {chan.subcategory}
                        </span>
                      )}
                      <span className="text-[11px] text-[#94A3B8] ml-auto">
                        Created {new Date(chan.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                      {chan.description}
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F1F5F9] text-center">
                      <div className="bg-[#F8FAFC] p-2 rounded-xl">
                        <p className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                          Subscribers
                        </p>
                        <p className="text-xs font-bold text-[#334155] mt-0.5">
                          {Number(chan.subscribersCount ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[#F8FAFC] p-2 rounded-xl">
                        <p className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                          Videos
                        </p>
                        <p className="text-xs font-bold text-[#334155] mt-0.5">
                          {Number(chan.videosCount ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[#F8FAFC] p-2 rounded-xl">
                        <p className="text-[10px] uppercase font-semibold text-[#94A3B8]">
                          Views
                        </p>
                        <p className="text-xs font-bold text-[#334155] mt-0.5">
                          {Number(chan.totalViews ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#F1F5F9]">
                    {!isPrimary ? (
                      <button
                        onClick={() => handleSetActive(chan.id, chan.name)}
                        className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Set as Active</span>
                      </button>
                    ) : (
                      <span className="text-[11.5px] font-medium text-[#16A34A] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Currently Active</span>
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      {channels.length > 1 && (
                        <button
                          onClick={() => handleDeleteChannel(chan.id, chan.name)}
                          title="Delete channel"
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty Slots up to 5 */}
          </div>
        )}
      </div>

      {/* HOW YOU'LL APPEAR MODAL (Matching Ref Image 1) */}
      <HowYoullAppearModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        channelsCount={channels.length}
        onSubmit={async (data) => {
          await apiClient.channels.create(data);
          showToast(`Channel "${data.name}" created successfully!`);
          await fetchChannels();
        }}
      />
    </div>
  );
}
