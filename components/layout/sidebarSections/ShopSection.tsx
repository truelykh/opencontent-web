"use client";

import React from "react";
import {
  ShoppingBagRounded as ShoppingBag,
  Inventory2Rounded as Package,
} from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { NavSection } from "../NavSection";
import { ShopSubTab } from "@/types";

export interface ShopSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  shopSubTab: ShopSubTab;
  onSelectShopSubTab: (subTab: ShopSubTab) => void;
  onNavigate: (tab: string) => void;
  onSelectNavLabel?: (label: string) => void;
}

/**
 * ShopSection
 * ----------------------------------------------------
 * Single Responsibility: Navigation for openstore and orders.
 */
export const ShopSection: React.FC<ShopSectionProps> = ({
  isOpen,
  onToggle,
  isLocked = false,
  currentTab,
  shopSubTab,
  onSelectShopSubTab,
  onNavigate,
  onSelectNavLabel,
}) => {
  const handleSelect = (label: string, subTab: ShopSubTab) => {
    onSelectNavLabel?.(label);
    onSelectShopSubTab(subTab);
    onNavigate("shop");
  };

  return (
    <NavSection
      title="Shop"
      open={isOpen}
      onToggle={onToggle}
      locked={isLocked}
    >
      <NavItem
        icon={ShoppingBag}
        label="Openstore"
        active={currentTab === "shop" && shopSubTab === "store"}
        onClick={() => handleSelect("Openstore", "store")}
      />
      <NavItem
        icon={Package}
        label="My Orders"
        active={currentTab === "shop" && shopSubTab === "orders"}
        onClick={() => handleSelect("My Orders", "orders")}
      />
    </NavSection>
  );
};
