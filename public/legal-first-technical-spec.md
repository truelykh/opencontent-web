# Opencontent.in — Legal-First Technical Specification

**Version:** 1.0 (draft)
**Status:** For review by Indian technology/media counsel. Engineering controls, not legal advice.
**Owner:** Platform architecture
**Audience:** Backend engineers, SRE, security, product, counsel.

---

## 0. Purpose

This specification turns the company's legal boundary into implementable microservice
decisions. It exists to prevent three failure modes:

1. **A central identity database** — a single store that maps people to legal identity,
   viewing history and purchases.
2. **An ineffective age gate** — a self-declaration checkbox presented as assurance.
3. **A global content-control mechanism** — one switch or admin that can override every
   independent operator.

It describes a target architecture, contracts and guardrails. It does not assert that
any particular legal obligation applies: that determination belongs to counsel, and the
resulting values are carried in a versioned policy pack.

**Non-goals:** building a monolith, a monorepo with coupled releases, a shared database,
or a protocol controlled by a single administrator.

---

## 1. Three commitments

| # | Commitment | Engineering consequence |
|---|------------|-------------------------|
| 1 | The company will not demand unnecessary personal information. | Pseudonymous accounts by default. Collect only fields with a declared purpose. One owning service per data class. |
| 2 | The company will not have unilateral control over independent operators or the protocol. | Operator-owned catalogs and moderation. Signed policy packs. Multi-party protocol change control. No master admin key. |
| 3 | The company will comply with obligations that apply to its own services. | Policy-pack-driven clocks and evidence. Service ownership matrix. Legal sign-off before launch. |

These commitments coexist: privacy and federation do not remove legal responsibility,
and compliance does not require a central identity database.

---

## 2. Legal boundary and policy packs

### 2.1 Frameworks to confirm with counsel

- Information Technology Act, 2000 and the IT Rules **as currently notified and amended**.
- Digital Personal Data Protection Act, 2023 and its notified rules.
- Ministry of Information and Broadcasting publisher-side guidance for news/curated
  content.
- Consumer-protection, payments (RBI / PCI-DSS via PSP) and company/tax record-keeping
  duties.
- Any sectoral or state requirements that apply to the operator's actual service.

Do **not** infer exemptions from decentralization. Whether an entity is an intermediary,
publisher or something else depends on its actual role and conduct, not on a diagram.

### 2.2 Policy pack

All statutory values are configuration, not code:

```yaml
policy_pack:
  id: in-it-rules
  version: 1.0.0
  jurisdiction: IN
  signed_by: counsel
  effective_from: 2026-10-01
  clocks:
    grievance_acknowledge_hours: 24
    grievance_resolve_days: 15
    court_or_gov_notice_action_hours: 36
    monthly_compliance_report: true
    lawful_request_record_retention_days: 180
  age_assurance:
    required_for: [adult_curated_content]
    accepted_assurance_levels: [issuer_signed_band]
    fail_mode: closed_for_restricted_only
  publisher_rules:
    news_content_review_required: true
```

Rules:

- A service may only read a **signed** policy pack; unsigned packs are rejected.
- Every moderation/notice decision records the policy-pack version used.
- Changing a value requires a new version, counsel signature and an audit entry.
- Policy-pack version is exposed in transparency reports.

---

## 3. Architecture decision record (ADR-001)

| Decision | Commitment | Engineering guardrail |
|----------|------------|-----------------------|
| User identity | No mandatory real-world identity by default | Pairwise pseudonymous accounts; no KYC store; optional creator verification does not create identity data. |
| Age verification | Privacy-preserving 18+ proof from a trusted issuer | Signed age-band assertion only; no DOB, documents, selfies or biometrics. |
| Content | No intentional facilitation of unlawful uploads | Licence attestation, upload validation and operator-scoped notice handling; no hidden global blocklist. |
| Infrastructure | Company and independent operators coexist | Per-operator control planes; shared infrastructure is stateless or opt-in. |
| Moderation | Transparent policies and operator-level decisions | Decisions carry scope, policy version, evidence and appeal path. |
| Governance | Public protocol and independent implementations | Versioned specifications; multi-party change control; no privileged protocol key. |
| Data | Minimum necessary processing and documented retention | Data map; per-service deletion jobs; no PII in logs; no shared user table. |
| Legal accountability | Clear responsibilities for company-operated services | Service ownership matrix; counsel sign-off; incident runbook with named owner. |

