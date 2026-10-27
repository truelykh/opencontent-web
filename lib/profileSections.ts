import type { ProfileSubTab } from "@/types";

export type ProfileAuthState = "loading" | "guest" | "authenticated" | "error";

export const PROFILE_SECTION_ORDER: readonly ProfileSubTab[] = [
  "profile",
  "session",
  "identity",
  "data",
];

export function profileNavigationSections(
  authState: ProfileAuthState
): readonly ProfileSubTab[] {
  return authState === "authenticated" ? PROFILE_SECTION_ORDER : ["profile"];
}

export function visibleProfileSection(
  authState: ProfileAuthState,
  requested: ProfileSubTab
): ProfileSubTab {
  return authState === "authenticated" ? requested : "profile";
}

export const PROFILE_SECTION_LABELS: Record<ProfileSubTab, string> = {
  profile: "Profile",
  session: "Session",
  identity: "Identity",
  data: "Data",
};

export const PROFILE_GUEST_STATES: Record<
  ProfileSubTab,
  { heading: string; description: string }
> = {
  profile: {
    heading: "Sign in to view your profile",
    description: "Your profile information will appear here once you're signed in.",
  },
  session: {
    heading: "Sign in to view your session",
    description: "Your current session details will appear here once you're signed in.",
  },
  identity: {
    heading: "Sign in to view your identity",
    description: "Your identity information will appear here once you're signed in.",
  },
  data: {
    heading: "Sign in to manage your data",
    description: "Sign in to access your data, download your information, or manage account deletion.",
  },
};

export function isProfileSection(value: string): value is ProfileSubTab {
  return PROFILE_SECTION_ORDER.includes(value as ProfileSubTab);
}
