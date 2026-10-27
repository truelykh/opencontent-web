"use client";

import React from "react";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { SIDEBAR_CATEGORY_ITEMS } from "../sidebarCategories";

export interface CategoriesSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * CategoriesSection
 * ----------------------------------------------------
 * Single Responsibility: Manages category navigation list matching the platform taxonomy.
 * The Home item owns the unfiltered catalogue; this section contains only
 * actual category filters so navigation does not present duplicate feeds.
 */
export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  selectedCategory,
  onSelectCategory,
  onNavigate,
  onSelectNavLabel,
}) => {
  const isFeed = currentTab === "feed";

  const handleSelect = (id: string, name: string) => {
    onSelectNavLabel?.(name);
    onSelectCategory(id);
    if (currentTab !== "feed") {
      onNavigate("feed");
    }
  };

  return (
    <NavSection
      title="Categories"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
      hint={SIDEBAR_CATEGORY_ITEMS.length}
    >
      {SIDEBAR_CATEGORY_ITEMS.map((cat) => {
        const isActive =
          isFeed &&
          (selectedCategory === cat.id ||
            (cat.id === "News Video" && selectedCategory === "News"));

        return (
          <NavItem
            key={cat.id}
            icon={cat.icon}
            label={cat.name}
            active={isActive}
            onClick={() => handleSelect(cat.id, cat.name)}
          />
        );
      })}

    </NavSection>
  );
};
