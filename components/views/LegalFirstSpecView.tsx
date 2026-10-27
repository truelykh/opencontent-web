"use client";

import React, { useState } from "react";
import {
  WarningAmberRounded as AlertTriangle,
  ArrowForwardRounded as ArrowRight,
  BlockRounded as Ban,
  CheckRounded as Check,
  CheckCircleRounded as CheckCircle2,
  AssignmentTurnedInRounded as ClipboardCheck,
  StorageRounded as Database,
  FileDownloadRounded as Download,
  VisibilityOffRounded as EyeOff,
  FactCheckRounded as FileCheck2,
  FingerprintRounded as Fingerprint,
  GavelRounded as Gavel,
  VpnKeyRounded as KeyRound,
  HubRounded as Network,
  RocketLaunchRounded as Rocket,
  BalanceRounded as Scale,
  VerifiedUserRounded as ShieldCheck,
  ShoppingBagRounded as ShoppingBag,
  LockOpenRounded as Unlock,
  AllInboxRounded as Boxes,
  DataObjectRounded as FileJson,
  AltRouteRounded as GitBranch,
  SpeedRounded as Gauge,
  PeopleRounded as Users,
  CancelRounded as XCircle,
} from "@mui/icons-material";
import {
  AGE_FLOW,
  AGE_NEVER,
  AGE_STORED,
  ANTI_PATTERNS,
  COMMITMENTS,
  DECISIONS,
  FAILURE_MODES,
  LAUNCH_GATE,
  OBLIGATIONS,
  PHASES,
  PRINCIPLES,
  RETENTION,
  SERVICE_PLANES,
  SERVICES,
} from "@/data/legalSpec";

type SpecTab = "commitments" | "identity" | "safety" | "services" | "data";

const TABS: { id: SpecTab; label: string; icon: typeof Scale }[] = [
  { id: "commitments", label: "Commitments", icon: Scale },
  { id: "identity", label: "Identity & age", icon: Fingerprint },
  { id: "safety", label: "Content safety", icon: ShieldCheck },
  { id: "services", label: "Service boundaries", icon: Network },
  { id: "data", label: "Data & launch gate", icon: Database },
];

const TH =
  "px-4 py-2.5 text-left text-[9.5px] font-bold uppercase tracking-wider text-[#94A3B8]";
const TD = "px-4 py-3 align-top text-[11px] leading-relaxed text-[#475569]";

const DATA_PRINCIPLES = [
  {
    title: "Minimise",
    detail:
      "Each service declares the fields it needs. A field with no purpose in the data map cannot be collected.",
  },
  {
    title: "Purpose limitation",
    detail:
      "Age data unlocks restricted content. It is never reused for ads, profiling or analytics.",
  },
  {
    title: "Erasure",
    detail:
      "Account deletion fans out as events; each service runs its own delete job and reports completion.",
  },
  {
    title: "Breach playbook",
    detail:
      "Named owner, 72-hour assessment window, regulator and user notification templates rehearsed twice a year.",
  },
];

