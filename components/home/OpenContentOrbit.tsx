"use client";

import React from "react";
import {
  ArticleRounded as Article,
  HeadphonesRounded as Headphones,
  SchoolRounded as School,
  VideoLibraryRounded as VideoLibrary,
} from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { BrandMark } from "../layout/BrandLogo";

type OrbitDirection = "clockwise" | "counterclockwise";

interface OrbitRing {
  radius: number;
  tone: "warm" | "neutral";
}

interface OrbitService {
  label: string;
  icon: React.ComponentType<SvgIconProps>;
  color: string;
  ring: number;
  direction: OrbitDirection;
  revolution: number;
  angle: number;
  delay: number;
}

interface OrbitStyle extends React.CSSProperties {
  "--orbit-duration": string;
  "--orbit-fade-delay": string;
  "--orbit-radius": string;
  "--orbit-start-angle": string;
}

// These values are the single source of truth for both the SVG rings and the
// center-based CSS transforms. The viewBox is 100x100, so each radius is a
// percentage of the same square coordinate system. Four rings keep the
// decorative system legible and calm at Home hero scale.
const ORBIT_RINGS: readonly OrbitRing[] = [
  { radius: 15, tone: "neutral" },
  { radius: 24.5, tone: "warm" },
  { radius: 34, tone: "neutral" },
  { radius: 43.5, tone: "warm" },
];

const ORBIT_SERVICES: readonly OrbitService[] = [
  { label: "Watch", icon: VideoLibrary, color: "var(--oc-home-watch-icon)", ring: 0, direction: "clockwise", revolution: 32, angle: 0, delay: 0 },
  { label: "Listen", icon: Headphones, color: "var(--oc-home-listen-icon)", ring: 1, direction: "counterclockwise", revolution: 43, angle: 140, delay: 70 },
  { label: "Read", icon: Article, color: "var(--oc-home-read-icon)", ring: 2, direction: "clockwise", revolution: 51, angle: 220, delay: 140 },
  { label: "Learn", icon: School, color: "var(--oc-home-learn-icon)", ring: 3, direction: "counterclockwise", revolution: 61, angle: 40, delay: 210 },
];

function getRingRadius(index: number) {
  return ORBIT_RINGS[index]?.radius ?? ORBIT_RINGS[0].radius;
}

/** Decorative miniature solar system for the Home empty state. */
export default function OpenContentOrbit() {
  return (
    <div className="oc-orbit" aria-hidden="true">
      <svg className="oc-orbit__scene" viewBox="0 0 100 100" fill="none" role="presentation">
        <defs>
          <linearGradient id="oc-comet-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--oc-brand)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--oc-brand)" stopOpacity="0.7" />
          </linearGradient>
          <filter id="oc-orbit-ring-warm-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.7" floodColor="#D97706" floodOpacity="0.28" />
          </filter>
          <filter id="oc-orbit-ring-neutral-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.7" floodColor="#64748B" floodOpacity="0.24" />
          </filter>
        </defs>

        {ORBIT_RINGS.map((ring, index) => (
          <circle
            key={`ring-${index}`}
            className={`oc-orbit__svg-ring oc-orbit__svg-ring--${ring.tone}`}
            cx="50"
            cy="50"
            r={ring.radius}
            fill="none"
            stroke={ring.tone === "warm" ? "#FFB26B" : "#B8C0CA"}
            filter={`url(#oc-orbit-ring-${ring.tone}-shadow)`}
            strokeDasharray="0.35 1.55"
            strokeLinecap="round"
            strokeOpacity={ring.tone === "warm" ? 0.72 : 0.52}
            strokeWidth="0.42"
          />
        ))}

        <g className="oc-orbit__comet oc-orbit__comet--one">
          <path className="oc-orbit__comet-tail" d="M -7 0 C -4 -1 -2 -1 0 0 C -2 1 -4 1 -7 0 Z" />
          <circle className="oc-orbit__comet-head" cx="0" cy="0" r="1" />
          <animateMotion path="M 10 72 C 24 34 58 22 88 40" dur="12s" begin="1s" repeatCount="indefinite" rotate="auto" />
        </g>
        <g className="oc-orbit__comet oc-orbit__comet--two">
          <path className="oc-orbit__comet-tail" d="M -6 0 C -3 -1 -1 -1 0 0 C -1 1 -3 1 -6 0 Z" />
          <circle className="oc-orbit__comet-head" cx="0" cy="0" r="0.8" />
          <animateMotion path="M 88 70 C 64 48 36 78 14 30" dur="15s" begin="5s" repeatCount="indefinite" rotate="auto" />
        </g>
      </svg>

      <div className="oc-orbit__actors">
        {ORBIT_SERVICES.map((service) => {
          const Icon = service.icon;
          const style: OrbitStyle = {
            "--orbit-duration": `${service.revolution}s`,
            "--orbit-fade-delay": `${service.delay}ms`,
            "--orbit-radius": `${getRingRadius(service.ring)}`,
            "--orbit-start-angle": `${service.angle}deg`,
          };

          return (
            <div
              key={service.label}
              className={`oc-orbit__item ${service.direction === "counterclockwise" ? "oc-orbit__item--reverse" : ""}`}
              style={style}
            >
              <span className="oc-orbit__content" style={{ color: service.color }}>
                <Icon className="oc-orbit__icon" aria-hidden="true" />
              </span>
            </div>
          );
        })}
      </div>

      <div className="oc-orbit__core">
        <BrandMark size={76} title={null} className="oc-orbit__core-mark" />
      </div>
    </div>
  );
}
