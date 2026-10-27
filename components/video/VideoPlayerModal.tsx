"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useEffect, useRef } from "react";
import {
  CloseRounded as X,
  PlayArrowRounded as Play,
  PauseRounded as Pause,
  VolumeUpRounded as Volume2,
  VolumeOffRounded as VolumeX,
  FullscreenRounded as Maximize,
  SkipNextRounded as SkipForward,
  OpenInNewRounded as ExternalLink,
  ThumbUpRounded as ThumbsUp,
  ThumbDownRounded as ThumbsDown,
  ShareRounded as Share2,
  FavoriteRounded as Heart,
  AccessTimeRounded as Clock,
  FlagRounded as Flag,
  ShoppingBagRounded as ShoppingBag,
  VisibilityRounded as Eye,
  CheckCircleRounded as CheckCircle2,
  InfoRounded as Info,
  SearchRounded as Search,
  MicRounded as Mic,
  AddRounded as Plus,
  NotificationsNoneRounded as Bell,
  ArrowBackRounded as ArrowLeft,
  ChevronRightRounded as ChevronRight,
  ChevronLeftRounded as ChevronLeft,
  MoreVertRounded as MoreVertical,
  PictureInPictureAltRounded as PictureInPicture,
  SpeedRounded as Speed,
  RefreshRounded as Refresh,
  WarningAmberRounded as ErrorIcon,
} from "@mui/icons-material";
import { VideoItem, AdSimulation, BuyLink } from "@/types";
import { BrandLockup } from "../layout/BrandLogo";
import { apiClient } from "@/lib/apiClient";
import { useProfile } from "../auth/ProfileProvider";
import type Hls from "hls.js";
import type { ErrorData as HlsErrorData } from "hls.js";



interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onSelectVideo?: (video: VideoItem) => void;
  allVideos?: VideoItem[];
}

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
}

/**
 * Upload Date Logic:
 * If <= 30 days -> shows relative time e.g. "4 days ago"
 * If > 30 days -> shows an exact date (DD-MMM-YYYY). Missing or invalid dates
 * remain explicitly unavailable rather than being replaced with invented metadata.
 */
function formatUploadDate(dateInput?: string): string {
  if (!dateInput) return "Date unavailable";
  const trimmed = dateInput.trim();

  // Non-date status labels are not evidence of a publication date.
  if (/^(official release|streaming now)$/i.test(trimmed)) {
    return "Date unavailable";
  }

  // Check for "X days ago"
  const daysMatch = trimmed.match(/^(\d+)\s*days?\s*ago$/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    if (days <= 30) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return formatExactDate(d);
  }

  // Check for "X weeks ago"
  const weeksMatch = trimmed.match(/^(\d+)\s*weeks?\s*ago$/i);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    const totalDays = weeks * 7;
    if (totalDays <= 30) {
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }
    const d = new Date(Date.now() - totalDays * 24 * 60 * 60 * 1000);
    return formatExactDate(d);
  }

  // Hours / Minutes / Seconds / Today / Yesterday (all <= 30 days)
  if (
    /^(today|yesterday|just now|\d+\s*(?:hour|minute|second)s?\s*ago)/i.test(
      trimmed
    )
  ) {
    return trimmed;
  }

  // "X months ago" -> exceeds 30 days
  const monthsMatch = trimmed.match(/^(\d+)\s*months?\s*ago$/i);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    const d = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
    return formatExactDate(d);
  }

  // "X years ago" -> exceeds 30 days
  const yearsMatch = trimmed.match(/^(\d+)\s*years?\s*ago$/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10);
    const d = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000);
    return formatExactDate(d);
  }

  // Match explicit day month year format e.g. "12 DEC 2025 • PIB Delhi" or "12-Dec-2025" or "12 Dec 2025"
  const monthMap: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  const dmyMatch = trimmed.match(
    /(\d{1,2})[\s\-]+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[a-z]*[\s\-]+(\d{4})/i
  );
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthKey = dmyMatch[2].toLowerCase().slice(0, 3);
    const month = monthMap[monthKey] ?? 11;
    const year = parseInt(dmyMatch[3], 10);
    const parsedDate = new Date(year, month, day);
    const diffDays = Math.floor(
      (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 0 && diffDays <= 30) {
      return diffDays === 0
        ? "Today"
        : `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
    return formatExactDate(parsedDate);
  }

  // Standard date parsing (ISO or RFC)
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const diffDays = Math.floor(
      (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= 0 && diffDays <= 30) {
      return diffDays === 0
        ? "Today"
        : `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
    return formatExactDate(parsed);
  }

  return "Date unavailable";
}

