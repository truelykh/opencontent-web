"use client";

import React from "react";
import {
  HomeRounded as Home,
  LiveTvRounded as Tv,
  FavoriteRounded as Heart,
  HistoryRounded as History,
} from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { TrendingCometIcon } from "../../common/CategoryIcons";

export interface DiscoverSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  selectedCategory: string;
  onNavigate: (tab: string) => void;
  onSelectCategory: (cat: string) => void;
  activeNavLabel?: string;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * DiscoverSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation items for general discovery (Home, Trending, Subscriptions, Favourites, Watch History).
 */
export const DiscoverSection: React.FC<DiscoverSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  selectedCategory,
  onNavigate,
  onSelectCategory,
  activeNavLabel,
  onSelectNavLabel,
}) => {
  const isFeed = currentTab === "feed";

  const handleSelect = (label: string, tab: string, category?: string) => {
    onSelectNavLabel?.(label);
    if (category) {
      onSelectCategory(category);
    }
    onNavigate(tab);
  };

  return (
    <NavSection
      title="Discover"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
    >
      <NavItem
        icon={Home}
        label="Home"
        active={isFeed && selectedCategory === "all" && (activeNavLabel ? activeNavLabel === "Home" : true)}
        onClick={() => handleSelect("Home", "feed", "all")}
      />
      <NavItem
        icon={TrendingCometIcon}
        label="Trending"
        active={isFeed && selectedCategory === "trending"}
        onClick={() => handleSelect("Trending", "feed", "trending")}
      />
      <NavItem
        icon={Tv}
        label="Subscriptions"
        active={currentTab === "subscriptions"}
        onClick={() => handleSelect("Subscriptions", "subscriptions")}
      />
      <NavItem
        icon={Heart}
        label="Favourites"
        active={currentTab === "favourites"}
        onClick={() => handleSelect("Favourites", "favourites")}
      />
      <NavItem
        icon={History}
        label="Watch History"
        active={currentTab === "history"}
        onClick={() => handleSelect("Watch History", "history")}
      />
    </NavSection>
  );
};