This ADR is a hard boundary for architecture review. A change that introduces a central
identity table, a global content flag, or a deployable spanning multiple bounded contexts
is rejected.

---

## 4. Architecture and delivery model

### 4.1 Principles

- **One deployable per bounded context.** Each service has its own release, rollback and
  on-call rotation.
- **Database per service.** No shared schemas, no cross-service joins. Access is via API
  or events only.
- **Contract-first.** OpenAPI 3.1 for commands/queries, AsyncAPI 2.6 for events. Contracts
  are versioned in a registry and tested in CI.
- **Asynchronous by default across boundaries.** Sagas/outbox replace distributed
  transactions.
- **No monorepo.** Each service is its own repository with its own pipeline, version,
  migrations and CODEOWNERS. Shared code is limited to thin, versioned client libraries
  and schemas.
- **Zero trust.** mTLS between services, short-lived credentials, least-privilege scopes
  per call, no implicit trust from network location.
- **Per-service SLOs and error budgets.**
- **Cells, not one giant cluster.** Deployments are partitioned to limit blast radius.
- **No PII in logs, traces or metrics.** Pseudonymous identifiers only.

### 4.2 What "no monorepo" means concretely

- Independent repositories; no cross-repo path dependencies.
- Semantic versioning for APIs and events; breaking changes require a new major version
  and a migration window.
- Message schemas published to a contract registry; consumers pin compatible ranges.
- A cross-service change lands as coordinated, independently revertible releases — never a
  single lockstep commit.

A "distributed monolith" (shared database, lockstep releases, synchronous call chains) is
explicitly out of scope.

---

## 5. Service inventory

Thirteen services, each owning its data. The web app is a separate frontend deployable and
is not bundled into this repository set.

| Service | Plane | Responsibility | Owns | Must never |
|---------|-------|----------------|------|------------|
| edge-gateway | Edge & access | TLS, routing, rate limits, bot/DDoS controls, request signing | Ephemeral session cache, routing config | Identity documents, content rulings, long-lived profiles |
| identity-broker | Edge & access | Pairwise pseudonymous accounts, credential rotation, recovery | Pairwise account IDs, credential hashes, recovery secrets | Legal name, DOB, ID copies, global user ID |
| age-assurance-adapter | Edge & access | Verifies issuer-signed age bands and issues short-lived entitlements | Age band, issuer, method, assertion hash, expiry | DOB, ID scans, selfies, biometrics, verification history |
| consent-registry | Edge & access | Purpose-specific consent and withdrawal, including children's paths | Consent receipts, purposes, policy versions | Behavioural profiles or ad interests |
| content-catalog | Content | Title metadata, licence attribution, age labels, availability | Catalog records, licence proofs, taxonomy | Raw media bytes or viewer identities |
| media-pipeline | Content | Upload validation, transcode, HLS, signed playback URLs | Object keys, transcode jobs, renditions | Account identities or moderation decisions |
| search-index | Content | Rebuildable index from catalog events, operator visibility at query time | Derived index documents | PII, raw play history, other operators' excluded content |
| moderation-service | Safety & legal | Operator-scoped review queues, policy checks, decisions, appeals | Decisions, policy versions, reviewer actions, appeals | A global blocklist or authority over other operators |
| notice-takedown-service | Safety & legal | Grievances and lawful notices, statutory clocks, responses, reports | Notices, acknowledgements, clocks, responses | Automatic platform-wide removal outside operator scope |
| transparency-ledger | Safety & legal | Hash-chained, append-only audit of moderation, notice and governance actions | Ledger entries, report snapshots | PII beyond the minimum needed to defend a decision |
| commerce-service | Commerce | Shop catalog, carts, orders, refunds, creator splits via PSP | Orders, refunds, payout schedules, tax invoices | Card data, CVV, UPI credentials, unrelated identity data |
| analytics-telemetry | Data & federation | Aggregated playback, ad and commerce metrics | Aggregated rollups, cohort counters | Cross-service behavioural profiles, kids' tracking, raw IDs |
| operator-registry | Data & federation | Operator endpoints, signed policy packs, protocol revisions | Registry entries, signatures, revision metadata | Content decisions, catalogs, a unilateral admin key |

