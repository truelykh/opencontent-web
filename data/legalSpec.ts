// Content model for the Legal-First Technical Specification view.
// This is engineering documentation, not legal advice. Policy-pack values
// must be confirmed by Indian technology/media counsel against currently
// notified rules before launch.

export interface Commitment {
  title: string;
  summary: string;
  rule: string;
}

export const COMMITMENTS: Commitment[] = [
  {
    title: "No unnecessary personal information",
    summary:
      "Collect only what a service needs to do its job, store it in that service, and delete it on a schedule. No real-world identity is required to watch or upload.",
    rule: "Default: pseudonymous accounts. KYC is never a product requirement.",
  },
  {
    title: "No unilateral control",
    summary:
      "Independent operators keep their own catalogs, policies and moderation decisions. The company cannot silently rewrite the protocol or switch off another operator.",
    rule: "No master admin key. Protocol changes require the multi-party charter.",
  },
  {
    title: "Comply where obligations actually apply",
    summary:
      "The company is accountable for the services it operates — not for pretending decentralization removes legal duties. Obligations live in versioned policy packs, not code comments.",
    rule: "Policy packs are versioned, counsel-owned and enforced by clocks and evidence.",
  },
];

export interface DecisionRow {
  decision: string;
  commitment: string;
  guardrail: string;
}

export const DECISIONS: DecisionRow[] = [
  {
    decision: "User identity",
    commitment: "No mandatory real-world identity account by default",
    guardrail:
      "identity-broker issues pairwise pseudonyms. Optional creator verification badges do not create a KYC store.",
  },
  {
    decision: "Age verification",
    commitment: "Privacy-preserving 18+ proof from a trusted issuer",
    guardrail:
      "Only a signed age-band assertion is accepted. No date of birth, ID documents or selfies are stored.",
  },
  {
    decision: "Content",
    commitment: "No intentional facilitation of unlawful uploads",
    guardrail:
      "Licence attestation, format/limits validation, and operator-scoped notice workflows — never a hidden global blocklist.",
  },
  {
    decision: "Infrastructure",
    commitment: "Company and independent operators can coexist",
    guardrail:
      "Each operator runs its own control plane. Shared infrastructure is stateless (CDN, edge) or explicitly opt-in.",
  },
  {
    decision: "Moderation",
    commitment:
      "Transparent policies, operator-level decisions and applicable compliance",
    guardrail:
      "Every decision is recorded in a transparency ledger with scope, policy version and appeal path.",
  },
  {
    decision: "Governance",
    commitment:
      "Public protocol, independent implementations, no unilateral takeover",
    guardrail:
      "Versioned specs + multi-party change control. No privileged protocol key exists in any service.",
  },
  {
    decision: "Data",
    commitment:
      "Minimum necessary processing, documented retention and security",
    guardrail:
      "Data map + per-service retention jobs. No shared user table across services, no PII in logs.",
  },
  {
    decision: "Legal accountability",
    commitment:
      "Clear responsibilities for the company-operated services",
    guardrail:
      "Service ownership matrix, counsel sign-off per policy pack, and an incident runbook that names an owner.",
  },
];

export interface ServiceSpec {
  name: string;
  plane: string;
  responsibility: string;
  owns: string;
  never: string;
  contract: string;
}

export const SERVICE_PLANES: { title: string; intent: string }[] = [
  {
    title: "Edge & access",
    intent:
      "Terminate traffic, keep accounts pseudonymous, and prove age without collecting identity.",
  },
  {
    title: "Content",
    intent:
      "Publish, transcode and index public-domain media. Each service owns one kind of data.",
  },
  {
    title: "Safety & legal",
    intent:
      "Operator-scoped moderation, statutory notice handling, and tamper-evident accountability.",
  },
  {
    title: "Commerce",
    intent:
      "Sell creator merch, downloads and courses without becoming a card-data processor.",
  },
  {
    title: "Data & federation",
    intent:
      "Aggregate telemetry and let independent operators interoperate without a central choke point.",
  },
];

