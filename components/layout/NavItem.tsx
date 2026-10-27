"use client";

import React from "react";
import { OpenInNewRounded as ExternalLink } from "@mui/icons-material";

export type NavIconType = React.ComponentType<{
  className?: string;
  sx?: Record<string, unknown>;
}>;

export interface NavItemProps {
  icon: NavIconType;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: string | number;
  external?: boolean;
  title?: string;
  className?: string;
}

/**
 * NavItem
 * ----------------------------------------------------
 * Single Responsibility: Renders a single accessible navigation item.
 * Adheres strictly to WAI-ARIA navigation button semantics,
 * strict typing (no `any`), and brand design token styling.
 */
export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  badge,
  external = false,
  title,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-[64px] w-full items-center gap-5 rounded-[18px] px-5 py-4 text-[1.55rem] transition-colors duration-150 text-left select-none cursor-pointer lg:min-h-[40px] lg:gap-2.5 lg:rounded-lg lg:px-3 lg:py-2 lg:text-sm ${
        active
          ? "font-semibold text-[var(--oc-action)] bg-[var(--saffron-light)]"
          : "font-medium text-[var(--oc-text-secondary)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)]"
      } ${className}`}
    >
      <Icon
        className={`h-7 w-7 shrink-0 transition-colors lg:h-[18px] lg:w-[18px] ${
          active ? "text-[var(--oc-action)]" : "text-[var(--oc-text-secondary)] group-hover:text-[var(--oc-text-primary)]"
        }`}
        sx={{ fontSize: 17 }}
      />
      <span className="truncate leading-tight lg:leading-normal">{label}</span>
      {badge !== undefined && badge !== "" && (
        <span
          className={`ml-auto rounded-full px-1.5 py-px text-xs font-bold leading-4 tabular-nums lg:text-[9.5px] ${
            active ? "bg-[var(--oc-action)] text-white" : "bg-[var(--oc-surface-subtle)] text-[var(--oc-text-secondary)]"
          }`}
        >
          {badge}
        </span>
      )}
      {external && (
        <ExternalLink
          aria-hidden="true"
          className="ml-auto h-5 w-5 shrink-0 text-[var(--oc-text-secondary)] lg:h-3.5 lg:w-3.5"
          sx={{ fontSize: 15 }}
        />
      )}
    </button>
  );
};
