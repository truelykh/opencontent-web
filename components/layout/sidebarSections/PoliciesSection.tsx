"use client";

import React from "react";
import {
  ArticleRounded as FileText,
  RotateLeftRounded as RotateCcw,
  ApartmentRounded as Building2,
  StorageRounded as Database,
  VerifiedUserRounded as ShieldCheck,
} from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { PolicySubTab } from "@/types";

export interface PoliciesSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  policySubTab: PolicySubTab;
  onSelectPolicySubTab: (subTab: PolicySubTab) => void;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * PoliciesSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation for opencontent legal and compliance policies.
 */
export const PoliciesSection: React.FC<PoliciesSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  policySubTab,
  onSelectPolicySubTab,
  onNavigate,
  onSelectNavLabel,
}) => {
  const isPolicies = currentTab === "policies";

  const handleSelect = (label: string, subTab: PolicySubTab) => {
    onSelectNavLabel?.(label);
    onSelectPolicySubTab(subTab);
    onNavigate("policies");
  };

  return (
    <NavSection
      title="Policies"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
    >
      <NavItem
        icon={FileText}
        label="Usage"
        active={isPolicies && policySubTab === "usage"}
        onClick={() => handleSelect("Usage", "usage")}
      />
      <NavItem
        icon={RotateCcw}
        label="Refund"
        active={isPolicies && policySubTab === "refund"}
        onClick={() => handleSelect("Refund", "refund")}
      />
      <NavItem
        icon={Building2}
        label="Platform"
        active={isPolicies && policySubTab === "platform"}
        onClick={() => handleSelect("Platform", "platform")}
      />
      <NavItem
        icon={Database}
        label="Data"
        active={isPolicies && policySubTab === "data"}
        onClick={() => handleSelect("Data", "data")}
      />
      <NavItem
        icon={ShieldCheck}
        label="Privacy"
        active={isPolicies && policySubTab === "privacy"}
        onClick={() => handleSelect("Privacy", "privacy")}
      />
    </NavSection>
  );
};
