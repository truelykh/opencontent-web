"use client";

import React from "react";
import { RefreshRounded as Refresh } from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";

interface ContentErrorStateProps {
  icon: React.ComponentType<SvgIconProps>;
  title: string;
  description: string;
  onRetry: () => void;
}

export default function ContentErrorState({
  icon: Icon,
  title,
  description,
  onRetry,
}: ContentErrorStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center py-12 text-center" role="alert">
      <div className="oc-library-surface flex h-14 w-14 items-center justify-center rounded-full bg-[var(--oc-surface-subtle)] text-[var(--oc-error)]">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[var(--oc-text-primary)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--oc-text-secondary)]">{description}</p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-saffron mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
      >
        <Refresh className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
