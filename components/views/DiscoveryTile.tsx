"use client";

import React from "react";
import type { NavIconType } from "@/components/layout/NavItem";
import type { ExploreDestinationAvailability } from "@/lib/navigation";

interface DiscoveryTileProps {
  icon: NavIconType;
  label: string;
  description?: string;
  surface: string;
  iconColor: string;
  compact?: boolean;
  onClick?: () => void;
  availability?: ExploreDestinationAvailability;
}

/** Compact, centered destination tile shared by Explore group views. */
export default function DiscoveryTile({
  icon: Icon,
  label,
  description,
  surface,
  iconColor,
  compact = false,
  onClick,
  availability = "supported",
}: DiscoveryTileProps) {
  const isActionable = Boolean(onClick) && availability !== "planned" && availability !== "policy-restricted";
  const statusLabel = availability === "planned" ? "Soon" : availability === "policy-restricted" ? "Policy review" : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isActionable}
      aria-label={description ? `${label}. ${description}` : label}
      aria-disabled={!isActionable}
      title={description}
      style={{ backgroundColor: surface }}
      className={`group flex w-full flex-col items-center justify-center rounded-[12px] border px-2.5 text-center transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2 ${compact ? "min-h-[72px] gap-1.5 py-2" : "min-h-[104px] gap-2 py-3"} ${
        isActionable
          ? "border-[var(--oc-border)] bg-[var(--oc-background)] hover:border-[var(--oc-action)] hover:bg-[var(--oc-surface-subtle)]"
          : "cursor-not-allowed border-[var(--oc-border)] bg-[var(--oc-surface-subtle)] opacity-70"
      }`}
    >
      <Icon
        className={compact ? "h-5 w-5 shrink-0" : "h-6 w-6 shrink-0"}
        sx={{ fontSize: compact ? 20 : 24, color: iconColor }}
      />
      <span className={`max-w-full break-words text-center font-semibold leading-tight text-[var(--oc-text-primary)] ${compact ? "text-xs" : "text-sm"}`}>
        {label}
      </span>
      {statusLabel && (
        <span className="text-[9px] font-medium leading-none text-[var(--oc-text-secondary)]">{statusLabel}</span>
      )}
    </button>
  );
}
