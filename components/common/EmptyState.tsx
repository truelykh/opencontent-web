"use client";

import React from "react";
import {
  RefreshRounded as RefreshIcon,
  VideoLibraryRounded as VideoLibrary,
} from "@mui/icons-material";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  isError?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = VideoLibrary,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isError = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`py-10 sm:py-14 flex max-w-2xl flex-col items-start justify-center text-left ${className}`}
      role="region"
      aria-label={title}
    >
      <div className={`mb-4 flex h-10 w-10 items-center justify-center ${isError ? "text-[var(--oc-error)]" : "text-[var(--oc-action)]"}`}>
        {isError ? (
          <RefreshIcon className="w-7 h-7" />
        ) : (
          <Icon className="w-7 h-7" />
        )}
      </div>

      <h3 className="text-[16px] font-semibold tracking-tight text-[var(--oc-text-primary)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--oc-text-secondary)] sm:text-[13px]">
        {description}
      </p>

      {(onAction || onSecondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {onAction && actionText && (
            <button
              type="button"
              onClick={onAction}
              className={`${isError ? "btn-secondary" : "btn-saffron"} inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium shadow-xs cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {isError && <RefreshIcon className="h-4 w-4" aria-hidden="true" />}
              {actionText}
            </button>
          )}
          {onSecondaryAction && secondaryActionText && (
            <button
              type="button"
              onClick={onSecondaryAction}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--oc-text-secondary)] hover:text-[var(--oc-text-primary)] hover:bg-[var(--oc-surface-subtle)] border border-[var(--oc-border)] transition-colors cursor-pointer"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
