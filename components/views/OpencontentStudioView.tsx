"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useMemo, useEffect } from "react";
import {
  ForumRounded as MessageSquare,
  CloudUploadRounded as Upload,
  RadioRounded as Radio,
  AddBoxRounded as PlusSquare,
  AutoAwesomeRounded as Sparkles,
  PublicRounded as Globe,
  LockRounded as Lock,
  SearchRounded as Search,
  CheckCircleRounded as CheckCircle2,
  ChevronLeftRounded as ChevronLeft,
  ChevronRightRounded as ChevronRight,
  PlayArrowRounded as Play,
  DeleteOutlineRounded as Trash2,
  AccessTimeRounded as Clock,
  ArrowOutwardRounded as ArrowUpRight,
  CloseRounded as X,
  AddRounded as Plus,
  LinkRounded as LinkIcon,
  MovieRounded as Film,
} from "@mui/icons-material";
import { VideoItem, CreatorChannel, StudioSubTab } from "@/types";
import { apiClient } from "@/lib/apiClient";
import StudioWelcomeModal from "./StudioWelcomeModal";
import HowYoullAppearModal from "./HowYoullAppearModal";
import ChannelCustomizationView from "./ChannelCustomizationView";

interface OpencontentStudioViewProps {
  videos: VideoItem[];
  initialSubTab?: StudioSubTab;
  onOpenUpload: () => void;
  onPlayVideo: (video: VideoItem) => void;
  onDeleteVideo?: (id: string) => void;
  onToggleMonetization?: (id: string) => void;
  onNavigateToChannels?: () => void;
  onNavigateToEarn?: () => void;
  onNavigateToCollab?: () => void;
  onNavigateToClaims?: () => void;
}

export default function OpencontentStudioView(props: OpencontentStudioViewProps) {
  return <OpencontentStudioContent key={props.initialSubTab ?? "dashboard"} {...props} />;
}

