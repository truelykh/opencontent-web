"use client";

import React from "react";
import {
  ChevronRightRounded as ChevronRight,
} from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";

export interface HorizontalPageHeaderProps {
  icon: React.ComponentType<SvgIconProps>;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Shared header for secondary application pages.
 *
 * Keep the structure intentionally flat: the icon, title, chevron, and
 * description form one readable horizontal line on wider screens without a
 * card, border, or decorative icon container.
 */
export default function HorizontalPageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className = "",
}: HorizontalPageHeaderProps) {
  return (
    <header className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`.trim()}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        <Icon className="h-6 w-6 shrink-0 text-[var(--oc-brand)]" aria-hidden="true" />
        <h1 className="shrink-0 text-xl font-semibold tracking-[-0.025em] text-[var(--oc-text-primary)] sm:text-2xl">
          {title}
        </h1>
        <ChevronRight
          className="hidden h-4 w-4 shrink-0 text-[var(--oc-text-secondary)] sm:block"
          aria-hidden="true"
        />
        <p className="basis-full text-sm leading-6 text-[var(--oc-text-secondary)] sm:basis-auto sm:min-w-0 sm:flex-1 sm:text-[15px]">
          {description}
        </p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
