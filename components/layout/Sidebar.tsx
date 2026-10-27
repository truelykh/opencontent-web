"use client";

import React, { useState } from "react";
import { CloseRounded as X } from "@mui/icons-material";
import {
  AgeProfile,
  SettingsSubTab,
  PolicySubTab,
  ProfileSubTab,
  ShopSubTab,
  StudioSubTab,
  AdSubTab,
  GovernanceSubTab,
} from "@/types";
import { BrandLockup } from "./BrandLogo";
import { PrimaryNavigation } from "./PrimaryNavigation";
import { NavItem } from "./NavItem";
import { LibrarySection } from "./sidebarSections/LibrarySection";
import { SIDEBAR_PRODUCT_NAVIGATION, SIDEBAR_SECONDARY_NAVIGATION } from "@/lib/navigation";

export interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedAgeProfile?: AgeProfile;
  setSelectedAgeProfile?: (profile: AgeProfile) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onOpenUpload: () => void;
  studioSubTab?: StudioSubTab;
  setStudioSubTab?: (subTab: StudioSubTab) => void;
  settingsSubTab?: SettingsSubTab;
  setSettingsSubTab?: (subTab: SettingsSubTab) => void;
  policySubTab?: PolicySubTab;
  setPolicySubTab?: (subTab: PolicySubTab) => void;
  profileSubTab?: ProfileSubTab;
  setProfileSubTab?: (subTab: ProfileSubTab) => void;
  shopSubTab?: ShopSubTab;
  setShopSubTab?: (subTab: ShopSubTab) => void;
  adCenterSubTab?: AdSubTab;
  setAdCenterSubTab?: (subTab: AdSubTab) => void;
  governanceSubTab?: GovernanceSubTab;
  setGovernanceSubTab?: (subTab: GovernanceSubTab) => void;
  /** Called after any navigation, used to close the mobile drawer */
  onNavigate?: () => void;
  activeNavLabel?: string;
  onSelectNavLabel?: (label: string) => void;
}

export type SectionId =
  | "library";

/**
 * Sidebar
 * ----------------------------------------------------
 * Single Responsibility: Orchestrates the sidebar navigation container and mobile drawer rail.
 * Delegates section rendering to focused, single-responsibility sub-components.
 * Strictly zero mock data, zero hardcoded badge junk.
 */
export default function Sidebar({
  currentTab,
  setCurrentTab,
  selectedCategory,
  setSelectedCategory,
  setStudioSubTab,
  setSettingsSubTab,
  setShopSubTab,
  setPolicySubTab,
  onNavigate,
  onSelectNavLabel,
}: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    library: false,
  });

  const toggleSection = (section: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Derive which section should be highlighted/locked based on active tab
  const getActiveSection = (): SectionId | null => {
    if (["subscriptions", "favourites", "history"].includes(currentTab)) return "library";
    return null;
  };

  const activeSection = getActiveSection();

  const isSectionOpen = (section: SectionId) =>
    openSections[section] || activeSection === section;

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    onNavigate?.();
  };

  const handlePrimaryNavigate = (tab: string, category?: string, label?: string) => {
    if (category) setSelectedCategory(category);
    if (label) onSelectNavLabel?.(label);
    handleNavigate(tab);
  };

  return (
    <aside className="mobile-sidebar flex h-full min-h-dvh w-full shrink-0 flex-col select-none border-r border-[var(--oc-border)] bg-[var(--oc-background)] lg:w-56">
      {/* Brand Header */}
      <div className="h-24 border-b border-[var(--oc-border)] flex items-center px-9 gap-4 shrink-0 lg:h-16 lg:px-4 lg:gap-2">
        <BrandLockup className="flex-1" />

        {/* Closes the drawer on small screens */}
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close navigation"
          className="lg:hidden p-2 -mr-2 rounded-lg text-[var(--oc-text-secondary)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)] transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Rail with Scrollbar */}
      <div className="saffron-scrollbar flex-1 space-y-5 overflow-y-auto px-9 py-8 lg:space-y-3 lg:px-3 lg:py-4">
        <PrimaryNavigation
          currentTab={currentTab}
          selectedCategory={selectedCategory}
          onNavigate={handlePrimaryNavigate}
        />

        <LibrarySection
          isOpen={isSectionOpen("library")}
          onToggle={() => toggleSection("library")}
          isLocked={activeSection === "library"}
          currentTab={currentTab}
          onNavigate={(tab, label) => {
            onSelectNavLabel?.(label);
            handleNavigate(tab);
          }}
        />

        <nav aria-label="Products" className="space-y-0.5">
          {SIDEBAR_PRODUCT_NAVIGATION.map((item) => {
            const active = item.id === "shop"
              ? currentTab === "shop"
              : item.id === "studio"
                ? ["studio", "manage", "channels", "collab", "governance"].includes(currentTab)
                : currentTab === "ads";
            return (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={active}
                external={item.external}
                onClick={() => {
                  onSelectNavLabel?.(item.label);
                  if (item.id === "shop") setShopSubTab?.("store");
                  if (item.id === "studio") setStudioSubTab?.("dashboard");
                  handleNavigate(item.tab);
                }}
              />
            );
          })}
        </nav>

        <div className="my-2 border-t border-[var(--oc-border)]" />

        <nav aria-label="Account and support" className="space-y-0.5">
          {SIDEBAR_SECONDARY_NAVIGATION.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentTab === item.tab || (item.id === "help" && ["legal", "microservices", "governance"].includes(currentTab))}
              onClick={() => {
                onSelectNavLabel?.(item.label);
                if (item.id === "settings") setSettingsSubTab?.("account");
                if (item.id === "help") setPolicySubTab?.("usage");
                handleNavigate(item.tab);
              }}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