export const SERVICES: ServiceSpec[] = [
  {
    name: "edge-gateway",
    plane: "Edge & access",
    responsibility:
      "TLS termination, routing, rate limits, bot/DDoS controls and request signing for downstream calls.",
    owns: "Ephemeral session cache and routing config.",
    never: "Identity documents, content rulings, or long-lived user profiles.",
    contract: "HTTP/JSON + mTLS",
  },
  {
    name: "identity-broker",
    plane: "Edge & access",
    responsibility:
      "Issues pairwise pseudonymous accounts, rotates credentials and manages recovery without a central identity database.",
    owns: "Pairwise account IDs, credential hashes, recovery secrets.",
    never: "Legal name, date of birth, Aadhaar/PAN copies, or a global user ID.",
    contract: "OpenAPI 3.1 + OIDC",
  },
  {
    name: "age-assurance-adapter",
    plane: "Edge & access",
    responsibility:
      "Accepts signed age-band assertions from a trusted issuer, verifies them offline and releases short-lived entitlements.",
    owns: "Age band, issuer, assurance method, assertion hash, expiry.",
    never: "DOB, ID scans, selfies, biometrics, or a browsable verification history.",
    contract: "OpenAPI 3.1 + JWKS",
  },
  {
    name: "consent-registry",
    plane: "Edge & access",
    responsibility:
      "Records purpose-specific consent and withdrawal for optional processing, including children's data paths.",
    owns: "Consent receipts, purposes, policy versions, withdrawal timestamps.",
    never: "Behavioural profiles or inferred interests used for ads.",
    contract: "OpenAPI 3.1 + events",
  },
  {
    name: "content-catalog",
    plane: "Content",
    responsibility:
      "Stores title metadata, licence attribution, age labels, availability windows and operator scoping.",
    owns: "Catalog records, licence proofs, category taxonomy.",
    never: "Raw video bytes or viewer identities.",
    contract: "OpenAPI 3.1",
  },
  {
    name: "media-pipeline",
    plane: "Content",
    responsibility:
      "Validates uploads, runs ffmpeg transcodes, publishes HLS renditions and signed playback URLs.",
    owns: "Object storage keys, transcode jobs, renditions.",
    never: "Account identities or moderation decisions.",
    contract: "Async jobs + signed URLs",
  },
  {
    name: "search-index",
    plane: "Content",
    responsibility:
      "Builds a rebuildable search index from catalog events; applies operator visibility rules at query time.",
    owns: "Derived index documents.",
    never: "PII, raw play history, or excluded-content entries from other operators.",
    contract: "OpenAPI 3.1 + catalog events",
  },
  {
    name: "moderation-service",
    plane: "Safety & legal",
    responsibility:
      "Runs operator-scoped review queues, policy-pack checks, decisions, appeals and evidence capture.",
    owns: "Decisions, policy versions, reviewer actions, appeal records.",
    never: "A global blocklist or authority over another operator's catalog.",
    contract: "OpenAPI 3.1 + events",
  },
  {
    name: "notice-takedown-service",
    plane: "Safety & legal",
    responsibility:
      "Intakes grievances and lawful notices, starts statutory clocks, routes to the responsible operator and records responses.",
    owns: "Notices, acknowledgements, SLA clocks, responses and reports.",
    never: "Automatic platform-wide removal outside the operator's scope.",
    contract: "OpenAPI 3.1 + events",
  },
  {
    name: "transparency-ledger",
    plane: "Safety & legal",
    responsibility:
      "Append-only, hash-chained record of moderation, notice and protocol-governance actions for audits and public reports.",
    owns: "Hash-chained ledger entries and report snapshots.",
    never: "PII beyond the minimum needed to defend a decision.",
    contract: "Append API + signed exports",
  },
  {
    name: "commerce-service",
    plane: "Commerce",
    responsibility:
      "Handles shop catalog, carts, orders, refunds and creator splits; delegates payments to a PCI-DSS PSP.",
    owns: "Orders, refunds, payout schedules, tax invoices.",
    never: "Card numbers, CVV, UPID credentials, or unrelated identity data.",
    contract: "OpenAPI 3.1 + PSP webhooks",
  },
  {
    name: "analytics-telemetry",
    plane: "Data & federation",
    responsibility:
      "Aggregates playback, ad and commerce metrics for creator reporting and capacity planning.",
    owns: "Aggregated rollups and cohort-level counters.",
    never: "Cross-service behavioural profiles, kids' tracking, or raw identifiers in dashboards.",
    contract: "Async event ingestion",
  },
  {
    name: "operator-registry",
    plane: "Data & federation",
    responsibility:
      "Publishes operator endpoints, signed policy-pack versions and protocol revisions under multi-party governance.",
    owns: "Registry entries, signatures, protocol revision metadata.",
    never: "Content decisions, operator catalogs, or a unilateral protocol admin key.",
    contract: "OpenAPI 3.1 + signed manifests",
  },
];

