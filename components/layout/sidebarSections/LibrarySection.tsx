"use client";

import React from "react";
import { KeyboardArrowDownRounded as ChevronDown, LibraryBooks } from "@mui/icons-material";
import { NavItem } from "../NavItem";
import { LIBRARY_NAVIGATION } from "@/lib/navigation";

interface LibrarySectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  currentTab: string;
  onNavigate: (tab: string, label: string) => void;
}

export function LibrarySection({ isOpen, onToggle, isLocked = false, currentTab, onNavigate }: LibrarySectionProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={`Library section, ${isOpen ? "expanded" : "collapsed"}`}
        className={`group flex min-h-[64px] w-full items-center gap-5 rounded-[18px] px-5 py-4 text-left text-[1.55rem] transition-colors duration-150 select-none cursor-pointer lg:min-h-[40px] lg:gap-2.5 lg:rounded-lg lg:px-3 lg:py-2 lg:text-sm ${
          isLocked
            ? "font-semibold text-[var(--oc-action)] border-l-2 border-[var(--oc-action)] bg-transparent"
            : "font-medium text-[var(--oc-text-secondary)] hover:bg-[var(--oc-surface-subtle)] hover:text-[var(--oc-text-primary)]"
        }`}
      >
        <LibraryBooks
          aria-hidden="true"
          className={`h-7 w-7 shrink-0 transition-colors lg:h-[18px] lg:w-[18px] ${
            isLocked ? "text-[var(--oc-action)]" : "text-[var(--oc-text-secondary)] group-hover:text-[var(--oc-text-primary)]"
          }`}
          sx={{ fontSize: 17 }}
        />
        <span className="truncate leading-tight lg:leading-normal">Library</span>
        <ChevronDown
          aria-hidden="true"
          className={`ml-auto h-6 w-6 shrink-0 transition-transform duration-200 lg:h-4 lg:w-4 ${
            isOpen ? "rotate-0" : "-rotate-90"
          } ${isLocked ? "text-[var(--oc-action)]" : "text-[var(--oc-text-secondary)]"}`}
          sx={{ fontSize: 17 }}
        />
      </button>

      {isOpen && (
        <nav aria-label="Library" className="mt-1 space-y-0.5 pl-2 animate-in fade-in duration-150 lg:pl-0">
          {LIBRARY_NAVIGATION.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentTab === item.tab}
              onClick={() => onNavigate(item.tab, item.label)}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
