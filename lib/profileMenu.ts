export type ProfileSessionStatus = "active" | "expired" | "unknown";

export const PROFILE_MENU_NAVIGATION = {
  feed: "feed",
  videos: "manage",
  ads: "ads",
  profile: "profile",
  settings: "settings",
} as const;

export function sessionSecondsRemaining(
  expiresAt: string | null | undefined,
  nowMs: number
): number | null {
  if (!expiresAt) return null;
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return null;
  return Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
}

export function profileSessionStatus(
  signedIn: boolean,
  expiresAt: string | null | undefined,
  nowMs: number
): ProfileSessionStatus {
  if (!signedIn || !expiresAt) return "unknown";
  const secondsRemaining = sessionSecondsRemaining(expiresAt, nowMs);
  if (secondsRemaining === null) return "unknown";
  return secondsRemaining === 0 ? "expired" : "active";
}

export function formatSessionTimer(seconds: number | null): string {
  if (seconds === null) return "Session unavailable";
  if (seconds === 0) return "Session expired";
  return `${Math.floor(seconds / 3600)}h ${String(
    Math.floor((seconds % 3600) / 60)
  ).padStart(2, "0")}m ${String(seconds % 60).padStart(2, "0")}s remaining`;
}
