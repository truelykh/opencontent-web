"use client";

import React from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Accessible label. Pass null when the mark sits next to visible wordmark text. */
  title?: string | null;
}

/**
 * The Opencontent mark: circle filled in orange.
 * Drawn as crisp inline SVG.
 */
export function BrandMark({
  size = 28,
  className = "",
  title = "Opencontent",
}: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-lockup-mark ${className}`}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      {/* Circle filled in saffron */}
      <circle cx="24" cy="24" r="24" fill="var(--oc-brand, #FF6B00)" />
    </svg>
  );
}

interface BrandLockupProps {
  size?: number;
  markSize?: number;
  showTagline?: boolean;
  className?: string;
}

/** Mark + Opencontent wordmark horizontally aligned at identical optical size (28px Regular 400). */
export function BrandLockup({
  size = 22,
  markSize,
  className = "",
}: BrandLockupProps) {
  const actualSize = size ?? markSize ?? 28;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BrandMark
        size={actualSize}
        title={null}
        className="shrink-0"
      />
      <span
        style={{ fontSize: `${actualSize}px`, fontWeight: 500 }}
        className="brand-lockup-wordmark font-medium tracking-[-0.02em] text-[var(--oc-brand)] leading-none select-none"
      >
        Opencontent
      </span>
    </div>
  );
}
