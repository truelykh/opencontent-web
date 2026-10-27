"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadRounded as Upload,
  SearchRounded as Search,
  PersonRounded as User,
  LoginRounded as LogIn,
  LogoutRounded as LogOut,
  CloseRounded as X,
  TrendingUpRounded as TrendingUp,
  LayersRounded as Layers,
  SettingsRounded as Settings,
  NotificationsNoneRounded as Bell,
  AccessTimeRounded as Clock,
  ChevronRightRounded as ChevronRight,
  MenuRounded as Menu,
  FingerprintRounded as Fingerprint,
  AccountCircleRounded as UserRound,
} from "@mui/icons-material";
import { AgeProfile } from "@/types";
import { useProfile } from "../auth/ProfileProvider";
import { BrandMark } from "./BrandLogo";
import { ContentImage } from "../common/ContentImage";
import {
  formatSessionTimer,
  PROFILE_MENU_NAVIGATION,
  profileSessionStatus,
  sessionSecondsRemaining,
} from "@/lib/profileMenu";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedAgeProfile: AgeProfile;
  setSelectedAgeProfile: (profile: AgeProfile) => void;
  onOpenUpload: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSidebar: () => void;
  activeNavLabel?: string;
  onResetToHome?: () => void;
  showBreadcrumb?: boolean;
}

const TAB_LABELS: Record<string, string> = {
  feed: "Home",
  explore: "Explore",
  studio: "Opencontent Studio",
  shop: "Openstore",
  channels: "Channels",
  manage: "Opencontent Studio",
  ads: "Open Adcentre",
  governance: "Rights & Claims",
  subscriptions: "Subscriptions",
  history: "Watch History",
  collab: "Collab Network",
  favourites: "Favourites",
  profile: "Profile",
  policies: "Policies",
  legal: "Legal-First Spec",
  microservices: "Runtime Topology",
  settings: "Settings",
};

