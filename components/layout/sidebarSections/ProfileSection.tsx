"use client";

import React from "react";
import { PersonRounded as UserRound } from "@mui/icons-material";
import { NavItem } from "../NavItem";

export interface ProfileSectionProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * ProfileSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation for user profile, session security, identity, and data storage.
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentTab,
  onNavigate,
  onSelectNavLabel,
}) => (
  <NavItem
    icon={UserRound}
    label="Profile"
    active={currentTab === "profile"}
    onClick={() => {
      onSelectNavLabel?.("Profile");
      onNavigate("profile");
    }}
  />
);