---

## 6. Identity, pseudonymity and age assurance

### 6.1 Pseudonymous accounts

- `identity-broker` issues a **pairwise subject identifier** per relying service; there is
  no global user ID linking activity across services.
- Recovery uses a minimal, purpose-scoped channel; no legal identity is required to watch
  or to publish public-domain content.
- Optional creator verification may display a badge; it must not become a hidden KYC store.
- No service may join identities across services except through a user-presented
  capability (e.g. a user-held export or authorized linking flow).

### 6.2 Age assurance flow

1. Viewer requests a restricted title. The player asks the gate for an entitlement; it
   never renders a birth-date field.
2. Viewer is redirected to a trusted issuer (e.g. a regulated provider using
   DigiLocker-backed or telecom/bank-issued age data) and consents to share only the age
   band.
3. `age-assurance-adapter` verifies the assertion offline: issuer allowlist, JWKS
   signature, nonce/replay, expiry, assurance level.
4. A short-lived entitlement is issued and bound to the pairwise session. Only metadata is
   stored.

### 6.3 Assertion contract (example)

```json
{
  "iss": "https://issuer.example.in",
  "sub": "pairwise-subject-8f1c",
  "age_band": "over_18",
  "assurance_level": "issuer_signed_band",
  "method": "digilocker_age_band",
  "iat": 1792416000,
  "exp": 1795008000,
  "nonce": "u-9f2c1a"
}
```

Verification rules:

- `iss` must be on the signed issuer allowlist for the jurisdiction.
- Signature verified against cached JWKS; key rotation tolerated with a short overlap.
- `exp` enforced with ≤60s clock skew; no silent extension.
- `nonce` single-use per attempt; replays rejected and audited.
- `age_band` is the only age signal persisted; raw DOB is never requested.

### 6.4 Storage

**Stored:** age band (`over_18` / `under_18`), issuer ID, assurance method, assertion hash,
expiry, pairwise subject.

**Never stored:** date of birth, Aadhaar/PAN/passport images, selfies/video, biometric
templates, a central profile linking services.

### 6.5 Failure modes

| Failure | Control |
|---------|---------|
| Issuer unavailable | Fail closed for restricted titles only; keep the rest of the catalog available; bounded retries. |
| Assertion expired | Re-verify; never extend silently. |
| Replayed/forged assertion | Reject; rate-limit the subject; write a ledger event. |
| Viewer declines | Restricted catalog remains locked; no dark patterns. |
| Under-18 detected | Kids/teen experience; consent-based features only; no behavioural ads or tracking. |
| Foreign issuer/transfer | Default to a domestic issuer; any transfer reviewed in the policy pack. |

### 6.6 Effectiveness requirements

- No self-declaration path for restricted titles.
- Server-side verification only; client state is never trusted.
- Entitlements expire; re-verification is scheduled.
- Under-18 paths use verifiable parental consent where required by the policy pack.
- Bypass attempts and verification outcomes are audited without PII.

---

## 7. Content safety, notices and transparency

### 7.1 Operator-scoped moderation

- Each operator publishes a signed policy pack and applies it to its own catalog.
- Reviewers hold least-privilege scopes for one operator only.
- Every decision records: scope, policy-pack version, reason code, evidence reference,
  reviewer, timestamp and appeal path.
- The company may remove content from **company-operated services only**. It cannot
  silently remove content from an independent operator's catalog.

