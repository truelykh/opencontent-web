"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  CloseRounded as X,
} from "@mui/icons-material";

interface StudioWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudioWelcomeModal({
  isOpen,
  onClose,
}: StudioWelcomeModalProps) {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#CBD5E1] my-auto animate-in zoom-in-95 text-center flex flex-col items-center">
        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-[#334155] flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Vector Creative Illustration (Matching Ref Image 2) */}
        <div className="w-full bg-[#FFFDF7] pt-8 pb-4 px-6 flex items-center justify-center overflow-hidden border-b border-[#F1F5F9]">
          <svg
            viewBox="0 0 540 320"
            className="w-full max-w-[420px] h-auto drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Soft Glow */}
            <circle cx="270" cy="160" r="140" fill="#FFF7ED" />

            {/* Microphone Cable & Boom Mic */}
            <path
              d="M180,240 C170,180 150,130 190,90 C220,60 270,70 290,110"
              stroke="#0D9488"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="280" y="80" width="30" height="45" rx="15" fill="#2563EB" />
            <line x1="285" y1="92" x2="305" y2="92" stroke="#60A5FA" strokeWidth="2" />
            <line x1="285" y1="102" x2="305" y2="102" stroke="#60A5FA" strokeWidth="2" />

            {/* LEFT CHARACTER (Lilac/Orange Creator holding recording stylus) */}
            <circle cx="160" cy="130" r="45" fill="#DDD6FE" />
            {/* Hair */}
            <path d="M125,120 C125,95 155,75 185,90 C200,98 205,125 195,140 Z" fill="#F97316" />
            {/* Ear & Glasses */}
            <circle cx="178" cy="135" r="12" fill="#E9D5FF" stroke="#7C3AED" strokeWidth="3" />
            <circle cx="145" cy="135" r="3" fill="#4C1D95" />
            {/* Body */}
            <path
              d="M120,240 C120,190 145,175 175,175 C190,175 205,190 205,240 Z"
              fill="#F43F5E"
            />
            {/* Pattern on sweater */}
            <path d="M130,210 Q145,200 160,215 Q175,200 190,215" stroke="#FFE4E6" strokeWidth="3" fill="none" />
            <path d="M135,230 Q150,220 165,235 Q180,220 195,235" stroke="#FFE4E6" strokeWidth="3" fill="none" />
            {/* Hand raising creative stylus */}
            <path d="M190,190 L215,145 L225,152 L200,198 Z" fill="#DDD6FE" />
            <line x1="215" y1="145" x2="235" y2="115" stroke="#0D9488" strokeWidth="4" strokeLinecap="round" />

            {/* Golden Coin in foreground */}
            <ellipse cx="230" cy="275" rx="35" ry="18" fill="#FBBF24" />
            <ellipse cx="230" cy="270" rx="35" ry="18" fill="#F59E0B" />
            <ellipse cx="230" cy="270" rx="28" ry="14" fill="#FCD34D" />
            <text x="223" y="275" fill="#B45309" fontWeight="bold" fontSize="16">₹</text>

            {/* CENTER CHARACTER (Yellow/Teal Creator with ruler & analytics) */}
            <path d="M220,150 C220,105 280,105 280,150 C280,195 220,195 220,150 Z" fill="#F59E0B" />
            {/* Teal Hair */}
            <path d="M215,140 C215,90 285,90 285,140 C285,115 270,105 240,105 C220,105 215,125 215,140 Z" fill="#0D9488" />
            <circle cx="265" cy="140" r="10" fill="#059669" />
            <circle cx="240" cy="145" r="3.5" fill="#78350F" />
            {/* Smile */}
            <path d="M245,160 Q252,168 260,160" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Shirt */}
            <path d="M210,240 C210,185 240,185 275,185 C305,185 315,200 315,240 Z" fill="#F97316" />

            {/* Yellow Measuring Ruler */}
            <rect x="270" y="125" width="22" height="150" rx="3" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
            {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135].map((y, i) => (
              <line key={i} x1="270" y1={135 + y} x2={i % 2 === 0 ? "282" : "277"} y2={135 + y} stroke="#713F12" strokeWidth="1.5" />
            ))}

            {/* Bar Charts (Orange & Blue columns) */}
            <rect x="298" y="200" width="22" height="75" rx="3" fill="#DC2626" />
            <rect x="324" y="170" width="22" height="105" rx="3" fill="#3B82F6" />
            <rect x="350" y="220" width="22" height="55" rx="3" fill="#1E3A8A" />

            {/* RIGHT CHARACTER (Blue-haired videographer looking into camera) */}
            <circle cx="370" cy="140" r="40" fill="#FDE68A" />
            {/* Bright Blue Hair */}
            <path d="M345,130 C345,85 410,80 415,125 C415,140 405,150 395,140 C385,100 355,105 345,130 Z" fill="#2563EB" />
            {/* Glasses */}
            <circle cx="380" cy="142" r="14" fill="#FEF08A" stroke="#1D4ED8" strokeWidth="3" />
            <circle cx="382" cy="142" r="3.5" fill="#1E3A8A" />
            {/* Green spotted shirt */}
            <path d="M330,240 C330,175 390,175 420,240 Z" fill="#10B981" />
            <circle cx="355" cy="195" r="4" fill="#047857" />
            <circle cx="385" cy="210" r="4" fill="#047857" />
            <circle cx="370" cy="230" r="4" fill="#047857" />

            {/* Professional Video Camera & Tripod */}
            <rect x="390" y="125" width="55" height="40" rx="6" fill="#2563EB" />
            <path d="M445,135 L470,120 L470,170 L445,155 Z" fill="#1D4ED8" />
            <circle cx="415" cy="145" r="10" fill="#60A5FA" />
            <circle cx="415" cy="145" r="5" fill="#1E40AF" />
            {/* Camera mount & Tripod Legs */}
            <rect x="410" y="165" width="12" height="15" fill="#475569" />
            <line x1="416" y1="180" x2="385" y2="280" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <line x1="416" y1="180" x2="425" y2="280" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="416" y1="180" x2="465" y2="280" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        {/* Text & Button Area */}
        <div className="p-7 space-y-3 max-w-md">
          <h2 className="text-[22px] font-bold text-[#334155] tracking-tight leading-snug">
            Welcome to Opencontent Studio
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Opencontent Studio has personalized insights, the latest news &amp; insider tips, analytics, and more
          </p>

          <div className="pt-3">
            <button
              onClick={onClose}
              type="button"
              className="bg-[#334155] text-white hover:bg-[#1E293B] active:scale-95 px-8 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
