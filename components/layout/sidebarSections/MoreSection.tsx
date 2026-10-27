"use client";

import React from "react";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { MORE_NAVIGATION } from "@/lib/navigation";

interface MoreSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  onNavigate: (tab: string, label: string) => void;
}

export function MoreSection({ isOpen, onToggle, isLocked = false, currentTab, onNavigate }: MoreSectionProps) {
  return (
    <NavSection title="More" open={isOpen} onToggle={onToggle} locked={isLocked}>
      {MORE_NAVIGATION.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={currentTab === item.tab}
          onClick={() => onNavigate(item.tab, item.label)}
        />
      ))}
    </NavSection>
  );
}
