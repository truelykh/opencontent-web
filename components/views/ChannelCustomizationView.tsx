"use client";

import { ContentImage } from "../common/ContentImage";

import React, { useState, useRef } from "react";
import {
  ContentCopyRounded as Copy,
  CheckRounded as Check,
  AddRounded as Plus,
  DeleteOutlineRounded as Trash2,
  AutoAwesomeRounded as Sparkles,
  PlayArrowRounded as Play,
  LockRounded as Lock,
  WarningAmberRounded as AlertTriangle,
} from "@mui/icons-material";
import { CreatorChannel } from "@/types";
import { apiClient } from "@/lib/apiClient";

interface ChannelCustomizationViewProps {
  channel: CreatorChannel | null;
  onChannelUpdated?: (channel: CreatorChannel) => void;
  onViewChannel?: () => void;
}

export default function ChannelCustomizationView(props: ChannelCustomizationViewProps) {
  return <ChannelCustomizationContent key={props.channel?.id ?? "no-channel"} {...props} />;
}

function ChannelCustomizationContent({
  channel,
  onChannelUpdated,
  onViewChannel,
}: ChannelCustomizationViewProps) {
  const subTab: string = "profile";
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(channel?.name || "");
  const [handle, setHandle] = useState(channel?.handle || "");
  const [description, setDescription] = useState(channel?.description || "");
  const [avatar, setAvatar] = useState(channel?.avatar || "");
  const [banner, setBanner] = useState(channel?.bannerUrl || "");
  const [watermark, setWatermark] = useState(channel?.watermarkUrl || "");
  const [contactEmail, setContactEmail] = useState(channel?.contactEmail || "");
  const [links, setLinks] = useState<{ title: string; url: string }[]>(channel?.externalLinks || []);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Hidden file inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const channelCanonicalUrl = channel?.id
    ? `https://www.opencontent.in/channel/${channel.id}`
    : "";

  const handleCopyChannelUrl = () => {
    if (!channelCanonicalUrl) return;
    navigator.clipboard?.writeText(channelCanonicalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleAddLink = () => {
    setLinks([...links, { title: "", url: "" }]);
    setHasChanges(true);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleLinkChange = (index: number, field: "title" | "url", val: string) => {
    const updated = [...links];
    updated[index][field] = val;
    setLinks(updated);
    setHasChanges(true);
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setter(reader.result);
          setHasChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      const updates = {
        name: name.trim(),
        handle: handle.trim(),
        description: description.trim(),
        avatar: avatar || channel?.avatar,
        bannerUrl: banner,
        watermarkUrl: watermark,
        category: channel?.category || "Entertainment",
      };

      if (!channel?.id) {
        throw new Error("Create a channel before publishing customization.");
      }
      const res = await apiClient.channels.update(channel.id, updates);
      if (res && res.channel) {
        onChannelUpdated?.(res.channel);
        setHasChanges(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        throw new Error(res.error || res.message || "Failed to update channel");
      }
    } catch (err: unknown) {
      console.error("Failed to publish customization:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to publish channel customization");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (channel) {
      setName(channel.name);
      setHandle(channel.handle);
      setDescription(channel.description || "");
      setAvatar(channel.avatar || "");
      setBanner(channel.bannerUrl || "");
      setWatermark(channel.watermarkUrl || "");
      setContactEmail(channel.contactEmail || "");
      setHasChanges(false);
    }
  };

  const initialLetter = (name.trim() || channel?.name || "?").charAt(0).toUpperCase();

  if (!channel) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center border-b border-[#E2E8F0] px-6 py-16 text-center">
        <h1 className="text-[16px] font-medium tracking-tight text-[#334155]">
          Channel customization
        </h1>
        <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#64748B]">
          Create a channel before customizing its profile, branding, or links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#334155] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-3">
          <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold">Changes published</p>
            <p className="text-[11px] text-[#94A3B8]">Your channel profile has been updated on Opencontent.</p>
          </div>
        </div>
      )}

      {/* Customization header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-[16px] font-normal tracking-tight text-[#334155] leading-tight">
            Channel customization
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage branding elements, description, handles, and external links for <span className="font-semibold text-[#334155]">{name}</span>.
          </p>
        </div>

        {/* Top Actions: View channel, Cancel, Publish */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onViewChannel}
            className="px-4 py-1.5 rounded-full border border-[#CBD5E1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            View channel
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              hasChanges ? "text-[#64748B] hover:text-[#334155]" : "text-[#CBD5E1] cursor-not-allowed"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving}
            className="px-5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs bg-[#334155] text-white hover:bg-[#FF9933] cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            {isSaving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* PROFILE TAB CONTENT */}
      {subTab === "profile" && (
        <div className="divide-y divide-[#F1F5F9] space-y-8">
          {/* SECTION 1: Banner Image (Matching Ref Image 3) */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Banner image</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                This image will appear across the top of your channel
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Responsive Device Mockup Graphic */}
              <div className="relative w-64 h-36 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl overflow-hidden flex items-center justify-center p-3 shrink-0 shadow-inner">
                {banner ? (
                  <ContentImage src={banner} alt="Banner preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Desktop screen with red banner */}
                    <div className="w-40 h-24 bg-white border-2 border-[#334155] rounded-t-md relative flex flex-col items-center">
                      <div className="w-full h-8 bg-[#E11D48] flex items-center justify-center">
                        <span className="text-[8px] font-mono font-bold text-white tracking-widest uppercase">BANNER</span>
                      </div>
                      <div className="w-full flex-1 bg-white" />
                      {/* Stand */}
                      <div className="absolute -bottom-2 w-12 h-2 bg-[#94A3B8] rounded-b" />
                    </div>

                    {/* Smartphone overlap */}
                    <div className="absolute bottom-1 right-3 w-8 h-14 bg-white border border-[#334155] rounded-md overflow-hidden shadow-md flex flex-col">
                      <div className="w-full h-4 bg-[#E11D48]" />
                      <div className="w-full flex-1 bg-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions & Upload */}
              <div className="space-y-3 max-w-md">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  For the best results on all devices, use an image that&apos;s at least 2048 x 1152 pixels and 6MB or less.
                </p>
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={(e) => handleFileSelect(e, setBanner)}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-5 py-2 rounded-full border border-[#CBD5E1] text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: Picture (Matching Ref Image 3) */}
          <div className="pt-8 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Picture</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Your profile picture will appear where your channel is presented on Opencontent, like next to your videos and comments
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Circular Avatar Preview */}
              <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-2 border-[#CBD5E1] flex items-center justify-center shadow-xs">
                {avatar ? (
                  <ContentImage src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#E11D48] text-white flex items-center justify-center text-5xl font-normal font-sans">
                    {initialLetter}
                  </div>
                )}
              </div>

              {/* Instructions & Upload */}
              <div className="space-y-3 max-w-md">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  It&apos;s recommended to use a picture that&apos;s at least 98 x 98 pixels and 4MB or less. Use a PNG or GIF (no animations) file. Make sure your picture follows the Opencontent Community Guidelines.
                </p>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={(e) => handleFileSelect(e, setAvatar)}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-5 py-2 rounded-full border border-[#CBD5E1] text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: Name (Matching Ref Image 3 & 4) */}
          {channelCanonicalUrl && <div className="pt-8 space-y-3 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Name</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Choose a channel name that represents you and your content. Changes made to your name and picture are visible only on Opencontent. You can change your name twice in 14 days.
              </p>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Your channel name"
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs text-[#334155] outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
            />
          </div>}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 4: Handle (Matching Ref Image 4) */}
          <div className="pt-8 space-y-3 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#334155] flex items-center gap-2">
                  <span>Handle</span>
                  {channel?.canEditHandle === false && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Lock className="w-3 h-3 text-amber-700" />
                      Locked ({channel.daysUntilUnlock || 14}d left)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Your handle is a unique @name that identifies your channel. Once edited, your handle cannot be changed for 14 days.
                </p>
              </div>
            </div>

            {channel?.canEditHandle === false && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  This handle was updated recently and is locked for 14 days. You can change it again in <strong>{channel.daysUntilUnlock || 14} days</strong>.
                </span>
              </div>
            )}

            <div>
              <input
                type="text"
                disabled={channel?.canEditHandle === false}
                value={handle}
                onChange={(e) => {
                  let v = e.target.value.trim();
                  if (!v.startsWith("@")) v = `@${v}`;
                  setHandle(v);
                  setHasChanges(true);
                }}
                placeholder="@yourhandle"
                className={`w-full rounded-xl border px-4 py-2.5 text-xs font-mono outline-none transition-all ${
                  channel?.canEditHandle === false
                    ? "bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed"
                    : "border-[#CBD5E1] bg-white text-[#334155] focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933]"
                }`}
              />
              <p className="text-[11px] text-[#64748B] mt-1.5 font-mono">
                https://www.opencontent.in/{handle}
              </p>
            </div>
          </div>

          {/* SECTION 5: Description (Matching Ref Image 4) */}
          <div className="pt-8 space-y-3 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Description</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Tell viewers about your channel. Your description will appear in the About section of your channel and search results, among other places.
              </p>
            </div>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Tell viewers about your channel..."
              className="w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-xs text-[#334155] outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] saffron-scrollbar leading-relaxed"
            />

            <div>
              <button
                type="button"
                onClick={() => alert("Multilingual translation: Subtitle tracks & Hindi/Regional descriptions can be added.")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add language</span>
              </button>
            </div>
          </div>

          {/* SECTION 6: Channel URL (Matching Ref Images 4 & 5) */}
          <div className="pt-8 space-y-3 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Channel URL</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                This is the standard web address for your channel. It includes your unique channel ID, which is the numbers and letters at the end of the URL.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5">
              <span className="text-xs text-[#334155] font-mono truncate flex-1">
                {channelCanonicalUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyChannelUrl}
                className="text-[#64748B] hover:text-[#334155] transition-colors p-1 rounded-md hover:bg-white"
                title="Copy channel URL"
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* SECTION 7: Links (Matching Ref Image 5) */}
          <div className="pt-8 space-y-3 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Links</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Share external links with your viewers. They&apos;ll be visible on your channel profile and about page.
              </p>
            </div>

            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(idx, "title", e.target.value)}
                    placeholder="Link title (e.g. Website, Twitter)"
                    className="w-1/3 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#334155] outline-none focus:border-[#FF9933]"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, "url", e.target.value)}
                    placeholder="URL (https://...)"
                    className="flex-1 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#334155] outline-none focus:border-[#FF9933] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add link</span>
              </button>
            </div>
          </div>

          {/* SECTION 8: Contact info (Matching Ref Image 5) */}
          <div className="pt-8 space-y-3 max-w-2xl">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Contact info</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Let people know how to contact you with business inquiries. The email address you enter may appear in the About section of your channel and be visible to viewers.
              </p>
            </div>

            <div className="relative rounded-xl border border-[#CBD5E1] bg-white px-4 py-2">
              <label className="block text-[10px] font-medium text-[#64748B]">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Email address"
                className="w-full text-xs text-[#334155] outline-none bg-transparent"
              />
            </div>
          </div>

          {/* SECTION 9: Video Watermark (Matching Ref Image 5) */}
          <div className="pt-8 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#334155]">Video watermark</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                The watermark will appear on your videos in the right-hand corner of the video player
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Video Player Preview Mockup */}
              <div className="relative w-64 h-36 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl overflow-hidden flex flex-col justify-between p-2 shadow-inner shrink-0">
                <div className="flex-1 flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#CBD5E1]" />
                </div>

                {/* Right Bottom Corner Watermark Graphic */}
                <div className="absolute bottom-6 right-3 w-8 h-8 rounded border border-dashed border-[#CBD5E1] bg-white flex items-center justify-center shadow-xs">
                  {watermark ? (
                    <ContentImage src={watermark} alt="Watermark" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="w-6 h-6 bg-[#E11D48]/10 rounded flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                    </div>
                  )}
                </div>

                {/* Video controls mockup */}
                <div className="w-full flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </div>
                  <div className="w-32 h-1 bg-[#E2E8F0] rounded-full mx-2" />
                  <span>0:00 / 4:12</span>
                </div>
              </div>

              {/* Instructions & Upload */}
              <div className="space-y-3 max-w-md">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  An image that&apos;s 150 x 150 pixels is recommended. Use a PNG, GIF (no animations), BMP, or JPEG file that&apos;s 1MB or less.
                </p>
                <input
                  type="file"
                  ref={watermarkInputRef}
                  onChange={(e) => handleFileSelect(e, setWatermark)}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => watermarkInputRef.current?.click()}
                  className="px-5 py-2 rounded-full border border-[#CBD5E1] text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOME TAB CONTENT */}
      {subTab === "home" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-xs space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-sm font-bold text-[#334155]">Home Tab Layout</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Customize your channel homepage with featured video trailers, popular uploads shelf, and public playlists for returning subscribers.
            </p>
            <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-[#334155]">
                <span>Channel trailer for people who haven&apos;t subscribed</span>
                <button className="text-[#FF9933] hover:underline">Add</button>
              </div>
              <p className="text-[11px] text-[#64748B]">Share a preview of your channel with potential subscribers.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