export interface AgeStep {
  step: string;
  title: string;
  detail: string;
}

export const AGE_FLOW: AgeStep[] = [
  {
    step: "01",
    title: "Restricted title requested",
    detail:
      "The player asks the gate service for an entitlement. It never asks the viewer to type a birth date.",
  },
  {
    step: "02",
    title: "Trusted issuer proves the band",
    detail:
      "The viewer is redirected to a regulated issuer (e.g. DigiLocker-backed or telecom/bank-issued age band) and consents to share only the band.",
  },
  {
    step: "03",
    title: "Assertion verified offline",
    detail:
      "age-assurance-adapter checks the issuer signature via JWKS, nonce, expiry and assurance level. It derives over-18 or under-18.",
  },
  {
    step: "04",
    title: "Short-lived entitlement released",
    detail:
      "The gate unlocks for a bounded session. Only assertion metadata is stored — never the underlying document.",
  },
];

export const AGE_STORED: string[] = [
  "Age band (over-18 / under-18)",
  "Issuer ID and assurance method",
  "Assertion hash and expiry",
  "Pairwise subject pseudonym",
];

export const AGE_NEVER: string[] = [
  "Date of birth",
  "Aadhaar / PAN / passport scans",
  "Selfies, video or biometric templates",
  "A central profile that links activity across services",
];

export interface FailureMode {
  scenario: string;
  control: string;
}

export const FAILURE_MODES: FailureMode[] = [
  {
    scenario: "Issuer unavailable or slow",
    control:
      "Fail closed for adult titles only; keep the rest of the catalog available and retry with a bounded timeout.",
  },
  {
    scenario: "Assertion expired",
    control: "Re-verify. Never extend the entitlement silently.",
  },
  {
    scenario: "Replayed or forged assertion",
    control:
      "Reject on nonce/signature mismatch, rate-limit the subject and write a ledger event.",
  },
  {
    scenario: "Viewer declines verification",
    control:
      "Adult catalog stays locked; no dark patterns, no degraded UI tricks.",
  },
  {
    scenario: "Under-18 viewer detected",
    control:
      "Route to the kids/teen experience; enable only consent-based features and no behavioural ads.",
  },
  {
    scenario: "Foreign issuer or data transfer",
    control:
      "Default to a domestic issuer. Any transfer is reviewed and approved in the policy pack.",
  },
];

export interface ObligationRow {
  obligation: string;
  clock: string;
  service: string;
}

export const OBLIGATIONS: ObligationRow[] = [
  {
    obligation: "Acknowledge a grievance",
    clock: "Within 24 hours",
    service: "notice-takedown-service",
  },
  {
    obligation: "Resolve a grievance",
    clock: "Within 15 days",
    service: "notice-takedown-service",
  },
  {
    obligation: "Act on a court or government notice",
    clock: "Within 36 hours",
    service: "notice-takedown-service",
  },
  {
    obligation: "Publish the monthly compliance report",
    clock: "Monthly",
    service: "transparency-ledger",
  },
  {
    obligation: "Retain records for lawful requests",
    clock: "180 days (configurable)",
    service: "moderation + notice services",
  },
  {
    obligation: "Publisher-side obligations for news content",
    clock: "Per policy pack",
    service: "content-catalog + moderation",
  },
];

export interface RetentionRow {
  dataClass: string;
  service: string;
  purpose: string;
  retention: string;
}

