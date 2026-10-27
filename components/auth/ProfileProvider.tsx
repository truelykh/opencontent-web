"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import SignInModal from "./SignInModal";
import { profileSessionStatus } from "@/lib/profileMenu";

export interface AccountSummary {
  publicId: string;
  createdAt: string;
  userIdIssuedAt: string;
  userIdExpiresAt: string;
  userIdDaysRemaining: number;
  userIdExpired: boolean;
}

export interface ProfileSummary {
  accountId: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  id: string;
  startedAt: string;
  expiresAt: string;
  userId: string;
}

interface ActionResult {
  ok: boolean;
  message?: string;
}

export interface LoginResult extends ActionResult {
  rotated?: { previousUserId: string; newUserId: string };
  newUserId?: string;
}

interface ProfileInput {
  firstName: string;
  lastName: string;
  displayName: string;
}

interface ProfileContextValue {
  account: AccountSummary | null;
  profile: ProfileSummary | null;
  session: SessionSummary | null;
  signedIn: boolean;
  loading: boolean;
  error: string | null;
  authState: "loading" | "guest" | "authenticated" | "error";
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refresh: () => Promise<void>;
  saveProfile: (input: ProfileInput) => Promise<ActionResult>;
  uploadAvatar: (file: File) => Promise<ActionResult>;
  removeAvatar: () => Promise<ActionResult>;
  rotateIdentity: () => Promise<ActionResult>;
  clearProfile: () => Promise<ActionResult>;
  deleteAllData: () => Promise<ActionResult>;
  downloadData: () => Promise<ActionResult>;
  login: (userId: string) => Promise<LoginResult>;
  logout: () => Promise<ActionResult>;
  createUserId: () => Promise<LoginResult>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function avatarErrorMessage(status: number): string {
  if (status === 413) return "Image must be 2 MB or smaller.";
  if (status === 415) return "Use a PNG, JPEG or WebP image.";
  if (status === 400) return "Choose an image file first.";
  return "Could not upload the image. Try again.";
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [session, setSession] = useState<SessionSummary | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [sessionNow, setSessionNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  useEffect(() => {
    if (!signedIn || !session?.expiresAt) return;
    const timer = window.setInterval(() => setSessionNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session?.expiresAt, signedIn]);

  const apply = useCallback((data: Record<string, unknown>) => {
    if ("account" in data) {
      setAccount((data.account as AccountSummary | null) ?? null);
    }
    if ("profile" in data) {
      setProfile((data.profile as ProfileSummary | null) ?? null);
    }
    if (typeof data.signedIn === "boolean") setSignedIn(data.signedIn);
    if ("session" in data) {
      setSession((data.session as SessionSummary | null) ?? null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        apply({ account: null, profile: null, signedIn: false, session: null });
        setError(null);
        return;
      }
      if (!response.ok) throw new Error("profile_unavailable");
      apply(await readJson(response));
      setError(null);
    } catch {
      setError("Could not load the profile.");
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    if (!signedIn || !session?.expiresAt) return;
    if (profileSessionStatus(signedIn, session.expiresAt, sessionNow) === "expired") {
      const clearTimer = window.setTimeout(() => {
        apply({ account: null, profile: null, signedIn: false, session: null });
        setError(null);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }
    const timer = window.setInterval(() => {
      void refresh();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [apply, refresh, session?.expiresAt, sessionNow, signedIn]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            apply({ account: null, profile: null, signedIn: false, session: null });
            setError(null);
          }
          return;
        }
        if (!response.ok) throw new Error("profile_unavailable");
        const data = await readJson(response);
        if (cancelled) return;
        apply(data);
      } catch {
        if (!cancelled) setError("Could not load the profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const saveProfile = useCallback(
    async (input: ProfileInput): Promise<ActionResult> => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await readJson(response);
        if (!response.ok) {
          return {
            ok: false,
            message:
              (data.message as string) ??
              "Could not save the profile. Check the fields.",
          };
        }
        apply(data);
        return { ok: true };
      } catch {
        return { ok: false, message: "Could not reach the profile service." };
      }
    },
    [apply]
  );

  const uploadAvatar = useCallback(
    async (file: File): Promise<ActionResult> => {
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });
        const data = await readJson(response);
        if (!response.ok) {
          return { ok: false, message: avatarErrorMessage(response.status) };
        }
        apply(data);
        return { ok: true };
      } catch {
        return { ok: false, message: "Could not upload the image." };
      }
    },
    [apply]
  );

  const removeAvatar = useCallback(async (): Promise<ActionResult> => {
    try {
      const response = await fetch("/api/profile/avatar", { method: "DELETE" });
      const data = await readJson(response);
      if (!response.ok) {
        return { ok: false, message: "Could not remove the image." };
      }
      apply(data);
      return { ok: true };
    } catch {
      return { ok: false, message: "Could not remove the image." };
    }
  }, [apply]);

  const rotateIdentity = useCallback(async (): Promise<ActionResult> => {
    try {
      const response = await fetch("/api/identity/rotate", { method: "POST" });
      const data = await readJson(response);
      if (!response.ok) {
        return { ok: false, message: "Could not generate a new user ID." };
      }
      apply(data);
      return { ok: true };
    } catch {
      return { ok: false, message: "Could not generate a new user ID." };
    }
  }, [apply]);

  const clearProfile = useCallback(async (): Promise<ActionResult> => {
    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      const data = await readJson(response);
      if (!response.ok) {
        return { ok: false, message: "Could not clear the profile." };
      }
      apply(data);
      return { ok: true };
    } catch {
      return { ok: false, message: "Could not clear the profile." };
    }
  }, [apply]);

  const downloadData = useCallback(async (): Promise<ActionResult> => {
    try {
      const response = await fetch("/api/profile/data", { cache: "no-store" });
      if (!response.ok) {
        return { ok: false, message: "Could not export your data." };
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `opencontent-profile-${account?.publicId ?? "export"}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      return { ok: true };
    } catch {
      return { ok: false, message: "Could not export your data." };
    }
  }, [account]);

  const login = useCallback(
    async (userId: string): Promise<LoginResult> => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await readJson(response);
        if (!response.ok) {
          return {
            ok: false,
            message:
              (data.message as string) ??
              "Could not sign in with that user ID.",
          };
        }
        apply(data);
        setError(null);
        setLoading(false);
        return {
          ok: true,
          rotated:
            (data.rotated as LoginResult["rotated"] | null) ?? undefined,
        };
      } catch {
        return { ok: false, message: "Could not reach the sign-in service." };
      }
    },
    [apply]
  );

  const logout = useCallback(async (): Promise<ActionResult> => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) {
        return { ok: false, message: "Could not end the session." };
      }
      setSignedIn(false);
      setSession(null);
      setAccount(null);
      setProfile(null);
      setError(null);
      return { ok: true };
    } catch {
      return { ok: false, message: "Could not end the session." };
    }
  }, []);

  const deleteAllData = useCallback(async (): Promise<ActionResult> => {
    try {
      const response = await fetch("/api/profile/data", { method: "DELETE" });
      if (!response.ok) {
        return { ok: false, message: "Could not delete data from servers." };
      }
      setSignedIn(false);
      setSession(null);
      setAccount(null);
      setProfile(null);
      setError(null);
      // Immediately open the SignInModal popup screen
      setIsAuthModalOpen(true);
      return { ok: true };
    } catch {
      return { ok: false, message: "Could not reach the server to delete data." };
    }
  }, []);

  const createUserId = useCallback(async (): Promise<LoginResult> => {
    try {
      const response = await fetch("/api/auth/new", { method: "POST" });
      const data = await readJson(response);
      if (!response.ok) {
        return {
          ok: false,
          message: (data.message as string) ?? "Could not create a user ID.",
        };
      }
      apply(data);
      setError(null);
      setLoading(false);
      const newUserId = (data.account as AccountSummary | undefined)?.publicId;
      return { ok: true, newUserId };
    } catch {
      return { ok: false, message: "Could not create a user ID." };
    }
  }, [apply]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      account,
      profile,
      session,
      signedIn,
      loading,
      error,
      authState: loading
        ? "loading"
        : error
          ? "error"
          : profileSessionStatus(signedIn, session?.expiresAt, sessionNow) === "active"
            ? "authenticated"
            : "guest",
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      refresh,
      saveProfile,
      uploadAvatar,
      removeAvatar,
      rotateIdentity,
      clearProfile,
      deleteAllData,
      downloadData,
      login,
      logout,
      createUserId,
    }),
    [
      account,
      profile,
      session,
      signedIn,
      loading,
      error,
      sessionNow,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      refresh,
      saveProfile,
      uploadAvatar,
      removeAvatar,
      rotateIdentity,
      clearProfile,
      deleteAllData,
      downloadData,
      login,
      logout,
      createUserId,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
      {isAuthModalOpen && <SignInModal onClose={closeAuthModal} />}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error("useProfile must be used inside ProfileProvider");
  }
  return value;
}
