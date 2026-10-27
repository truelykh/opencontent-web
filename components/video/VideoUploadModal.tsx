"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CloseRounded as X,
  CloudUploadRounded as Upload,
  CheckCircleRounded as CheckCircle2,
  MovieRounded as Film,
  HeadphonesRounded as HeadphonesIcon,
  PublicRounded as Globe,
  LockRounded as Lock,
  LinkRounded as LinkIcon,
  WarningAmberRounded as AlertTriangle,
  AddRounded as Plus,
  ImageRounded as ImageIcon,
  VideoLibraryRounded as VideoLibrary,
} from "@mui/icons-material";
import {
  VideoItem,
  CreatorChannel,
  PLATFORM_CATEGORIES,
  PlatformCategory,
  ContentFormatType,
} from "@/types";
import { apiClient } from "@/lib/apiClient";

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoPublished: (newVideo: VideoItem) => void;
  defaultCategory?: string;
  fullPage?: boolean;
}

const SUPPORTED_CONTENT_TYPES: {
  id: ContentFormatType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "video",
    label: "Video",
    description: "Standard horizontal video",
    icon: Film,
  },
  {
    id: "audio",
    label: "Audio",
    description: "Audio stream or podcast",
    icon: HeadphonesIcon,
  },
  { id: "movie", label: "Movie", description: "Full-length film", icon: Film },
  { id: "series", label: "Series", description: "Episode-based series", icon: Film },
  { id: "pdf", label: "PDF", description: "Document or edition", icon: VideoLibrary },
];

