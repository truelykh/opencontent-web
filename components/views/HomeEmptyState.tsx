"use client";

import React from "react";
import {
  ArticleRounded as Article,
  ArrowForwardRounded as ArrowForward,
  ExploreRounded as Compass,
  FileUploadRounded as Create,
  HeadphonesRounded as Headphones,
  MovieRounded as Film,
  RadioRounded as Radio,
  SchoolRounded as GraduationCap,
  ShoppingBagRounded as ShoppingBag,
} from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { HOME_DISCOVERY_GROUP_IDS } from "@/lib/navigation";
import type { ExploreGroupId } from "@/lib/navigation";
import OpenContentOrbit from "../home/OpenContentOrbit";

interface HomeEmptyStateProps {
  onExplore: () => void;
  onOpenGroup: (groupId: ExploreGroupId) => void;
}

interface Shortcut {
  label: string;
  description: string;
  icon: React.ComponentType<SvgIconProps>;
  surface: string;
  iconColor: string;
  onClick: () => void;
}

export default function HomeEmptyState({
  onExplore,
  onOpenGroup,
}: HomeEmptyStateProps) {
  const shortcuts: Shortcut[] = [
    {
      label: "Watch",
      description: "Movies and shows",
      icon: Film,
      surface: "var(--oc-home-watch-surface)",
      iconColor: "var(--oc-home-watch-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.watch),
    },
    {
      label: "Listen",
      description: "Music and radio",
      icon: Headphones,
      surface: "var(--oc-home-listen-surface)",
      iconColor: "var(--oc-home-listen-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.listen),
    },
    {
      label: "Read",
      description: "Articles and news",
      icon: Article,
      surface: "var(--oc-home-read-surface)",
      iconColor: "var(--oc-home-read-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.read),
    },
    {
      label: "Learn",
      description: "Education content",
      icon: GraduationCap,
      surface: "var(--oc-home-learn-surface)",
      iconColor: "var(--oc-home-learn-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.learn),
    },
    {
      label: "Live",
      description: "Live channels",
      icon: Radio,
      surface: "var(--oc-home-live-surface)",
      iconColor: "var(--oc-home-live-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.live),
    },
    {
      label: "Shop",
      description: "Creator products",
      icon: ShoppingBag,
      surface: "var(--oc-home-shop-surface)",
      iconColor: "var(--oc-home-shop-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.shop),
    },
    {
      label: "Studio",
      description: "Creator tools",
      icon: Create,
      surface: "var(--oc-home-create-surface)",
      iconColor: "var(--oc-home-create-icon)",
      onClick: () => onOpenGroup(HOME_DISCOVERY_GROUP_IDS.create),
    },
  ];

  return (
    <section
      className="home-empty-state flex min-h-0 flex-col justify-start py-3 sm:py-4 lg:py-4"
      aria-labelledby="home-empty-title"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--oc-action)]">
            Welcome to OpenContent
          </p>
          <h2
            id="home-empty-title"
            className="home-empty-state-title mt-3 max-w-xl text-3xl leading-[1.08] tracking-[-0.035em] text-[var(--oc-text-primary)] sm:text-4xl lg:text-[2.75rem]"
          >
            Discover what matters to you
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--oc-text-secondary)] sm:text-base">
            OpenContent brings together video, music, articles, education,
            public information, commerce, and creator tools in one place.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="btn-saffron mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <Compass className="h-4 w-4" aria-hidden="true" />
            Explore OpenContent
            <ArrowForward className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-[280px] items-center justify-center lg:min-h-0 lg:items-start">
          <OpenContentOrbit />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {shortcuts.map(({ label, description, icon: Icon, surface, iconColor, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            style={{ backgroundColor: surface }}
            className="group flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-transparent p-3.5 text-center transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[var(--oc-border)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold text-[var(--oc-text-primary)]">
                {label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-[var(--oc-text-secondary)]">
                {description}
              </span>
            </span>
            <ArrowForward className="h-4 w-4" style={{ color: iconColor }} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
