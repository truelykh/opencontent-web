"use client";

import { ArrowUpwardRounded as ArrowUp } from "@mui/icons-material";
import { BrandLockup } from "./BrandLogo";
import { PolicySubTab } from "@/types";

const YEAR = new Date().getFullYear();

interface SiteFooterProps {
  compact?: boolean;
  onNavigate: (tab: string) => void;
  onOpenCategory: (category: string) => void;
  onOpenPolicy: (subTab: PolicySubTab) => void;
  onOpenShop: () => void;
  onOpenUpload: () => void;
  onBackToTop: () => void;
}

function FooterLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-[11.5px] font-normal text-[var(--oc-text-secondary)] transition-colors hover:text-[var(--oc-brand)]"
    >
      {children}
    </button>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--oc-text-secondary)]">
        {title}
      </h3>
      <ul className="mt-2 space-y-1">{children}</ul>
    </div>
  );
}

export default function SiteFooter({
  compact = false,
  onNavigate,
  onOpenCategory,
  onOpenPolicy,
  onOpenShop,
  onOpenUpload,
  onBackToTop,
}: SiteFooterProps) {
  if (compact) {
    return (
      <footer className="mt-auto border-t border-[var(--oc-border)] bg-[var(--oc-background)]">
        <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-5">
          <BrandLockup />
          <nav aria-label="Compact footer" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
            <FooterLink onClick={() => onNavigate("feed")}>Home</FooterLink>
            <FooterLink onClick={() => onNavigate("explore")}>Explore</FooterLink>
            <FooterLink onClick={() => onOpenPolicy("usage")}>Usage</FooterLink>
            <FooterLink onClick={() => onOpenPolicy("privacy")}>Privacy</FooterLink>
            <FooterLink onClick={() => onNavigate("settings")}>Settings</FooterLink>
            <button
              type="button"
              onClick={onBackToTop}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--oc-text-secondary)] transition-colors hover:text-[var(--oc-brand)]"
            >
              <ArrowUp className="h-3 w-3" aria-hidden="true" />
              Top
            </button>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-[var(--oc-border)] bg-[var(--oc-background)]">
      {/* Brand accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[var(--oc-brand)]/70 via-[var(--oc-brand)]/15 to-transparent" />

      <div className="w-full px-3 py-6 sm:px-4 lg:px-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:gap-x-8 lg:gap-y-3 lg:grid-cols-[1.25fr_0.9fr_0.9fr_0.9fr]">
          {/* Brand */}
          <div className="col-span-full lg:col-span-1">
            <BrandLockup />
            <p className="mt-2 max-w-[290px] text-[11.5px] leading-relaxed text-[var(--oc-text-secondary)]">
              A platform to discover and watch streaming content from creators and channels.
            </p>
          </div>

          {/* Platform */}
          <FooterColumn title="Platform">
            <li>
              <FooterLink onClick={() => onNavigate("feed")}>Home</FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onOpenCategory("trending")}>
                Trending
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onOpenCategory("Live Channels")}>
                Live channels
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onOpenCategory("Movies")}>
                Movies
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onOpenCategory("Education")}>
                Education
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={onOpenShop}>Openstore</FooterLink>
            </li>
          </FooterColumn>

          {/* Creators */}
          <FooterColumn title="For creators">
            <li>
              <FooterLink onClick={onOpenUpload}>Upload a video</FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("manage")}>
                Your channel
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("ads")}>
                Monetization
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("collab")}>
                Collab requests
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("governance")}>
                Copyright &amp; claims
              </FooterLink>
            </li>
          </FooterColumn>

          {/* Policies */}
          <FooterColumn title="Policies & help">
            <li>
              <FooterLink onClick={() => onOpenPolicy("usage")}>
                Usage policy
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onOpenPolicy("refund")}>
                Refund policy
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onOpenPolicy("privacy")}>
                Privacy policy
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("governance")}>
                Public complaints
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("legal")}>
                Legal-first spec
              </FooterLink>
            </li>
            <li>
              <FooterLink onClick={() => onNavigate("settings")}>
                Settings
              </FooterLink>
            </li>
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-3 border-t border-[var(--oc-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex-1 text-left text-[11.5px] text-[var(--oc-text-secondary)] sm:text-center">
            © {YEAR} Opencontent.in · Designed with AI, built for India.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10.5px] font-medium text-[var(--oc-text-secondary)]">
              English (IN) · INR ₹
            </span>
            <span className="hidden h-3 w-px bg-[var(--oc-border)] sm:block" />
            <button
              type="button"
              onClick={onBackToTop}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--oc-border)] bg-[var(--oc-background)] px-2.5 py-1 text-[10.5px] font-medium text-[var(--oc-text-secondary)] transition-colors hover:border-[var(--oc-border-strong)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-brand)]"
            >
              <ArrowUp className="h-3 w-3" />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
