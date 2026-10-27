"use client";

import React, { useRef, useState } from "react";
import {
  ContentCopyRounded as Copy,
  CheckRounded as Check,
  AutorenewRounded as RefreshCw,
  CloseRounded as X,
  WarningAmberRounded as AlertTriangle,
  AutoAwesomeRounded as Sparkles,
} from "@mui/icons-material";
import { BrandLockup } from "../layout/BrandLogo";
import { useProfile } from "./ProfileProvider";

// Keep this aligned with Auth's PublicIDAlphabet: omit only ambiguous L/O.
const ALPHABET = "ABCDEFGHIJKMNPQRSTUVWXYZ23456789";
const LENGTH = 7;

// Seven concentric vault rings — generously sized for clear visual presence
const RING_RADII = [190, 168, 146, 124, 102, 80, 58];
const RING_DASHES = ["2 10", "12 12", "1 6", "20 14", "5 9", "26 18", "3 7"];
const RING_WIDTHS = [2.2, 2.0, 1.8, 2.2, 1.8, 2.0, 1.8];
const RING_START = [0, 24, 48, 72, 96, 120, 144];

interface SignInModalProps {
  onClose: () => void;
}

type SuccessState = {
  kind: "rotated" | "created";
  userId: string;
  previousUserId?: string;
};

