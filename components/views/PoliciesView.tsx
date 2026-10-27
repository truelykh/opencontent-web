"use client";

import React, { useState } from "react";
import {
  VerifiedUserRounded as ShieldCheck,
  ArticleRounded as FileText,
  RotateLeftRounded as RotateCcw,
  ApartmentRounded as Building2,
  StorageRounded as Database,
  LockRounded as Lock,
  CheckCircleRounded as CheckCircle2,
  WarningAmberRounded as AlertTriangle,
  BalanceRounded as Scale,
  AccountBalanceRounded as Landmark,
} from "@mui/icons-material";
import { PolicySubTab } from "@/types";

interface PoliciesViewProps {
  initialSubTab?: PolicySubTab;
}

export default function PoliciesView({ initialSubTab = "usage" }: PoliciesViewProps) {
  const [activeTab, setActiveTab] = useState<PolicySubTab>(initialSubTab);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] mb-2">
            <Scale className="w-3 h-3 text-[#2563EB]" />
            Legal & Regulatory Framework
          </div>
          <h2 className="text-xl font-black text-[#334155] tracking-tight">
            Platform Policies & Compliance
          </h2>
          <p className="text-[14px] text-[#475569] mt-1 max-w-xl leading-relaxed">
            Official legal documentation governing open public domain streaming, advertiser
            sponsorships, data protection, and Indian IT Intermediary compliance.
          </p>
        </div>

        {/* Tab switchers: Usage, Refund, Platform, Data, Privacy */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-[#E2E8F0] rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("usage")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "usage"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Usage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("refund")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "refund"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Refund
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("platform")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "platform"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Platform
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "data"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Data
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Privacy
          </button>
        </div>
      </div>

      {/* 1. USAGE POLICY */}
      {activeTab === "usage" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <FileText className="w-5 h-5 text-[#FF6F00]" />
            <div>
              <h3 className="font-bold text-sm text-[#334155]">
                Terms of Usage & Public Domain Fair Dealing
              </h3>
              <p className="text-[11px] text-[#64748B]">Last updated: October 2026</p>
            </div>
          </div>

          <div className="space-y-3 text-[#334155] leading-relaxed">
            <p>
              Welcome to <strong>opencontent.in</strong>. All content broadcasted on this platform
              is made available free of charge under Public Domain, Creative Commons (CC-BY, CC0),
              or Government Open Data Licenses (GODL-India).
            </p>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 space-y-2">
              <div className="font-bold text-[#334155] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Permitted Uses
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[#475569]">
                <li>Free streaming for personal, educational, research, and non-commercial public screenings.</li>
                <li>Fair dealing commentary, critique, and archival preservation in accordance with Section 52 of the Indian Copyright Act 1957.</li>
                <li>Attribution to original creators and public institutions (e.g. ISRO, Prasar Bharati).</li>
              </ul>
            </div>

            <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-lg p-3 space-y-2">
              <div className="font-bold text-[#9F1239] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                Prohibited Conduct
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[#BE123C]">
                <li>Re-uploading protected copyrighted materials without valid open license authorization.</li>
                <li>Scraping video streams via automated bots for commercial re-syndication without platform API tokens.</li>
                <li>Circumventing age gating protocols on mature categories.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. REFUND POLICY */}
      {activeTab === "refund" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <RotateCcw className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h3 className="font-bold text-sm text-[#334155]">
                Sponsor & Advertiser Refund Policy
              </h3>
              <p className="text-[11px] text-[#64748B]">Programmatic Ad Bidding & Payout Protection</p>
            </div>
          </div>

          <div className="space-y-3 text-[#334155] leading-relaxed">
            <p>
              As opencontent.in is a 100% free streaming platform for viewers, viewers are never charged
              subscription or pay-per-view fees. The following policy applies to programmatic advertisers,
              sponsors, and creator revenue settlements in INR (₹).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC]">
                <div className="font-bold text-[#334155] mb-1">Invalid Traffic & Bot Impressions</div>
                <p className="text-[#64748B]">
                  Impression audits occur every 24 hours. Any clicks or video impressions deemed
                  fraudulent or bot-generated by our automated telemetry are automatically refunded
                  to advertiser wallets within 3 business days.
                </p>
              </div>

              <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC]">
                <div className="font-bold text-[#334155] mb-1">Campaign Cancellation</div>
                <p className="text-[#64748B]">
                  Advertisers may halt unserved CPM budget at any point. Unutilized balances are returned
                  via the original payment method (UPI, Net Banking, or Corporate Cards) within 5-7 bank days.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
              <div className="font-bold text-[#166534] mb-1">Creator Payout Guarantees</div>
              <p className="text-[#15803D]">
                Verified creators receive automated INR payouts to their registered UPI ID or Bank Account
                by the 7th of every calendar month for all verified ad revenue earned.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PLATFORM POLICY & GOV MANDATES */}
      {activeTab === "platform" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Building2 className="w-5 h-5 text-[#16A34A]" />
            <div>
              <h3 className="font-bold text-sm text-[#334155]">
                Platform Governance & Intermediary Guidelines
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Ministry of Information & Broadcasting • IT Rules, 2021 & Digital Media Ethics Code
              </p>
            </div>
          </div>

          {/* Official PIB Press Release Card */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-4.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F00] text-white">
                  GOI Official Release
                </span>
                <span className="font-bold text-[#334155]">
                  Ministry of Information & Broadcasting
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono">
                PIB Delhi • Release ID: 2203034 • 12 DEC 2025
              </span>
            </div>

            <h4 className="font-extrabold text-[#334155] text-sm leading-snug">
              Government Mandates Strong Safeguards on OTT Platforms to Protect Children from Age-Inappropriate Content
            </h4>
            <p className="text-[#475569] leading-relaxed">
              Freedom of speech is guaranteed under <strong>Article 19(1)</strong> of the Constitution. At the same time, the Government highlights measures under the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong> (notified 25th February, 2021) to ensure ethical digital media practices and restrict deceptive or age-inappropriate material across online platforms.
            </p>
          </div>

          {/* 1. Mandatory 5-Category Age Classification & Child Safeguards */}
          <div className="space-y-2">
            <div className="font-bold text-[#334155] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>1. Part-III Code of Ethics & Child Protection Safeguards</span>
            </div>
            <p className="text-[#475569] leading-relaxed">
              Publishers of online curated content (OTT platforms) are required not to transmit content prohibited by law and must enforce:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
                <div className="font-bold text-[#334155] mb-1">5-Tier Age Classification</div>
                <p className="text-[11px] text-[#64748B]">
                  Classification of all curated content into 5 categories based on the General Guidelines provided in the Schedule to the IT Rules, 2021.
                </p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
                <div className="font-bold text-[#334155] mb-1">Child Access Barriers</div>
                <p className="text-[11px] text-[#64748B]">
                  Implementation of robust parental verification, age-locks, and strictly restricted feeds ensuring zero exposure to inappropriate content for children.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Three-Tier Grievance Redressal Mechanism */}
          <div className="space-y-2">
            <div className="font-bold text-[#334155] flex items-center gap-1.5 text-xs">
              <Scale className="w-4 h-4 text-[#2563EB]" />
              <span>2. Three-Tier Grievance Redressal Framework</span>
            </div>
            <p className="text-[#475569] leading-relaxed">
              As notified under the IT Rules, 2021, grievances regarding content ethics are resolved through a structured 3-tier hierarchy:
            </p>
            <div className="space-y-2">
              <div className="border border-[#BFDBFE] bg-[#EFF6FF] p-3 rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  I
                </div>
                <div>
                  <div className="font-bold text-[#1E40AF]">Level-I: Publisher Redressal (opencontent.in)</div>
                  <div className="text-[11px] text-[#2563EB] mt-0.5">
                    Grievance Officer: grievance@opencontent.in • Bangalore, India. Acknowledged within 24 hours, resolved within 15 days.
                  </div>
                </div>
              </div>

              <div className="border border-[#CBD5E1] bg-[#F8FAFC] p-3 rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#334155] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  II
                </div>
                <div>
                  <div className="font-bold text-[#334155]">Level-II: Self-Regulating Body of Publishers</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Independent industry self-regulatory body headed by a retired Supreme Court/High Court Judge to safeguard freedom of speech while ensuring ethics compliance.
                  </div>
                </div>
              </div>

              <div className="border border-[#CBD5E1] bg-[#F8FAFC] p-3 rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#475569] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  III
                </div>
                <div>
                  <div className="font-bold text-[#334155]">Level-III: Oversight Mechanism of Central Government</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Inter-Departmental Committee administered by the Ministry of Information & Broadcasting for appeals and statutory compliance.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Part-II MeitY Rules, PIB Fact Check Unit & Section 69A IT Act */}
          <div className="space-y-2">
            <div className="font-bold text-[#334155] flex items-center gap-1.5 text-xs">
              <Landmark className="w-4 h-4 text-[#FF6F00]" />
              <span>3. Fact Check Unit (FCU) & Section 69A IT Act Enforcement</span>
            </div>
            <div className="bg-[#FFF7ED] border border-[#FFEDD5] p-3 rounded-lg space-y-1.5 text-[#9A3412]">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6F00]" />
                PIB Fact Check Unit (FCU) Integration
              </div>
              <p className="text-[11px] leading-relaxed">
                Intermediaries are bound under Part-II of the IT Rules (MeitY) to prevent patently false or misleading information. The PIB Fact Check Unit (FCU) verifies news relating to the Government of India. Under <strong>Section 69A of the IT Act, 2000</strong>, statutory blocking orders are executed for content threatening the sovereignty, integrity, defense, security of the State, or public order.
              </p>
            </div>
          </div>

          {/* 4. Support for the Indian Creators' Economy */}
          <div className="space-y-2">
            <div className="font-bold text-[#334155] flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>4. National Creator Economy Initiatives (WAVES 2025)</span>
            </div>
            <p className="text-[#475569] leading-relaxed">
              The Government highlights active support for Indian creators through landmark digital initiatives:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div className="font-bold text-[#334155] mb-0.5">WAVES 2025 & CIC</div>
                <p className="text-[10px] text-[#64748B]">
                  World Audio Visual Summit & Create in India Challenges providing grassroots performers with global digital visibility.
                </p>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div className="font-bold text-[#334155] mb-0.5">WAVES Bazaar</div>
                <p className="text-[10px] text-[#64748B]">
                  National marketplace connecting verified Indian creators directly with global buyers, distributors, and investors.
                </p>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div className="font-bold text-[#334155] mb-0.5">Prasar Bharati WAVES OTT</div>
                <p className="text-[10px] text-[#64748B]">
                  Unified national platform promoting authentic regional language content, cultural storytelling, and creator monetization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DATA POLICY */}
      {activeTab === "data" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Database className="w-5 h-5 text-[#8B5CF6]" />
            <div>
              <h3 className="font-bold text-sm text-[#334155]">
                Data Governance & Indian DPDP Act 2023
              </h3>
              <p className="text-[11px] text-[#64748B]">Digital Personal Data Protection Compliance</p>
            </div>
          </div>

          <div className="space-y-3 text-[#334155] leading-relaxed">
            <p>
              We prioritize sovereign Indian data governance and strict adherence to the Digital
              Personal Data Protection Act (DPDP Act 2023).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC]">
                <div className="font-bold text-[#334155] mb-1">Local Data Residency</div>
                <p className="text-[#64748B]">
                  All viewer telemetry, video metadata, and payment records reside exclusively in
                  certified Tier-4 data centers within the geographical territory of India.
                </p>
              </div>

              <div className="border border-[#E2E8F0] rounded-lg p-3 bg-[#F8FAFC]">
                <div className="font-bold text-[#334155] mb-1">Zero Tracking for Kids (0-12)</div>
                <p className="text-[#64748B]">
                  Under our Kids Zone safety charter, we do not store advertising identifiers, IP addresses,
                  or behavioral profiles for underage viewers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PRIVACY POLICY */}
      {activeTab === "privacy" && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Lock className="w-5 h-5 text-[#059669]" />
            <div>
              <h3 className="font-bold text-sm text-[#334155]">
                Privacy Charter & Viewer Rights
              </h3>
              <p className="text-[11px] text-[#64748B]">Transparency, Security & Encryption</p>
            </div>
          </div>

          <div className="space-y-3 text-[#334155] leading-relaxed">
            <p>
              Your privacy is fundamental. We do not sell your personal details to third-party data brokers.
            </p>

            <div className="space-y-2">
              <div className="border border-[#E2E8F0] rounded-lg p-3">
                <div className="font-bold text-[#334155]">Data We Collect</div>
                <p className="text-[#64748B] mt-1">
                  Only essential operational signals: video play count, bandwidth streaming bitrate for
                  buffering adaptation, and creator account credentials needed for monetization settlements.
                </p>
              </div>

              <div className="border border-[#E2E8F0] rounded-lg p-3">
                <div className="font-bold text-[#334155]">Right to Erasure & Account Deletion</div>
                <p className="text-[#475569] mt-1">
                  Users and creators can request complete deletion of watch history and profile records
                  at any time from Account Settings or by emailing privacy@opencontent.in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