export const RETENTION: RetentionRow[] = [
  {
    dataClass: "Pseudonymous account + credential hashes",
    service: "identity-broker",
    purpose: "Sign-in, recovery and abuse controls",
    retention: "Account life + 30-day recovery hold",
  },
  {
    dataClass: "Age band, issuer, assertion hash",
    service: "age-assurance-adapter",
    purpose: "Restricted-content entitlement",
    retention: "12 months maximum, then re-verify",
  },
  {
    dataClass: "Consent receipts",
    service: "consent-registry",
    purpose: "Prove consent and respect withdrawal",
    retention: "Purpose life + statutory limitation",
  },
  {
    dataClass: "Moderation decisions + evidence",
    service: "moderation-service",
    purpose: "Defensibility, appeals and reporting",
    retention: "180 days by default (policy-pack set)",
  },
  {
    dataClass: "Notices and takedown records",
    service: "notice-takedown-service",
    purpose: "Statutory clocks and compliance reports",
    retention: "180 days by default (policy-pack set)",
  },
  {
    dataClass: "Aggregated playback and ad metrics",
    service: "analytics-telemetry",
    purpose: "Creator payouts and capacity planning",
    retention: "24 months, aggregated, no raw IDs",
  },
  {
    dataClass: "Orders, refunds and tax invoices",
    service: "commerce-service",
    purpose: "Contract, tax and accounting duties",
    retention: "8 years (confirm with counsel/CA)",
  },
  {
    dataClass: "Audit ledger entries",
    service: "transparency-ledger",
    purpose: "Tamper-evident accountability",
    retention: "Append-only; hashes plus minimal context",
  },
];

export const PRINCIPLES: { title: string; detail: string }[] = [
  {
    title: "One deployable per bounded context",
    detail:
      "Every service ships independently with its own version, pipeline and rollback.",
  },
  {
    title: "Database per service",
    detail:
      "No shared tables or cross-service joins. Access is through APIs or events only.",
  },
  {
    title: "Contract-first",
    detail:
      "OpenAPI 3.1 for commands/queries, AsyncAPI 2.6 for events, versioned and tested in CI.",
  },
  {
    title: "No monorepo",
    detail:
      "Each service keeps its own repository and release cadence; shared code is thin, versioned packages.",
  },
  {
    title: "Zero trust",
    detail:
      "mTLS between services, short-lived credentials, least-privilege scopes per call.",
  },
  {
    title: "Per-service SLOs",
    detail:
      "Latency, error budget and saturation are owned by the team that ships the service.",
  },
];

export const ANTI_PATTERNS: string[] = [
  "A central KYC or identity database",
  "A self-declared “I am 18” checkbox treated as age assurance",
  "A global takedown switch that overrides independent operators",
  "One shared database or schema across services",
  "A monorepo with coupled releases across services",
  "A god-key that can rewrite protocol rules unilaterally",
  "Silent shadow-banning without a recorded decision or appeal",
  "Storing ID documents “for future use”",
  "Behavioural advertising or tracking for children",
  "Synchronous ten-service request chains with no timeouts",
];

export const LAUNCH_GATE: string[] = [
  "Indian media/technology counsel sign-off on the content model and intermediary status",
  "Age-assurance provider due diligence, DPIA and data-flow map approved",
  "Grievance officer appointed and escalation runbook tested",
  "Notice/takedown timelines automated and evidenced end-to-end",
  "Retention schedule approved and enforced by scheduled jobs",
  "Operator charter and policy-pack versioning published",
  "Security review and independent penetration test completed",
  "DPDP breach playbook rehearsed with named owners",
  "Transparency report template and monthly process ready",
  "Shop/payment flows reviewed against PCI-DSS and consumer-protection duties",
];

export const PHASES: { phase: string; title: string; detail: string }[] = [
  {
    phase: "Phase 0",
    title: "Legal gate + policy pack",
    detail:
      "Counsel review, DPIA, retention schedule. No public uploads until this is signed off.",
  },
  {
    phase: "Phase 1",
    title: "Core trust services",
    detail:
      "Catalog, identity-broker, age-assurance-adapter, notices and ledger in a closed beta.",
  },
  {
    phase: "Phase 2",
    title: "Commerce",
    detail:
      "Shop orders, refunds and creator splits behind a PCI-DSS payment provider.",
  },
  {
    phase: "Phase 3",
    title: "Federation",
    detail:
      "Operator registry, signed policy packs and multi-party protocol governance.",
  },
];