export default function LegalFirstSpecView() {
  const [tab, setTab] = useState<SpecTab>("commitments");

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF6F00] via-[#FF6F00]/40 to-transparent" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6F00]/20 bg-[#FFF7ED] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C2410C]">
                <FileCheck2 className="h-3 w-3" />
                Compliance engineering
              </span>
              <span className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-bold text-[#C2410C]">
                Draft · v1.0 · for counsel review
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[#334155] sm:text-[27px]">
              Legal-First Technical Specification
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#64748B] sm:text-[13px]">
              A microservice blueprint that refuses three failure modes: a
              central identity database, a theatrical age gate, and a global
              content-control mechanism.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-[#475569]">
              {[
                "13 independent services",
                "Database per service",
                "No monorepo",
                "Operator-scoped moderation",
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
            <a
              href="/legal-first-technical-spec.md"
              download
              className="btn-saffron rounded-xl px-4 py-2 text-[11.5px] font-bold shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Download spec (.md)
            </a>
            <span className="max-w-[230px] text-[10px] leading-relaxed text-[#94A3B8] lg:text-right">
              Engineering source of truth · implementation-ready contracts
              included
            </span>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF9933]" />
        <p className="text-[11px] leading-relaxed text-[#9A3412]">
          <span className="font-bold">Engineering controls, not legal advice.</span>{" "}
          Statutory values live in a versioned policy pack and must be confirmed
          by Indian technology/media counsel against the currently notified IT
          Rules, DPDP rules and I&amp;B publisher guidance — before any public
          upload feature ships. Proposed amendments are not obligations until
          they are officially notified.
        </p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Specification sections"
        className="flex items-center gap-1 overflow-x-auto rounded-full border border-[#E2E8F0] bg-white p-1 shadow-xs saffron-scrollbar"
      >
        {TABS.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                isActive
                  ? "font-bold text-[#FF9933] bg-transparent"
                  : "font-semibold text-[#64748B] hover:text-[#334155]"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${
                  isActive ? "text-[#FF9933]" : "text-[#94A3B8]"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "commitments" && <CommitmentsTab />}
      {tab === "identity" && <IdentityTab />}
      {tab === "safety" && <SafetyTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "data" && <DataTab />}

      <p className="pb-1 text-center text-[10px] text-[#94A3B8]">
        Spec v1.0 · Owner: platform architecture · Review with counsel before
        launch
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Commitments                                                        */
/* ------------------------------------------------------------------ */

function CommitmentsTab() {
  const icons = [ShieldCheck, Unlock, Scale];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {COMMITMENTS.map((commitment, index) => {
          const Icon = icons[index];
          return (
            <article
              key={commitment.title}
              className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
            >
              <span className="absolute right-4 top-2 text-[30px] font-black leading-none text-[#F1F5F9] tabular-nums">
                0{index + 1}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FF6F00]/20 bg-[#FFF7ED] text-[#FF6F00]">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="mt-3 text-[13.5px] font-bold leading-snug text-[#334155]">
                {commitment.title}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
                {commitment.summary}
              </p>
              <div className="mt-3 rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Spec rule
                </div>
                <p className="mt-0.5 text-[10.5px] font-medium leading-relaxed text-[#334155]">
                  {commitment.rule}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] px-4 py-3">
          <div>
            <h2 className="text-[13px] font-bold text-[#334155]">
              Architecture decision record
            </h2>
            <p className="text-[10.5px] text-[#64748B]">
              The legal boundary, converted into enforceable engineering decisions
            </p>
          </div>
          <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[9.5px] font-bold text-[#64748B]">
            ADR-001 · v1.0
          </span>
        </div>
        <div className="overflow-x-auto saffron-scrollbar">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className={TH}>Decision</th>
                <th className={TH}>Company commitment</th>
                <th className={TH}>Engineering guardrail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {DECISIONS.map((row) => (
                <tr key={row.decision} className="transition-colors hover:bg-[#FCFDFE]">
                  <td
                    className={`${TD} whitespace-nowrap font-semibold text-[#334155]`}
                  >
                    {row.decision}
                  </td>
                  <td className={TD}>{row.commitment}</td>
                  <td className={TD}>{row.guardrail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6F00]" />
        <p className="text-[10.5px] leading-relaxed text-[#475569]">
          <span className="font-bold text-[#334155]">
            This ADR is a hard boundary, not a preference.
          </span>{" "}
          A pull request that introduces a central identity table, a global
          content flag, or a single deployable containing multiple bounded
          contexts should be rejected on architecture review.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Identity & age                                                     */
/* ------------------------------------------------------------------ */

function IdentityTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-600">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[13px] font-bold text-emerald-900">
            Invariant: no central identity database
          </h2>
          <p className="mt-0.5 max-w-3xl text-[11px] leading-relaxed text-emerald-900/80">
            Accounts are pairwise pseudonyms. There is no table anywhere in the
            platform that maps a person to their legal identity, their viewing
            history and their purchases. Age is proven with a signed band, not
            with documents.
          </p>
        </div>
        <span className="ml-auto hidden shrink-0 rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 sm:block">
          Non-negotiable
        </span>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FF6F00]/20 bg-[#FFF7ED] text-[#FF6F00]">
            <Fingerprint className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[13px] font-bold text-[#334155]">
              Privacy-preserving 18+ assurance
            </h2>
            <p className="text-[10.5px] text-[#64748B]">
              The gate is effective without becoming a surveillance point
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {AGE_FLOW.map((step, index) => (
            <div key={step.step} className="relative rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-black text-[#C2410C] ring-1 ring-[#FF6F00]/20">
                  {step.step}
                </span>
                {index < AGE_FLOW.length - 1 && (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-[#CBD5E1] md:block" />
                )}
              </div>
              <h3 className="mt-2 text-[11.5px] font-bold leading-snug text-[#334155]">
                {step.title}
              </h3>
              <p className="mt-1 text-[10px] leading-relaxed text-[#64748B]">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            What age-assurance-adapter stores
          </h2>
          <ul className="mt-2.5 space-y-1.5">
            {AGE_STORED.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11px] text-[#475569]">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
            <EyeOff className="h-4 w-4 text-[#DC2626]" />
            What it must never store
          </h2>
          <ul className="mt-2.5 space-y-1.5">
            {AGE_NEVER.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[11px] text-[#475569]">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="border-b border-[#F1F5F9] px-4 py-3">
          <h2 className="text-[13px] font-bold text-[#334155]">
            Failure modes &amp; designed response
          </h2>
          <p className="text-[10.5px] text-[#64748B]">
            An age gate is only effective if its unhappy paths fail safely
          </p>
        </div>
        <div className="overflow-x-auto saffron-scrollbar">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className={TH}>Failure</th>
                <th className={TH}>Designed control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {FAILURE_MODES.map((row) => (
                <tr key={row.scenario}>
                  <td className={`${TD} whitespace-nowrap font-semibold text-[#334155]`}>
                    {row.scenario}
                  </td>
                  <td className={TD}>{row.control}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
          <ClipboardCheck className="h-4 w-4 text-[#FF6F00]" />
          Effectiveness checklist
        </h2>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {[
            "No self-declaration path is accepted for restricted titles",
            "Assertions are issuer-signed and verified server-side",
            "Entitlements expire and are re-verified",
            "Under-18 paths get consent + non-tracking defaults",
            "Verification decisions are audited without PII",
            "A bypass attempt is logged and rate-limited",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-[10.5px] text-[#475569]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Content safety                                                     */
/* ------------------------------------------------------------------ */

function SafetyTab() {
  const flow = [
    {
      step: "01",
      title: "Notice or report arrives",
      detail:
        "Court order, government notice, creator dispute or viewer report enters notice-takedown-service.",
    },
    {
      step: "02",
      title: "Validity + scope check",
      detail:
        "The notice is validated against the policy pack and mapped to the responsible operator and catalog.",
    },
    {
      step: "03",
      title: "Operator decision on the clock",
      detail:
        "The operator records a decision, reason, policy version and effective scope before the statutory deadline.",
    },
    {
      step: "04",
      title: "Action, ledger, appeal",
      detail:
        "Action is applied only to that operator's surface, written to the transparency ledger, and appealable.",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {flow.map((step) => (
          <div key={step.step} className="rounded-xl border border-[#F1F5F9] bg-white p-3 shadow-xs">
            <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[9.5px] font-black text-[#C2410C]">
              {step.step}
            </span>
            <h3 className="mt-2 text-[11.5px] font-bold leading-snug text-[#334155]">
              {step.title}
            </h3>
            <p className="mt-1 text-[10px] leading-relaxed text-[#64748B]">
              {step.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
            <Users className="h-4 w-4 text-[#2563EB]" />
            Operator-scoped by design
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-[10.5px] leading-relaxed text-[#475569]">
            {[
              "Each operator publishes a signed policy pack and applies it to its own catalog.",
              "Reviewers act inside one operator's queue with least-privilege scopes.",
              "Decisions carry scope, policy version, evidence and an appeal path.",
              "The platform may remove content from company-operated services only.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
            <Ban className="h-4 w-4 text-[#DC2626]" />
            What is explicitly prohibited
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-[10.5px] leading-relaxed text-[#475569]">
            {[
              "A global take-down switch that overrides every operator.",
              "A hidden blocklist applied without a recorded decision.",
              "One reviewer role with authority over other operators' catalogs.",
              "Protocol-level content rules changed by a single admin key.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] px-4 py-3">
          <div>
            <h2 className="text-[13px] font-bold text-[#334155]">
              Statutory clocks &amp; evidence
            </h2>
            <p className="text-[10.5px] text-[#64748B]">
              Timelines are configuration, not hardcoded assumptions
            </p>
          </div>
          <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[9.5px] font-bold text-[#64748B]">
            Policy pack · IN · v1
          </span>
        </div>
        <div className="overflow-x-auto saffron-scrollbar">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className={TH}>Obligation</th>
                <th className={TH}>Baseline clock</th>
                <th className={TH}>Enforcing service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {OBLIGATIONS.map((row) => (
                <tr key={row.obligation}>
                  <td className={`${TD} font-semibold text-[#334155]`}>
                    {row.obligation}
                  </td>
                  <td className={TD}>{row.clock}</td>
                  <td className={TD}>
                    <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[10px] text-[#475569]">
                      {row.service}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-[#F1F5F9] px-4 py-2.5 text-[10px] leading-relaxed text-[#94A3B8]">
          Baseline reflects the IT Rules 2021 framework and must be confirmed
          against current notified amendments and I&amp;B publisher guidance.
          Changing a value requires a new signed policy-pack version.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
        <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
          <Gavel className="h-4 w-4 text-[#FF6F00]" />
          Architecture review checklist
        </h2>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {ANTI_PATTERNS.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-lg bg-[#F8FAFC] px-2.5 py-1.5 text-[10.5px] text-[#475569]">
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Service boundaries                                                 */
/* ------------------------------------------------------------------ */

function ServicesTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PRINCIPLES.map((principle, index) => {
          const icons = [Boxes, Database, FileJson, GitBranch, ShieldCheck, Gauge];
          const Icon = icons[index] ?? Boxes;
          return (
            <div
              key={principle.title}
              className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#FF6F00]">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-[11.5px] font-bold text-[#334155]">
                  {principle.title}
                </h3>
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#64748B]">
                {principle.detail}
              </p>
            </div>
          );
        })}
      </div>

      {SERVICE_PLANES.map((plane) => {
        const services = SERVICES.filter((service) => service.plane === plane.title);
        return (
          <section key={plane.title} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-bold text-[#334155]">
                  {plane.title}
                </h2>
                <p className="text-[10.5px] text-[#64748B]">{plane.intent}</p>
              </div>
              <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[9.5px] font-bold text-[#64748B] tabular-nums">
                {services.length} {services.length === 1 ? "service" : "services"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.name}
                  className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs transition-colors hover:border-[#CBD5E1]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-1.5">
                    <h3 className="font-mono text-[11.5px] font-bold text-[#334155]">
                      {service.name}
                    </h3>
                    <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-[8.5px] font-semibold text-[#64748B]">
                      {service.contract}
                    </span>
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-[#64748B]">
                    {service.responsibility}
                  </p>
                  <div className="mt-3 space-y-1.5 border-t border-[#F1F5F9] pt-3">
                    <div className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-[#475569]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>
                        <span className="font-bold text-emerald-700">Owns: </span>
                        {service.owns}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-[#475569]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                      <span>
                        <span className="font-bold text-[#DC2626]">Never: </span>
                        {service.never}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data & launch gate                                                 */
/* ------------------------------------------------------------------ */

function DataTab() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DATA_PRINCIPLES.map((principle) => (
          <div
            key={principle.title}
            className="rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-xs"
          >
            <h3 className="text-[11.5px] font-bold text-[#334155]">
              {principle.title}
            </h3>
            <p className="mt-1 text-[10px] leading-relaxed text-[#64748B]">
              {principle.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] px-4 py-3">
          <div>
            <h2 className="text-[13px] font-bold text-[#334155]">
              Data map &amp; retention
            </h2>
            <p className="text-[10.5px] text-[#64748B]">
              Every data class has one owning service and one approved window
            </p>
          </div>
          <span className="rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[9.5px] font-bold text-[#C2410C]">
            Counsel to confirm windows
          </span>
        </div>
        <div className="overflow-x-auto saffron-scrollbar">
          <table className="w-full min-w-[840px] text-left">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className={TH}>Data class</th>
                <th className={TH}>Owning service</th>
                <th className={TH}>Purpose</th>
                <th className={TH}>Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {RETENTION.map((row) => (
                <tr key={row.dataClass}>
                  <td className={`${TD} font-semibold text-[#334155]`}>
                    {row.dataClass}
                  </td>
                  <td className={TD}>
                    <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[9.5px] text-[#475569]">
                      {row.service}
                    </span>
                  </td>
                  <td className={TD}>{row.purpose}</td>
                  <td className={`${TD} whitespace-nowrap`}>{row.retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <h2 className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#334155]">
            <ClipboardCheck className="h-4 w-4 text-[#FF6F00]" />
            Pre-launch legal gate
          </h2>
          <p className="mt-0.5 text-[10.5px] text-[#64748B]">
            Ship-blocking items — every one needs a named owner and evidence
          </p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {LAUNCH_GATE.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] px-2.5 py-1.5 text-[10px] leading-relaxed text-[#475569]"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
            <h2 className="flex items-center gap-1.5 text-[12px] font-bold text-red-900">
              <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
              Launch blocker
            </h2>
            <p className="mt-1 text-[10.5px] leading-relaxed text-red-900/80">
              Do not enable unrestricted public uploads until Indian media/
              technology counsel has reviewed the actual content model,
              age-assurance design and intermediary status.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs">
            <h2 className="flex items-center gap-1.5 text-[12px] font-bold text-[#334155]">
              <Rocket className="h-4 w-4 text-[#FF6F00]" />
              Delivery phases
            </h2>
            <ol className="mt-2.5 space-y-2.5">
              {PHASES.map((phase) => (
                <li key={phase.phase} className="flex gap-2.5">
                  <span className="mt-0.5 h-fit shrink-0 rounded-md border border-[#FF6F00]/20 bg-[#FFF7ED] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#C2410C]">
                    {phase.phase}
                  </span>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#334155]">
                      {phase.title}
                    </div>
                    <p className="text-[9.5px] leading-relaxed text-[#64748B]">
                      {phase.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
        <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6F00]" />
        <p className="text-[10.5px] leading-relaxed text-[#475569]">
          <span className="font-bold text-[#334155]">Commerce note:</span> card
          data stays with the PCI-DSS payment provider. commerce-service stores
          PSP tokens, orders and invoices only — never card numbers, CVV or UPI
          credentials.
        </p>
      </div>
    </div>
  );
}
