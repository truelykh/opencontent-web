"use client";

import React from "react";
import {
  DashboardRounded as LayoutDashboard,
  TuneRounded as Sliders,
  SmartDisplayRounded as PlaySquare,
  CloudUploadRounded as Upload,
  CurrencyRupeeRounded as IndianRupee,
  HandshakeRounded as Handshake,
  ChatBubbleOutlineRounded as Chat,
} from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { StudioSubTab, GovernanceSubTab } from "@/types";

export interface StudioSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  studioSubTab: StudioSubTab;
  governanceSubTab?: GovernanceSubTab;
  activeNavLabel?: string;
  onSelectStudioSubTab: (subTab: StudioSubTab) => void;
  onSelectGovernanceSubTab?: (subTab: GovernanceSubTab) => void;
  onOpenUpload: () => void;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * StudioSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation for Opencontent Studio creator suite and rights governance.
 * Eliminates shared ambiguous active states and removes hardcoded mock badges.
 */
export const StudioSection: React.FC<StudioSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  studioSubTab,
  onSelectStudioSubTab,
  onNavigate,
  onSelectNavLabel,
}) => {
  const handleSelectStudio = (label: string, subTab: StudioSubTab) => {
    onSelectNavLabel?.(label);
    onSelectStudioSubTab(subTab);
    onNavigate("studio");
  };

  const handleNav = (label: string, tab: string) => {
    onSelectNavLabel?.(label);
    onNavigate(tab);
  };

  return (
    <NavSection
      title="Opencontent Studio"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
    >
      <NavItem icon={PlaySquare} label="Channels" active={currentTab === "channels"} onClick={() => handleNav("Channels", "channels")} />
      <NavItem
        icon={Sliders}
        label="Customization"
        active={currentTab === "studio" && studioSubTab === "customization"}
        onClick={() => handleSelectStudio("Customization", "customization")}
      />
      <NavItem icon={Handshake} label="Collab" active={currentTab === "collab"} onClick={() => handleNav("Collab", "collab")} />
      <NavItem icon={Chat} label="Chat" active={false} onClick={() => handleNav("Chat", "collab")} />
      <NavItem icon={LayoutDashboard} label="Dashboard" active={currentTab === "studio" && studioSubTab === "dashboard"} onClick={() => handleSelectStudio("Dashboard", "dashboard")} />
      <NavItem icon={PlaySquare} label="My videos" active={currentTab === "studio" && studioSubTab === "content"} onClick={() => handleSelectStudio("My videos", "content")} />
      <NavItem icon={IndianRupee} label="Monetization" active={currentTab === "ads"} onClick={() => handleNav("Monetization", "ads")} />
      <NavItem icon={Upload} label="Upload" active={currentTab === "studio" && studioSubTab === "upload"} onClick={() => handleSelectStudio("Upload", "upload")} />
    </NavSection>
  );
};
