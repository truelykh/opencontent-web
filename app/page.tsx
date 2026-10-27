"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  // Layout
  Header,
  Sidebar,
  SiteFooter,
  // Video & Media
  VideoCard,
  VideoPlayerModal,
  VideoUploadModal,
  Shelf,
  type ShelfTone,
  // Auth
  ProfileProvider,
  // Views
  OpencontentStudioView,
  ChannelsView,
  SubscriptionsView,
  WatchHistoryView,
  FavouritesView,
  CreatorCollabView,
  CreatorRightsPanel,
  AdMonetizationPanel,
  PrivacyProfileView,
  SettingsView,
  ShopView,
  PoliciesView,
  LegalFirstSpecView,
  MicroserviceArchitectureView,
  ComponentErrorBoundary,
  EmptyState,
  VideoCardSkeletonGrid,
  SearchResultsSkeleton,
  ExploreView,
  HomeEmptyState,
  TrendingView,
} from "@/components";
import HorizontalPageHeader from "@/components/common/HorizontalPageHeader";
import { apiClient } from "@/lib/apiClient";
import {
  VideoItem,
  AgeProfile,
  SettingsSubTab,
  PolicySubTab,
  ProfileSubTab,
  ShopSubTab,
  StudioSubTab,
  AdSubTab,
  GovernanceSubTab,
} from "../types";
import { buildVideoCatalogIndex, queryIndexedVideos, VideoCatalogIndex } from "../lib/videoCatalogIndex";
import type { ExploreGroupId } from "../lib/navigation";
import { AnimeBladeIcon, CartoonCatIcon, TrendingCometIcon } from "../components/common/CategoryIcons";
import {
  MovieRounded as Film,
  AutoAwesomeRounded as Sparkles,
  SearchRounded as Search,
  RefreshRounded as Refresh,
  CheckCircleRounded as CheckCircle,
  AccountBalanceRounded as Landmark,
  RadioRounded as Radio,
  MusicNoteRounded as Music2,
  LiveTvRounded as Tv,
  SchoolRounded as GraduationCap,
  SportsEsportsRounded as Gamepad2,
  MonitorHeartRounded as HeartPulse,
  ExploreRounded as Compass,
  HeadphonesRounded as Headphones,
  ReceiptLongRounded as ScrollText,
  MenuBookRounded as BookOpen,
  ArticleRounded as FileText,
  ArrowBackRounded as ArrowLeft,
  CloseRounded as X,
  EmojiEventsRounded as Trophy,
} from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";

type SvgIcon = React.ComponentType<SvgIconProps>;