### 7.2 Notice and takedown

Flow: intake → validity/scope check → operator decision → action + ledger + appeal.

Baseline clocks (confirm against currently notified rules):

| Obligation | Baseline |
|------------|----------|
| Acknowledge a grievance | 24 hours |
| Resolve a grievance | 15 days |
| Act on court/government notice | 36 hours |
| Monthly compliance report | monthly |
| Retain records for lawful requests | 180 days (policy-pack set) |

Changing a clock requires a new signed policy pack. The ledger records which version was
in force for each decision.

### 7.3 No global content control

Prohibited:

- A platform-wide take-down switch that overrides every operator.
- A hidden blocklist applied without a recorded decision.
- A reviewer role with authority over other operators' catalogs.
- Protocol-level content rules changed by a single admin key.

### 7.4 Decision event (example)

```json
{
  "id": "evt-01JB...",
  "type": "moderation.decision.recorded.v1",
  "source": "moderation-service",
  "operator_id": "op-in-01",
  "subject": { "content_id": "vid-movie-01", "scope": "operator_catalog" },
  "decision": "restrict",
  "reason_code": "policy.copyright.claim_upheld",
  "policy_pack": "in-it-rules@1.0.0",
  "evidence_ref": "evidence/01JB...",
  "appeal": { "available": true, "deadline": "2026-10-25T00:00:00Z" },
  "occurred_at": "2026-10-18T08:12:00Z"
}
```

---

## 8. Federation and protocol governance

- Independent implementations may interoperate via published specifications and signed
  manifests.
- `operator-registry` publishes endpoints, policy-pack versions and protocol revisions; it
  does **not** publish content decisions.
- Protocol changes require multi-party approval (documented charter, public comment
  window, maintainer quorum). There is no single admin key that can rewrite rules.
- Operators can exit: catalog export, portable identity-independent data, documented
  migration. No lock-in through proprietary schemas.
- Interoperability is tested with at least two independent implementations in CI.

---

## 9. Data protection, retention and security

### 9.1 Data map

| Data class | Service | Purpose | Retention |
|------------|---------|---------|-----------|
| Pseudonymous account + credential hashes | identity-broker | Sign-in, recovery, abuse controls | Account life + 30-day recovery hold |
| Age band, issuer, assertion hash | age-assurance-adapter | Restricted-content entitlement | 12 months max, then re-verify |
| Consent receipts | consent-registry | Prove consent, respect withdrawal | Purpose life + statutory limitation |
| Moderation decisions + evidence | moderation-service | Defensibility, appeals, reporting | 180 days default (policy pack) |
| Notices and takedown records | notice-takedown-service | Statutory clocks and reports | 180 days default (policy pack) |
| Aggregated playback/ad metrics | analytics-telemetry | Payouts and capacity planning | 24 months, aggregated, no raw IDs |
| Orders, refunds, invoices | commerce-service | Contract, tax, accounting | 8 years (counsel/CA confirm) |
| Audit ledger entries | transparency-ledger | Tamper-evident accountability | Append-only, hashes + minimal context |

### 9.2 Controls

- Deletion fans out as events; each service deletes its own data and reports completion.
- PII is prohibited in logs, traces and metrics.
- Encryption in transit (TLS 1.3, mTLS internally) and at rest.
- Secrets in a managed vault; no long-lived credentials in images.
- SBOM, signed images, dependency scanning and least-privilege CI identities.
- DPIA, data-flow map and retention schedule are launch gates.

---

## 10. Repository and deployment topology

**No monorepo.** Each service is an independent repository:

```text
fcontent-age-assurance/          # own repo, own pipeline
  api/openapi.yaml
  events/asyncapi.yaml
  migrations/
  deploy/helm/
  CODEOWNERS
```

- The web frontend (this Next.js app) is its own repository/deployable.
- Contracts are published to a registry; consumers pin compatible ranges.
- CI per repository: lint, unit, contract, integration, image scan, signed artifact.
- Deployment: Kubernetes per service or cell, HPA, PodDisruptionBudget, per-service SLO.
- Observability: OpenTelemetry traces and metrics; no PII; alert on notice-clock breach,
  age-gate error rate and ledger lag.

