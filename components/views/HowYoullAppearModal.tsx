"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  WarningAmberRounded as AlertTriangle,
  CloseRounded as X,
} from "@mui/icons-material";

interface HowYoullAppearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    handle: string;
    category: string;
    subcategory?: string;
    avatar?: string;
  }) => Promise<void>;
  channelsCount: number;
}

export default function HowYoullAppearModal({
  isOpen,
  onClose,
  onSubmit,
}: HowYoullAppearModalProps) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [category] = useState("Entertainment");
  const [subcategory] = useState("Movies & TV Shows");
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [avatar] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const isHandleEmpty = !handle.trim() || handle.trim() === "@";
  const showHandleError = handleTouched && isHandleEmpty;
  const isFormValid = name.trim().length > 0 && !isHandleEmpty && policiesAccepted && !submitting;

  const handleNameChange = (val: string) => {
    setName(val);
    setErrorMsg(null);
    if (!handleTouched) {
      const slug = val.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18);
      setHandle(slug ? `@${slug}` : "");
    }
  };

  const handleHandleChange = (val: string) => {
    setHandleTouched(true);
    setErrorMsg(null);
    let clean = val.trim();
    if (!clean.startsWith("@")) clean = `@${clean}`;
    setHandle(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandleTouched(true);

    if (!name.trim()) {
      setErrorMsg("Please enter a channel name.");
      return;
    }
    if (isHandleEmpty) {
      setErrorMsg("Add a handle to continue.");
      return;
    }
    if (!policiesAccepted) {
      setErrorMsg("Please agree to the Opencontent Studio policies to continue.");
      return;
    }

    // Check restrictions
    const norm = category.toLowerCase();
    if (norm === "gov" || norm === "government" || norm === "doctor" || norm === "medical") {
      setErrorMsg("Category 'gov' and 'doctor' are strictly reserved for official verification.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        handle: handle.trim(),
        category,
        subcategory,
        avatar: avatar || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create channel";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl w-full max-w-[560px] overflow-hidden shadow-2xl border border-[#CBD5E1] my-auto animate-in zoom-in-95 p-8 flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-[#64748B] hover:text-[#334155] p-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Title (Matching Ref Image 1) */}
        <h2 className="text-[22px] font-bold text-[#334155] tracking-tight mb-6">
          How you&apos;ll appear
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input Field */}
          <div>
            <div className="relative rounded-lg border border-[#CBD5E1] focus-within:border-[#1A73E8] focus-within:ring-1 focus-within:ring-[#1A73E8] transition-all bg-white px-3.5 pt-2 pb-1.5">
              <label className="block text-[11px] font-medium text-[#64748B]">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Name"
                className="w-full text-sm text-[#334155] outline-none bg-transparent placeholder-[#94A3B8]"
              />
            </div>
          </div>

          {/* Handle Input Field with Red Error State matching Ref Image 1 */}
          <div>
            <div
              className={`relative rounded-lg border transition-all bg-white px-3.5 pt-2 pb-1.5 ${
                showHandleError
                  ? "border-[#DC2626] ring-1 ring-[#DC2626]"
                  : "border-[#CBD5E1] focus-within:border-[#1A73E8] focus-within:ring-1 focus-within:ring-[#1A73E8]"
              }`}
            >
              <label
                className={`block text-[11px] font-medium ${
                  showHandleError ? "text-[#DC2626]" : "text-[#64748B]"
                }`}
              >
                Handle
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  required
                  value={handle}
                  onFocus={() => {
                    if (!handle) setHandle("@");
                  }}
                  onBlur={() => setHandleTouched(true)}
                  onChange={(e) => handleHandleChange(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full text-sm text-[#334155] outline-none bg-transparent font-mono"
                />
              </div>
            </div>
            {showHandleError && (
              <p className="text-xs text-[#DC2626] mt-1.5">
                Add a handle to continue
              </p>
            )}
          </div>

          <label className="flex items-start gap-2.5 pt-2 text-[11px] leading-relaxed text-[#64748B]">
            <input type="checkbox" checked={policiesAccepted} onChange={(e) => setPoliciesAccepted(e.target.checked)} className="mt-0.5 accent-[#64748B]" />
            <span>I agree to the Opencontent Studio policies and understand that my channel name and handle will be public.</span>
          </label>

          {/* Modal Action Buttons (Cancel / Create channel) matching Ref Image 1 */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-sm font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                isFormValid
                  ? "bg-[#334155] text-white hover:bg-[#1E293B] active:scale-95"
                  : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed shadow-none"
              }`}
            >
              {submitting ? "Creating..." : "Create channel"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
