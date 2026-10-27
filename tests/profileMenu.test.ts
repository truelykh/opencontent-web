import assert from "node:assert/strict";
import test from "node:test";
import {
  formatSessionTimer,
  PROFILE_MENU_NAVIGATION,
  profileSessionStatus,
  sessionSecondsRemaining,
} from "../lib/profileMenu";
import {
  PROFILE_GUEST_STATES,
  PROFILE_SECTION_LABELS,
  PROFILE_SECTION_ORDER,
  isProfileSection,
  profileNavigationSections,
  visibleProfileSection,
} from "../lib/profileSections";

const expiresAt = "2026-10-23T12:00:10.000Z";
const now = Date.parse("2026-10-23T12:00:00.000Z");

test("countdown is derived from the authoritative expiration timestamp", () => {
  assert.equal(sessionSecondsRemaining(expiresAt, now), 10);
  assert.equal(sessionSecondsRemaining(expiresAt, now + 11_000), 0);
  assert.equal(formatSessionTimer(10), "0h 00m 10s remaining");
});

test("invalid or missing expiration produces unknown status", () => {
  assert.equal(profileSessionStatus(true, undefined, now), "unknown");
  assert.equal(profileSessionStatus(true, "not-a-date", now), "unknown");
  assert.equal(formatSessionTimer(null), "Session unavailable");
});

test("expired sessions receive the expired status", () => {
  assert.equal(profileSessionStatus(true, expiresAt, now + 10_000), "expired");
  assert.equal(profileSessionStatus(false, expiresAt, now), "unknown");
  assert.equal(formatSessionTimer(0), "Session expired");
});

test("profile menu navigation keeps Home Feed on the main feed", () => {
  assert.equal(PROFILE_MENU_NAVIGATION.feed, "feed");
  assert.equal(PROFILE_MENU_NAVIGATION.videos, "manage");
  assert.equal(PROFILE_MENU_NAVIGATION.profile, "profile");
  assert.equal(PROFILE_MENU_NAVIGATION.settings, "settings");
});

test("profile sections preserve the four-section order and labels", () => {
  assert.deepEqual(PROFILE_SECTION_ORDER, ["profile", "session", "identity", "data"]);
  assert.deepEqual(PROFILE_SECTION_LABELS, {
    profile: "Profile",
    session: "Session",
    identity: "Identity",
    data: "Data",
  });
  assert.deepEqual(PROFILE_GUEST_STATES, {
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
  });
  assert.equal(isProfileSection("session"), true);
  assert.equal(isProfileSection("music"), false);
});

test("profile navigation progressively discloses protected sections", () => {
  assert.deepEqual(profileNavigationSections("loading"), ["profile"]);
  assert.deepEqual(profileNavigationSections("guest"), ["profile"]);
  assert.deepEqual(profileNavigationSections("error"), ["profile"]);
  assert.deepEqual(profileNavigationSections("authenticated"), PROFILE_SECTION_ORDER);
  assert.equal(visibleProfileSection("guest", "data"), "profile");
  assert.equal(visibleProfileSection("authenticated", "data"), "data");
});