---

## 11. API and event conventions

- **Envelope:** CloudEvents-compatible (`id`, `source`, `type`, `subject`, `time`, `data`).
- **Idempotency:** every command carries `Idempotency-Key`; consumers dedupe on event id.
- **Versioning:** `v1` in type/URL; additive changes preferred; deprecation window ≥90 days.
- **Errors:** RFC 9457 problem+json; no internal details leaked.
- **Auth:** workload identity + mTLS; scopes per operation; no shared service account.
- **Time:** UTC ISO-8601 everywhere; clocks monitored.

Example event envelope:

```json
{
  "specversion": "1.0",
  "id": "evt-01JB...",
  "source": "notice-takedown-service",
  "type": "notice.acknowledged.v1",
  "subject": "notice/01JB...",
  "time": "2026-10-18T08:12:00Z",
  "data": { "operator_id": "op-in-01", "clock": "acknowledge_24h" }
}
```

---

## 12. SLOs and operations

| Service | Availability | Latency target | Notes |
|---------|--------------|----------------|-------|
| edge-gateway | 99.95% | p95 < 40 ms edge | Rate limits are a safety control |
| identity-broker | 99.9% | p95 < 150 ms | No identity data by design |
| age-assurance-adapter | 99.9% | p95 < 250 ms | Fail closed for restricted only |
| content-catalog | 99.95% | p95 < 120 ms | Cacheable read path |
| notice-takedown-service | 99.9% | clock breach = 0 | Alert before deadline |
| commerce-service | 99.9% | p95 < 300 ms | PSP dependency isolated |

Runbooks: issuer outage, replay attack, notice-clock breach, ledger integrity failure,
payment-provider outage. Every runbook names an owner.

---

## 13. Pre-launch legal gate

Ship-blocking, each with a named owner and evidence:

- [ ] Indian media/technology counsel sign-off on content model and intermediary status.
- [ ] Age-assurance provider due diligence, DPIA and data-flow map approved.
- [ ] Grievance officer appointed; escalation runbook tested.
- [ ] Notice/takedown timelines automated and evidenced end to end.
- [ ] Retention schedule approved and enforced by scheduled jobs.
- [ ] Operator charter and policy-pack versioning published.
- [ ] Security review and independent penetration test completed.
- [ ] DPDP breach playbook rehearsed.
- [ ] Transparency report template and monthly process ready.
- [ ] Payment flows reviewed against PCI-DSS and consumer-protection duties.

### Delivery phases

0. **Legal gate + policy pack** — no public uploads until signed off.
1. **Core trust services** — catalog, identity-broker, age-assurance-adapter, notices,
   ledger in closed beta.
2. **Commerce** — orders, refunds, creator splits behind a PCI-DSS PSP.
3. **Federation** — operator registry, signed policy packs, multi-party governance.

---

## 14. Prohibited patterns

- A central KYC or identity database.
- A self-declared “I am 18” checkbox treated as age assurance.
- A global take-down switch that overrides independent operators.
- One shared database or schema across services.
- A monorepo with coupled releases across services.
- A god-key that can rewrite protocol rules unilaterally.
- Silent shadow-banning without a recorded decision or appeal.
- Storing ID documents “for future use”.
- Behavioural advertising or tracking for children.
- Synchronous ten-service request chains with no timeouts.

---

## 15. Open questions for counsel

1. Which obligations attach to company-operated services versus independent operators,
   given the actual content model?
2. Is issuer-signed age-band assurance sufficient for restricted catalog access, and which
   issuers are acceptable?
3. What retention periods are required for notices, moderation evidence and commerce
   records?
4. What publisher-side obligations apply to news/curated content?
5. What disclosures and user-facing notices are required for the age-assurance flow?
6. How should cross-border issuer or infrastructure processing be documented?