export default function SignInModal({ onClose }: SignInModalProps) {
  const { login, createUserId } = useProfile();
  const [mode, setMode] = useState<"signin" | "generate">("signin");
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [genDisplay, setGenDisplay] = useState<string[]>(Array(LENGTH).fill(""));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [storedConfirmed, setStoredConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotations, setRotations] = useState<number[]>(RING_START);
  const [focused, setFocused] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const userId = digits.join("");
  const complete = userId.length === LENGTH;

  const focusIndex = (index: number) => {
    const target = inputs.current[Math.max(0, Math.min(LENGTH - 1, index))];
    target?.focus();
    target?.select();
  };

  const spin = (index: number, degrees: number) => {
    setRotations((prev) =>
      prev.map((angle, ring) => (ring === index ? angle + degrees : angle))
    );
  };

  const setDigit = (index: number, raw: string) => {
    const char = raw.trim().slice(-1).toUpperCase();
    if (char && !ALPHABET.includes(char)) return;
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    setError(null);
    if (char) spin(index, 46);
    if (char && index < LENGTH - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      spin(index - 1, -24);
      focusIndex(index - 1);
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }
    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-HJ-NP-Z2-9]/g, "")
      .slice(0, LENGTH - index);
    if (!pasted) return;
    setDigits((prev) => {
      const next = [...prev];
      for (let offset = 0; offset < pasted.length; offset++) {
        next[index + offset] = pasted[offset];
      }
      return next;
    });
    setError(null);
    for (let offset = 0; offset < pasted.length; offset++) {
      spin(index + offset, 46);
    }
    focusIndex(index + pasted.length);
  };

  const submit = async () => {
    if (!complete || busy) return;
    setBusy(true);
    setError(null);
    const result = await login(userId);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "Could not sign in.");
      return;
    }
    if (result.rotated) {
      setSuccess({
        kind: "rotated",
        userId: result.rotated.newUserId,
        previousUserId: result.rotated.previousUserId,
      });
      return;
    }
    onClose();
  };

  // Animated generation routine with rotating rig for each character
  const handleGenerateAndSignIn = async () => {
    if (busy || isGenerating) return;
    setBusy(true);
    setError(null);
    setIsGenerating(true);

    try {
      // 1. Request new ID from provider
      const result = await createUserId();
      if (!result.ok || !result.newUserId) {
        setBusy(false);
        setIsGenerating(false);
        setError(result.message ?? "Could not create a user ID.");
        return;
      }

      const finalId = result.newUserId.toUpperCase();

      // 2. Sequential mechanical animation: spin each ring and lock characters one-by-one
      for (let i = 0; i < LENGTH; i++) {
        spin(i, 360 + (i + 1) * 45);

        for (let t = 0; t < 3; t++) {
          const randomChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          setGenDisplay((prev) => {
            const next = [...prev];
            next[i] = randomChar;
            return next;
          });
          await new Promise((r) => setTimeout(r, 40));
        }

        setGenDisplay((prev) => {
          const next = [...prev];
          next[i] = finalId[i];
          return next;
        });

        await new Promise((r) => setTimeout(r, 110));
      }

      await new Promise((r) => setTimeout(r, 260));
      setIsGenerating(false);
      setBusy(false);
      setSuccess({ kind: "created", userId: finalId });
    } catch {
      setBusy(false);
      setIsGenerating(false);
      setError("Could not create a user ID. Please try again.");
    }
  };

  const copyId = async () => {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.userId);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = success.userId;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#334155]/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-2xl saffron-scrollbar sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#475569] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155] cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header — identical lockup everywhere */}
        <div className="flex flex-col items-center justify-center text-center">
          <BrandLockup size={30} />
          <p className="mt-2 text-sm text-[#475569]">
            {success
              ? "Your 7-character User ID"
              : mode === "signin"
              ? "Enter your 7-character User ID"
              : "Generate an anonymous User ID"}
          </p>
        </div>

        {/* Success View: User ID created or rotated */}
        {success ? (
          <div className="mt-5 space-y-5">
            {/* Expanded Concentric Vault Rig with generated characters */}
            <div className="relative mx-auto h-[260px] sm:h-[280px] w-full max-w-[340px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,#FFF7ED_0%,rgba(255,255,255,0)_70%)]"
              />
              <svg
                viewBox="0 0 400 400"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {RING_RADII.map((radius, index) => (
                  <circle
                    key={radius}
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke="#FF9933"
                    strokeOpacity={0.25 + index * 0.08}
                    strokeWidth={RING_WIDTHS[index]}
                    strokeDasharray={RING_DASHES[index]}
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${rotations[index] + index * 20}deg)`,
                      transformOrigin: "center",
                      transformBox: "fill-box",
                      transition: `transform ${800 + index * 100}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                    }}
                  />
                ))}
              </svg>

              {/* ID chars centered inside rig */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/95 px-3 py-2.5 shadow-lg border border-[#FED7AA]">
                <div className="flex items-center justify-center gap-1.5">
                  {success.userId.split("").map((char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className="flex h-10 w-8 items-center justify-center rounded-md border border-[#FF9933]/50 bg-[#FFF7ED] font-mono text-base font-bold text-[#334155]"
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 flex justify-center">
                  <button
                    type="button"
                    onClick={copyId}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 py-1 text-xs font-semibold text-[#334155] transition-colors hover:border-[#FF9933] hover:text-[#FF9933] cursor-pointer"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copied to clipboard" : "Copy ID"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Caution & Bullet points — NOT IN A CARD */}
            <div className="space-y-3 text-left pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                <AlertTriangle className="h-4.5 w-4.5 text-[#DC2626]" />
                <span>Caution</span>
              </div>

              <ul className="space-y-2 text-sm leading-relaxed text-[#1E293B]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#DC2626] font-bold text-base leading-none select-none mt-0.5">•</span>
                  <span className="font-semibold text-[#334155]">
                    Please store your User ID safely right now.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#DC2626] font-bold text-base leading-none select-none mt-0.5">•</span>
                  <span>
                    Opencontent does not collect your email or phone number. If lost, it is permanently lost. There is no account recovery.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#FF9933] font-bold text-base leading-none select-none mt-0.5">•</span>
                  <span>
                    Your ID is valid for 180 days and automatically rotates upon active sign in.
                  </span>
                </li>
              </ul>

              {/* Checkbox Acknowledgment (increased font size, not in a card) */}
              <label className="flex items-start gap-3 cursor-pointer select-none pt-3 border-t border-[#E2E8F0]">
                <input
                  type="checkbox"
                  checked={storedConfirmed}
                  onChange={(e) => setStoredConfirmed(e.target.checked)}
                  className="mt-1 h-4.5 w-4.5 shrink-0 rounded accent-[#FF9933] cursor-pointer"
                />
                <span className="text-sm font-medium text-[#334155] leading-snug">
                  I have saved my User ID in a safe place and understand that if lost, it cannot be recovered.
                </span>
              </label>
            </div>

            {/* Clean & Simple Confirm Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={!storedConfirmed}
                className="btn-saffron min-w-[160px] justify-center rounded-full px-6 py-2 text-xs active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue to Opencontent</span>
              </button>
            </div>
          </div>
        ) : mode === "signin" ? (
          /* Sign In Mode */
          <div className="mt-4">
            {/* Expanded Concentric Vault Rings */}
            <div className="relative mx-auto h-[290px] sm:h-[320px] w-full max-w-[360px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,#FFF7ED_0%,rgba(255,255,255,0)_70%)]"
              />
              <svg
                viewBox="0 0 400 400"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {RING_RADII.map((radius, index) => (
                  <circle
                    key={radius}
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke={
                      index === focused
                        ? "#FF9933"
                        : digits[index]
                        ? "#FB923C"
                        : "#CBD5E1"
                    }
                    strokeOpacity={
                      index === focused ? 0.85 : digits[index] ? 0.6 : 0.35
                    }
                    strokeWidth={RING_WIDTHS[index]}
                    strokeDasharray={RING_DASHES[index]}
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${rotations[index]}deg)`,
                      transformOrigin: "center",
                      transformBox: "fill-box",
                      transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                ))}
              </svg>

              {/* 7 Inputs Centered */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/95 px-3 py-2 shadow-lg border border-[#E2E8F0]">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => setDigit(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={(event) => handlePaste(index, event)}
                      onFocus={() => {
                        setFocused(index);
                        spin(index, 14);
                      }}
                      aria-label={`User ID character ${index + 1}`}
                      maxLength={1}
                      inputMode="text"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      autoFocus={index === 0}
                      className={`h-11 w-8 sm:h-12 sm:w-9.5 rounded-lg border text-center font-mono text-lg font-bold uppercase outline-none transition-all ${
                        digit
                          ? "border-[#FF9933] bg-[#FFF7ED] text-[#334155]"
                          : "border-[#CBD5E1] bg-white text-[#334155]"
                      } focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-2 text-center text-xs font-semibold text-[#DC2626]">
                {error}
              </p>
            )}

            {/* Clean & Simple "Sign in" Button */}
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={submit}
                disabled={!complete || busy}
                className="btn-saffron min-w-[140px] justify-center rounded-full px-6 py-2 text-xs active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{busy ? "Signing in…" : "Sign in"}</span>
              </button>
            </div>

            <p className="mt-3 text-center text-xs leading-relaxed text-[#475569]">
              IDs are valid for 180 days. Signing in with an expired ID rotates it automatically.
            </p>

            <div className="mt-3 border-t border-[#E2E8F0] pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("generate");
                }}
                disabled={busy}
                className="text-xs font-semibold text-[#FF9933] hover:underline cursor-pointer"
              >
                New here? Generate a user ID
              </button>
            </div>
          </div>
        ) : (
          /* Generate Mode */
          <div className="mt-4">
            {/* Expanded Animation Rig rotating on each character created */}
            <div className="relative mx-auto h-[290px] sm:h-[320px] w-full max-w-[360px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,#FFF7ED_0%,rgba(255,255,255,0)_70%)]"
              />
              <svg
                viewBox="0 0 400 400"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {RING_RADII.map((radius, index) => (
                  <circle
                    key={radius}
                    cx="200"
                    cy="200"
                    r={radius}
                    fill="none"
                    stroke="#FF9933"
                    strokeOpacity={
                      isGenerating
                        ? 0.4 + index * 0.08
                        : 0.22 + index * 0.05
                    }
                    strokeWidth={RING_WIDTHS[index]}
                    strokeDasharray={RING_DASHES[index]}
                    strokeLinecap="round"
                    style={{
                      transform: `rotate(${rotations[index]}deg)`,
                      transformOrigin: "center",
                      transformBox: "fill-box",
                      transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                ))}
              </svg>

              {/* 7 Display Slots */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/95 px-3 py-2 shadow-lg border border-[#FED7AA]">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  {Array.from({ length: LENGTH }).map((_, index) => {
                    const char = genDisplay[index];
                    return (
                      <span
                        key={index}
                        className={`flex h-11 w-8 sm:h-12 sm:w-9.5 items-center justify-center rounded-lg border font-mono text-lg font-bold transition-all ${
                          char
                            ? "border-[#FF9933] bg-[#FFF7ED] text-[#334155] scale-[1.03]"
                            : "border-[#CBD5E1] bg-white text-[#CBD5E1]"
                        }`}
                      >
                        {char || "•"}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-2 text-center text-xs font-semibold text-[#DC2626]">
                {error}
              </p>
            )}

            {/* Clean & Simple "Generate and sign in" Button */}
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleGenerateAndSignIn}
                disabled={busy || isGenerating}
                className="btn-saffron min-w-[170px] justify-center rounded-full px-6 py-2 text-xs active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Forging User ID…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate and sign in</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-3 text-center text-xs leading-relaxed text-[#475569]">
              IDs are valid for 180 days. Prompt to store will appear immediately upon generation.
            </p>

            <div className="mt-3 border-t border-[#E2E8F0] pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode("signin");
                }}
                disabled={busy || isGenerating}
                className="text-xs font-semibold text-[#FF9933] hover:underline cursor-pointer"
              >
                Already have an ID? Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
