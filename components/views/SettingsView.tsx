"use client";

import React, { useState } from "react";
import {
  SettingsRounded as Settings,
  TuneRounded as Sliders,
  ManageAccountsRounded as UserCog,
  LockRounded as Lock,
  VerifiedUserRounded as ShieldCheck,
  NotificationsNoneRounded as Bell,
  PublicRounded as Globe,
  LaptopRounded as Laptop,
  SmartphoneRounded as Smartphone,
  SaveRounded as Save,
  CheckCircleRounded as CheckCircle2,
  CurrencyRupeeRounded as IndianRupee,
  CampaignRounded as Megaphone,
} from "@mui/icons-material";
import HorizontalPageHeader from "../common/HorizontalPageHeader";

export type SettingsSubTab = "account" | "creator" | "security" | "ads";

interface SettingsViewProps {
  initialSubTab?: SettingsSubTab;
}

export default function SettingsView({ initialSubTab = "account" }: SettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(initialSubTab);

  // Account Settings state
  const [primaryLanguage, setPrimaryLanguage] = useState("English / Hindi");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [bandwidthSaver, setBandwidthSaver] = useState(false);

  // Creator Settings state
  const [autoMonetize, setAutoMonetize] = useState(true);
  const [defaultLicense, setDefaultLicense] = useState("CC-BY-4.0");
  const [contentIdAutoScan, setContentIdAutoScan] = useState(true);
  const [allowCollabRequests, setAllowCollabRequests] = useState(true);
  const [defaultResolution, setDefaultResolution] = useState("1080p");

  // Security Settings state

  // Ads Settings state
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [familySafeFiltering, setFamilySafeFiltering] = useState(true);
  const [preRollAds, setPreRollAds] = useState(true);
  const [midRollInterval, setMidRollInterval] = useState("7");
  const [autoCpmFloor, setAutoCpmFloor] = useState("120");

  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Settings updated successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-[#334155] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-[#334155] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{notification}</span>
        </div>
      )}

      <HorizontalPageHeader
        icon={Settings}
        title="Settings & Configurations"
        description="Manage your available application preferences."
        actions={(
          /* Tab switchers in requested order: account, creator, security, ads */
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1">
          <button
            type="button"
            onClick={() => setActiveSubTab("account")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === "account"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Account
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("creator")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === "creator"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Creator
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("security")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === "security"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Security
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("ads")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
              activeSubTab === "ads"
                ? "bg-white text-[#FF9933] shadow-xs"
                : "text-[#64748B] hover:text-[#334155]"
            }`}
          >
            Ad Preferences
          </button>
          </div>
        )}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* SUBTAB 1: ACCOUNT SETTINGS */}
        {activeSubTab === "account" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <UserCog className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-bold text-sm text-[#334155]">
                Account & Viewing Preferences
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Language & Regional Subtitles
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00] bg-white"
                    >
                      <option value="English / Hindi">English + Hindi (Default)</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Bengali">বাংলা (Bengali)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Data & Bandwidth Optimization
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="dataSaver"
                      checked={bandwidthSaver}
                      onChange={(e) => setBandwidthSaver(e.target.checked)}
                      className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                    />
                    <label htmlFor="dataSaver" className="text-[#334155] cursor-pointer font-medium">
                      Enable mobile data saver mode for video streaming
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
                <div className="font-bold text-[#334155] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#FF6F00]" />
                  Notification Preferences
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <div>
                    <div className="font-bold text-[#334155]">Email Alerts for Payouts & Claims</div>
                    <div className="text-[11px] text-[#64748B]">
                      Receive weekly INR ₹ payout invoices and Content ID copyright notices.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                  <div>
                    <div className="font-bold text-[#334155]">SMS Alerts for Security Verification</div>
                    <div className="text-[11px] text-[#64748B]">
                      Get instant OTPs for new logins or banking payout changes.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: CREATOR SETTINGS */}
        {activeSubTab === "creator" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Sliders className="w-4 h-4 text-[#FF6F00]" />
              <h3 className="font-bold text-sm text-[#334155]">
                Creator Studio & Upload Defaults
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div>
                  <div className="font-bold text-[#334155]">
                    Auto-Enable Ad Monetization on New Uploads
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Automatically inject pre-roll, mid-roll, and banner ads to earn INR (₹)
                    revenue.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoMonetize}
                  onChange={(e) => setAutoMonetize(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div>
                  <div className="font-bold text-[#334155]">
                    Content ID Copyright Auto-Match
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Detect acoustic fingerprints and visual duplicates across newly uploaded videos.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={contentIdAutoScan}
                  onChange={(e) => setContentIdAutoScan(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div>
                  <div className="font-bold text-[#334155]">
                    Allow Creator Collaboration Requests
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Permit verified Indian creators to invite your channel to revenue-split
                    co-productions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowCollabRequests}
                  onChange={(e) => setAllowCollabRequests(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Default Public Domain / Creative Commons License
                  </label>
                  <select
                    value={defaultLicense}
                    onChange={(e) => setDefaultLicense(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00] bg-white"
                  >
                    <option value="CC0">Creative Commons Zero (CC0 - Public Domain)</option>
                    <option value="CC-BY-4.0">Creative Commons CC-BY 4.0</option>
                    <option value="GODL-India">Government Open Data License (GODL-India)</option>
                    <option value="Standard-Creator">Standard opencontent.in Open Free License</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Default Transcoding Target
                  </label>
                  <select
                    value={defaultResolution}
                    onChange={(e) => setDefaultResolution(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00] bg-white"
                  >
                    <option value="1080p">1080p Full HD (60 FPS)</option>
                    <option value="4k">4K Ultra HD (HDR)</option>
                    <option value="720p">720p Optimized Bandwidth</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: SECURITY SETTINGS */}
        {activeSubTab === "security" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Lock className="w-4 h-4 text-[#16A34A]" />
              <h3 className="font-bold text-sm text-[#334155]">
                Security & Multi-Factor Authentication
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#14532D]">
                      Two-Factor Authentication (2FA) Active
                    </div>
                    <div className="text-[11px] text-[#15803D]">
                      Secured via Indian mobile OTP (+91 98765 43210) & Authenticator App.
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#16A34A] bg-white px-2.5 py-1 rounded border border-[#86EFAC]">
                  Enabled
                </span>
              </div>

              {/* Active Sessions */}
              <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC] space-y-3">
                <div className="font-bold text-[#334155] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-[#64748B]" />
                    Active Device Sessions
                  </span>
                  <span className="text-[10px] text-[#16A34A] font-bold">2 Devices Online</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-[#2563EB]" />
                      <div>
                        <div className="font-bold text-[#334155]">MacBook Pro — Chrome 128</div>
                        <div className="text-[10px] text-[#64748B]">Bengaluru, India • Current Active Session</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      This Device
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#64748B]" />
                      <div>
                        <div className="font-bold text-[#334155]">OnePlus 11 — Android App</div>
                        <div className="text-[10px] text-[#64748B]">Bengaluru, India • Last active 42 mins ago</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[10px] text-[#DC2626] font-bold hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: ADS PREFERENCES & MONETIZATION CONTROLS */}
        {activeSubTab === "ads" && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Megaphone className="w-4 h-4 text-[#FF6F00]" />
              <h3 className="font-bold text-sm text-[#334155]">
                Ad Preferences & Programmatic Sponsor Controls
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div>
                  <div className="font-bold text-[#334155]">
                    Personalized Indian Brand Ads
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Allow relevant Indian tech, retail, and education brand sponsorships based on viewing history.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={personalizedAds}
                  onChange={(e) => setPersonalizedAds(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div>
                  <div className="font-bold text-[#334155]">
                    Family-Safe & Non-Intrusive Ad Filtering
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Enforce zero gambling, betting, or predatory financial ad placement across all streams.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={familySafeFiltering}
                  onChange={(e) => setFamilySafeFiltering(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div>
                  <div className="font-bold text-[#334155]">
                    Allow Pre-Roll Video Ads (5-Second Skip)
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Support free video streaming with skippable 5-second brand introductions before playback.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preRollAds}
                  onChange={(e) => setPreRollAds(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F00] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Mid-Roll Ad Spacing Interval
                  </label>
                  <select
                    value={midRollInterval}
                    onChange={(e) => setMidRollInterval(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00] bg-white"
                  >
                    <option value="5">Every 5 minutes (Maximum Creator Payout)</option>
                    <option value="7">Every 7 minutes (Balanced Experience)</option>
                    <option value="12">Every 12 minutes (Minimal Interruption)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Minimum Automated CPM Floor (INR ₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={autoCpmFloor}
                      onChange={(e) => setAutoCpmFloor(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[#CBD5E1] rounded-lg text-xs focus:outline-none focus:border-[#FF6F00] bg-white"
                      placeholder="120"
                    />
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-1">
                    Ads below this CPM won&apos;t be served to your audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-saffron py-2 px-5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