function OpencontentStudioContent({
  videos,
  initialSubTab = "dashboard",
  onOpenUpload,
  onPlayVideo,
  onDeleteVideo,
}: OpencontentStudioViewProps) {
  const [activeTab, setActiveTab] = useState<StudioSubTab>(initialSubTab);

  // Active channel state
  const [channels, setChannels] = useState<CreatorChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<CreatorChannel | null>(null);

  // Content sub-tabs
  const [contentSubTab, setContentSubTab] = useState<
    "videos" | "series" | "shorts" | "live" | "posts" | "playlists" | "collaborations"
  >("videos");
  const [contentSearch, setContentSearch] = useState("");

  // Analytics sub-tabs
  const [analyticsSubTab, setAnalyticsSubTab] = useState<
    "overview" | "content" | "audience" | "trends"
  >("overview");
  const [analyticsMetric, setAnalyticsMetric] = useState<"views" | "watchTime" | "subscribers">("views");
  const [aiInsightPrompt, setAiInsightPrompt] = useState<string | null>(null);

  // Community sub-tabs
  const [communitySubTab, setCommunitySubTab] = useState<"comments" | "posts" | "mentions">("comments");

  // Subtitles sub-tabs
  const [subtitlesSubTab, setSubtitlesSubTab] = useState<"all" | "drafts" | "published">("all");

  // Modals state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return !localStorage.getItem("opencontent_studio_welcomed"); } catch { return false; }
  });
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  // Load user channels
  useEffect(() => {
    apiClient.channels.list().then((data) => {
      if (data && data.channels && data.channels.length > 0) {
        setChannels(data.channels);
        const primary = data.channels.find((c: CreatorChannel) => c.isPrimary) || data.channels[0];
        setActiveChannel(primary);
      }
    }).catch(() => {});
  }, []);

  // Aggregated channel metrics
  const totalViews = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.views || 0), 0);
  }, [videos]);

  const totalRevenue = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.adSettings?.revenue || 0), 0);
  }, [videos]);

  const watchTimeHours = useMemo(() => {
    const totalSec = videos.reduce((acc, v) => acc + v.durationSec * v.views, 0);
    return (totalSec / 3600).toFixed(1);
  }, [videos]);

  // Filtered videos for Content tab
  const filteredVideos = useMemo(() => {
    let list = [...videos];
    if (contentSubTab === "shorts") {
      list = list.filter((v) => v.durationSec < 120);
    } else if (contentSubTab === "live") {
      list = list.filter((v) => v.category?.toLowerCase().includes("live"));
    } else if (contentSubTab === "series") {
      list = list.filter((v) => v.contentType === "series" || v.contentType === "vertical_series" || v.category === "Web Series");
    }
    if (contentSearch.trim()) {
      const q = contentSearch.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q));
    }
    return list;
  }, [videos, contentSubTab, contentSearch]);

  const latestVideo = videos[0] || null;

  return (
    <div className="space-y-6">
      {/* Studio Top Navigation & Channel Header */}
      {activeChannel && false && activeTab !== "customization" && <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {activeChannel?.avatar ? (
              <ContentImage
                src={activeChannel?.avatar || ""}
                alt={activeChannel?.name || "Your channel"}
                className="w-13 h-13 rounded-full object-cover ring-3 ring-[#FF9933]/20"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold ring-3 ring-[#FF9933]/20 select-none">
                {(activeChannel?.name || "OC").slice(0, 2).toUpperCase()}
              </div>
            )}
            {activeChannel && <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-2 py-0.5 text-[10px] font-bold text-[#C2410C]">
                Opencontent Studio
              </span>
              <span className="text-[11px] text-[#475569]">
                {channels.length}/5 channels
              </span>
            </div>
            <h1 className="text-[16px] font-normal tracking-tight text-[#334155] leading-tight mt-0.5">
              {activeChannel?.name || "Create your first channel"}
            </h1>
            {activeChannel && (
              <p className="text-xs text-[#475569]">
                {activeChannel?.handle} · {activeChannel?.category}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons: Tour, New Channel, Upload Video, Go Live, Create Post */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWelcomeOpen(true)}
            className="py-2 px-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FED7AA]/30 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Studio Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          {channels.length < 5 && (
            <button
              onClick={() => setIsCreateChannelOpen(true)}
              className="py-2 px-3 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#334155] hover:border-[#94A3B8] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Create Channel"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="hidden sm:inline">New Channel</span>
            </button>
          )}

          {activeChannel && (
            <button
              onClick={onOpenUpload}
              className="btn-saffron py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Upload Videos</span>
            </button>
          )}

          {activeChannel && <button
            onClick={() => alert("Live broadcasting uses HLS/WebRTC streaming. Connect OBS via RTMP stream key.")}
            className="p-2 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#334155] hover:border-[#94A3B8] transition-colors cursor-pointer"
            title="Go live"
          >
            <Radio className="w-4 h-4 text-[#DC2626]" />
          </button>}

          {activeChannel && <button
            onClick={() => onOpenUpload()}
            className="p-2 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC] hover:text-[#334155] hover:border-[#94A3B8] transition-colors cursor-pointer"
            title="Create post"
          >
            <PlusSquare className="w-4 h-4 text-[#FF9933]" />
          </button>}
        </div>
      </div>}

      {/* ========================================================
          TAB 1: CHANNEL DASHBOARD (Matching Ref Image 1)
         ======================================================== */}
      {activeTab === "dashboard" && (
        <>
        <div className="space-y-5">
          <div className="border-b border-[#E2E8F0] pb-4">
            <h2 className="text-[16px] font-medium text-[#334155]">Channel dashboard</h2>
            <p className="mt-1 text-xs text-[#64748B]">Live channel totals from your created channels.</p>
          </div>
          {channels.length === 0 ? (
            <div className="border-b border-[#E2E8F0] py-12 text-center">
              <p className="text-sm font-medium text-[#334155]">Create a channel to see its dashboard</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#64748B]">Channel subscribers, uploads, and verified analytics will appear here after a channel is created.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {channels.map((channel) => (
                <section key={channel.id} className="border-b border-[#E2E8F0] pb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-[#334155]">{channel.name}</h3>
                      <p className="mt-0.5 text-[11px] text-[#64748B]">{channel.handle}</p>
                    </div>
                    <span className="text-[11px] text-[#64748B]">{channel.videosCount} uploads</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                    <div><p className="text-[#64748B]">Subscribers</p><p className="mt-1 text-sm font-medium text-[#334155]">{channel.subscribersCount.toLocaleString()}</p></div>
                    <div><p className="text-[#64748B]">Total views</p><p className="mt-1 text-sm font-medium text-[#334155]">{channel.totalViews.toLocaleString()}</p></div>
                    <div><p className="text-[#64748B]">View windows</p><p className="mt-1 text-sm font-medium text-[#94A3B8]">Unavailable</p></div>
                    <div><p className="text-[#64748B]">Upload metrics</p><p className="mt-1 text-sm font-medium text-[#94A3B8]">Unavailable</p></div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
        {false && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Column 1: Recent Video Metrics / Upload Prompt */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-[16px] font-normal leading-snug text-[#334155] mb-4">
                Latest video performance
              </h2>

              {latestVideo ? (
                <div className="space-y-4">
                  <div
                    onClick={() => onPlayVideo(latestVideo)}
                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-slate-900 border border-[#E2E8F0]"
                  >
                    <ContentImage
                      src={latestVideo.thumbnail}
                      alt={latestVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-[#FF9933] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {latestVideo.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#334155] line-clamp-2">
                      {latestVideo.title}
                    </h3>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Published {latestVideo.publishedDate}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#F1F5F9] text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span>Ranking by views</span>
                      <span className="font-semibold text-[#334155]">1 of {videos.length}</span>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Views</span>
                      <span className="font-semibold text-[#334155]">{latestVideo.views.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#64748B]">
                      More performance metrics will appear when enough verified playback data is available.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFF7ED] text-[#FF9933] flex items-center justify-center mx-auto">
                    <Upload className="w-7 h-7 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#334155]">
                      Want to see metrics on your recent video?
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
                      Upload and publish a public domain video to get started with audience analytics.
                    </p>
                  </div>
                  <button
                    onClick={onOpenUpload}
                    className="btn-saffron py-2 px-5 rounded-xl text-xs font-semibold"
                  >
                    Upload videos
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] mt-4 flex items-center justify-between">
              <button
                onClick={() => setActiveTab("analytics")}
                className="text-xs font-semibold text-[#FF9933] hover:text-[#E88520] transition-colors"
              >
                Go to video analytics
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className="text-xs text-[#64748B] hover:text-[#334155] transition-colors"
              >
                See comments
              </button>
            </div>
          </div>

          {/* Column 2: Channel Analytics Summary */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-[16px] font-normal leading-snug text-[#334155]">
                  Channel analytics
                </h2>
                <div className="mt-3">
                  <p className="text-[11px] text-[#64748B] font-medium">Current subscribers</p>
                  <p className="text-3xl font-extrabold text-[#334155] tracking-tight mt-0.5">
                    {activeChannel?.subscribersCount ?? 0}
                  </p>
                  <p className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Current recorded total</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#334155] uppercase tracking-wide">
                  Summary · Last 28 days
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#F8FAFC]">
                    <span className="text-[#64748B]">Views</span>
                    <span className="font-bold text-[#334155]">{totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#F8FAFC]">
                    <span className="text-[#64748B]">Watch time (hours)</span>
                    <span className="font-bold text-[#334155]">{watchTimeHours}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#64748B]">Estimated Revenue</span>
                    <span className="font-bold text-[#16A34A]">₹{totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1F5F9]">
                <h3 className="text-xs font-bold text-[#334155] mb-2">
                  Top content · Last 48 hours
                </h3>
                <div className="space-y-2">
                  {videos.slice(0, 3).map((v) => (
                    <div
                      key={v.id}
                      onClick={() => onPlayVideo(v)}
                      className="flex items-center justify-between text-xs cursor-pointer group hover:bg-[#F8FAFC] p-1.5 rounded-lg transition-colors"
                    >
                      <span className="truncate max-w-[200px] text-[#475569] group-hover:text-[#FF9933] font-medium">
                        {v.title}
                      </span>
                      <span className="font-semibold text-[#334155] shrink-0 ml-2">
                        {v.views}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F5F9] mt-4">
              <button
                onClick={() => setActiveTab("analytics")}
                className="w-full py-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#334155] hover:bg-[#F1F5F9] hover:border-[#94A3B8] transition-colors"
              >
                Go to channel analytics
              </button>
            </div>
          </div>

          {/* Column 3: Creator Insider & What's new */}
          <div className="space-y-5">
            {/* Creator Insider Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#334155]">Creator Insider</span>
                <span className="text-[11px] text-[#94A3B8] font-mono">1 / 4</span>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-[#FF6F00]/20 relative flex items-center justify-center border border-slate-700">
                <div className="flex flex-col items-center gap-1 text-center px-4">
                  <Film className="w-8 h-8 text-[#FF9933] opacity-80" />
                  <span className="text-white font-bold text-xs tracking-tight">Creator Guide</span>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Opencontent Studio
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#334155] leading-snug">
                  WAVES &amp; IT Rules 2021: Monetizing Public Domain Archives
                </h3>
                <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                  Learn how indie Indian filmmakers and cultural archivists are generating compliant ad revenue on opencontent.in.
                </p>
              </div>

              <button
                onClick={() => alert("Opening Opencontent Creator Guide")}
                className="w-full py-1.5 rounded-lg border border-[#CBD5E1] text-[11px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              >
                Watch on Opencontent
              </button>
            </div>

            {/* What's new in Studio */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#334155]">What&apos;s new in Studio</h3>
              <div className="space-y-2 text-xs divide-y divide-[#F1F5F9]">
                <div className="pt-1.5 first:pt-0">
                  <p className="font-semibold text-[#334155]">Up to 5 Channels per Creator Account</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Launch distinct public domain genres with dedicated branding.
                  </p>
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold text-[#334155]">26 Canonical Broadcast Taxonomies</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Choose from Technology, Entertainment, Science, and more.
                  </p>
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold text-[#334155]">Gov &amp; Doctor Reservation Guardrails</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Strict verification under IT Rules 2021 Part-III.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>}
        </>
      )}

      {/* ========================================================
          TAB 2: CHANNEL CONTENT (Matching Ref Image 2)
         ======================================================== */}
      {activeTab === "content" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
          {/* Header & Sub-Filter Tabs */}
          <div className="p-5 border-b border-[#E2E8F0] space-y-3">
            <h2 className="text-[16px] font-normal tracking-tight text-[#334155] leading-tight">
              My videos
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto saffron-scrollbar pt-1">
              {[
                { id: "videos", label: "Videos" },
                { id: "series", label: "Series" },
                { id: "shorts", label: "Shorts" },
                { id: "live", label: "Live" },
                { id: "posts", label: "Posts" },
                { id: "playlists", label: "Playlists" },
                { id: "collaborations", label: "Collaborations" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setContentSubTab(sub.id as typeof contentSubTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    contentSubTab === sub.id
                      ? "bg-[#334155] text-white"
                      : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                  type="text"
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  placeholder="Search your videos..."
                  className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] pl-9 pr-3 py-1.5 text-xs text-[#334155] placeholder-[#94A3B8] outline-none focus:border-[#FF9933] focus:bg-white"
                />
              </div>

              <span className="text-xs text-[#64748B]">
                {filteredVideos.length} {filteredVideos.length === 1 ? "stream" : "streams"}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto saffron-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                  <th className="py-3 px-4 w-8">
                    <input type="checkbox" className="rounded text-[#FF9933]" />
                  </th>
                  <th className="py-3 px-4 min-w-[280px]">Video</th>
                  <th className="py-3 px-4">Notices</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Views</th>
                  <th className="py-3 px-4 text-right">Comments</th>
                  <th className="py-3 px-4 text-right">Likes</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 px-4 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Film className="w-8 h-8 text-slate-300 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-700">
                          {contentSubTab === "shorts"
                            ? "No short videos published yet"
                            : contentSubTab === "live"
                            ? "No live streams published yet"
                            : "No videos published yet"}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {contentSubTab === "shorts"
                            ? "Short-form videos under 60 seconds will appear here as you publish them."
                            : contentSubTab === "live"
                            ? "Scheduled or recorded live streams will appear here."
                            : "Upload a public domain film or series to start publishing on your channel."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8FAFC]/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <input type="checkbox" className="rounded text-[#FF9933]" />
                    </td>

                    {/* Video Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div
                          onClick={() => onPlayVideo(v)}
                          className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer group-hover:ring-2 group-hover:ring-[#FF9933]"
                        >
                          <ContentImage src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9.5px] px-1 py-0.2 rounded font-mono">
                            {v.duration}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => onPlayVideo(v)}
                            className="font-semibold text-xs text-[#334155] line-clamp-2 hover:text-[#FF9933] cursor-pointer"
                          >
                            {v.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              ID: {v.id}
                            </span>
                            {v.catalogCode && (
                              <span className="font-mono text-[10px] bg-orange-50 text-[#FF9933] font-bold px-1.5 py-0.5 rounded border border-orange-200">
                                {v.catalogCode}
                              </span>
                            )}
                            {v.contentType === "series" && v.seriesEpisode && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                                S{v.seriesEpisode.seasonNumber}E{v.seriesEpisode.episodeNumber}
                              </span>
                            )}
                            {v.contentType === "movie" && v.filmCertification && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                                Rated {v.filmCertification}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Notices */}
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        {v.privacy === "private" ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-600">Private</span>
                          </>
                        ) : v.privacy === "unlisted" ? (
                          <>
                            <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-amber-700">Unlisted</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span className="text-[#16A34A]">Public</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#64748B]">
                      <div>
                        <p className="text-xs text-[#334155] font-medium">{v.publishedDate}</p>
                        <p className="text-[10px] text-[#94A3B8]">Published</p>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 text-right font-medium text-[#334155]">
                      {v.views.toLocaleString()}
                    </td>

                    {/* Comments */}
                    <td className="py-3.5 px-4 text-right text-[#64748B]">
                      0
                    </td>

                    {/* Likes */}
                    <td className="py-3.5 px-4 text-right text-[#64748B]">
                      {v.likes || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onPlayVideo(v)}
                          title="Watch video"
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#FF9933] hover:bg-[#FFF7ED] transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        {onDeleteVideo && (
                          <button
                            onClick={() => onDeleteVideo(v.id)}
                            title="Delete video"
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <span className="font-semibold text-[#334155]">30</span>
            </div>
            <div className="flex items-center gap-3">
              <span>1–{filteredVideos.length} of {filteredVideos.length}</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded text-[#CBD5E1] cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 rounded text-[#CBD5E1] cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: CHANNEL ANALYTICS (Matching Ref Image 3)
         ======================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          {/* AI Quick Insight Action Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              "✨ How did viewers find my content?",
              "✨ How many new viewers did I reach?",
              "✨ Summarize my latest video performance",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setAiInsightPrompt(chip)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  aiInsightPrompt === chip
                    ? "bg-[#334155] text-white border-[#334155]"
                    : "bg-white text-[#475569] border-[#CBD5E1] hover:border-[#FF9933] hover:text-[#DC2626]"
                }`}
              >
                {chip}
              </button>
            ))}

            <button
              onClick={() => alert("Advanced Mode: Multi-dimensional metrics breakdown enabled.")}
              className="ml-auto text-xs font-semibold text-[#64748B] hover:text-[#334155] border border-[#CBD5E1] bg-white px-3 py-1.5 rounded-xl cursor-pointer"
            >
              Advanced mode
            </button>
          </div>

          {/* AI Insight Box if clicked */}
          {aiInsightPrompt && (
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4 text-xs text-[#9A3412] flex items-start gap-3 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-[#DC2626] mb-1">{aiInsightPrompt}</p>
                <p className="leading-relaxed text-[#7C2D12]">
                  Insights will appear here after enough verified audience data has been collected.
                </p>
              </div>
              <button onClick={() => setAiInsightPrompt(null)} className="text-[#9A3412] hover:text-[#334155]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Analytics Sub-Nav & Date Range */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
              <div className="flex items-center gap-1">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "content", label: "Content" },
                  { id: "audience", label: "Audience" },
                  { id: "trends", label: "Trends" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setAnalyticsSubTab(t.id as typeof analyticsSubTab)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      analyticsSubTab === t.id
                        ? "bg-[#FFF7ED] text-[#DC2626]"
                        : "text-[#64748B] hover:text-[#334155]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#64748B] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Last 28 days · Realtime synced</span>
              </div>
            </div>

            {/* Metric Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setAnalyticsMetric("views")}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  analyticsMetric === "views"
                    ? "border-[#FF9933] bg-[#FFF7ED]/30 ring-2 ring-[#FF9933]/10"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <p className="text-xs font-medium text-[#64748B]">Views</p>
                <p className="text-2xl font-black text-[#334155] mt-1">{totalViews.toLocaleString()}</p>
                <p className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Recorded catalogue total</span>
                </p>
              </div>

              <div
                onClick={() => setAnalyticsMetric("watchTime")}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  analyticsMetric === "watchTime"
                    ? "border-[#FF9933] bg-[#FFF7ED]/30 ring-2 ring-[#FF9933]/10"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <p className="text-xs font-medium text-[#64748B]">Watch time (hours)</p>
                <p className="text-2xl font-black text-[#334155] mt-1">{watchTimeHours}</p>
                <p className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Calculated from recorded views</span>
                </p>
              </div>

              <div
                onClick={() => setAnalyticsMetric("subscribers")}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  analyticsMetric === "subscribers"
                    ? "border-[#FF9933] bg-[#FFF7ED]/30 ring-2 ring-[#FF9933]/10"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <p className="text-xs font-medium text-[#64748B]">Subscribers</p>
                <p className="text-2xl font-black text-[#334155] mt-1">{activeChannel?.subscribersCount ?? 0}</p>
                <p className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Growing community</span>
                </p>
              </div>
            </div>

            {/* Interactive Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 pt-3">
              <div className="lg:col-span-3 space-y-2">
                <div className="h-64 w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span>Performance over time</span>
                    <span className="font-semibold text-[#334155]">Daily average: {Math.round(totalViews / 28)} views/day</span>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="flex-1 w-full my-auto flex items-end">
                    <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="studioSaffronGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF9933" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#FF9933" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,100 C50,95 80,60 140,75 C200,90 240,40 300,55 C360,70 420,20 500,30 L500,120 L0,120 Z"
                        fill="url(#studioSaffronGrad)"
                      />
                      <path
                        d="M0,100 C50,95 80,60 140,75 C200,90 240,40 300,55 C360,70 420,20 500,30"
                        fill="none"
                        stroke="#FF9933"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="300" cy="55" r="4.5" fill="#FF9933" className="animate-pulse" />
                      <circle cx="500" cy="30" r="5" fill="#DC2626" />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[10px] text-[#94A3B8] border-t border-[#E2E8F0] pt-1">
                    <span>Day 1</span>
                    <span>Day 7</span>
                    <span>Day 14</span>
                    <span>Day 21</span>
                    <span>Day 28 (Today)</span>
                  </div>
                </div>
              </div>

              {/* Realtime Sidebar Card (Matching Image 3) */}
              <div className="bg-white border border-[#CBD5E1] rounded-xl p-4 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#334155] flex items-center justify-between">
                    <span>Realtime</span>
                    <span className="flex items-center gap-1 text-[10px] text-[#16A34A] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                      Updating live
                    </span>
                  </h3>
                  <div className="mt-3">
                    <p className="text-2xl font-black text-[#334155]">{activeChannel?.subscribersCount ?? 0}</p>
                    <p className="text-[11px] text-[#64748B]">Subscribers</p>
                    <button
                      onClick={() => alert(`Active subscriber count: ${activeChannel?.subscribersCount ?? 0}`)}
                      className="text-[11px] font-semibold text-[#FF9933] hover:underline mt-1 block"
                    >
                      See live count
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F1F5F9]">
                  <p className="text-lg font-black text-[#334155]">—</p>
                  <p className="text-[11px] text-[#64748B]">Views · Last 48 hours unavailable</p>
                  <div className="flex items-end gap-1 h-12 mt-2 pt-1 border-b border-[#E2E8F0]">
                    {[40, 25, 60, 30, 80, 45, 90, 70, 100, 85, 95].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="flex-1 bg-[#FED7AA] hover:bg-[#FF9933] rounded-t transition-colors"
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert("Realtime traffic is streaming live from the views Go microservice.")}
                  className="w-full text-center text-xs text-[#64748B] hover:text-[#334155] pt-1 block"
                >
                  See more
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: COMMUNITY (Matching Ref Image 4)
         ======================================================== */}
      {activeTab === "community" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <h2 className="text-[16px] font-normal tracking-tight text-[#334155] leading-tight">
              Community
            </h2>
            <div className="flex items-center gap-1">
              {["comments", "posts", "mentions"].map((t) => (
                <button
                  key={t}
                  onClick={() => setCommunitySubTab(t as typeof communitySubTab)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize font-semibold transition-colors cursor-pointer ${
                    communitySubTab === t
                      ? "bg-[#FFF7ED] text-[#DC2626]"
                      : "text-[#64748B] hover:text-[#334155]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Chips matching Image 4 */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              "Published",
              "Most relevant",
              "Response status: Unresponded",
              "Content type: Videos, Shorts, +1 more",
            ].map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569]"
              >
                <span>{filter}</span>
              </span>
            ))}
            <button
              onClick={() => alert("Filters reset")}
              className="text-xs text-[#DC2626] hover:underline font-medium"
            >
              Remove filter
            </button>
          </div>

          {/* Empty State / Moderator feed matching Image 4 */}
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FFF7ED] text-[#FF9933] flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#334155]">
                No comments found
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                Try searching for something else or removing filters to view comments on your published streams.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: CHANNEL SUBTITLES (Matching Ref Image 5)
         ======================================================== */}
      {activeTab === "subtitles" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="border-b border-[#F1F5F9] pb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-normal tracking-tight text-[#334155] leading-tight">
              Channel subtitles
            </h2>
            <div className="flex items-center gap-1">
              {["all", "drafts", "published"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSubtitlesSubTab(t as typeof subtitlesSubTab)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize font-semibold transition-colors cursor-pointer ${
                    subtitlesSubTab === t
                      ? "bg-[#FFF7ED] text-[#DC2626]"
                      : "text-[#64748B] hover:text-[#334155]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                <th className="py-3 px-4 min-w-[280px]">Video</th>
                <th className="py-3 px-4">Languages</th>
                <th className="py-3 px-4 text-right">Modified on</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {videos.map((v) => (
                <tr key={v.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ContentImage src={v.thumbnail} alt={v.title} className="w-16 h-10 rounded-md object-cover" />
                      <span className="font-medium text-[#334155] truncate max-w-md">{v.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">
                    <span className="inline-flex items-center gap-1 font-mono text-[#334155] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">
                      1 language (English CC)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#94A3B8]">
                    {v.publishedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================
          TAB 6: CHANNEL CUSTOMIZATION (Matching Ref Images 3, 4, 5)
         ======================================================== */}
      {activeTab === "customization" && (
        <ChannelCustomizationView
          channel={activeChannel}
          onChannelUpdated={(updated) => {
            setActiveChannel(updated);
            setChannels((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            );
          }}
          onViewChannel={() => {
            if (activeChannel?.handle) {
              alert(`Navigating to public channel view: https://opencontent.in/${activeChannel.handle}`);
            }
          }}
        />
      )}

      {/* Studio Welcome Modal (Matching Ref Image 2) */}
      <StudioWelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => {
          setIsWelcomeOpen(false);
          try {
            localStorage.setItem("opencontent_studio_welcomed", "true");
          } catch {}
        }}
      />

      {/* "How you'll appear" Channel Creation Modal (Matching Ref Image 1) */}
      <HowYoullAppearModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        channelsCount={channels.length}
        onSubmit={async (data) => {
          const res = await apiClient.channels.create(data);
          if (res && res.channel) {
            setChannels((prev) => [...prev, res.channel]);
            setActiveChannel(res.channel);
          }
        }}
      />
    </div>
  );
}