export default function Header({
  currentTab,
  setCurrentTab,
  onOpenUpload,
  searchQuery,
  setSearchQuery,
  onOpenSidebar,
  activeNavLabel,
  onResetToHome,
  showBreadcrumb = true,
}: HeaderProps) {
  // UI States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { account, profile, session, signedIn, logout, refresh, openAuthModal } = useProfile();
  const [now, setNow] = useState(() => Date.now());
  const [isEndingSession, setIsEndingSession] = useState(false);
  const displayName = profile?.displayName?.trim() || null;
  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    null;
  const shownName = displayName ?? fullName;
  const avatarUrl = profile?.avatarUrl ?? null;
  const initials = shownName
    ? shownName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : null;
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const refreshedExpiredSession = useRef<string | null>(null);

  useEffect(() => {
    if (!signedIn || !session?.expiresAt) return;
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (
        timestamp >= new Date(session.expiresAt).getTime() &&
        refreshedExpiredSession.current !== session.expiresAt
      ) {
        refreshedExpiredSession.current = session.expiresAt;
        void refresh();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [refresh, session?.expiresAt, signedIn]);

  useEffect(() => {
    if (!signedIn) return;
    const revalidate = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [refresh, signedIn]);

  useEffect(() => {
    if (!isProfileOpen) return;
    const firstMenuItem = profileMenuRef.current?.querySelector<HTMLButtonElement>(
      "button:not([disabled])"
    );
    firstMenuItem?.focus();
  }, [isProfileOpen]);

  const handleEndSession = async () => {
    setIsEndingSession(true);
    const result = await logout();
    setIsEndingSession(false);
    if (result.ok) {
      setIsProfileOpen(false);
      profileButtonRef.current?.focus();
    }
  };

  const sessionSecondsLeft = sessionSecondsRemaining(session?.expiresAt, now);
  const sessionTimerLabel = formatSessionTimer(sessionSecondsLeft);
  const sessionStatus = profileSessionStatus(signedIn, session?.expiresAt, now);

  // Notifications State & Dropdown
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      message: string;
      time: string;
      unread: boolean;
    }[]
  >([]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K focuses search, Escape clears it
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (
        event.key === "Escape" &&
        document.activeElement === searchInputRef.current
      ) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setSearchQuery]);

  return (
    <>
      <header className="h-16 bg-[color-mix(in_srgb,var(--oc-background)_95%,transparent)] backdrop-blur-xl border-b border-[var(--oc-border)] px-4 lg:px-8 flex items-center justify-between gap-3 sm:gap-5 shrink-0 sticky top-0 z-30">
        {/* Mobile: opens the navigation drawer */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden -ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-[var(--oc-text-secondary)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)] transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden shrink-0" aria-label="Opencontent">
          <BrandMark size={22} title="Opencontent" />
        </div>

        {/* Left: current view breadcrumb (desktop only; Home already has primary navigation) */}
        {currentTab !== "feed" && showBreadcrumb ? (
          <div className="hidden lg:flex items-center gap-2 min-w-0 max-w-[360px] shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onResetToHome) {
                  onResetToHome();
                } else {
                  setCurrentTab("feed");
                }
              }}
              title="Go to Home"
              className="text-[15px] font-medium tracking-[-0.02em] text-[var(--oc-text-primary)] hover:text-[var(--oc-action)] transition-colors cursor-pointer shrink-0"
            >
              Opencontent
            </button>
            <ChevronRight className="w-4 h-4 text-[var(--oc-text-secondary)] shrink-0" />
            <span className="text-[15px] font-normal text-[var(--oc-text-secondary)] truncate">
              {activeNavLabel || TAB_LABELS[currentTab] || "Home"}
            </span>
          </div>
        ) : (
          <div className="hidden lg:block w-0 shrink-0" aria-hidden="true" />
        )}

        {/* Top Center: Search Bar */}
        <div className="flex-1 min-w-0 max-w-xl mx-auto">
          <div className="group relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 w-4 h-4 text-[var(--oc-text-secondary)] transition-colors group-focus-within:text-[var(--oc-brand)]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, topics, and channels..."
              aria-label="Search videos"
              className="input input-sm input-bordered h-10 w-full rounded-lg border-[var(--oc-border)] bg-[var(--oc-surface-subtle)] pl-10 pr-24 text-[13px] text-[var(--oc-text-primary)] placeholder-[var(--oc-text-secondary)] focus:border-[var(--oc-border-strong)] focus:bg-white"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-[54px] w-5 h-5 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#334155] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="kbd kbd-xs pointer-events-none absolute right-[54px] hidden sm:inline-flex text-[#64748B]">
                ⌘K
              </kbd>
            )}

            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              title="Search"
              aria-label="Search"
              className="header-search-action absolute right-0.5 flex h-10 w-10 min-h-10 items-center justify-center rounded-full p-0 text-white shadow-sm cursor-pointer btn btn-primary btn-sm"
            >
              <Search className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right Tools: Upload, Notifications, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* 1. Upload Button */}
          <button
            onClick={onOpenUpload}
            className="btn-saffron h-10 min-h-10 max-[360px]:hidden rounded-full px-4 text-xs shadow-xs"
            title="Upload Video"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* 2. Notifications Icon */}
          <div className="relative hidden sm:block" ref={notificationsRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label={`Notifications (${unreadCount} unread)`}
              aria-expanded={isNotificationsOpen}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border bg-white p-0 transition-colors cursor-pointer ${
                isNotificationsOpen
                  ? "border-[#CBD5E1] text-[#FF9933]"
                  : "border-[#E2E8F0] text-[#64748B] hover:text-[#FF9933] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="badge badge-primary badge-xs absolute -top-0.5 -right-0.5 min-w-4 h-4 p-0 font-bold text-[9px] shadow-xs tabular-nums text-white border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl shadow-slate-900/10 py-2 z-50 text-xs text-[#334155] animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="font-bold text-sm text-[#334155] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="badge badge-sm badge-warning text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-bold text-[#FF9933] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto saffron-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-semibold text-slate-700">No new notifications</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">We&apos;ll alert you about uploads and creator updates here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F1F5F9]">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === item.id ? { ...n, unread: false } : n
                              )
                            );
                          }}
                          className={`p-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                            item.unread ? "bg-orange-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-[11px] text-[#334155] leading-tight flex items-center gap-1.5">
                              {item.unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] shrink-0" />
                              )}
                              {item.title}
                            </span>
                            <span className="text-[9px] text-[#94A3B8] shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#64748B] mt-1 leading-snug">
                            {item.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="hidden sm:block h-6 w-px bg-[#E2E8F0]" />

          {/* 3. Profile Icon */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              ref={profileButtonRef}
              onClick={() => {
                if (signedIn) {
                  setIsProfileOpen(!isProfileOpen);
                } else {
                  openAuthModal();
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:ring-2 hover:ring-[#FF9933]/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9933] cursor-pointer"
              title="Profile"
              aria-label="Profile menu"
              aria-expanded={isProfileOpen}
            >
              <div className="relative">
                {signedIn ? (
                  <div
                    className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-[#FF9933] bg-[#334155]"
                    title={shownName ?? "Profile"}
                  >
                    {avatarUrl ? (
                      <ContentImage
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : initials ? (
                      <span className="flex h-full w-full items-center justify-center text-[10px] font-black text-white">
                        {initials}
                      </span>
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-white">
                        <Fingerprint className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
                {signedIn && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      sessionStatus === "active"
                        ? "bg-[#16A34A]"
                        : sessionStatus === "expired"
                          ? "bg-[#DC2626]"
                          : "bg-[#94A3B8]"
                    }`}
                    aria-label={`Session ${sessionStatus}`}
                  />
                )}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                ref={profileMenuRef}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setIsProfileOpen(false);
                    profileButtonRef.current?.focus();
                  }
                }}
                className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl shadow-slate-900/10 z-50 text-xs text-[#334155] animate-in fade-in slide-in-from-top-2"
              >
                {!signedIn ? (
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        openAuthModal();
                      }}
                      className="w-full rounded-lg bg-[var(--oc-action)] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--oc-action-hover)]"
                    >
                      Sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-[#E2E8F0] bg-[#FFF8F0] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#FF9933] bg-[#334155]">
                          {avatarUrl ? (
                            <ContentImage src={avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : initials ? (
                            <span className="text-xs font-black text-white">{initials}</span>
                          ) : (
                            <Fingerprint className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-sm text-[#334155]">
                            {shownName ?? "Your profile"}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] font-semibold tracking-wide text-[#64748B]">
                            {account?.publicId ?? "User ID unavailable"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-[#FED7AA] bg-white/80 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-[#FF9933]" />
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">Session</div>
                            <div className="truncate text-[11px] font-semibold text-[#475569]">{sessionTimerLabel}</div>
                          </div>
                        </div>
                        <span
                          className={`ml-2 h-2 w-2 shrink-0 rounded-full ${
                            sessionStatus === "active"
                              ? "bg-[#16A34A]"
                              : sessionStatus === "expired"
                                ? "bg-[#DC2626]"
                                : "bg-[#94A3B8]"
                          }`}
                          aria-label={`Session ${sessionStatus}`}
                        />
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentTab(PROFILE_MENU_NAVIGATION.feed);
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                      >
                        <Layers className="w-4 h-4 text-[#FF9933]" />
                        <span>Watch Feed</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab(PROFILE_MENU_NAVIGATION.videos);
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                      >
                        <Upload className="w-4 h-4 text-[#2563EB]" />
                        <span>Your Videos</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab(PROFILE_MENU_NAVIGATION.ads);
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                      >
                        <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                        <span>Ad Monetization</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab(PROFILE_MENU_NAVIGATION.profile);
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                      >
                        <UserRound className="w-4 h-4 text-[#FF9933]" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentTab(PROFILE_MENU_NAVIGATION.settings);
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-[#E2E8F0] px-3 py-2">
                      <button
                        onClick={() => {
                          void handleEndSession();
                        }}
                        disabled={isEndingSession}
                        className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-bold text-[#DC2626] transition-colors hover:bg-[#FEE2E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9933] disabled:cursor-wait disabled:opacity-60"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isEndingSession ? "Ending session…" : "End session"}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 4. Logout Icon */}
          {signedIn ? (
            <button
              onClick={() => {
                void handleEndSession();
              }}
              disabled={isEndingSession}
              title="End session"
              aria-label="End session"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white p-0 text-[#64748B] hover:text-[#DC2626] hover:border-[#FCA5A5] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal()}
              title="Sign in"
              aria-label="Sign in"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white p-0 text-[#475569] hover:text-[#FF9933] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
