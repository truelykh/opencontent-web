"use client";

import React from "react";
import {
  BarChartRounded as BarChart3,
  LayersRounded as Layers,
  CampaignRounded as Megaphone,
  CurrencyRupeeRounded as IndianRupee,
} from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { AdSubTab, SettingsSubTab } from "@/types";

export interface AdCenterSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  adCenterSubTab?: AdSubTab;
  settingsSubTab: SettingsSubTab;
  activeNavLabel?: string;
  onSelectAdCenterSubTab?: (subTab: AdSubTab) => void;
  onSelectSettingsSubTab: (subTab: SettingsSubTab) => void;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * AdCenterSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation for Open Adcentre monetization suite.
 * Fixes active navigation bug by ensuring each item has a unique, deterministic active condition.
 */
export const AdCenterSection: React.FC<AdCenterSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  adCenterSubTab,
  settingsSubTab,
  activeNavLabel,
  onSelectAdCenterSubTab,
  onSelectSettingsSubTab,
  onNavigate,
  onSelectNavLabel,
}) => {
  const isAds = currentTab === "ads";

  const handleSelectAdSubTab = (label: string, subTab: AdSubTab) => {
    onSelectNavLabel?.(label);
    onSelectAdCenterSubTab?.(subTab);
    onNavigate("ads");
  };

  const handleSelectSettingsAds = () => {
    onSelectNavLabel?.("Ad Preferences");
    onSelectSettingsSubTab("ads");
    onNavigate("settings");
  };

  return (
    <NavSection
      title="Open Adcentre"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
    >
      <NavItem
        icon={BarChart3}
        label="Ad CPM Analytics"
        active={
          isAds &&
          (adCenterSubTab
            ? adCenterSubTab === "analytics"
            : activeNavLabel === "Ad CPM Analytics" || !activeNavLabel)
        }
        onClick={() => handleSelectAdSubTab("Ad CPM Analytics", "analytics")}
      />
      <NavItem
        icon={Layers}
        label="Campaign Bids"
        active={
          isAds &&
          (adCenterSubTab ? adCenterSubTab === "bids" : activeNavLabel === "Campaign Bids")
        }
        onClick={() => handleSelectAdSubTab("Campaign Bids", "bids")}
      />
      <NavItem
        icon={Megaphone}
        label="Ad Simulation Studio"
        active={
          isAds &&
          (adCenterSubTab
            ? adCenterSubTab === "studio"
            : activeNavLabel === "Ad Simulation Studio")
        }
        onClick={() => handleSelectAdSubTab("Ad Simulation Studio", "studio")}
      />
      <NavItem
        icon={IndianRupee}
        label="Sponsor Payouts"
        active={
          isAds &&
          (adCenterSubTab
            ? adCenterSubTab === "payouts"
            : activeNavLabel === "Sponsor Payouts")
        }
        onClick={() => handleSelectAdSubTab("Sponsor Payouts", "payouts")}
      />
      <NavItem
        icon={Megaphone}
        label="Ad Preferences"
        active={currentTab === "settings" && settingsSubTab === "ads"}
        onClick={handleSelectSettingsAds}
      />
    </NavSection>
  );
};
