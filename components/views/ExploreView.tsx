"use client";

import React from "react";
import { EXPLORE_GROUPS } from "@/lib/navigation";
import type { ExploreDestination, ExploreGroup, ExploreGroupId } from "@/lib/navigation";
import DiscoveryTile from "./DiscoveryTile";

interface ExploreViewProps {
  onOpenCategory: (category: string) => void;
  onNavigate: (tab: string) => void;
  onOpenShop: (subTab: "store" | "orders") => void;
  onOpenUpload: () => void;
  selectedGroupId?: ExploreGroupId | null;
  onSelectGroup?: (groupId: ExploreGroupId) => void;
  onClearGroup?: () => void;
}

export default function ExploreView({
  onOpenCategory,
  onNavigate,
  onOpenShop,
  onOpenUpload,
  selectedGroupId = null,
  onSelectGroup,
  onClearGroup,
}: ExploreViewProps) {
  const handleDestination = (destination: ExploreDestination) => {
    const target = destination.target;
    if (!target || destination.availability === "planned" || destination.availability === "policy-restricted") return;
    if (target.type === "category") onOpenCategory(target.category);
    else if (target.type === "tab") onNavigate(target.tab);
    else if (target.type === "shop") onOpenShop(target.subTab);
    else onOpenUpload();
  };

  const handleSelectGroup = (groupId: ExploreGroupId) => {
    onSelectGroup?.(groupId);
  };

  const handleClearGroup = () => {
    onClearGroup?.();
  };

  const handleGroupEntry = (group: ExploreGroup) => {
    if (group.presentation === "product") {
      const destination = group.destinations.find((item) => item.availability === "supported");
      if (destination) handleDestination(destination);
      return;
    }
    handleSelectGroup(group.id as ExploreGroupId);
  };

  const selectedGroup = selectedGroupId
    ? EXPLORE_GROUPS.find((group): group is ExploreGroup & { id: ExploreGroupId } => group.id === selectedGroupId)
    : undefined;

  if (selectedGroup) {
    return (
      <section aria-labelledby="explore-group-heading" className="space-y-7 pb-4">
        <button
          type="button"
          onClick={handleClearGroup}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--oc-action)] transition-colors hover:text-[var(--oc-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">←</span>
          Back to Explore
        </button>
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--oc-action)]">Explore</p>
          <div className="mt-2 flex flex-col items-center gap-2">
            <span aria-hidden="true">
              {React.createElement(selectedGroup.icon, {
                sx: { fontSize: 28, color: "var(--oc-brand)" },
              })}
            </span>
            <h1 id="explore-group-heading" className="text-3xl font-semibold tracking-[-0.03em] text-[var(--oc-text-primary)] sm:text-4xl">
              {selectedGroup.selectionTitle}
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--oc-text-secondary)]">
            {selectedGroup.selectionDescription}
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 max-[374px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {selectedGroup.destinations.map((destination) => {
            const Icon = destination.icon;
            return (
              <DiscoveryTile
                key={destination.id}
                icon={Icon}
                label={destination.label}
                description={destination.description}
                surface="var(--oc-background)"
                iconColor="var(--oc-brand)"
                onClick={() => handleDestination(destination)}
                availability={destination.availability}
              />
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="explore-heading" className="space-y-5 pb-4">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--oc-brand)]">Explore</p>
        <h1 id="explore-heading" className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--oc-text-primary)] sm:text-4xl">
          Explore OpenContent
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-6 text-[var(--oc-text-secondary)]">
          Choose what you want to discover.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        {EXPLORE_GROUPS.map((group) => {
          const overviewDestinations = group.previewDestinationIds
            .map((id) => group.destinations.find((destination) => destination.id === id))
            .filter((destination): destination is ExploreDestination => Boolean(destination));
          return (
            <section
              key={group.id}
              aria-labelledby={`explore-${group.id}`}
              className="rounded-2xl border border-[var(--oc-border)] bg-[var(--oc-background)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                    {React.createElement(group.icon, {
                      sx: { fontSize: 24, color: "var(--oc-brand)" },
                    })}
                  </div>
                  <div className="min-w-0 text-left">
                    <h2 id={`explore-${group.id}`} className="text-base font-semibold text-[var(--oc-text-primary)]">{group.title}</h2>
                    <p className="mt-0.5 text-xs leading-5 text-[var(--oc-text-secondary)]">{group.description}</p>
                  </div>
                </div>
                {group.presentation === "directory" && (
                  <button
                    type="button"
                    onClick={() => handleSelectGroup(group.id as ExploreGroupId)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-[var(--oc-brand)] transition-colors hover:bg-[var(--oc-surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oc-action)] focus-visible:ring-offset-2"
                  >
                    View all <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
              <div className={`mt-3 grid gap-2 ${group.presentation === "product" ? "max-w-[220px] grid-cols-1" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"}`}>
              {overviewDestinations.map((destination) => {
                const Icon = destination.icon;
                return (
                  <DiscoveryTile
                    key={destination.id}
                    icon={Icon}
                    label={destination.label}
                    description={destination.description}
                    surface="var(--oc-background)"
                    iconColor="var(--oc-brand)"
                    compact
                    onClick={() => group.presentation === "product" ? handleGroupEntry(group) : handleDestination(destination)}
                    availability={destination.availability}
                  />
                );
              })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