interface ShelfConfig {
  key: string;
  title: string;
  subtitle: string;
  icon: SvgIcon;
  tone: ShelfTone;
  videos: VideoItem[];
  /** Value passed to the category filter when "See all" is clicked */
  seeAllCategory: string;
  showRank?: boolean;
  showLikes?: boolean;
  pulse?: boolean;
}

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<VideoItem[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(true);
  const [trendingFetchError, setTrendingFetchError] = useState<string | null>(null);
  const [subscribedCreatorNames, setSubscribedCreatorNames] = useState<Set<string>>(new Set());
  const [uploadCategory, setUploadCategory] = useState<string>("Movies");
  const [currentTab, setCurrentTab] = useState<string>("feed");
  const [selectedAgeProfile, setSelectedAgeProfile] =
    useState<AgeProfile>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [semanticResults, setSemanticResults] = useState<{ query: string; videos: VideoItem[] } | null>(null);
  const [isSemanticLoading, setIsSemanticLoading] = useState<boolean>(false);
  const [useSemanticSearch, setUseSemanticSearch] = useState<boolean>(true);
  const searchRequestRef = useRef(0);
  const [settingsSubTab, setSettingsSubTab] =
    useState<SettingsSubTab>("account");
  const [studioSubTab, setStudioSubTab] =
    useState<StudioSubTab>("dashboard");
  const [policySubTab, setPolicySubTab] = useState<PolicySubTab>("usage");
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>("profile");
  const [shopSubTab, setShopSubTab] = useState<ShopSubTab>("store");
  const [adCenterSubTab, setAdCenterSubTab] = useState<AdSubTab>("analytics");
  const [governanceSubTab, setGovernanceSubTab] = useState<GovernanceSubTab>("claims");

  // Modals state
  const [selectedVideoForPlay, setSelectedVideoForPlay] =
    useState<VideoItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [activeNavLabel, setActiveNavLabel] = useState<string>("Home");
  const [selectedExploreGroup, setSelectedExploreGroup] = useState<ExploreGroupId | null>(null);

  // Search requests are resolved by the catalogue service.
  useEffect(() => {
    const q = searchQuery.trim();
    const requestId = ++searchRequestRef.current;
    if (!q) {
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setIsSemanticLoading(true);
      try {
        const res = await apiClient.videos.list({ q, semantic: true });
        if (!active || requestId !== searchRequestRef.current) return;
        if (res?.videos && Array.isArray(res.videos)) {
          setSemanticResults({ query: q, videos: res.videos });
        } else {
          setSemanticResults({ query: q, videos: [] });
        }
      } catch {
        if (!active || requestId !== searchRequestRef.current) return;
        setSemanticResults({ query: q, videos: [] });
      } finally {
        if (active && requestId === searchRequestRef.current) {
          setIsSemanticLoading(false);
        }
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);
  const [videoFetchError, setVideoFetchError] = useState<string | null>(null);

  const fetchVideos = React.useCallback(async () => {
    setIsLoadingVideos(true);
    setVideoFetchError(null);
    try {
      const data = await apiClient.videos.list();
      if (data?.videos && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
    } catch (err: unknown) {
      setVideoFetchError(err instanceof Error ? err.message : "Failed to load video catalog. Please check your connection and try again.");
    } finally {
      setIsLoadingVideos(false);
    }
  }, []);

  const fetchTrendingVideos = React.useCallback(async () => {
    setIsTrendingLoading(true);
    setTrendingFetchError(null);
    try {
      const data = await apiClient.videos.list({ category: "trending" });
      setTrendingVideos(Array.isArray(data?.videos) ? data.videos.slice(0, 10) : []);
    } catch (err: unknown) {
      setTrendingVideos([]);
      setTrendingFetchError(err instanceof Error ? err.message : "Unable to load trending activity.");
    } finally {
      setIsTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Opencontent.in";
    void (async () => {
      await fetchVideos();
    })();

    void (async () => {
      await fetchTrendingVideos();
    })();

    fetch("/api/subscriptions")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const names = Array.isArray(data?.channels)
          ? data.channels
              .filter((channel: { isSubscribed?: boolean }) => channel.isSubscribed)
              .flatMap((channel: { name?: string; handle?: string }) => [channel.name, channel.handle])
              .filter((name: string | undefined): name is string => Boolean(name))
              .map((name: string) => name.toLowerCase().replace(/^@/, ""))
          : [];
        setSubscribedCreatorNames(new Set(names));
      })
      .catch(() => setSubscribedCreatorNames(new Set()));

    // Decoupled Client SDK: fetch verified sponsor campaigns from server
  }, [fetchTrendingVideos, fetchVideos]);

  // Active User Activity & Platform Dwell Time Heartbeat (Every 30s)
  useEffect(() => {
    apiClient.telemetry.heartbeat({
      pageRoute: typeof window !== "undefined" ? window.location.pathname : "/",
      activeSeconds: 15,
      isTabFocused: typeof document !== "undefined" ? document.visibilityState === "visible" : true,
    });

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        apiClient.telemetry.heartbeat({
          pageRoute: window.location.pathname,
          activeSeconds: 30,
          isTabFocused: true,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const mainRef = useRef<HTMLElement>(null);

  // Jump back to the top whenever the view or filter changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [currentTab, selectedCategory]);

  // Escape closes the mobile navigation drawer
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Single O(N) pass catalog indexing with O(1) category buckets and inverted token index
  const catalog = useMemo<VideoCatalogIndex>(() => {
    return buildVideoCatalogIndex(videos, selectedAgeProfile);
  }, [videos, selectedAgeProfile]);

  // Inverted Index + LRU Cached Search: O(1) cache hit, O(M) token set intersection
  const filteredFeedVideos = useMemo(() => {
    return queryIndexedVideos(catalog, searchQuery, selectedCategory);
  }, [catalog, searchQuery, selectedCategory]);

  // Prefer server search results when available.
  const displaySearchVideos = useMemo(() => {
    if (!searchQuery.trim()) return filteredFeedVideos;
    if (useSemanticSearch && semanticResults?.query === searchQuery.trim()) {
      return semanticResults.videos;
    }
    return filteredFeedVideos;
  }, [searchQuery, useSemanticSearch, semanticResults, filteredFeedVideos]);

  // All Genre Shelves: O(1) direct hash-bucket retrieval and O(N log K) MinHeap top-K
  // The current catalogue contract has no recent engagement window or trend score.
  // Do not turn all-time counters into a misleading real-time Trending feed.
  const subscribedVideos = videos.filter((video) => {
    const creator = (video.uploader?.name || "").toLowerCase().replace(/^@/, "");
    return subscribedCreatorNames.has(creator);
  }).slice(0, 10);

  const shelves: ShelfConfig[] = [
    {
      key: "trending",
      title: "Trending",
      subtitle: "Available when verified recent activity is recorded",
      icon: TrendingCometIcon,
      tone: "orange",
      videos: trendingVideos,
      seeAllCategory: "trending",
      showRank: true,
    },
    {
      key: "subscriptions",
      title: "Subscriptions",
      subtitle: "Latest releases from creators you follow",
      icon: Tv,
      tone: "orange",
      videos: subscribedVideos,
      seeAllCategory: "all",
    },
    {
      key: "gov",
      title: "Gov",
      subtitle: "Verified government channels",
      icon: Landmark,
      tone: "emerald",
      videos: (catalog.categoryBuckets.get("Gov") || []).slice(0, 10),
      seeAllCategory: "Gov",
    },
    {
      key: "live",
      title: "Live Channels",
      subtitle: "On air right now",
      icon: Radio,
      tone: "red",
      videos: (catalog.categoryBuckets.get("Live Channels") || []).slice(0, 10),
      seeAllCategory: "Live Channels",
      pulse: true,
    },
    {
      key: "radio",
      title: "Radio",
      subtitle: "Always-on audio streams",
      icon: Headphones,
      tone: "pink",
      videos: (catalog.categoryBuckets.get("Radio") || []).slice(0, 10),
      seeAllCategory: "Radio",
    },
    {
      key: "dnews",
      title: "Digital Newspaper",
      subtitle: "Today's editions",
      icon: ScrollText,
      tone: "cyan",
      videos: (catalog.categoryBuckets.get("Digital Newspaper") || []).slice(0, 10),
      seeAllCategory: "Digital Newspaper",
    },
    {
      key: "music",
      title: "Music",
      subtitle: "Music and audio releases",
      icon: Music2,
      tone: "violet",
      videos: catalog.topLikedMusic,
      seeAllCategory: "Music",
      showLikes: true,
    },
    {
      key: "movies",
      title: "Movies",
      subtitle: "Public domain films",
      icon: Film,
      tone: "amber",
      videos: (catalog.categoryBuckets.get("Movies") || []).slice(0, 10),
      seeAllCategory: "Movies",
    },
    {
      key: "webseries",
      title: "Web Series",
      subtitle: "Binge-worthy seasons",
      icon: Tv,
      tone: "indigo",
      videos: (catalog.categoryBuckets.get("Web Series") || []).slice(0, 10),
      seeAllCategory: "Web Series",
    },
    {
      key: "anime",
      title: "Anime",
      subtitle: "Animated series & films",
      icon: AnimeBladeIcon,
      tone: "rose",
      videos: (catalog.categoryBuckets.get("Anime") || []).slice(0, 10),
      seeAllCategory: "Anime",
    },
    {
      key: "cartoons",
      title: "Cartoons",
      subtitle: "Animated stories and shows",
      icon: CartoonCatIcon,
      tone: "rose",
      videos: (catalog.categoryBuckets.get("Cartoons") || []).slice(0, 10),
      seeAllCategory: "Cartoons",
    },
    {
      key: "manga",
      title: "Manga",
      subtitle: "Panels & story arcs",
      icon: BookOpen,
      tone: "purple",
      videos: (catalog.categoryBuckets.get("Manga") || []).slice(0, 10),
      seeAllCategory: "Manga",
    },
    {
      key: "articles",
      title: "Articles",
      subtitle: "Long-form reads",
      icon: FileText,
      tone: "sky",
      videos: (catalog.categoryBuckets.get("Articles") || []).slice(0, 10),
      seeAllCategory: "Articles",
    },
    {
      key: "education",
      title: "Education",
      subtitle: "Learn something new",
      icon: GraduationCap,
      tone: "teal",
      videos: (catalog.categoryBuckets.get("Education") || []).slice(0, 10),
      seeAllCategory: "Education",
    },
    {
      key: "gaming",
      title: "Gaming",
      subtitle: "Playthroughs & live plays",
      icon: Gamepad2,
      tone: "purple",
      videos: (catalog.categoryBuckets.get("Gaming") || []).slice(0, 10),
      seeAllCategory: "Gaming",
    },
    {
      key: "health",
      title: "Health",
      subtitle: "Wellness & fitness",
      icon: HeartPulse,
      tone: "emerald",
      videos: (catalog.categoryBuckets.get("Health") || []).slice(0, 10),
      seeAllCategory: "Health",
    },
    {
      key: "sports",
      title: "Sports",
      subtitle: "Cricket, football, athletics & tournaments",
      icon: Trophy,
      tone: "amber",
      videos: (catalog.categoryBuckets.get("Sports") || []).slice(0, 10),
      seeAllCategory: "Sports",
    },
    {
      key: "others",
      title: "Others",
      subtitle: "Everything else",
      icon: Compass,
      tone: "slate",
      videos: (catalog.categoryBuckets.get("Others") || []).slice(0, 10),
      seeAllCategory: "Others",
    },
  ];
  const visibleShelves = shelves.filter((shelf) => shelf.videos.length > 0);

  // Actions
  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideoForPlay(video);
    try {
      apiClient.telemetry.playback({
        videoId: video.id,
        category: video.category,
        eventType: "play",
        positionSec: 0,
        videoDurationSec: video.durationSec,
        watchTimeSec: 15,
        completionRate: 5,
      });

    } catch {}
  };

  const handleClosePlayer = () => {
    setSelectedVideoForPlay(null);
  };

  const handleVideoPublished = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev.filter((v) => v.id !== newVideo.id)]);
    showToast(`Video "${newVideo.title}" published! ID: ${newVideo.id} (${newVideo.catalogCode || "Cataloged"})`);
  };

  const handleResetToHome = () => {
    setCurrentTab("feed");
    setSelectedExploreGroup(null);
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveNavLabel("Home");
    mainRef.current?.scrollTo({ top: 0 });
  };

  const openCategory = (category: string) => {
    setSelectedExploreGroup(null);
    setSelectedCategory(category);
    setCurrentTab("feed");
    setActiveNavLabel(category === "all" ? "Home" : category);
  };

  const openShop = (subTab: ShopSubTab = "store") => {
    setSelectedExploreGroup(null);
    setShopSubTab(subTab);
    setCurrentTab("shop");
    setActiveNavLabel(subTab === "orders" ? "My Orders" : "Openstore");
  };

  const openPolicy = (subTab: PolicySubTab) => {
    setPolicySubTab(subTab);
    setCurrentTab("policies");
    const map: Record<PolicySubTab, string> = {
      usage: "Usage",
      refund: "Refund",
      platform: "Platform",
      data: "Data",
      privacy: "Privacy",
    };
    setActiveNavLabel(map[subTab] ?? "Policies");
  };

  /** Used by the footer, where "Home" should also clear active filters */
  const navigateTo = (tab: string) => {
    setSelectedExploreGroup(null);
    if (tab === "feed") {
      setSelectedCategory("all");
      setSearchQuery("");
      setActiveNavLabel("Home");
    } else if (tab === "explore") {
      setSelectedCategory("all");
      setSearchQuery("");
      setActiveNavLabel("Explore");
    } else {
      const tabMap: Record<string, string> = {
        shop: "Openstore",
        subscriptions: "Subscriptions",
        favourites: "Favourites",
        history: "Watch History",
        channels: "Channels",
        manage: "Your Videos",
        collab: "Collab Requests",
        governance: "Copyright & Claims",
        ads: "Open Adcentre",
        legal: "Legal-First Spec",
        microservices: "Runtime Topology",
        profile: "Profile Details",
        policies: "Usage",
        settings: "Account",
      };
      if (tabMap[tab]) setActiveNavLabel(tabMap[tab]);
    }
    setCurrentTab(tab);
  };

  const openExploreGroup = (groupId: ExploreGroupId) => {
    setSelectedExploreGroup(groupId);
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveNavLabel("Explore");
    setCurrentTab("explore");
  };

  const isFilteredView = selectedCategory !== "all" || searchQuery.trim() !== "";

  return (
    <ProfileProvider>
    <div className="app-shell flex h-dvh min-h-screen text-[var(--oc-text-primary)] overflow-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#334155] text-white pl-4 pr-3 py-2.5 rounded-xl shadow-2xl shadow-slate-900/25 text-xs flex items-center gap-2.5 border border-[#334155] animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#4ADE80] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-1 p-0.5 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile drawer backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#334155]/50 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* Left Sidebar — static on desktop, slide-in drawer below lg */}
      <div
        className={`${
          isSidebarOpen
            ? "fixed inset-y-0 left-0 z-50 w-[min(100vw,650px)] shadow-2xl animate-in slide-in-from-left"
            : "hidden"
        } lg:relative lg:z-auto lg:block lg:w-auto lg:shadow-none shrink-0`}
      >
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedAgeProfile={selectedAgeProfile}
          setSelectedAgeProfile={setSelectedAgeProfile}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onOpenUpload={() => {
            setIsUploadOpen(false);
            setCurrentTab("studio");
            setStudioSubTab("upload");
          }}
          studioSubTab={studioSubTab}
          setStudioSubTab={setStudioSubTab}
          settingsSubTab={settingsSubTab}
          setSettingsSubTab={setSettingsSubTab}
          policySubTab={policySubTab}
          setPolicySubTab={setPolicySubTab}
          profileSubTab={profileSubTab}
          setProfileSubTab={setProfileSubTab}
          shopSubTab={shopSubTab}
          setShopSubTab={setShopSubTab}
          adCenterSubTab={adCenterSubTab}
          setAdCenterSubTab={setAdCenterSubTab}
          governanceSubTab={governanceSubTab}
          setGovernanceSubTab={setGovernanceSubTab}
          onNavigate={() => setIsSidebarOpen(false)}
          activeNavLabel={activeNavLabel}
          onSelectNavLabel={setActiveNavLabel}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header & Navigation Bar */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedAgeProfile={selectedAgeProfile}
          setSelectedAgeProfile={setSelectedAgeProfile}
          onOpenUpload={() => { setCurrentTab("studio"); setStudioSubTab("upload"); }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          activeNavLabel={activeNavLabel}
          onResetToHome={handleResetToHome}
          showBreadcrumb={currentTab === "explore"}
        />

        {/* Scrollable View Container */}
        <main
          ref={mainRef}
          className="grid flex-1 grid-cols-1 grid-rows-[1fr_auto] overflow-y-auto"
        >
          <div key={currentTab} className="content-column oc-page-content animate-in fade-in pb-2 pt-4 sm:pb-3 sm:pt-5">
            {/* TAB 1: Public Stream Catalog (Feed) */}
            {currentTab === "feed" && (
              <div className="space-y-7">
                {/*
                 * Home is an ecosystem entry point, not a video-service error
                 * boundary. Keep catalogue loading/error states scoped to
                 * filtered views; the unfiltered Home composition can render
                 * independently while video shelves load in the background.
                 */}
                {isLoadingVideos && isFilteredView && (
                  <div className="space-y-4 pt-1">
                    <VideoCardSkeletonGrid count={8} />
                  </div>
                )}

                {/* State 2: Request Failure with Functional Retry Action */}
                {!isLoadingVideos && videoFetchError && selectedCategory !== "trending" && (
                  !isFilteredView ? (
                    <div className="space-y-4">
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--oc-border)] bg-[var(--oc-surface-subtle)] px-4 py-3 text-sm"
                        role="alert"
                      >
                        <p className="text-[var(--oc-text-secondary)]">
                          The video catalogue is temporarily unavailable. You can still explore OpenContent while we reconnect.
                        </p>
                        <button
                          type="button"
                          onClick={fetchVideos}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--oc-action)] px-3 py-1.5 text-xs font-semibold text-[var(--oc-action)] transition-colors hover:bg-[var(--oc-action)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
                        >
                          <Refresh className="h-3.5 w-3.5" aria-hidden="true" />
                          Try again
                        </button>
                      </div>
                      <HomeEmptyState
                        onExplore={() => navigateTo("explore")}
                        onOpenGroup={openExploreGroup}
                      />
                    </div>
                  ) : (
                    <EmptyState
                      title="Unable to load videos"
                      description="We couldn't connect to the video service. Please check your connection and try again."
                      isError={true}
                      actionText="Try again"
                      onAction={fetchVideos}
                    />
                  )
                )}

                {/* State 3: Zero Content on Platform (Designed First-Visit State) */}
                {/* State 4: Content Available (Real Videos in Genre Shelves) */}
                {!isFilteredView && !videoFetchError && visibleShelves.length > 0 && (
                  <div className="pt-1">
                    {visibleShelves.map((shelf) => (
                      <Shelf
                        key={shelf.key}
                        title={shelf.title}
                        subtitle={shelf.subtitle}
                        icon={shelf.icon}
                        tone={shelf.tone}
                        videos={shelf.videos}
                        category={shelf.seeAllCategory}
                        onPlay={handlePlayVideo}
                        onOpenUpload={(cat) => {
                          setUploadCategory(cat);
                          setCurrentTab("studio");
                          setStudioSubTab("upload");
                        }}
                        showRank={shelf.showRank}
                        showLikes={shelf.showLikes}
                        pulse={shelf.pulse}
                        onSeeAll={() => openCategory(shelf.seeAllCategory)}
                      />
                    ))}
                  </div>
                )}

                {/*
                 * A missing or unavailable catalogue must not replace the
                 * Home experience. The welcome composition remains useful for
                 * first visits and during temporary video-service outages.
                 */}
                {!isFilteredView && !videoFetchError && visibleShelves.length === 0 && (
                  <HomeEmptyState
                    onExplore={() => navigateTo("explore")}
                    onOpenGroup={openExploreGroup}
                  />
                )}

                {/* State 5: Filtered View (Trending, Category, or Search Results) */}
                {!isLoadingVideos && selectedCategory === "trending" && !searchQuery.trim() && (
                  <TrendingView
                    videos={trendingVideos}
                    isLoading={isTrendingLoading}
                    error={trendingFetchError}
                    onRetry={fetchTrendingVideos}
                    onExplore={() => navigateTo("explore")}
                    onBackToHome={handleResetToHome}
                    onPlay={handlePlayVideo}
                  />
                )}

                {!isLoadingVideos && !videoFetchError && isFilteredView && selectedCategory !== "trending" && (
                  <div className="space-y-5 pt-1">
                    {searchQuery.trim() ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <Search className="h-6 w-6 shrink-0 text-[var(--oc-brand)]" aria-hidden="true" />
                        <h1 className="text-xl font-semibold tracking-[-0.025em] text-[var(--oc-text-primary)] sm:text-2xl">
                          Results for &quot;{searchQuery.trim()}&quot;
                        </h1>
                        {useSemanticSearch && (
                          <span className="flex items-center gap-1 rounded-full border border-[var(--oc-border)] bg-[var(--oc-surface-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--oc-action)]">
                            <Sparkles className="h-3 w-3 text-[var(--oc-action)]" />
                            AI Semantic Search
                          </span>
                        )}
                        {isSemanticLoading && (
                          <span className="animate-pulse rounded-full border border-[var(--oc-border)] bg-[var(--oc-surface-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--oc-action)]">
                            Searching...
                          </span>
                        )}
                      </div>
                    ) : (
                      <HorizontalPageHeader
                        icon={selectedCategory === "Live Channels" ? Radio : Film}
                        title={selectedCategory === "Live Channels" ? "Live channels" : selectedCategory}
                        description={selectedCategory === "Live Channels"
                          ? "Explore live broadcasts and channels."
                          : `Browse published ${selectedCategory.toLowerCase()} content from the OpenContent catalogue.`}
                      />
                    )}

                    {searchQuery.trim() && displaySearchVideos.length > 0 && (
                      <p className="text-[11px] text-[var(--oc-text-secondary)]">
                        {displaySearchVideos.length}{" "}
                        {displaySearchVideos.length === 1 ? "result" : "results"}
                        {selectedCategory !== "all" ? ` in ${selectedCategory}` : ""}
                      </p>
                    )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {searchQuery.trim() && (
                          <div className="inline-flex items-center rounded-full border border-[var(--oc-border)] bg-[var(--oc-surface-subtle)] p-0.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setUseSemanticSearch(true)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                useSemanticSearch
                                  ? "bg-[var(--oc-action)] text-white shadow-xs"
                                  : "text-[var(--oc-text-secondary)] hover:text-[var(--oc-text-primary)]"
                              }`}
                            >
                              ✨ AI Semantic
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseSemanticSearch(false)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                !useSemanticSearch
                                  ? "bg-[var(--oc-text-primary)] text-white shadow-xs"
                                  : "text-[var(--oc-text-secondary)] hover:text-[var(--oc-text-primary)]"
                              }`}
                            >
                              Exact Words
                            </button>
                          </div>
                        )}

                        {searchQuery.trim() && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--oc-border)] bg-[var(--oc-background)] px-2.5 py-1 text-[11px] font-semibold text-[var(--oc-text-secondary)] transition-colors hover:border-[var(--oc-border-strong)] hover:text-[var(--oc-text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
                          >
                            <X className="w-3 h-3" />
                            Clear search
                          </button>
                        )}
                        {displaySearchVideos.length > 0 && (
                          <button
                            onClick={handleResetToHome}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--oc-action)]/30 bg-[var(--oc-surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--oc-action)] transition-colors hover:border-[var(--oc-action)] hover:bg-[var(--oc-background)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Back to Home
                          </button>
                        )}
                      </div>

                    {/* Pending Semantic Search Skeleton */}
                    {searchQuery.trim() && isSemanticLoading ? (
                      <SearchResultsSkeleton count={4} />
                    ) : displaySearchVideos.length === 0 ? (
                      searchQuery.trim() ? (
                        <EmptyState
                          icon={Search}
                          title="No videos match this search"
                          description="No videos match this search. Try different keywords."
                          actionText="Clear search"
                          onAction={() => setSearchQuery("")}
                          secondaryActionText="Back to Home"
                          onSecondaryAction={handleResetToHome}
                        />
                      ) : selectedCategory === "Live Channels" ? (
                        <EmptyState
                          icon={Radio}
                          title="No live channels yet"
                          description="Live broadcasts from public channels will appear here when creators go on air."
                          actionText="Back to Home"
                          onAction={handleResetToHome}
                        />
                      ) : (
                        <EmptyState
                          icon={Film}
                          title={`No ${selectedCategory} yet`}
                          description={`Published ${selectedCategory.toLowerCase()} content will appear here when it is available.`}
                          actionText="Back to Home"
                          onAction={handleResetToHome}
                        />
                      )
                    ) : (
                      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displaySearchVideos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            onPlay={handlePlayVideo}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Explore directory */}
            {currentTab === "explore" && (
              <ExploreView
                onOpenCategory={openCategory}
                onNavigate={navigateTo}
                onOpenShop={(subTab) => openShop(subTab)}
                onOpenUpload={() => {
                  setCurrentTab("studio");
                  setStudioSubTab("upload");
                  setActiveNavLabel("Upload");
                }}
                selectedGroupId={selectedExploreGroup}
                onSelectGroup={setSelectedExploreGroup}
                onClearGroup={() => setSelectedExploreGroup(null)}
              />
            )}

            {/* TAB: Creator Channels */}
            {currentTab === "channels" && (
              <ChannelsView
                onOpenUpload={() => { setCurrentTab("studio"); setStudioSubTab("upload"); }}
                onNavigateToVideos={() => {
                  setStudioSubTab("content");
                  setCurrentTab("studio");
                }}
              />
            )}

            {/* TAB: Opencontent Studio */}
            {(currentTab === "studio" || currentTab === "manage") && (
              <ComponentErrorBoundary fallbackTitle="Opencontent Studio encountered an issue">
                <OpencontentStudioView
                  videos={videos}
                  initialSubTab={currentTab === "manage" ? "content" : studioSubTab}
                  onOpenUpload={() => { setCurrentTab("studio"); setStudioSubTab("upload"); }}
                  onPlayVideo={handlePlayVideo}
                  onNavigateToChannels={() => setCurrentTab("channels")}
                  onNavigateToEarn={() => setCurrentTab("ads")}
                  onNavigateToCollab={() => setCurrentTab("collab")}
                  onNavigateToClaims={() => setCurrentTab("governance")}
                />
              </ComponentErrorBoundary>
            )}

            {/* TAB 3: Ad Monetization & CPM Panel */}
            {currentTab === "ads" && (
              <ComponentErrorBoundary fallbackTitle="Ad Monetization panel encountered an issue">
                <AdMonetizationPanel />
              </ComponentErrorBoundary>
            )}

            {/* TAB 4: Legal-first technical specification */}
            {currentTab === "legal" && (
              <ComponentErrorBoundary fallbackTitle="Legal Spec view encountered an issue">
                <LegalFirstSpecView />
              </ComponentErrorBoundary>
            )}

            {/* TAB 5: Runtime microservice topology */}
            {currentTab === "microservices" && (
              <ComponentErrorBoundary fallbackTitle="Architecture view encountered an issue">
                <MicroserviceArchitectureView />
              </ComponentErrorBoundary>
            )}

            {/* TAB 6: Creator Rights, Copyright, Takedowns & Public Complaints */}
            {currentTab === "governance" && (
              <ComponentErrorBoundary fallbackTitle="Rights & Claims panel encountered an issue">
                <CreatorRightsPanel />
              </ComponentErrorBoundary>
            )}

            {/* TAB 7: Subscriptions */}
            {currentTab === "subscriptions" && (
              <ComponentErrorBoundary fallbackTitle="Subscriptions view encountered an issue">
                <SubscriptionsView
                  videos={videos}
                  onPlayVideo={handlePlayVideo}
                  onExplore={() => navigateTo("explore")}
                />
              </ComponentErrorBoundary>
            )}

            {/* TAB 8: Watch History */}
            {currentTab === "history" && (
              <ComponentErrorBoundary fallbackTitle="History view encountered an issue">
                <WatchHistoryView
                  videos={videos}
                  onPlayVideo={handlePlayVideo}
                  onExplore={() => navigateTo("explore")}
                />
              </ComponentErrorBoundary>
            )}

            {/* TAB 9: Creator Collab Network */}
            {currentTab === "collab" && (
              <ComponentErrorBoundary fallbackTitle="Collab network view encountered an issue">
                <CreatorCollabView videos={videos} />
              </ComponentErrorBoundary>
            )}

            {/* TAB 10: Favourites */}
            {currentTab === "favourites" && (
              <ComponentErrorBoundary fallbackTitle="Favourites view encountered an issue">
                <FavouritesView
                  videos={videos}
                  onPlayVideo={handlePlayVideo}
                  onExplore={() => navigateTo("explore")}
                />
              </ComponentErrorBoundary>
            )}

            {/* TAB 11: Shop (Merch, Downloads, Courses & Orders) */}
            {currentTab === "shop" && (
              <ComponentErrorBoundary fallbackTitle="Openstore encountered an issue">
                <ShopView
                  activeTab={shopSubTab}
                  onTabChange={setShopSubTab}
                  onToast={showToast}
                />
              </ComponentErrorBoundary>
            )}

            {/* TAB 12: Profile details, session, identity and data storage */}
            {currentTab === "profile" && (
              <ComponentErrorBoundary fallbackTitle="Profile view encountered an issue">
                <PrivacyProfileView
                  activeTab={profileSubTab}
                  onSelectTab={setProfileSubTab}
                />
              </ComponentErrorBoundary>
            )}

            {/* TAB 13: Policies (Usage, Refund, Platform, Data, Privacy) */}
            {currentTab === "policies" && (
              <ComponentErrorBoundary fallbackTitle="Policies view encountered an issue">
                <PoliciesView key={policySubTab} initialSubTab={policySubTab} />
              </ComponentErrorBoundary>
            )}

            {/* TAB 14: Settings (Creator, Account, Security, Ads) */}
            {currentTab === "settings" && (
              <ComponentErrorBoundary fallbackTitle="Settings view encountered an issue">
                <SettingsView key={settingsSubTab} initialSubTab={settingsSubTab} />
              </ComponentErrorBoundary>
            )}
          </div>

          <SiteFooter
            compact={!(["policies", "legal", "microservices"] as string[]).includes(currentTab)}
            onNavigate={navigateTo}
            onOpenCategory={openCategory}
            onOpenPolicy={openPolicy}
            onOpenShop={() => openShop("store")}
            onOpenUpload={() => { setCurrentTab("studio"); setStudioSubTab("upload"); }}
            onBackToTop={() =>
              mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })
            }
          />
        </main>
      </div>

      {/* Video Streaming & Ad Injection Modal */}
      {selectedVideoForPlay && (
        <VideoPlayerModal
          video={selectedVideoForPlay}
          onClose={handleClosePlayer}
          onSelectVideo={(v) => setSelectedVideoForPlay(v)}
          allVideos={videos}
        />
      )}

      {/* Video Upload & Age Classification Modal */}
      <VideoUploadModal
        isOpen={isUploadOpen || (currentTab === "studio" && studioSubTab === "upload")}
        fullPage={currentTab === "studio" && studioSubTab === "upload"}
        onClose={() => {
          setIsUploadOpen(false);
          if (currentTab === "studio" && studioSubTab === "upload") setStudioSubTab("dashboard");
        }}
        onVideoPublished={handleVideoPublished}
        defaultCategory={uploadCategory}
      />
    </div>
    </ProfileProvider>
  );
}
