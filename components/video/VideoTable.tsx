"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useMemo } from "react";
import {
  SearchRounded as Search,
  RefreshRounded as RotateCw,
  TuneRounded as SlidersHorizontal,
  KeyboardArrowDownRounded as ChevronDown,
  CheckRounded as Check,
  PlayArrowRounded as Play,
  DeleteOutlineRounded as Trash2,
  AttachMoneyRounded as DollarSign,
  MovieRounded as Film,
  AutoAwesomeRounded as Sparkles,
  ChildCareRounded as Baby,
  SportsEsportsRounded as Gamepad2,
  WarningAmberRounded as AlertTriangle,
  CloudUploadRounded as Upload,
} from "@mui/icons-material";
import { VideoItem } from "@/types";

interface VideoTableProps {
  videos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onDeleteVideo: (id: string) => void;
  onToggleMonetization: (id: string) => void;
}

export default function VideoTable({
  videos,
  onPlayVideo,
  onOpenUpload,
  onDeleteVideo,
  onToggleMonetization,
}: VideoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // O(1) Set-based selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered dataset with pre-normalized search query
  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return videos.filter((v) => {
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.uploader.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q);

      const matchesProfile =
        profileFilter === "all" || v.ageProfile === profileFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "running" && v.status === "published") ||
        (statusFilter === "transcoding" && v.status === "transcoding") ||
        (statusFilter === "review" && v.status === "review");

      return matchesSearch && matchesProfile && matchesStatus;
    });
  }, [videos, searchQuery, profileFilter, statusFilter]);

  // O(N) select all with Set
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredVideos.map((v) => v.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // O(1) single item toggle
  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
      {/* Top Action Bar (matches vCluster screenshot top bar) */}
      <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          <button onClick={onOpenUpload} className="btn btn-primary btn-sm gap-1.5 shadow-xs">
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload &amp; Publish Video</span>
          </button>

          <div className="relative inline-block">
            <button className="btn btn-outline btn-sm gap-1 text-[#334155] border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#334155]">
              <span>Add Existing Ad Tag...</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>
          </div>
        </div>

        {/* Right Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all columns..."
              className="input input-sm input-bordered pl-8 w-48 sm:w-60 text-xs focus:input-primary text-[#334155]"
            />
          </div>

          {/* Age Profile Filter */}
          <div className="relative">
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              aria-label="Filter by age profile"
              className="select select-sm select-bordered text-xs text-[#334155] focus:select-primary cursor-pointer"
            >
              <option value="all">Any age profile</option>
              <option value="kids">Kids (0-12 Safe)</option>
              <option value="teen">Teen (13-17)</option>
              <option value="adult">Adult (18+)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by video status"
              className="select select-sm select-bordered text-xs text-[#334155] focus:select-primary cursor-pointer"
            >
              <option value="all">Any status</option>
              <option value="running">Published &amp; Live</option>
              <option value="transcoding">Transcoding (MinIO)</option>
              <option value="review">Review</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh list"
            aria-label="Refresh list"
            className="btn btn-sm btn-outline border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#64748B]"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#FF9933]" : ""}`}
            />
          </button>

          {/* Columns Button */}
          <button
            title="Customize Columns"
            aria-label="Customize Columns"
            className="btn btn-sm btn-outline border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#334155] gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Columns</span>
          </button>
        </div>
      </div>

      {/* Bulk action helper if items selected */}
      {selectedIds.size > 0 && (
        <div className="bg-[#EFF6FF] border-b border-[#BFDBFE] px-4 py-2 flex items-center justify-between text-xs text-[#1E40AF]">
          <span className="font-semibold">
            {selectedIds.size} video{selectedIds.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedIds.forEach((id) => onToggleMonetization(id));
                setSelectedIds(new Set());
              }}
              className="btn btn-xs btn-outline btn-info bg-white"
            >
              Toggle Monetization
            </button>
            <button
              onClick={() => {
                selectedIds.forEach((id) => onDeleteVideo(id));
                setSelectedIds(new Set());
              }}
              className="btn btn-xs btn-error text-white"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="table table-sm w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all videos"
                  checked={
                    filteredVideos.length > 0 &&
                    selectedIds.size === filteredVideos.length
                  }
                  onChange={handleSelectAll}
                  className="checkbox checkbox-xs checkbox-primary"
                />
              </th>
              <th className="py-3 px-4 min-w-[260px]">Video Title &amp; Specs</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Age Profile</th>
              <th className="py-3 px-4">Tenancy / Ad Model</th>
              <th className="py-3 px-4">Public License</th>
              <th className="py-3 px-4 text-right">Ad Views / Impr.</th>
              <th className="py-3 px-4 text-right">Revenue (INR)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
            {filteredVideos.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#64748B]">
                  <Film className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
                  <div className="font-semibold text-sm text-[#334155]">
                    No videos match your criteria
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Try adjusting search query or profile filters.
                  </p>
                </td>
              </tr>
            ) : (
              filteredVideos.map((video) => {
                // O(1) Set membership lookup
                const isSelected = selectedIds.has(video.id);

                return (
                  <tr
                    key={video.id}
                    className={`hover:bg-[#F8FAFC] transition-colors ${
                      isSelected ? "bg-[#FFF7ED]/50" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        aria-label={`Select video ${video.title}`}
                        checked={isSelected}
                        onChange={() => handleSelectOne(video.id)}
                        className="checkbox checkbox-xs checkbox-primary"
                      />
                    </td>

                    {/* Title + Thumbnail + Duration */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => onPlayVideo(video)}
                          className="relative w-16 h-10 rounded bg-[#334155] overflow-hidden shrink-0 cursor-pointer group shadow-xs"
                        >
                          <ContentImage
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                          <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                            {video.duration}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onPlayVideo(video)}
                            className="font-bold text-xs text-[#334155] hover:text-[#FF9933] transition-colors text-left line-clamp-1 block cursor-pointer"
                          >
                            {video.title}
                          </button>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                            <span>{video.category}</span>
                            <span>•</span>
                            <span>{video.uploader.name}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {video.status === "published" ? (
                        <span className="badge badge-sm badge-info gap-1 text-[11px] font-semibold">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Running
                        </span>
                      ) : video.status === "transcoding" ? (
                        <span className="badge badge-sm badge-warning gap-1 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          Transcoding
                        </span>
                      ) : (
                        <span className="badge badge-sm badge-ghost gap-1 text-[11px] font-semibold">
                          In Review
                        </span>
                      )}
                    </td>

                    {/* Age Profile Badge */}
                    <td className="py-3 px-4">
                      {video.ageProfile === "kids" && (
                        <span className="badge badge-sm badge-success gap-1 text-[10px] font-bold">
                          <Baby className="w-3 h-3" />
                          Kids Safe
                        </span>
                      )}
                      {video.ageProfile === "teen" && (
                        <span className="badge badge-sm badge-info gap-1 text-[10px] font-bold">
                          <Gamepad2 className="w-3 h-3" />
                          Teen (13-17)
                        </span>
                      )}
                      {video.ageProfile === "adult" && (
                        <span className="badge badge-sm badge-error gap-1 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Adult 18+
                        </span>
                      )}
                    </td>

                    {/* Tenancy / Ad Model */}
                    <td className="py-3 px-4">
                      <span className="badge badge-sm badge-ghost border-[#E2E8F0] gap-1 text-[11px] font-semibold">
                        <Sparkles className="w-3 h-3 text-[#FF9933]" />
                        {video.adSettings.monetizationEnabled
                          ? "Ad-Funded (Free)"
                          : "Non-Monetized"}
                      </span>
                    </td>

                    {/* Public License */}
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                      {video.publicDomainLicense}
                    </td>

                    {/* Ad Impressions */}
                    <td className="py-3 px-4 text-right font-medium text-[#334155]">
                      <div className="font-semibold text-[#334155]">
                        {video.adSettings.impressions.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        {video.views.toLocaleString("en-IN")} plays
                      </div>
                    </td>

                    {/* Ad Revenue (INR) */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#16A34A]">
                      ₹{video.adSettings.revenue.toLocaleString("en-IN")}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPlayVideo(video)}
                          title="Stream video & test ad injection"
                          className="p-1.5 rounded hover:bg-[#F1F5F9] text-[#334155] hover:text-[#FF6F00] transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => onToggleMonetization(video.id)}
                          title={
                            video.adSettings.monetizationEnabled
                              ? "Pause ad monetization"
                              : "Enable ads"
                          }
                          className={`p-1.5 rounded hover:bg-[#F1F5F9] transition-colors ${
                            video.adSettings.monetizationEnabled
                              ? "text-[#16A34A]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteVideo(video.id)}
                          title="Remove video from catalog"
                          className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#DC2626] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Summary Bar */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap items-center justify-between text-xs text-[#64748B]">
        <div>
          Showing{" "}
          <span className="font-bold text-[#334155]">
            {filteredVideos.length}
          </span>{" "}
          of <span className="font-bold text-[#334155]">{videos.length}</span>{" "}
          total catalog titles
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
            <span>Running / Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            <span>Ads Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            <span>18+ Age Gated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
