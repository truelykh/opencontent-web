"use client";

import React, { useState, useEffect } from "react";
import {
  HandshakeRounded as Handshake,
  PersonAddRounded as UserPlus,
  SendRounded as Send,
  CheckCircleRounded as CheckCircle2,
  CloseRounded as X,
  VerifiedUserRounded as ShieldCheck,
} from "@mui/icons-material";
import { CreatorChannel, VideoItem } from "@/types";
import { apiClient } from "@/lib/apiClient";

interface CreatorCollabViewProps {
  videos: VideoItem[];
}

interface CollaborationRequest {
  id: string;
  requesterChannelId: string;
  targetChannelId: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  projectTitle?: string;
  role?: string;
  revenueSplit?: string;
  note?: string;
  targetHandle?: string;
  createdAt?: string;
}

export default function CreatorCollabView({ videos }: CreatorCollabViewProps) {
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChannel, setCurrentChannel] = useState<CreatorChannel | null>(null);

  // Load active channel & real collaboration requests on mount
  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.channels.list().catch(() => ({ channels: [] })),
      apiClient.collaborations.list().catch(() => []),
    ]).then(([channelData, collabs]) => {
      if (!mounted) return;
      if (channelData?.channels && channelData.channels.length > 0) {
        setCurrentChannel(channelData.channels[0]);
      }
      setCollabRequests(collabs || []);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Modal / Form state for sending new collab request
  const [isNewCollabOpen, setIsNewCollabOpen] = useState(false);
  const [targetCreator, setTargetCreator] = useState("");
  const [projectTitle, setProjectTitle] = useState(
    videos[0]?.title || ""
  );
  const [collabRole, setCollabRole] = useState("Co-Director & Co-Author");
  const [splitRatio, setSplitRatio] = useState("50% / 50%");
  const [customNote, setCustomNote] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"friends" | "requests" | "sent">("friends");

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const isIncoming = (request: CollaborationRequest) => currentChannel?.id === request.targetChannelId;
  const visibleRequests = collabRequests.filter((request) => {
    if (activeSection === "friends") return request.status === "accepted";
    if (activeSection === "requests") return isIncoming(request) && request.status === "pending";
    return !isIncoming(request) && request.status === "pending";
  });

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChannel?.id) {
      showNotification("You must set up a channel first before inviting collaborators.");
      return;
    }

    try {
      const created = await apiClient.collaborations.create({
        requesterChannelId: currentChannel.id,
        targetHandle: targetCreator,
        projectTitle,
        role: collabRole,
        revenueSplit: splitRatio,
        note: customNote,
      });

      setCollabRequests((prev) => [created, ...prev]);
      setIsNewCollabOpen(false);
      showNotification("Collaboration invitation sent.");
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : "Failed to send collaboration request.");
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await apiClient.collaborations.updateStatus(id, "accepted");
      setCollabRequests((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "accepted" } : c))
      );
      showNotification("Collaboration accepted.");
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : "Failed to accept collaboration.");
    }
  };

  const handleDeclineRequest = async (id: string) => {
    try {
      await apiClient.collaborations.updateStatus(id, "declined");
      setCollabRequests((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "declined" } : c))
      );
      showNotification("Collaboration request declined.");
    } catch (err: unknown) {
      showNotification(err instanceof Error ? err.message : "Failed to decline collaboration.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-[#334155] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-[#334155] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-[16px] font-medium text-[#334155] tracking-tight">
            Creator collaborations
          </h2>
          <p className="text-[13px] text-[#64748B] mt-1 max-w-xl leading-relaxed">
            Send collaboration invitations to other creators and manage requests you receive.
          </p>
        </div>

        {/* CTA to send Collab Request */}
        <button
          onClick={() => setIsNewCollabOpen(true)}
          className="btn-saffron py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 self-start md:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>New friend request</span>
        </button>
      </div>

      <div className="flex items-center gap-5 border-b border-[#E2E8F0]" role="tablist" aria-label="Creator connections">
        {[
          ["friends", "Friends"],
          ["requests", "Friend requests"],
          ["sent", "Sent requests"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeSection === id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className={`border-b-2 px-1 pb-2.5 text-xs font-medium transition-colors ${
              activeSection === id
                ? "border-[#64748B] text-[#334155]"
                : "border-transparent text-[#64748B] hover:text-[#334155]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading, empty, and real request states */}
      {loading ? (
        <div className="space-y-4" aria-label="Loading collaboration requests" aria-busy="true">
          <div className="h-4 w-48 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="h-20 w-full animate-pulse rounded bg-[#F1F5F9]" />
          <div className="h-20 w-full animate-pulse rounded bg-[#F1F5F9]" />
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="border-b border-[#E2E8F0] py-12 text-center text-[#64748B]">
          <Handshake className="mx-auto mb-2 h-8 w-8 text-[#94A3B8]" />
          <h3 className="text-sm font-medium text-[#334155]">
            {activeSection === "friends" ? "No friends yet" : activeSection === "requests" ? "No friend requests" : "No sent requests"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#64748B]">
            {activeSection === "friends"
              ? "Accepted creator connections will appear here."
              : "New requests will appear here when another creator sends or receives an invitation."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleRequests.map((req) => (
          <div
            key={req.id}
            className="border-b border-[#E2E8F0] py-5 flex flex-col justify-between gap-4"
          >
            <div>
              {/* Top row: Creator identity & status badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#334155] text-white flex items-center justify-center font-black text-xs shrink-0">
                    {(req.targetHandle || "@C").replace("@", "").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#334155] flex items-center gap-1">
                      <span className="truncate">{req.targetHandle}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    </div>
                <div className="text-[11px] text-[#64748B]">
                      {currentChannel?.id === req.requesterChannelId ? "Sent by you" : "Received by you"}
                    </div>
                  </div>
                </div>

                {/* Status pill */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                    req.status === "accepted"
                      ? "bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]"
                      : req.status === "declined"
                      ? "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
                      : "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                  }`}
                >
                  {req.status === "accepted"
                    ? "✓ Active Collab"
                    : req.status === "declined"
                    ? "Declined"
                    : "Pending Review"}
                </span>
              </div>

              {/* Project title & details */}
              <div className="mt-3 border-l-2 border-[#CBD5E1] pl-3 text-xs space-y-1.5">
                <div className="font-bold text-[#334155]">
                  {req.projectTitle}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                  <span>
                    <strong>Role:</strong> {req.role}
                  </span>
                  <span>•</span>
                  <span className="text-[#16A34A] font-bold">
                    Ad Share: {req.revenueSplit}
                  </span>
                </div>
                {req.note && (
                  <p className="text-[11px] text-[#475569] italic pt-1 border-t border-[#E2E8F0]/60">
                    &ldquo;{req.note}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Actions for Incoming */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#94A3B8]">
                {req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recently"}
              </span>

              {currentChannel?.id === req.targetChannelId && req.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-2.5 py-1.5 border border-[#CBD5E1] text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg font-semibold transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg font-bold transition-colors shadow-xs"
                  >
                    Accept & Co-Publish
                  </button>
                </div>
              )}

              {req.status === "accepted" && (
                <span className="text-[11px] text-[#16A34A] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Split Contract Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Send Collab Modal */}
      {isNewCollabOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsNewCollabOpen(false)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#334155]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF6F00] text-white flex items-center justify-center">
                <Handshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#334155]">
                  New friend request
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Invite another creator to a real collaboration
                </p>
              </div>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  Target Creator Handle / Channel
                </label>
                <input
                  type="text"
                  value={targetCreator}
                  onChange={(e) => setTargetCreator(e.target.value)}
                  placeholder="@handle or channel name"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  Video Project / Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Collaborative Sci-Fi Web Series"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Proposed Role
                  </label>
                  <select
                    value={collabRole}
                    onChange={(e) => setCollabRole(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#CBD5E1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#FF6F00]"
                  >
                    <option value="Co-Director & Co-Author">Co-Director</option>
                    <option value="VFX & CGI Specialist">VFX Specialist</option>
                    <option value="Music & Audio Composer">Music Composer</option>
                    <option value="Guest Host / Speaker">Guest Speaker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Ad Revenue Split
                  </label>
                  <select
                    value={splitRatio}
                    onChange={(e) => setSplitRatio(e.target.value)}
                    className="w-full px-2.5 py-2 border border-[#CBD5E1] rounded-lg text-xs bg-white focus:outline-none focus:border-[#FF6F00]"
                  >
                    <option value="50% / 50%">50% / 50% (Equal)</option>
                    <option value="60% (You) / 40% (Them)">60% / 40%</option>
                    <option value="70% (You) / 30% (Them)">70% / 30%</option>
                    <option value="80% (You) / 20% (Them)">80% / 20%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  Message / Production Pitch
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Describe your collaboration vision and production timeline..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FF6F00] hover:bg-[#E65100] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Collaboration Proposal</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
