import React from "react";

export interface DatabaseIconProps {
  className?: string;
  sx?: Record<string, unknown>;
}

/** Lucide-style cylindrical database icon, kept local to avoid a new dependency. */
export function Database({ className, sx }: DatabaseIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={sx as React.CSSProperties}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </svg>
  );
}
