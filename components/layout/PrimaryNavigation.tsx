"use client";

import React from "react";
import { NavItem } from "./NavItem";
import { PRIMARY_NAVIGATION } from "@/lib/navigation";

interface PrimaryNavigationProps {
  currentTab: string;
  selectedCategory: string;
  onNavigate: (tab: string, category?: string, label?: string) => void;
}

export function PrimaryNavigation({ currentTab, selectedCategory, onNavigate }: PrimaryNavigationProps) {
  return (
    <nav aria-label="Primary navigation" className="space-y-0.5">
      {PRIMARY_NAVIGATION.map((item) => {
        const active =
          item.id === "home"
            ? currentTab === "feed" && selectedCategory === "all"
            : item.id === "trending"
              ? currentTab === "feed" && selectedCategory === "trending"
              : item.id === "live"
                ? currentTab === "feed" && selectedCategory === "Live Channels"
                : currentTab === "explore";

        return (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={active}
            onClick={() => {
              if (item.id === "home") onNavigate("feed", "all", item.label);
              else if (item.id === "trending") onNavigate("feed", "trending", item.label);
              else if (item.id === "live") onNavigate("feed", "Live Channels", item.label);
              else onNavigate("explore", undefined, item.label);
            }}
          />
        );
      })}
    </nav>
  );
}
