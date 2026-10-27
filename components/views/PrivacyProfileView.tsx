"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ShowChartRounded as Activity,
  WarningAmberRounded as AlertTriangle,
  CameraAltRounded as Camera,
  CheckRounded as Check,
  CheckCircleRounded as CheckCircle2,
  ContentCopyRounded as Copy,
  CloudUploadRounded as Upload,
  SaveRounded as Save,
  FileDownloadRounded as Download,
  FingerprintRounded as Fingerprint,
  PublicRounded as Globe,
  AccessTimeRounded as Clock,
  LockRounded as Lock,
  LoginRounded as LogIn,
  LogoutRounded as LogOut,
  LocationOnRounded as MapPin,
  DevicesRounded as MonitorSmartphone,
  AutorenewRounded as RefreshCw,
  VerifiedUserRounded as ShieldCheck,
  DeleteOutlineRounded as Trash2,
  PersonRounded as UserRound,
  CancelRounded as XCircle,
} from "@mui/icons-material";
import { useProfile } from "../auth/ProfileProvider";
import {
  collectSessionProfile,
  DeviceClass,
  SessionProfile,
} from "@/lib/sessionProfile";
import {
  formatSessionTimer,
  profileSessionStatus,
  sessionSecondsRemaining,
} from "@/lib/profileMenu";
import { PROFILE_GUEST_STATES, PROFILE_SECTION_LABELS, profileNavigationSections, visibleProfileSection } from "@/lib/profileSections";
import { Database } from "@/components/icons/Database";
import { ProfileSubTab } from "@/types";
import HorizontalPageHeader from "../common/HorizontalPageHeader";

interface PrivacyProfileViewProps {
  activeTab: ProfileSubTab;
  onSelectTab?: (tab: ProfileSubTab) => void;
}

const PROFILE_SECTION_ICONS = {
  profile: UserRound,
  session: MonitorSmartphone,
  identity: Fingerprint,
  data: Database,
} as const;

function SignInPrompt({
  icon: Icon,
  heading,
  description,
  descriptionClassName,
  onSignIn,
}: {
  icon: React.ComponentType<{ className?: string }>;
  heading: string;
  description: string;
  descriptionClassName?: string;
  onSignIn: () => void;
}) {
  return (
    <div className="py-3 text-left">
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 shrink-0 text-[var(--oc-action)]" />
        <h2 className="text-sm font-bold text-[var(--oc-text-primary)]">{heading}</h2>
      </div>
      <p className={`mt-1 text-xs leading-relaxed text-[var(--oc-text-secondary)] ${descriptionClassName ?? ""}`}>{description}</p>
      <button
        type="button"
        onClick={onSignIn}
        className="btn-saffron mt-4 min-h-10 px-4 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-brand)]"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </button>
    </div>
  );
}

function AccountSectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--oc-border)] pb-4 text-left">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--oc-action)]" />
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--oc-text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--oc-text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}

const DEVICE_LABEL: Record<DeviceClass, string> = {
  mobile: "Mobile",
  tablet: "Tablet",
  laptop: "Laptop",
  desktop: "Desktop",
};

const VERDICT_META = {
  likely_human: {
    label: "Likely human",
    description:
      "No automation signals found in this browser. Server-side checks still apply.",
    className: "border-green-200 bg-green-50 text-green-700",
    ring: "#16A34A",
  },
  needs_verification: {
    label: "Needs verification",
    description:
      "A few signals are unusual. A server-side challenge may be required.",
    className: "border-[#FED7AA] bg-[#FFF7ED] text-[#FF9933]",
    ring: "#FF9933",
  },
  likely_automated: {
    label: "Automation detected",
    description:
      "Browser signals match automated tooling. Do not trust client-only data.",
    className: "border-red-200 bg-red-50 text-red-700",
    ring: "#DC2626",
  },
} as const;