export default function VideoUploadModal({
  isOpen,
  onClose,
  onVideoPublished,
  defaultCategory,
  fullPage = false,
}: VideoUploadModalProps) {
  const [step, setStep] = useState<"form" | "uploading" | "success">("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Channels state
  const [userChannels, setUserChannels] = useState<CreatorChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [channelsLoading, setChannelsLoading] = useState<boolean>(true);

  // Inline Channel Creation Form state

  // Video Form Fields
  const [contentType, setContentType] = useState<ContentFormatType>("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PlatformCategory>(() => {
    if (defaultCategory && (PLATFORM_CATEGORIES as readonly string[]).includes(defaultCategory)) {
      return defaultCategory as PlatformCategory;
    }
    return "Generic";
  });
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [seasonNumber, setSeasonNumber] = useState("1");
  const [seriesName, setSeriesName] = useState("");

  const categoryOptions: Record<string, string[]> = {
    video: ["Movies", "Web Series", "Vertical AI Series", "Anime", "Cartoons", "Gaming", "Sports", "Others"],
    audio: ["Music", "Radio"],
    movie: ["Movies"],
    series: ["Web Series", "Anime", "Cartoons", "Vertical AI Series"],
    pdf: ["Education", "Digital Newspaper"],
  };

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "unlisted">("public");
  const [tags, setTags] = useState(["@opencontent", "@india", "", "", "", "", ""]);

  // Upload progress & publishing
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publishedVideo, setPublishedVideo] = useState<VideoItem | null>(null);
  const handleContentTypeChange = (nextType: ContentFormatType) => {
    setContentType(nextType);
    const firstCategory = categoryOptions[nextType]?.[0];
    if (firstCategory) setCategory(firstCategory as PlatformCategory);
  };

  const loadChannels = async () => {
    setChannelsLoading(true);
    try {
      const data = await apiClient.channels.list();
      if (data && Array.isArray(data.channels) && data.channels.length > 0) {
        setUserChannels(data.channels);
        const primary = data.channels.find((c: CreatorChannel) => c.isPrimary) || data.channels[0];
        setSelectedChannelId(primary.id);
      } else {
        setUserChannels([]);
        setSelectedChannelId("");
      }
    } catch (err) {
      console.warn("Failed to load user channels:", err);
      setUserChannels([]);
      setSelectedChannelId("");
    } finally {
      setChannelsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void (async () => {
        await loadChannels();
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedChannelId) {
      setErrorMsg("Please select or create a channel to upload content.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }

    if (!mediaFile) {
      setErrorMsg("Choose a media file before publishing.");
      return;
    }

    const activeChan = userChannels.find((c) => c.id === selectedChannelId);
    if (!activeChan) {
      setErrorMsg("Selected channel was not found. Please re-select your channel.");
      return;
    }

    const customTags = tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0);

    setStep("uploading");
    setUploadProgress(20);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return prev + 15;
      });
    }, 250);

    try {
      const payload = {
        channelId: activeChan.id,
        title: title.trim(),
        description: description.trim(),
        contentType,
        genre: category,
        privacy,
        tags: customTags,
        seriesName: seriesName.trim() || undefined,
        seasonNumber: Number(seasonNumber) || 1,
        episodeNumber: Number(episodeNumber) || 1,
        thumbnail: thumbnailUrl.trim(),
        mediaFile,
      };

      const result = await apiClient.videos.upload(payload);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (result && result.video) {
        setPublishedVideo(result.video);
        setStep("success");
        onVideoPublished(result.video);
      } else {
        throw new Error(result?.error || "Failed to publish video");
      }
    } catch (err: unknown) {
      clearInterval(progressTimer);
      console.error("Upload error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to publish video. Please try again.");
      setStep("form");
    }
  };

  const handleReset = () => {
    setStep("form");
    setTitle("");
    setDescription("");
    setTags(["@opencontent", "@india", "", "", "", "", ""]);
    setMediaUrl("");
    setThumbnailUrl("");
    setMediaFile(null);
    setThumbnailFile(null);
    setPublishedVideo(null);
    setErrorMsg(null);
    onClose();
  };

  const uploadContent = (
    <div className={fullPage ? "w-full max-h-[calc(100dvh-1rem)] overflow-y-auto" : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"}>
      <div role={fullPage ? undefined : "dialog"} aria-modal={fullPage ? undefined : true} aria-labelledby="upload-content-title" className={fullPage ? "w-full border-b border-slate-200" : "relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF9933]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 id="upload-content-title" className="font-bold text-base text-slate-900 tracking-tight">
                Upload content
              </h2>
              <p className="text-xs text-slate-500">
                Publish a video to your channel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto saffron-scrollbar flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleStartUpload} className="space-y-4">
              {/* Channel Selector Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Channel <span className="text-red-500">*</span>
                  </label>
                  {userChannels.length > 0 && (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-[#FF9933] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create another channel
                    </button>
                  )}
                </div>

                {channelsLoading ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 animate-pulse">
                    Loading your channels...
                  </div>
                ) : userChannels.length > 0 ? (
                  <select
                    id="channel-select"
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] text-slate-900 font-medium"
                  >
                    {userChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.handle})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="border-b border-slate-200 py-3 text-xs text-slate-500">
                    No created channels are available. Create a channel in Studio before uploading.
                  </p>
                )}
              </div>

              {/* Content Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Content type
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {SUPPORTED_CONTENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = contentType === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleContentTypeChange(t.id)}
                        className={`min-h-11 items-center p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col gap-0.5 ${
                          isSelected
                            ? "border-[#FF9933] bg-[#FFF7ED] text-slate-900 ring-1 ring-[#FF9933]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              isSelected ? "text-[#FF9933]" : "text-slate-400"
                            }`}
                          />
                          <span className="text-[11px] font-medium">{t.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your video a descriptive title"
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlatformCategory)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs focus:border-[#FF9933] focus:outline-none"
                >
                  {(categoryOptions[contentType] || ["Others"]).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              {contentType === "series" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input value={seriesName} onChange={(e) => setSeriesName(e.target.value)} required placeholder="Series name" className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs" />
                  <input value={seasonNumber} onChange={(e) => setSeasonNumber(e.target.value)} required type="number" min="1" placeholder="Season" className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs" />
                  <input value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} required type="number" min="1" placeholder="Episode" className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs" />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video..."
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                />
              </div>

              {/* Media File & Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>Media file or URL</span>
                    <span className="text-[10px] text-slate-400">MP4, WebM, MP3</span>
                  </label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://... (or choose file below)"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF9933]"
                  />
                  <div className="mt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{mediaFile ? mediaFile.name : "Choose file"}</span>
                      <input
                        type="file"
                        accept="video/*,audio/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setMediaFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>Thumbnail</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://... (optional image URL)"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF9933]"
                  />
                  <div className="mt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{thumbnailFile ? thumbnailFile.name : "Choose thumbnail"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setThumbnailFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Visibility Status Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Visibility
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "public", label: "Public", desc: "Everyone can search and view", icon: Globe },
                    { id: "unlisted", label: "Unlisted", desc: "Anyone with the link", icon: LinkIcon },
                    { id: "private", label: "Private", desc: "Only you can view", icon: Lock },
                  ] as const).map((p) => {
                    const Icon = p.icon;
                    const isSelected = privacy === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setPrivacy(p.id)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#FF9933] bg-[#FFF7ED] text-slate-900 ring-1 ring-[#FF9933]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-medium text-[11px]">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#FF9933]" : "text-slate-400"}`} />
                          <span>{p.label}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-0.5">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creator Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Tags</span>
                  <span className="text-[10px] text-slate-400">7 tags · 10 characters each</span>
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  {tags.map((tag, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={10}
                      value={tag}
                      onChange={(e) => setTags((current) => current.map((value, i) => i === index ? e.target.value : value))}
                      placeholder={`Tag ${index + 1}`}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs focus:border-[#FF9933] focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedChannelId}
                  className="btn-saffron px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publish video
                </button>
              </div>
            </form>
          )}

          {step === "uploading" && (
            <div className="py-12 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-12 h-12 border-3 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Publishing content to your channel...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Please keep this window open while the upload completes.
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#FF9933] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Cancel upload
              </button>
            </div>
          )}

          {step === "success" && publishedVideo && (
            <div className="py-8 text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">
                  Video published successfully
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your video is now live on your channel and accessible according to your visibility settings.
                </p>
              </div>

              {/* Clean Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Title:</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[220px]">
                    {publishedVideo.title}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Channel:</span>
                  <span className="font-semibold text-slate-800">
                    {publishedVideo.uploader.name}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-800">
                    {publishedVideo.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Visibility:</span>
                  <span className="font-semibold text-emerald-600 capitalize">
                    {publishedVideo.privacy || "public"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-saffron px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return fullPage ? uploadContent : createPortal(uploadContent, document.body);
}