function formatExactDate(d: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(d.getDate()).padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`; // e.g. 12-Dec-2025
}

function formatLicense(license?: string): string | null {
  if (!license || !license.trim()) return null;
  const clean = license.trim();
  if (/india\s*-\s*open\s*data\s*-\s*gov/i.test(clean)) {
    return null;
  }
  return clean;
}



export default function VideoPlayerModal({
  video,
  onClose,
  onSelectVideo,
  allVideos = [],
}: VideoPlayerModalProps) {
  if (!video) return null;

  return (
    <VideoPlayerModalContent
      key={video.id}
      video={video}
      onClose={onClose}
      onSelectVideo={onSelectVideo}
      allVideos={allVideos}
    />
  );
}

interface VideoPlayerModalContentProps extends Omit<VideoPlayerModalProps, "video"> {
  video: VideoItem;
}

function VideoPlayerModalContent({
  video,
  onClose,
  onSelectVideo,
  allVideos = [],
}: VideoPlayerModalContentProps) {
  const { profile } = useProfile();
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(video);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Likes & Dislikes state
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(video?.likes || 0);

  // Subscribed state
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Favourites, Watch Later, Report states
  const [isFavourite, setIsFavourite] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showBuyLinksModal, setShowBuyLinksModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Description expand state (YouTube text limits)
  const [descExpanded, setDescExpanded] = useState(false);

  // Ad Simulation State
  const [adActive, setAdActive] = useState(() => Boolean(video.adSettings?.monetizationEnabled));
  const [adCountdown, setAdCountdown] = useState(5);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<AdSimulation | null>(null);
  const [adRevenueLogged, setAdRevenueLogged] = useState(false);

  // Comments & 50-per-page Pagination state
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const COMMENTS_PER_PAGE = 50;

  // Production Video Streaming & Resilience states
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const commentsSectionRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize external activity for the currently selected video.
  useEffect(() => {
    let cancelled = false;
    document.title = "Opencontent.in";

    apiClient.comments.list(currentVideo.id).then((data) => {
      if (!cancelled && data?.comments && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    });

    apiClient.likes.get(currentVideo.id).then((data) => {
      if (!cancelled && typeof data?.likeCount === "number") {
        setLikeCount(data.likeCount);
        if (typeof data.hasLiked === "boolean") setLiked(data.hasLiked);
      }
    });

    apiClient.dislikes.get(currentVideo.id).then((data) => {
      if (!cancelled && typeof data?.hasDisliked === "boolean") {
        setDisliked(data.hasDisliked);
      }
    });

    apiClient.favourites.list().then((favourites) => {
      if (!cancelled) setIsFavourite(favourites.includes(currentVideo.id));
    }).catch(() => {
      if (!cancelled) setIsFavourite(false);
    });

    if (currentVideo.channelId) {
      apiClient.subscriptions.list().then((channels) => {
        if (!cancelled) setIsSubscribed(channels.some((channel) => channel.id === currentVideo.channelId));
      }).catch(() => {
        if (!cancelled) setIsSubscribed(false);
      });
    }

    apiClient.views.record(currentVideo.id);
    return () => {
      cancelled = true;
      document.title = "Opencontent.in";
    };
  }, [currentVideo]);

  // Pick suitable ad based on age profile & dynamic RTB bidding auction
  useEffect(() => {
    if (adActive && currentVideo.adSettings?.monetizationEnabled) {

      // Fetch targeted preroll ad from Next.js BFF & Go ADS microservice
      let isMounted = true;
      const fetchPrerollAd = async () => {
        try {
          const catParam = currentVideo.category ? `&category=${encodeURIComponent(currentVideo.category)}` : "";
          const res = await fetch(`/api/ads?placement=preroll${catParam}&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data?.ads && data.ads.length > 0 && isMounted) {
              const liveAd = data.ads[0];
              setCurrentAd(liveAd);
              setAdCountdown(liveAd.skipAfterSec || 5);

              // 1. Report impression beacon to Next.js BFF & Go microservice
              if (liveAd.trackingToken) {
                fetch("/api/ads", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "impression", token: liveAd.trackingToken, placement: "preroll" }),
                }).catch(() => {});
              }

              // 2. Report client telemetry beacon to /api/telemetry/ad
              apiClient.telemetry.adPlayback({
                campaignId: liveAd.id,
                videoId: currentVideo.id,
                adFormat: "preroll",
                viewabilityPercent: 100,
                completed: false,
                audioMuted: isMuted,
              });
              return;
            }
          }
        } catch (err) {
          console.warn("[VideoPlayerModal] Error fetching dynamic preroll ad:", err);
        }

        if (isMounted) {
          setAdActive(false);
          setCurrentAd(null);
        }
      };

      fetchPrerollAd();
      return () => {
        isMounted = false;
      };
    }
  }, [currentVideo, adActive, isMuted]);

  // Ad countdown timer
  useEffect(() => {
    if (!adActive || !currentAd) return;

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          setCanSkipAd(true);
          if (!adRevenueLogged && currentVideo) {
            setAdRevenueLogged(true);
            // Fire ad completion telemetry beacon
            apiClient.telemetry.adPlayback({
              campaignId: currentAd.id,
              videoId: currentVideo.id,
              adFormat: "preroll",
              completed: true,
              audioMuted: isMuted,
              viewabilityPercent: 100,
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adActive, adRevenueLogged, currentVideo, currentAd, isMuted]);

  // Adaptive HLS Streaming and Playback Engine
  useEffect(() => {
    if (!currentVideo?.videoUrl || !videoRef.current) return;

    const videoEl = videoRef.current;
    setPlaybackError(null);
    setIsBuffering(false);

    let hlsInstance: Hls | null = null;
    const isHls = currentVideo.videoUrl.includes(".m3u8");

    if (isHls) {
      import("hls.js")
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            const instance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 60,
            });
            hlsInstance = instance;
            instance.loadSource(currentVideo.videoUrl);
            instance.attachMedia(videoEl);

            instance.on(Hls.Events.ERROR, (_event: string, data: HlsErrorData) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    instance.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    instance.recoverMediaError();
                    break;
                  default:
                    setPlaybackError("Stream playback error. Click retry to reload.");
                    instance.destroy();
                    break;
                }
              }
            });
            hlsRef.current = hlsInstance;
          } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
            videoEl.src = currentVideo.videoUrl;
          }
        })
        .catch(() => {
          videoEl.src = currentVideo.videoUrl;
        });
    } else {
      videoEl.src = currentVideo.videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentVideo?.videoUrl]);

  const handleRetryPlayback = () => {
    setPlaybackError(null);
    setIsBuffering(true);
    if (videoRef.current && currentVideo) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  const changePlaybackSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
    showToast(`Speed set to ${rate}x`);
  };

  const togglePiP = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn("Picture in Picture not available:", err);
      showToast("Picture-in-Picture not supported in this browser");
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "Escape") onClose();
      else if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (!adActive && videoRef.current) {
          if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
          else { videoRef.current.play().catch(() => {}); setIsPlaying(true); }
        }
      }
      else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }
      }
      else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (videoRef.current) {
          if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
          else videoRef.current.requestFullscreen?.().catch(() => {});
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, isPlaying, isMuted, adActive]);

  const selectVideo = (nextVideo: VideoItem) => {
    setCurrentVideo(nextVideo);
    setLikeCount(nextVideo.likes || 0);
    setLiked(false);
    setDisliked(false);
    setIsFavourite(false);
    setIsWatchLater(false);
    setIsReported(false);
    setShowBuyLinksModal(false);
    setComments([]);
    setCommentsPage(1);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackError(null);
    setAdActive(Boolean(nextVideo.adSettings?.monetizationEnabled));
    setCanSkipAd(false);
    setAdRevenueLogged(false);
    setCurrentAd(null);
    onSelectVideo?.(nextVideo);
  };

  const handleSkipAd = () => {
    setAdActive(false);
    if (currentAd) {
      const elapsed = Math.max(0, (currentAd.skipAfterSec || 5) - adCountdown);
      apiClient.telemetry.adPlayback({
        campaignId: currentAd.id,
        videoId: currentVideo.id,
        adFormat: "preroll",
        skippedAtSec: elapsed > 0 ? elapsed : 5.0,
        completed: false,
        audioMuted: isMuted,
        viewabilityPercent: 100,
      });
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (adActive) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleLikeToggle = async () => {
    if (!currentVideo) return;
    const prevLiked = liked;
    const prevLikeCount = likeCount;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (nextLiked && disliked) setDisliked(false);
    showToast(nextLiked ? "Added to Liked videos 👍" : "Removed from Liked videos");

    try {
      const res = await apiClient.likes.toggle(currentVideo.id);
      if (res && typeof res.likes === "number") {
        setLikeCount(res.likes);
        setLiked(Boolean(res.liked ?? res.hasLiked));
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
      showToast("Unable to update like. Please try again.");
    }
  };

  const handleDislikeToggle = async () => {
    if (!currentVideo) return;
    const previous = disliked;
    setDisliked(!previous);
    try {
      const result = await apiClient.dislikes.toggle(currentVideo.id);
      if (!result || typeof result.hasDisliked !== "boolean") throw new Error("Dislike update failed");
      setDisliked(result.hasDisliked);
      showToast(result.hasDisliked ? "Feedback noted" : "Dislike removed");
    } catch {
      setDisliked(previous);
      showToast("Unable to update dislike. Please try again.");
    }
  };

  const handleToggleFavourite = async () => {
    if (!currentVideo) return;
    const previous = isFavourite;
    setIsFavourite(!previous);
    const success = previous
      ? await apiClient.favourites.remove(currentVideo.id)
      : await apiClient.favourites.add(currentVideo.id);
    if (!success) {
      setIsFavourite(previous);
      showToast("Unable to update favourites. Please try again.");
      return;
    }
    showToast(previous ? "Removed from Favourites" : "Saved to Favourites ❤️");
  };

  const handleSubscriptionToggle = async () => {
    if (!currentVideo.channelId) {
      showToast("This video is missing its channel reference.");
      return;
    }
    const previous = isSubscribed;
    setIsSubscribed(!previous);
    const success = await apiClient.subscriptions.set(currentVideo.channelId, !previous);
    if (!success) {
      setIsSubscribed(previous);
      showToast("Unable to update subscription. Please try again.");
      return;
    }
    showToast(previous ? "Unsubscribed" : "Subscribed to channel!");
  };

  const handleToggleWatchLater = () => {
    if (isWatchLater) {
      setIsWatchLater(false);
      showToast("Removed from Watch Later");
    } else {
      setIsWatchLater(true);
      showToast("Saved to Watch Later ⏱️");
    }
  };

  const handleReport = () => {
    setIsReported(true);
    showToast("Report submitted. Thank you for keeping Opencontent safe.");
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Video link copied to clipboard!");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentVideo) return;

    const text = commentText.trim();

    try {
      const data = await apiClient.comments.post(currentVideo.id, text);
      if (data?.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentsPage(1);
        setCommentText("");
        showToast("Comment posted!");
        return;
      }
      showToast("Failed to post comment. Please try again.");
    } catch {
      showToast("Failed to post comment. Please try again.");
    }
  };

  // Up Next / Related videos (excluding current)
  const relatedVideos = allVideos.filter((v) => v.id !== currentVideo.id);

  // 5 creator tags maximum, formatted with @ (e.g. @isro, @movies, @scifi)
  const creatorTags = (currentVideo.tags || [])
    .slice(0, 5)
    .map((tag) => tag.replace(/^[#@]/, "").toLowerCase());

  // Formatted upload date (<=30 days -> relative, >30 days -> DD-MMM-YYYY)
  const formattedUploadDate = formatUploadDate(currentVideo.publishedDate);

  // Creator purchase / buy links (creators provide official purchase links)
  const activeBuyLinks: BuyLink[] =
    currentVideo.buyLinks && currentVideo.buyLinks.length > 0
      ? currentVideo.buyLinks
      : [];

  // Comments pagination: 50 comments per page
  const totalComments = comments.length;
  const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
  const startIndex = (commentsPage - 1) * COMMENTS_PER_PAGE;
  const visibleComments = comments.slice(
    startIndex,
    startIndex + COMMENTS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCommentsPage(newPage);
      commentsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Real Shorts for the right sidebar shelf (from actual platform catalog)
  const realShorts = (allVideos || []).filter(
    (v) =>
      v.id !== currentVideo.id &&
      (v.contentType === "short_video" || (v.durationSec && v.durationSec < 120 && v.durationSec > 0))
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#FFFFFF] text-[#334155] overflow-y-auto">
      {/* ── Top YouTube Navbar ── */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-[#E5E5E5] px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Close/Back button & Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            aria-label="Back to feed"
            className="p-2 rounded-full hover:bg-[#F2F2F2] text-[#334155] transition-colors cursor-pointer"
            title="Back to feed (Esc)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div onClick={onClose} className="cursor-pointer">
            <BrandLockup />
          </div>
        </div>

        {/* Center: Search Bar with Pill shape & Mic button */}
        <div className="flex-1 max-w-2xl mx-auto hidden sm:flex items-center gap-3">
          <div className="flex flex-1 items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-full h-10 px-4 rounded-l-full border border-[#CCCCCC] focus:border-[#FF6F00] outline-none text-sm placeholder-[#606060] bg-white shadow-inner"
            />
            <button
              type="button"
              className="h-10 px-5 rounded-r-full border border-l-0 border-[#CCCCCC] bg-[#F8F8F8] hover:bg-[#F0F0F0] text-[#334155] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 text-[#334155]" />
            </button>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] flex items-center justify-center text-[#334155] transition-colors cursor-pointer shrink-0"
            title="Search with your voice"
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Right Tools: + Create, Notifications (9+), User Avatar, Close */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-[#F2F2F2] text-[#334155] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold ring-1 ring-black/5 select-none cursor-pointer">
            {profile?.displayName?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Explicit Close Button */}
          <button
            onClick={onClose}
            aria-label="Close video"
            className="p-1.5 rounded-full hover:bg-[#F2F2F2] text-[#606060] hover:text-[#334155] transition-colors ml-1 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Main Two-Column Watch Page Container ── */}
      <div className="max-w-[1780px] mx-auto px-4 lg:px-8 py-5 flex flex-col lg:flex-row gap-6">
        {/* ── LEFT COLUMN: Video Player, Title, Channel Info, Action Buttons, Tags, Description, Comments (~70%) ── */}
        <div className="flex-1 min-w-0">
          {/* 1. Video Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md select-none group">
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              src={currentVideo.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
                setPlaybackError(null);
              }}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                setIsBuffering(false);
                setPlaybackError("Playback stream interrupted or source format error.");
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
              playsInline
              autoPlay
            />

            {/* Buffering Indicator */}
            {isBuffering && !adActive && !playbackError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-15 pointer-events-none">
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-[#FF9933] animate-spin" />
              </div>
            )}

            {/* Playback Error Overlay */}
            {playbackError && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-25 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center mb-3">
                  <ErrorIcon sx={{ fontSize: 28 }} />
                </div>
                <h3 className="text-white text-base font-bold">Playback Stream Stalled</h3>
                <p className="text-xs text-[#CBD5E1] mt-1 max-w-sm">
                  {playbackError}
                </p>
                <button
                  type="button"
                  onClick={handleRetryPlayback}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF9933] hover:bg-[#E88520] text-white text-xs font-bold transition-transform active:scale-95 shadow-md cursor-pointer"
                >
                  <Refresh sx={{ fontSize: 16 }} />
                  <span>Retry Stream</span>
                </button>
              </div>
            )}

            {/* AD SIMULATION OVERLAY */}
            {adActive && currentAd && (
              <div className="absolute inset-0 bg-black/85 flex flex-col justify-between p-4 md:p-6 z-20 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF6F00] text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                      Ad · 1 of 1
                    </span>
                    <span className="text-white text-xs font-semibold">
                      Sponsored by {currentAd.advertiser}
                    </span>
                  </div>
                </div>

                <div className="max-w-md mx-auto text-center my-auto px-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {currentAd.title}
                  </h3>
                  <p className="text-xs text-[#CBD5E1] mt-2">
                    {currentAd.tagline}
                  </p>
                  <a
                    href={currentAd.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      if (currentAd.trackingToken) {
                        fetch("/api/ads", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "click", token: currentAd.trackingToken, placement: "preroll" }),
                        }).catch(() => {});
                      }
                    }}
                    className="inline-flex items-center gap-1.5 mt-4 rounded-full bg-[#FF9933] text-white font-bold text-xs px-5 py-2 hover:bg-[#E88520] transition-colors shadow-lg"
                  >
                    <span>{currentAd.ctaText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="text-xs text-[#CBD5E1] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
                    <span>Video will play after sponsor ad</span>
                  </div>
                  <div>
                    {canSkipAd ? (
                      <button
                        onClick={handleSkipAd}
                        className="bg-white text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <span>Skip Ad</span>
                        <SkipForward className="w-4 h-4 fill-black" />
                      </button>
                    ) : (
                      <div className="bg-black/70 border border-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg">
                        Skip in {adCountdown}s
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sponsored Badge at bottom-left */}
            <div className="absolute bottom-14 left-4 z-10 flex items-center gap-1.5 rounded-sm bg-black/60 px-2 py-1 text-[11px] font-medium text-white/90 backdrop-blur-xs">
              <span>Sponsored</span>
              <Info className="w-3 h-3 text-white/70" />
              <span className="text-white/60">•</span>
              <span className="text-white/80">indiatstore.com</span>
            </div>

            {/* Video Controls Overlay */}
            {!adActive && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 z-10 flex flex-col gap-2">
                {/* Red/Orange YouTube Progress Scrubber Bar */}
                <div
                  className="w-full h-1 bg-white/30 hover:h-2 rounded-full cursor-pointer relative transition-all"
                  onClick={(e) => {
                    if (videoRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      videoRef.current.currentTime = pos * duration;
                    }
                  }}
                >
                  <div
                    className="h-full bg-[#FF9933] rounded-full relative"
                    style={{
                      width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF9933] rounded-full ring-2 ring-white shadow-md" />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1 hover:text-[#FF6F00] transition-colors cursor-pointer"
                      title={isPlaying ? "Pause (k)" : "Play (k)"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-1 hover:text-[#FF6F00] transition-colors cursor-pointer"
                      title={isMuted ? "Unmute (m)" : "Mute (m)"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    <span className="text-[#E2E8F0] font-mono text-[11px]">
                      {formatSeconds(currentTime)} / {formatSeconds(duration || currentVideo.durationSec || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Playback Speed Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold text-white/90 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-1"
                        title="Playback speed"
                      >
                        <Speed sx={{ fontSize: 16 }} />
                        <span>{playbackSpeed}x</span>
                      </button>

                      {showSpeedMenu && (
                        <div className="absolute bottom-8 right-0 bg-[#334155]/95 backdrop-blur-md border border-white/10 rounded-xl py-1 shadow-2xl z-30 min-w-24 text-left">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              type="button"
                              onClick={() => changePlaybackSpeed(rate)}
                              className={`w-full px-3 py-1 text-[11px] text-left hover:bg-white/10 flex items-center justify-between ${
                                playbackSpeed === rate ? "text-[#FF9933] font-bold" : "text-white/80"
                              }`}
                            >
                              <span>{rate}x</span>
                              {playbackSpeed === rate && <span className="text-[10px]">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Picture in Picture */}
                    <button
                      type="button"
                      onClick={togglePiP}
                      className="p-1 hover:text-[#FF9933] transition-colors cursor-pointer"
                      title="Picture in picture"
                    >
                      <PictureInPicture sx={{ fontSize: 18 }} />
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen?.().catch(() => {});
                          } else {
                            videoRef.current.requestFullscreen?.().catch(() => {});
                          }
                        }
                      }}
                      className="p-1 hover:text-[#FF6F00] transition-colors cursor-pointer"
                      title="Full screen (f)"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Video Title */}
          <h1 className="text-[16px] font-normal text-[#334155] mt-3.5 leading-snug tracking-tight">
            {currentVideo.title}
          </h1>

          {/* Metadata Badges (Series Continuity, Film Certification) */}
          {(currentVideo.seriesEpisode || currentVideo.filmCertification) && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {currentVideo.seriesEpisode && (
                <span className="text-[11px] bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                  <span>{currentVideo.seriesEpisode.seriesName}</span>
                  <span>•</span>
                  <span>S{currentVideo.seriesEpisode.seasonNumber}E{currentVideo.seriesEpisode.episodeNumber}</span>
                  {currentVideo.seriesEpisode.episodeTitle && (
                    <>
                      <span>:</span>
                      <span>{currentVideo.seriesEpisode.episodeTitle}</span>
                    </>
                  )}
                </span>
              )}
              {currentVideo.filmCertification && (
                <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                  <span>Certified {currentVideo.filmCertification}</span>
                  {currentVideo.certificateDoc && (
                    <span className="text-[10px] text-blue-500 font-mono">({currentVideo.certificateDoc})</span>
                  )}
                </span>
              )}
            </div>
          )}

          {/* 3. Channel Info Row: Avatar, Channel Name + Verified, Upload Date / Views / Subscribers, Subscribe Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pb-2">
            <div className="flex items-center gap-3">
              <ContentImage
                src={currentVideo.uploader.avatar}
                alt={currentVideo.uploader.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-black/5"
              />
              <div>
                <div className="font-semibold text-sm text-[#334155] flex items-center gap-1.5">
                  <span>{currentVideo.uploader.name}</span>
                  {currentVideo.uploader.verified && (
                    <CheckCircle2
                      className="w-4 h-4 text-[#FF9933] fill-[#FF9933]/15"
                      aria-label="Verified creator"
                    />
                  )}
                </div>
                <div className="text-xs text-[#606060] flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="font-medium text-[#334155]">
                    {formattedUploadDate}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-[#334155] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#606060]" />
                    {currentVideo.views.toLocaleString()} views
                  </span>
                </div>
              </div>

              {/* Subscribe Button (No Join Button!) */}
              <button
                type="button"
                onClick={handleSubscriptionToggle}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ml-2 ${
                  isSubscribed
                    ? "bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155]"
                    : "bg-[#FF9933] hover:bg-[#E88520] text-white shadow-xs"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>
          </div>

          {/* 4. Action Buttons Section: Liked Count, Dislike, Share, Favourite, Watch Later, Report */}
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {/* Segmented Like / Dislike Pill */}
            <div className="bg-[#F2F2F2] hover:bg-[#E5E5E5] rounded-full flex items-center h-9 text-xs font-semibold text-[#334155] transition-colors">
              <button
                type="button"
                onClick={handleLikeToggle}
                className={`flex items-center gap-1.5 px-3.5 h-full rounded-l-full hover:bg-black/5 transition-colors cursor-pointer ${
                  liked ? "text-[#FF9933]" : ""
                }`}
                title="I like this"
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likeCount.toLocaleString()}</span>
              </button>
              <div className="w-[1px] h-5 bg-[#D9D9D9]" />
              <button
                type="button"
                onClick={handleDislikeToggle}
                className={`flex items-center px-3 h-full rounded-r-full hover:bg-black/5 transition-colors cursor-pointer ${
                  disliked ? "text-[#FF9933]" : ""
                }`}
                title="I dislike this"
              >
                <ThumbsDown
                  className={`w-4 h-4 ${disliked ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="bg-[#F2F2F2] hover:bg-[#E5E5E5] rounded-full px-3.5 h-9 text-xs font-semibold text-[#334155] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share video"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {/* Favourites Icon Button */}
            <button
              type="button"
              onClick={handleToggleFavourite}
              className={`rounded-full px-3.5 h-9 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFavourite
                  ? "bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3]"
                  : "bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155]"
              }`}
              title="Add to Favourites"
            >
              <Heart className={`w-4 h-4 ${isFavourite ? "fill-current" : ""}`} />
              <span>{isFavourite ? "Favourited" : "Favourite"}</span>
            </button>

            {/* Watch Later Icon Button */}
            <button
              type="button"
              onClick={handleToggleWatchLater}
              className={`rounded-full px-3.5 h-9 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isWatchLater
                  ? "bg-[#F2F2F2] text-[#FF9933] hover:bg-[#E5E5E5]"
                  : "bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155]"
              }`}
              title="Save to Watch Later"
            >
              <Clock
                className={`w-4 h-4 ${isWatchLater ? "stroke-[2.5]" : ""}`}
              />
              <span>{isWatchLater ? "Saved" : "Watch Later"}</span>
            </button>

            {/* Report Button */}
            <button
              type="button"
              onClick={handleReport}
              className={`rounded-full px-3.5 h-9 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isReported
                  ? "bg-[#FFF7ED] text-[#DC2626] hover:bg-[#FEE2E2]"
                  : "bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155]"
              }`}
              title="Report video"
            >
              <Flag className="w-4 h-4" />
              <span>{isReported ? "Reported" : "Report"}</span>
            </button>

            {/* Buy Links Button (only when creator has registered official links) */}
            {activeBuyLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBuyLinksModal(!showBuyLinksModal)}
                className={`rounded-full px-3.5 h-9 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showBuyLinksModal
                    ? "bg-[#F2F2F2] text-[#FF9933] hover:bg-[#E5E5E5]"
                    : "bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155]"
                }`}
                title="Creator purchase links"
              >
                <ShoppingBag className="w-4 h-4 text-[#FF6F00]" />
                <span>Buy Links</span>
                <span className="bg-[#FF6F00] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                  {activeBuyLinks.length}
                </span>
              </button>
            )}
          </div>

          {/* Creator Purchase / Buy Links Showcase Panel */}
          {showBuyLinksModal && (
            <div className="mt-3 bg-[#FAF8F5] border border-[#FF6F00]/25 rounded-2xl p-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADCCE]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FF6F00]/10 flex items-center justify-center text-[#FF6F00] shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#334155] flex items-center gap-2 flex-wrap">
                      <span>Creator Purchase Links</span>
                      <span className="text-[10px] font-semibold bg-[#FF6F00] text-white px-2 py-0.5 rounded-full">
                        Official Store Links
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#606060]">
                      Purchase links provided by {currentVideo.uploader.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBuyLinksModal(false)}
                  className="p-1 rounded-full hover:bg-black/5 text-[#606060] transition-colors cursor-pointer"
                  title="Close purchase links"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {activeBuyLinks.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-[#E5E5E5] p-3 flex flex-col justify-between hover:border-[#FF6F00]/40 hover:shadow-xs transition-all"
                  >
                    <div className="flex gap-2.5 items-start">
                      {item.image && (
                        <ContentImage
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 ring-1 ring-black/5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {item.badge && (
                          <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#FF6F00] bg-[#FFF7ED] px-1.5 py-0.5 rounded mb-1">
                            {item.badge}
                          </span>
                        )}
                        <h4 className="text-xs font-semibold text-[#334155] line-clamp-2 leading-tight">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-[#606060] block mt-0.5">
                          {item.merchant}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F2F2F2]">
                      <span className="text-xs font-bold text-[#334155]">
                        {item.price}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          showToast(`Opening ${item.merchant || "store"} link...`)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FF6F00] hover:bg-[#E65100] text-white px-3 py-1 rounded-full transition-colors shadow-xs"
                      >
                        <span>Buy Now</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Creator Tags Section (Max 5 tags, @ notation) */}
          {creatorTags.length > 0 && (
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <span className="text-xs font-semibold text-[#606060]">
                Tags:
              </span>
              {creatorTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155] px-3 py-1 text-xs font-semibold transition-colors cursor-pointer hover:text-[#FF6F00]"
                >
                  @{tag}
                </span>
              ))}
            </div>
          )}

          {/* Category & License (License only displayed when known and supported) */}
          <div className="flex items-center gap-3 mt-2 text-xs text-[#606060] flex-wrap">
            {currentVideo.category && (
              <span className="font-semibold text-[#334155] flex items-center gap-1">
                <span>Category:</span>
                <span className="font-normal text-[#606060]">
                  {currentVideo.category}
                </span>
              </span>
            )}
            {formatLicense(currentVideo.publicDomainLicense) && (
              <>
                {currentVideo.category && <span>•</span>}
                <span className="font-semibold text-[#334155] flex items-center gap-1">
                  <span>License:</span>
                  <span className="font-normal text-[#606060]">
                    {formatLicense(currentVideo.publicDomainLicense)}
                  </span>
                </span>
              </>
            )}
          </div>

          {/* 6. Video Description Section (Clean, YouTube text limits: 3-line clamp, ...more / Show less) */}
          <div className="bg-[#F2F2F2] hover:bg-[#EAEAEA] rounded-xl p-4 mt-4 text-sm text-[#334155] transition-colors">
            <div className="font-bold text-sm text-[#334155] mb-1.5">
              <span>Video description</span>
            </div>

            {/* Pure video description text with YouTube text limits */}
            <p
              className={`text-xs leading-relaxed text-[#334155] whitespace-pre-line ${
                descExpanded ? "" : "line-clamp-3"
              }`}
            >
              {currentVideo.description}
            </p>

            <button
              type="button"
              onClick={() => setDescExpanded(!descExpanded)}
              className="mt-2 text-xs font-bold text-[#334155] hover:text-[#606060] cursor-pointer"
            >
              {descExpanded ? "Show less" : "...more"}
            </button>
          </div>

          {/* 7. Comments Section (Shows only 50 comments per page with pagination) */}
          <div ref={commentsSectionRef} className="mt-7 mb-8">
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-[#334155]">
                  {totalComments.toLocaleString()} Comments
                </h2>
                <span className="text-xs text-[#606060] bg-[#F2F2F2] px-2.5 py-0.5 rounded-full font-medium">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + COMMENTS_PER_PAGE, totalComments)} of{" "}
                  {totalComments}
                </span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#334155] hover:bg-[#F2F2F2] px-2.5 py-1 rounded cursor-pointer"
              >
                <span>Sort by</span>
              </button>
            </div>

            {/* Add a Comment Input Form */}
            <form
              onSubmit={handleAddComment}
              className="flex items-start gap-3 mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold ring-1 ring-black/5 select-none shrink-0">
                {profile?.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border-b border-[#CCCCCC] focus:border-[#334155] pb-1.5 text-xs outline-none bg-transparent placeholder-[#606060]"
                />
                {commentText && (
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setCommentText("")}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#334155] hover:bg-[#F2F2F2] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-[#065FD4] hover:bg-[#0056b3] text-white text-xs font-semibold cursor-pointer"
                    >
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* 50 Visible Comments for Current Page */}
            <div className="space-y-4">
              {visibleComments.map((cmt) => (
                <div key={cmt.id} className="flex items-start gap-3">
                  <ContentImage
                    src={cmt.avatar}
                    alt={cmt.author}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#334155]">
                        {cmt.author}
                      </span>
                      <span className="text-[11px] text-[#606060]">
                        {cmt.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                      {cmt.content}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-[#606060]">
                      <button className="flex items-center gap-1 hover:text-[#334155] cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{cmt.likes}</span>
                      </button>
                      <button className="hover:text-[#334155] cursor-pointer">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button className="font-semibold hover:text-[#334155] cursor-pointer">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls (50 comments per page) */}
            {totalPages > 1 && (
              <div className="mt-7 pt-4 border-t border-[#E5E5E5] flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-[#606060]">
                  Page <strong className="text-[#334155]">{commentsPage}</strong> of{" "}
                  <strong className="text-[#334155]">{totalPages}</strong> ({totalComments}{" "}
                  total comments, 50 per page)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(commentsPage - 1)}
                    disabled={commentsPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F2F2F2] cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          commentsPage === pageNum
                            ? "bg-[#334155] text-white"
                            : "border border-[#E2E8F0] text-[#334155] hover:bg-[#F2F2F2]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => handlePageChange(commentsPage + 1)}
                    disabled={commentsPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F2F2F2] cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Filter Chips, Up Next & Shorts Shelf (~30%) ── */}
        <div className="w-full lg:w-[410px] shrink-0 space-y-4">
          {/* Top Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {["All", `From ${currentVideo.uploader.name}`, "Gadgets", "Related"].map(
              (chip, idx) => (
                <button
                  key={chip}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    idx === 0
                      ? "bg-[#334155] text-white"
                      : "bg-[#F2F2F2] hover:bg-[#E5E5E5] text-[#334155]"
                  }`}
                >
                  {chip}
                </button>
              )
            )}
            <button className="p-1.5 rounded-full hover:bg-[#F2F2F2] text-[#334155] shrink-0">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Related / Up Next Video Cards */}
          <div className="space-y-3">
            {relatedVideos.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  selectVideo(item);
                }}
                className="flex items-start gap-2.5 group cursor-pointer"
              >
                {/* 16:9 Compact Thumbnail */}
                <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                  <ContentImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* "New" Badge */}
                  <span className="absolute top-1.5 left-1.5 bg-[#000000B3] text-white text-[10px] font-bold px-1 rounded">
                    New
                  </span>
                  {/* Duration Badge */}
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 rounded">
                    {item.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-1">
                  <h4 className="line-clamp-2 text-xs font-semibold text-[#334155] leading-snug group-hover:text-[#334155]">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-[#606060] mt-1 flex items-center gap-1">
                    <span className="truncate">{item.uploader.name}</span>
                    {item.uploader.verified && (
                      <CheckCircle2 className="w-3 h-3 text-[#FF9933]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#606060] mt-0.5 flex items-center gap-1">
                    <span>{item.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{formatUploadDate(item.publishedDate)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-[#606060] hover:text-[#334155] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* ── YouTube Shorts Shelf (only when real shorts exist) ── */}
          {realShorts.length > 0 && (
            <div className="border-t border-b border-[#E5E5E5] py-4 my-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#FF9933] font-black text-sm">⚡</span>
                <h3 className="font-bold text-sm text-[#334155]">Shorts</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {realShorts.slice(0, 3).map((short) => (
                  <div
                    key={short.id}
                    onClick={() => {
                      if (onSelectVideo) onSelectVideo(short);
                    }}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-xs">
                      {short.thumbnail ? (
                        <ContentImage
                          src={short.thumbnail}
                          alt={short.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                          <Play className="w-6 h-6 opacity-40 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-start justify-between gap-1">
                      <h5 className="line-clamp-2 text-[11px] font-semibold text-[#334155] leading-tight">
                        {short.title}
                      </h5>
                    </div>
                    <div className="text-[10px] text-[#606060] mt-0.5">
                      {short.views.toLocaleString()} plays
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Up Next Videos */}
          <div className="space-y-3">
            {relatedVideos.slice(3, 8).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  selectVideo(item);
                }}
                className="flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                  <ContentImage
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 rounded">
                    {item.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <h4 className="line-clamp-2 text-xs font-semibold text-[#334155] leading-snug group-hover:text-[#334155]">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-[#606060] mt-1 flex items-center gap-1">
                    <span className="truncate">{item.uploader.name}</span>
                    {item.uploader.verified && (
                      <CheckCircle2 className="w-3 h-3 text-[#FF9933]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#606060] mt-0.5 flex items-center gap-1">
                    <span>{item.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{formatUploadDate(item.publishedDate)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-[#606060] hover:text-[#334155] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#334155] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
