"use client";

import React from "react";
import {
  ManageAccountsRounded as UserCog,
  TuneRounded as Sliders,
  LockRounded as Lock,
} from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { SettingsSubTab } from "@/types";

export interface SettingsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  settingsSubTab: SettingsSubTab;
  onSelectSettingsSubTab: (subTab: SettingsSubTab) => void;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * SettingsSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation for platform user preferences and settings.
 */
export const SettingsSection: React.FC<SettingsSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  settingsSubTab,
  onSelectSettingsSubTab,
  onNavigate,
  onSelectNavLabel,
}) => {
  const isSettings = currentTab === "settings";

  const handleSelect = (label: string, subTab: SettingsSubTab) => {
    onSelectNavLabel?.(label);
    onSelectSettingsSubTab(subTab);
    onNavigate("settings");
  };

  return (
    <NavSection
      title="Settings"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
    >
      <NavItem
        icon={UserCog}
        label="Account"
        active={isSettings && settingsSubTab === "account"}
        onClick={() => handleSelect("Account", "account")}
      />
      <NavItem
        icon={Sliders}
        label="Creator"
        active={isSettings && settingsSubTab === "creator"}
        onClick={() => handleSelect("Creator", "creator")}
      />
      <NavItem
        icon={Lock}
        label="Security"
        active={isSettings && settingsSubTab === "security"}
        onClick={() => handleSelect("Security", "security")}
      />
    </NavSection>
  );
};
