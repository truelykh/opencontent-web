"use client";

import React from "react";
import { ArrowForwardRounded as ArrowForward } from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";

interface ContentEmptyStateProps {
  icon: React.ComponentType<SvgIconProps>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function ContentEmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: ContentEmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center py-12 text-center" role="region" aria-label={title}>
      <div className="oc-library-surface flex h-14 w-14 items-center justify-center rounded-full bg-[var(--oc-home-watch-surface)] text-[var(--oc-brand)]">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[var(--oc-text-primary)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--oc-text-secondary)]">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-saffron mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
        >
          {actionText}
          <ArrowForward className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