export default function PrivacyProfileView({
  activeTab,
  onSelectTab,
}: PrivacyProfileViewProps) {
  const { authState } = useProfile();
  const visibleTab = visibleProfileSection(authState, activeTab);

  return (
    <div className="space-y-5">
      <HorizontalPageHeader
        icon={UserRound}
        title="Profile"
        description="Manage your account, identity, sessions, and privacy."
      />
      <nav aria-label="Profile sections" className="flex flex-wrap gap-1.5">
          {profileNavigationSections(authState).map((section) => {
            const Icon = PROFILE_SECTION_ICONS[section];
            const active = visibleTab === section;
            return (
              <button
                key={section}
                type="button"
                onClick={() => onSelectTab?.(section)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2 ${
                  active
                    ? "bg-[var(--oc-surface-subtle)] text-[var(--oc-brand)]"
                    : "text-[var(--oc-text-secondary)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {PROFILE_SECTION_LABELS[section]}
              </button>
            );
          })}
      </nav>

      <section
        aria-label="Profile section content"
        className="min-w-0"
      >
        {visibleTab === "profile" && <ProfileTab />}
        {visibleTab === "session" && <SessionTab />}
        {visibleTab === "identity" && <IdentityTab />}
        {visibleTab === "data" && <DataTab />}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */

function ProfileTab() {
  const { account, profile, signedIn, loading, error, refresh, openAuthModal } = useProfile();

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading profile">
        <div className="h-5 w-40 animate-pulse bg-[var(--oc-surface-subtle)]" />
        <div className="h-24 w-full animate-pulse bg-[var(--oc-surface-subtle)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-left">
        <AlertTriangle className="mb-2 h-6 w-6 text-[var(--oc-error)]" />
        <p className="text-xs font-semibold text-[var(--oc-text-primary)]">{error}</p>
        <button
          onClick={() => refresh()}
          className="btn-saffron mt-3 px-3 py-1.5 text-[10.5px]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (!signedIn || !account || !profile) {
    return (
      <SignInPrompt
        icon={UserRound}
        {...PROFILE_GUEST_STATES.profile}
        onSignIn={openAuthModal}
      />
    );
  }

  return <ProfileEditor key={`${profile.accountId}:${profile.updatedAt}`} profile={profile} />;
}

function ProfileEditor({
  profile,
}: {
  profile: NonNullable<ReturnType<typeof useProfile>["profile"]>;
}) {
  const { account, uploadAvatar, removeAvatar, saveProfile } = useProfile();
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{
    kind: "ok" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    const result = await saveProfile({ firstName, lastName, displayName });
    setSaving(false);
    setStatus(
      result.ok
        ? { kind: "ok", message: "Profile saved." }
        : { kind: "error", message: result.message ?? "Could not save." }
    );
    if (result.ok) {
      setFirstName((value) => value.trim());
      setLastName((value) => value.trim());
      setDisplayName((value) => value.trim());
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setStatus({ kind: "error", message: "Use a PNG, JPEG or WebP image." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ kind: "error", message: "Image must be 2 MB or smaller." });
      return;
    }
    setUploading(true);
    setStatus(null);
    const result = await uploadAvatar(file);
    setUploading(false);
    setStatus(
      result.ok
        ? { kind: "ok", message: "Display picture updated." }
        : { kind: "error", message: result.message ?? "Upload failed." }
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    const result = await removeAvatar();
    setUploading(false);
    setStatus(
      result.ok
        ? { kind: "ok", message: "Display picture removed." }
        : { kind: "error", message: result.message ?? "Could not remove." }
    );
  };

  return (
    <div className="space-y-6">
      <AccountSectionHeading
        icon={UserRound}
        title="Profile details"
        description="Update the public information shown on your profile and published content."
      />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Avatar */}
      <div className="border-b border-[var(--oc-border)] pb-5">
        <div className="flex flex-col items-start text-left">
          <div className="relative h-28 w-28">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-[var(--oc-border)] bg-[var(--oc-surface-subtle)]">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt="Profile picture"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[var(--oc-border-strong)]">
                  <UserRound className="h-10 w-10" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload display picture"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--oc-action)] text-white shadow-sm transition-colors hover:bg-[var(--oc-action-hover)]"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 text-[12px] font-bold text-[var(--oc-text-primary)]">
            Display picture
          </div>
          <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--oc-text-secondary)]">
            PNG, JPEG or WebP · up to 2 MB
          </p>

          <div className="mt-3 flex flex-wrap justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-saffron px-3 py-1.5 text-[10.5px] disabled:opacity-60"
            >
              <Upload className="h-3 w-3" />
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            {profile.avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--oc-border)] px-3 py-1.5 text-[10.5px] font-bold text-[var(--oc-text-secondary)] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[var(--oc-error)]"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>

        {account && (
          <div className="mt-5 border-t border-[var(--oc-surface-subtle)] pt-3 text-left">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--oc-text-secondary)]">
              User ID
            </div>
            <div className="mt-0.5 font-mono text-[12px] font-bold tracking-[0.14em] text-[var(--oc-text-primary)]">
              {account.publicId}
            </div>
          </div>
        )}
      </div>

      {/* Details form */}
      <form
        onSubmit={handleSave}
        className="border-b border-[var(--oc-border)] pb-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-[13px] font-bold text-[var(--oc-text-primary)]">
              Public details
            </h2>
            <p className="mt-0.5 text-[10.5px] text-[var(--oc-text-secondary)]">
              The display name appears in your profile menu and on content you publish.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
              <span className="mb-1 block text-[10.5px] font-bold text-[var(--oc-text-primary)]">
              First name
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              maxLength={60}
              autoComplete="given-name"
              placeholder="Enter first name"
              className="w-full rounded-lg border border-[var(--oc-border)] px-3 py-2 text-[12px] text-[var(--oc-text-primary)] outline-none transition-all placeholder:text-[var(--oc-border-strong)] focus:border-[var(--oc-action)] focus:ring-2 focus:ring-[var(--oc-action)]/10"
            />
          </label>

          <label className="block">
              <span className="mb-1 block text-[10.5px] font-bold text-[var(--oc-text-primary)]">
              Last name
            </span>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              maxLength={60}
              autoComplete="family-name"
              placeholder="Enter last name"
              className="w-full rounded-lg border border-[var(--oc-border)] px-3 py-2 text-[12px] text-[var(--oc-text-primary)] outline-none transition-all placeholder:text-[var(--oc-border-strong)] focus:border-[var(--oc-action)] focus:ring-2 focus:ring-[var(--oc-action)]/10"
            />
          </label>

          <label className="block sm:col-span-2">
              <span className="mb-1 block text-[10.5px] font-bold text-[var(--oc-text-primary)]">
              Display name
            </span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={60}
              autoComplete="nickname"
              placeholder="Enter display name"
              className="w-full rounded-lg border border-[var(--oc-border)] px-3 py-2 text-[12px] text-[var(--oc-text-primary)] outline-none transition-all placeholder:text-[var(--oc-border-strong)] focus:border-[var(--oc-action)] focus:ring-2 focus:ring-[var(--oc-action)]/10"
            />
            <span className="mt-1 block text-[9.5px] text-[var(--oc-text-secondary)]">
              Shown publicly. Leave any field empty to keep it unset.
            </span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-saffron px-4 py-2 text-[11px] disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>

          {status && (
            <span
              className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${
              status.kind === "ok" ? "text-[var(--oc-success)]" : "text-[var(--oc-error)]"
              }`}
            >
              {status.kind === "ok" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              {status.message}
            </span>
          )}
        </div>
      </form>
    </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Session                                                            */
/* ------------------------------------------------------------------ */

function SessionTab() {
  const { account, signedIn, loading, session: activeSession, logout, openAuthModal } = useProfile();
  const [now, setNow] = useState(() => Date.now());
  const [session, setSession] = useState<SessionProfile | null>(null);
  const [dbSession, setDbSession] = useState<{
    stats: { total: number; active: number; lastRecordedAt: string | null };
    recent: Array<{
      id: string; startedAt: string; expiresAt: string; endedAt: string | null;
      countryCode: string | null; timezone: string | null; deviceClass: string | null;
      browser: string | null; signedIn: boolean;
    }>;
  } | null>(null);
  const [deviceOverride, setDeviceOverride] = useState<"auto" | DeviceClass>("auto");
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!activeSession?.expiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeSession?.expiresAt]);

  const secondsRemaining = sessionSecondsRemaining(activeSession?.expiresAt, now);
  const sessionStatus = profileSessionStatus(
    signedIn,
    activeSession?.expiresAt,
    now
  );

  // Collect client-side session profile
  useEffect(() => {
    let cancelled = false;
    collectSessionProfile()
      .then((p) => { if (!cancelled) setSession(p); })
      .catch(() => { if (!cancelled) setSession(null); });
    return () => { cancelled = true; };
  }, []);

  // Fetch DB-stored session data
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.stats && data?.recent) setDbSession({ stats: data.stats, recent: data.recent });
      })
      .catch(() => undefined);
  }, [signedIn]);

  const effectiveDevice: DeviceClass =
    deviceOverride === "auto" ? session?.device.deviceClass ?? "desktop" : deviceOverride;
  const isManualDevice = deviceOverride !== "auto";

  // POST signals to DB once per mount
  useEffect(() => {
    if (!session || !account || !signedIn || recordedRef.current) return;
    recordedRef.current = true;
    const payload = {
      countryCode: session.country.code !== "—" ? session.country.code : null,
      timezone: session.details.timezone,
      deviceClass: effectiveDevice,
      browser: `${session.browser.name} ${session.browser.version}`.trim(),
      botScore: session.bot.score,
      botVerdict: session.bot.verdict,
    };
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.ok ? r.json() : null)
      .then(() => {
        // Refresh DB session data after write
        fetch("/api/session", { cache: "no-store" })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.stats && data?.recent) setDbSession({ stats: data.stats, recent: data.recent });
          })
          .catch(() => undefined);
      })
      .catch(() => undefined);
  }, [session, account, signedIn, effectiveDevice]);

  const updateOverride = (value: "auto" | DeviceClass) => {
    setDeviceOverride(value);
    try {
      if (value === "auto") localStorage.removeItem("fc.device.class");
      else localStorage.setItem("fc.device.class", value);
    } catch { /* storage unavailable */ }
  };

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading session">
        <div className="h-5 w-32 animate-pulse bg-[var(--oc-surface-subtle)]" />
        <div className="h-20 w-full animate-pulse bg-[var(--oc-surface-subtle)]" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <SignInPrompt
        icon={MonitorSmartphone}
        {...PROFILE_GUEST_STATES.session}
        onSignIn={openAuthModal}
      />
    );
  }

  // Loading skeleton
  if (!session) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading session details">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-xl border border-[#E2E8F0] bg-white" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white" />
      </div>
    );
  }

  const verdict = VERDICT_META[session.bot.verdict];

  return (
    <div className="space-y-4">
      <AccountSectionHeading
        icon={MonitorSmartphone}
        title="Session"
        description="Review the current authenticated session and authorized device signals."
      />

      <div className="border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-bold text-[var(--oc-text-primary)]">Current status</h2>
            <p className="mt-0.5 text-[11px] text-[var(--oc-text-secondary)]">
              Session state comes from the authoritative Signin service.
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
            sessionStatus === "active"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : sessionStatus === "expired"
                ? "border-red-200 bg-red-50 text-[#DC2626]"
                : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              sessionStatus === "active"
                ? "bg-[#16A34A]"
                : sessionStatus === "expired"
                  ? "bg-[#DC2626]"
                  : "bg-[#94A3B8]"
            }`} />
            {sessionStatus === "active" ? "Active" : sessionStatus === "expired" ? "Expired" : "Unknown"}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SignalRow label="Started" value={activeSession ? formatSessionTime(activeSession.startedAt) : "—"} note="Authoritative session start." />
          <SignalRow label="Expires" value={activeSession ? formatSessionTime(activeSession.expiresAt) : "—"} note="Authoritative expiration timestamp." />
          <SignalRow label="Countdown" value={formatSessionTimer(secondsRemaining)} note="Updates while this page is open." />
          <div className="flex items-end sm:justify-end">
            {signedIn && (
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-[11px] font-bold text-[#334155] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9933] sm:w-auto"
              >
                <LogOut className="h-3.5 w-3.5" />
                End session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid gap-x-4 gap-y-5 border-b border-[var(--oc-border)] pb-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={LogIn}
          label="Login status"
          value={signedIn ? "Signed in" : "Signed out"}
          sub={signedIn ? `Session started ${activeSession ? formatSessionTime(activeSession.startedAt) : ""}` : "No active session"}
          badge={signedIn ? "Active" : "View only"}
          badgeClass={signedIn ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"}
        />
        <StatCard
          icon={MapPin}
          label="Country"
          value={`${session.country.flag} ${session.country.name}`}
          sub={`${session.country.code} · ${session.country.timezone}`}
          badge="Live"
          badgeClass="border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
        />
        <StatCard
          icon={MonitorSmartphone}
          label="Device"
          value={DEVICE_LABEL[effectiveDevice]}
          sub={isManualDevice ? "Set manually" : `${session.device.confidence} confidence · inferred`}
          badge={isManualDevice ? "Manual" : "Inferred"}
          badgeClass="border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
        />
        <StatCard
          icon={Globe}
          label="Browser"
          value={`${session.browser.name} ${session.browser.version}`}
          sub={`${session.browser.engine} engine`}
          badge="Client"
          badgeClass="border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
        />
      </div>

      {/* ── DB session summary (when signed in) ── */}
      {signedIn && dbSession && (
        <div className="grid gap-x-4 gap-y-4 border-b border-[var(--oc-border)] pb-4 sm:grid-cols-3">
          <div className="border-b border-[var(--oc-border)] pb-3 sm:border-b-0 sm:border-r sm:pr-4">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#94A3B8]">Total sessions</div>
            <div className="mt-1 text-[28px] font-black tabular-nums text-[#334155]">{dbSession.stats.total}</div>
            <div className="mt-0.5 text-[10px] text-[#64748B]">All time sign-ins stored in DB</div>
          </div>
          <div className="border-b border-[var(--oc-border)] pb-3 sm:border-b-0 sm:border-r sm:pr-4">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#94A3B8]">Active sessions</div>
            <div className="mt-1 text-[28px] font-black tabular-nums text-[#334155]">{dbSession.stats.active}</div>
            <div className="mt-0.5 text-[10px] text-[#64748B]">Unexpired &amp; signed in</div>
          </div>
          <div className="pb-3">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#94A3B8]">Last recorded</div>
            <div className="mt-1 text-[13px] font-black text-[#334155]">
              {dbSession.stats.lastRecordedAt
                ? new Date(dbSession.stats.lastRecordedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—"}
            </div>
            <div className="mt-0.5 text-[10px] text-[#64748B]">Most recent session start</div>
          </div>
        </div>
      )}

      {/* ── Bot & automation check ── */}
      <div className="overflow-hidden border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] px-4 py-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-[#334155]">
              <ShieldCheck className="h-4 w-4 text-[#FF6F00]" />
              Bot &amp; automation check
            </h2>
            <p className="text-[11.5px] text-[#475569]">
              Client-side signals, scored and saved to your session record
            </p>
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${verdict.className}`}>
            {verdict.label}
          </span>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center justify-center bg-[var(--oc-surface-subtle)] p-4">
            <ScoreRing score={session.bot.score} color={verdict.ring} />
            <div className="mt-2 text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">Signal score</div>
            <p className="mt-1 text-center text-[11px] leading-relaxed text-[#475569]">{verdict.description}</p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {session.bot.checks.map((check) => {
              const Icon = check.status === "fail" ? XCircle : check.status === "warn" ? AlertTriangle : CheckCircle2;
              const color = check.status === "fail" ? "text-[#DC2626]" : check.status === "warn" ? "text-[#FF9933]" : "text-[#16A34A]";
              return (
                <li key={check.id} className="flex items-start gap-2.5 border-b border-[var(--oc-surface-subtle)] pb-3">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-[#334155]">{check.label}</div>
                    <div className="text-[11px] leading-relaxed text-[#475569]">{check.detail}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="border-t border-[#F1F5F9] px-4 py-2.5 text-[11px] leading-relaxed text-[#475569]">
          No single browser signal proves a human. Production decisions combine server-side signals — TLS fingerprint, IP reputation, request cadence and rate limits — and escalate to a challenge instead of silently blocking.
        </p>
      </div>

      {/* ── Live session signals ── */}
      <div className="overflow-hidden border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] px-4 py-3">
          <div>
            <h2 className="text-[13px] font-bold text-[#334155]">Session signals</h2>
            <p className="text-[11.5px] text-[#475569]">Collected by the browser · saved to your session record</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9.5px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          <SignalRow label="Country" value={`${session.country.name} (${session.country.code})`} note={`Resolved from ${session.country.source}.`} />
          <SignalRow label="Timezone" value={session.details.timezone} note="Reported by the browser." />
          <SignalRow label="Locale" value={session.details.locale} note="Language preference reported by the browser." />
          <SignalRow label="Operating system" value={session.details.platform || "Unknown"} note="Derived from the user agent." />
          <SignalRow label="Screen" value={session.details.screen} note="Viewport size only." />
          <SignalRow label="Input" value={session.details.touch ? "Touch" : "Mouse / trackpad"} note="Used by the pointer-consistency check." />
          <SignalRow label="CPU cores" value={session.details.cores ? `${session.details.cores} logical cores` : "Not exposed"} note="Coarse concurrency hint." />
          <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11.5px] font-semibold text-[#334155]">Form factor</div>
              <p className="text-[11px] text-[#475569]">Auto-detection cannot always separate a laptop from a desktop.</p>
            </div>
            <select
              value={deviceOverride}
              onChange={(e) => updateOverride(e.target.value as "auto" | DeviceClass)}
              aria-label="Device form factor"
              className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#334155] outline-none focus:border-[#FF6F00]"
            >
              <option value="auto">Auto · {DEVICE_LABEL[session.device.deviceClass]}</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Recent session history from DB ── */}
      {signedIn && dbSession && dbSession.recent.length > 0 && (
        <div className="overflow-hidden border-b border-[#E2E8F0] pb-4">
          <div className="border-b border-[#F1F5F9] px-4 py-3">
            <h2 className="text-[13px] font-bold text-[#334155]">Recent sessions</h2>
            <p className="text-[10.5px] text-[#64748B]">Last {dbSession.recent.length} sign-ins stored in your session database</p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {dbSession.recent.map((s, i) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                  s.signedIn && !s.endedAt ? "bg-emerald-100 text-emerald-700" : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}>
                  {i === 0 ? "●" : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-[#334155]">
                      {new Date(s.startedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {new Date(s.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {s.signedIn && !s.endedAt && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">Active</span>
                    )}
                    {s.endedAt && (
                      <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[9px] font-semibold text-[#94A3B8]">Ended</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-[9.5px] text-[#64748B]">
                    {s.countryCode && <span>🌍 {s.countryCode}</span>}
                    {s.deviceClass && <span className="capitalize">{s.deviceClass}</span>}
                    {s.browser && <span>{s.browser}</span>}
                  </div>
                </div>
                <div className="text-right text-[9.5px] text-[#94A3B8]">
                  <div>Expires</div>
                  <div className="font-semibold text-[#475569]">
                    {new Date(s.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
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


function formatSessionTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  badge,
  badgeClass,
}: {
  icon: typeof LogIn;
  label: string;
  value: string;
  sub: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <div className="border-b border-[var(--oc-border)] pb-3">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-7 w-7 items-center justify-center text-[var(--oc-action)]">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {badge && (
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
        {label}
      </div>
      <div className="mt-0.5 truncate text-[14px] font-bold text-[#334155]">
        {value}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-[#475569]">{sub}</div>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative h-20 w-20">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${score} 100`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-black leading-none tabular-nums text-[#334155]">
          {score}
        </span>
        <span className="mt-0.5 text-[8.5px] font-bold uppercase tracking-wider text-[#64748B]">
          /100
        </span>
      </div>
    </div>
  );
}

function SignalRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="shrink-0 pt-0.5 text-[11.5px] font-semibold text-[#475569] sm:w-36">
        {label}
      </span>
      <div className="min-w-0 sm:flex-1">
        <div className="text-[12px] font-semibold text-[#334155]">{value}</div>
        <p className="text-[11px] leading-relaxed text-[#475569]">{note}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Identity                                                           */
/* ------------------------------------------------------------------ */

function IdentityTab() {
  const { account, signedIn, rotateIdentity, loading, openAuthModal } = useProfile();
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading identity">
        <div className="h-5 w-36 animate-pulse bg-[var(--oc-surface-subtle)]" />
        <div className="h-20 w-full animate-pulse bg-[var(--oc-surface-subtle)]" />
      </div>
    );
  }

  if (!signedIn || !account) {
    return (
      <SignInPrompt
        icon={Fingerprint}
        {...PROFILE_GUEST_STATES.identity}
        onSignIn={openAuthModal}
      />
    );
  }

  const copyValue = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const rotate = async () => {
    setBusy(true);
    const result = await rotateIdentity();
    setBusy(false);
    setStatus(result.ok ? "New ID generated." : result.message ?? "Failed.");
  };

  return (
    <div className="space-y-5">
      <AccountSectionHeading
        icon={Fingerprint}
        title="Identity"
        description="View your canonical public User ID and its current validity."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-b border-[#E2E8F0] pb-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                Your user ID
              </div>
              <div className="mt-0.5 text-[10.5px] text-[#475569]">
                7 characters · valid for 180 days
              </div>
            </div>
          </div>

          <div className="mt-4 font-mono text-[30px] font-black tracking-[0.18em] text-[#334155] sm:text-[34px]">
            {account.publicId}
          </div>
          <div className="mt-1 text-[10px] text-[#475569]">
            Issued {account.createdAt.slice(0, 10)} · 32⁷ ≈ 34.4 billion
            possible IDs
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-bold ${
                account.userIdExpired
                  ? "border-red-200 bg-red-50 text-[#DC2626]"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              <Clock className="h-3 w-3" />
              {account.userIdExpired
                ? "Expired — rotates at next sign-in"
                : `${Math.max(0, account.userIdDaysRemaining)} days left`}
            </span>
            <span className="text-[9.5px] text-[#475569]">
              Expires {account.userIdExpiresAt.slice(0, 10)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => copyValue(account.publicId, "id")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-[10.5px] font-bold text-[#334155] transition-colors hover:border-[#CBD5E1]"
            >
              {copied === "id" ? (
                <Check className="h-3.5 w-3.5 text-[#16A34A]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied === "id" ? "Copied" : "Copy ID"}
            </button>
            <button
              onClick={rotate}
              disabled={busy}
              className="btn-saffron px-3 py-1.5 text-[10.5px] disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`}
              />
              New ID
            </button>
          </div>
        </div>

        <div className="border-b border-[#E2E8F0] pb-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Identity security
              </div>
              <div className="mt-0.5 text-[10.5px] text-[#64748B]">
                Protected credential material
              </div>
            </div>
            <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[9px] font-bold text-[#64748B]">
              Private
            </span>
          </div>

          <div className="mt-3 bg-[var(--oc-text-primary)] p-4 text-[11px] leading-relaxed text-white">
            Credential hashes and salts are never exposed in the UI or data export.
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[9.5px] leading-relaxed text-[#94A3B8]">
              Your public ID is safe to share; authentication material remains server-side.
            </p>
          </div>
        </div>
      </div>

      {status && (
        <div className="flex items-center gap-2 border-b border-[var(--oc-border)] py-2.5 text-[11px] text-[var(--oc-text-primary)]">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
          {status}
        </div>
      )}

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

function DataTab() {
  const {
    signedIn,
    loading,
    logout,
    downloadData,
    rotateIdentity,
    clearProfile,
    deleteAllData,
    openAuthModal,
  } = useProfile();
  const [status, setStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (
    key: string,
    action: () => Promise<{ ok: boolean; message?: string }>,
    success: string
  ) => {
    setBusy(key);
    const result = await action();
    setBusy(null);
    setStatus(result.ok ? success : result.message ?? "Action failed.");
  };

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading data controls">
        <div className="h-5 w-28 animate-pulse bg-[var(--oc-surface-subtle)]" />
        <div className="h-20 w-full animate-pulse bg-[var(--oc-surface-subtle)]" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <SignInPrompt
        icon={Database}
        {...PROFILE_GUEST_STATES.data}
        descriptionClassName="lg:whitespace-nowrap"
        onSignIn={openAuthModal}
      />
    );
  }

  // What data we hold — user-friendly, no internal schema
  const dataItems = [
    {
      icon: UserRound,
      label: "Profile details",
      description: "Your display name, first name and last name.",
      canClear: true,
    },
    {
      icon: Camera,
      label: "Display picture",
      description: "Your profile photo, stored on our servers. No third-party host.",
      canClear: true,
    },
    {
      icon: Fingerprint,
      label: "Account & User ID",
      description: "A randomly generated 7-character ID that identifies your account.",
      canClear: false,
    },
    {
      icon: Activity,
      label: "Session history",
      description: "Sign-in timestamps, device class, browser and country — used for security.",
      canClear: false,
    },
  ];

  return (
    <div className="space-y-5">
      <AccountSectionHeading
        icon={Database}
        title="Data"
        description="Access your authorized export, privacy information, and account controls."
      />
      {/* What we store */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <div className="mb-4">
          <h3 className="text-[13px] font-bold text-[var(--oc-text-primary)]">What we store about you</h3>
          <p className="text-[10.5px] text-[var(--oc-text-secondary)]">All data is tied to your account and stored on our servers.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {dataItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3 border-b border-[var(--oc-surface-subtle)] pb-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[var(--oc-action)]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-[11px] font-bold text-[var(--oc-text-primary)]">{item.label}</div>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--oc-text-secondary)]">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your rights */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <div className="mb-4">
          <h3 className="text-[13px] font-bold text-[var(--oc-text-primary)]">Your rights &amp; controls</h3>
          <p className="text-[10.5px] text-[var(--oc-text-secondary)]">You have full control over your data at any time.</p>
        </div>

        <div className="space-y-2">
          {/* Download */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--oc-border)] py-3">
            <div>
              <div className="text-[11px] font-bold text-[#334155]">Download my data</div>
              <p className="text-[10px] text-[#64748B]">Export everything we have about you as a JSON file.</p>
            </div>
            <button
              onClick={() => run("download", downloadData, "Your data export has been downloaded.")}
              disabled={busy === "download"}
              className="btn-saffron px-3.5 py-1.5 text-[10.5px] disabled:opacity-60"
            >
              {busy === "download" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {busy === "download" ? "Exporting…" : "Download"}
            </button>
          </div>

          {/* Rotate ID */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--oc-border)] py-3">
            <div>
              <div className="text-[11px] font-bold text-[#334155]">Generate a new User ID</div>
              <p className="text-[10px] text-[#64748B]">Replaces your current ID. Your profile and content stay the same.</p>
            </div>
            <button
              onClick={() => run("rotate", rotateIdentity, "New User ID generated.")}
              disabled={busy === "rotate"}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6F00]/40 bg-[#FFF7ED] px-3.5 py-1.5 text-[10.5px] font-bold text-[#C2410C] transition-colors hover:bg-[#FFEDD5] disabled:opacity-60"
            >
              {busy === "rotate" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {busy === "rotate" ? "Generating…" : "New ID"}
            </button>
          </div>

          {/* Clear profile */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--oc-border)] py-3">
            <div>
              <div className="text-[11px] font-bold text-[#334155]">Clear profile data</div>
              <p className="text-[10px] text-[#64748B]">Removes your name, display name and profile picture from our servers.</p>
            </div>
            <button
              onClick={async () => {
                if (!confirmClear) { setConfirmClear(true); return; }
                setConfirmClear(false);
                await run("clear", clearProfile, "Profile details and picture cleared.");
              }}
              disabled={busy === "clear"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold transition-colors disabled:opacity-60 ${
                confirmClear
                  ? "border-red-300 bg-red-600 text-white hover:bg-red-700"
                  : "border-red-200 text-[#DC2626] hover:bg-red-50"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmClear ? "Confirm clear" : "Clear data"}
            </button>
          </div>

          {/* End session */}
          {signedIn && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--oc-border)] py-3">
              <div>
                <div className="text-[11px] font-bold text-[#334155]">End current session</div>
                <p className="text-[10px] text-[#64748B]">Signs you out of this device. Your account and data are kept.</p>
              </div>
              <button
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] px-3.5 py-1.5 text-[10.5px] font-bold text-[#334155] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}

          {/* Delete all data */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 py-3">
            <div>
              <div className="text-[11px] font-bold text-[#DC2626]">Delete all my data</div>
              <p className="text-[10px] text-[var(--oc-text-secondary)]">Submits an account-deletion request to the server workflow. Final cleanup status is confirmed by the service.</p>
            </div>
            <button
              onClick={async () => {
                if (!confirmDelete) { setConfirmDelete(true); return; }
                setConfirmDelete(false);
                await run("delete", deleteAllData, "Deletion request submitted. Follow the server-provided status for final cleanup.");
              }}
              disabled={busy === "delete"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10.5px] font-bold transition-colors disabled:opacity-60 ${
                confirmDelete
                  ? "border-red-400 bg-red-600 text-white hover:bg-red-700"
                  : "border-red-300 bg-white text-[#DC2626] hover:bg-red-600 hover:text-white"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "Yes, delete everything" : "Delete all data"}
            </button>
          </div>
        </div>

        {status && (
          <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-[#475569]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#16A34A]" />
            {status}
          </p>
        )}
      </div>

      {/* Privacy assurance */}
      <div className="border-t border-[#E2E8F0] pt-4">
        <div className="flex items-start gap-2.5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]" />
          <p className="text-[10px] leading-relaxed text-[#64748B]">
            Your data is stored securely on our servers. No third-party storage or advertising platforms have access to it. Your display picture is served directly from our servers — no external image host is used.
          </p>
        </div>
      </div>
    </div>
  );
}
