"use client";

import React from "react";
import { KeyboardArrowDownRounded as ChevronDown } from "@mui/icons-material";

export interface NavSectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  locked?: boolean;
  hint?: string | number;
  children: React.ReactNode;
}

/**
 * NavSection
 * ----------------------------------------------------
 * Single Responsibility: Renders a collapsible accordion section for grouped navigation items.
 * Adheres strictly to WAI-ARIA accordion/disclosure pattern.
 */
export const NavSection: React.FC<NavSectionProps> = ({
  title,
  open,
  onToggle,
  locked = false,
  hint,
  children,
}) => {
  const heading = (
    <>
      <span className="text-lg font-medium tracking-normal text-[var(--oc-text-secondary)] lg:text-[10px] lg:font-semibold">
        {title}
      </span>
      {hint !== undefined && !open && (
        <span className="rounded-full bg-[var(--oc-surface-subtle)] px-1.5 text-[9px] font-medium text-[var(--oc-text-secondary)]">
          {hint}
        </span>
      )}
      {!locked && (
        <ChevronDown
          className={`ml-auto h-3 w-3 shrink-0 text-[var(--oc-text-secondary)] transition-transform duration-200 group-hover/sec:text-[var(--oc-text-primary)] ${
            open ? "rotate-0" : "-rotate-90"
          }`}
          sx={{ fontSize: 13 }}
        />
      )}
    </>
  );

  return (
    <div className="w-full">
      {locked ? (
        <div className="mb-0.5 flex w-full items-center gap-1.5 px-2 py-1">
          {heading}
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${title} section, ${open ? "expanded" : "collapsed"}`}
          className="group/sec mb-0.5 flex min-h-[56px] w-full items-center gap-1.5 px-5 py-2 text-left select-none cursor-pointer lg:min-h-0 lg:px-2 lg:py-1"
        >
          {heading}
        </button>
      )}

      {open && (
        <nav aria-label={title} className="space-y-0.5 animate-in fade-in duration-150">
          {children}
        </nav>
      )}
    </div>
  );
};
