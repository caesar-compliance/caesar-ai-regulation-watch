# Decision Log — Caesar AI Regulation Watch

---

## [DEC-001] — 19 May 2026 — Repository standardization & governance

- **Status:** Approved
- **Decisions:**
  1. Follow Caesar AI Governance Hub standards and layouts.
  2. Control tower (Artem / ChatGPT) approves planning; coding agents execute implementation.
  3. No copying restricted competitor code or proprietary structures.
- **Rationale:** Ecosystem coherence and legal safety.

---

## [DEC-002] — 19 May 2026 — Full-scale product scope (documentation)

- **Status:** Approved
- **Decision:** Document Caesar AI Regulation Watch as a **global AI regulation monitoring** product, not only EU AI Act / Norway MVP wording.
- **In scope (vision):** global map, jurisdiction profiles, official source registry, law/guidance records, timelines, change history, status labels, source credibility, AI summary layer (review-gated), affected controls/evidence, RSS/JSON/export, public website, future Governance OS inbox.
- **Out of scope (claims):** compliance guarantees, legal advice, complete global coverage marketing.
- **Rationale:** Aligns with hub `FULL_SCALE_COMPETITOR_FEATURE_MAP` and competitor benchmarks (Techieray, VerifyWise, DLA Piper, OECD, IAPP, AI Legislation Tracker, artificialintelligenceact.eu) while preserving Caesar evidence-first differentiation.

---

## [DEC-003] — 19 May 2026 — Official-source-first policy

- **Status:** Approved
- **Decision:** Primary truth for public pages is **official or registered authoritative URLs**. Law firm matrices, trackers, and open datasets are secondary references for structure or supplementary data only, with attribution and license checks.
- **Rationale:** Reduces legal overclaim risk and matches hub quality expectations.

---

## [DEC-004] — 19 May 2026 — AI summaries require human review (default)

- **Status:** Approved
- **Decision:** AI-generated summaries may be stored as drafts; **public publication** defaults to **human-reviewed** content with disclaimers.
- **Rationale:** Benchmark products use summaries; Caesar must not present unreviewed AI text as governance guidance.

---

## [DEC-005] — 19 May 2026 — Static-first public architecture

- **Status:** Approved
- **Decision:** Public site v1 uses **static generation** from curated repo data; authenticated API and OS inbox are later phases.
- **Rationale:** Matches vendor-watch pattern, lowers ops burden, keeps blueprint phase code-free.

---

## [DEC-006] — 19 May 2026 — Control/evidence mapping language

- **Status:** Approved
- **Decision:** Mapping relationships use `may_affect` and `suggested_review` only — not mandatory compliance obligations.
- **Rationale:** Supports governance review without implying legal conclusions.

---

## [DEC-007] — 19 May 2026 — Pilot jurisdiction focus

- **Status:** Approved
- **Decision:** First implementation depth: **EU (AI Act cluster) + Norway**; additional jurisdictions via registry expansion without claiming exhaustive coverage.
- **Rationale:** Hub strategic angle and consulting market; expandable model.

---

## [DEC-008] — 19 May 2026 — No implementation in blueprint phase

- **Status:** Approved
- **Decision:** v0.1 delivers documentation only — no package managers, watchers, or UI code.
- **Rationale:** User-directed execution mode; reduce half-built repo risk.

---

## [DEC-009] — 19 May 2026 — EU/Norway pilot registry as v0.2.0 starting point

- **Status:** Approved (data committed; entries pending review)
- **Decision:** First machine-readable registry covers **EU** and **Norway** only, with seven `official_primary` sources and two jurisdiction files. All entries use `review_status: pending_review` until Control Tower approves URLs and scope text.
- **Fields:** Jurisdiction and source schemas use pilot field sets documented in [PILOT_SOURCE_REGISTRY.md](PILOT_SOURCE_REGISTRY.md) (`credibility_level`, `monitoring_scope`, etc.).
- **Explicit non-decisions:** No watchers, crawlers, APIs, UI, schedulers, or databases in this phase.
- **Rationale:** Matches ROADMAP v0.2, hub pilot focus (EU AI Act + Norway), and evidence-first incremental coverage without claiming legal completeness.

---

## [DEC-010] — 19 May 2026 — Norway EEA linkage via related_frameworks

- **Status:** Approved
- **Decision:** Norway is **not** modelled with `parent_jurisdiction: eu`. Use `parent_jurisdiction: null` and `related_frameworks: [eu, eea]` to document EEA/EØS monitoring context without implying EU membership.
- **Schema:** Optional `related_frameworks` array added to `schemas/jurisdiction.schema.json`.
- **Rationale:** Avoid misleading jurisdiction hierarchy; preserve legal-safe wording (Norway is not part of the EU).

---

## [DEC-011] — 19 May 2026 — Manual sample records before automated watchers

- **Status:** Approved (data committed; content pending Control Tower review)
- **Decision:** v0.3.0 adds **manual sample** law, guidance, and change YAML plus control/evidence mapping files to validate the data model **before** any watcher, UI, or API implementation. Change samples are explicitly **not** automated detections.
- **Taxonomy:** Pilot `ctrl_*` and `ev_*` refs are placeholders until aligned with hub standards and `caesar-ai-evidence`.
- **Rationale:** Reduces risk of building ingestion/UI on an unproven schema; supports governance-review wording (`may_affect`, `suggested_*_review`, `human_review_required`).

---

## [DEC-012] — 19 May 2026 — Taxonomy and export contract before automation

- **Status:** Approved (pending `caesar-ai-evidence` alignment)
- **Decision:** v0.3.1 adds canonical taxonomies, expanded review workflow (`draft` through `rejected_for_client_use`), draft `regulation_watch.control.*` / `regulation_watch.evidence.*` references with `reference_alignment: draft_pending_caesar_ai_evidence`, and `evidence-export-record` schema plus sample YAML. No export runtime, watchers, or UI.
- **Data boundaries:** `record_origin` distinguishes `official_source_registry`, `manual_sample`, and `future_watcher_output` on entity records.
- **Rationale:** Resolves v0.3.0 caveats (placeholder refs, undefined export shape, unstable review statuses) before v0.4 watchers or static site.

---

## [DEC-013] — 19 May 2026 — Third-party acceleration plan (v0.3.2)

- **Status:** Approved (documentation only)
- **Decision:** Add third-party acceleration **policy and research** without importing code, package managers, competitor datasets, or watchers. Competitor products remain **benchmark inputs**; official sources remain **primary truth**. Approved future stack direction: **Astro** (static site), **Leaflet** (2D map), **Pagefind** (search), **ajv** (schema CI) — adoption deferred to v0.3.3+.
- **Blocked until clarified:** Fairly regulation tracker repo (no LICENSE file). Techieray API data must not populate public Caesar exports without Commercial tier and terms compliance.
- **Data seed:** AI Legislation Tracker (MIT) may be used as supplementary gap-finding seed only after per-record official verification.
- **Rationale:** Accelerate delivery legally and technically; align with hub [LICENSE_AND_CODE_POLICY](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/research/LICENSE_AND_CODE_POLICY.md); keep v0.3.x data foundation clean before implementation.
- **Artifacts:** [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](THIRD_PARTY_CODE_AND_DATA_POLICY.md), [research/THIRD_PARTY_ACCELERATION_AUDIT.md](../research/THIRD_PARTY_ACCELERATION_AUDIT.md), [docs/ACCELERATION_DECISION_MATRIX.md](ACCELERATION_DECISION_MATRIX.md).

---

## [DEC-014] — 19 May 2026 — VerifyWise clean-room architecture study (v0.3.3)

- **Status:** Approved (documentation only)
- **Decision:** Study VerifyWise (GitHub monorepo + Global AI Regulations Tracker benchmark) as **architecture and UX reference only**. Produce clean-room backlog and v0.4.0 static site plan. **No VerifyWise code, schemas, UI, or proprietary data** in Caesar repos.
- **Implementation direction:** v0.4.0 read-only **Astro** static site from existing `data/` YAML (see [docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md), [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md)).
- **Official-source-first:** Unchanged — registry YAML remains primary truth.
- **Rationale:** Accelerate v0.4 without license risk; learn enterprise governance patterns (evidence, review, frameworks) while building a simpler public static product than VerifyWise SaaS.
- **Artifacts:** [research/VERIFYWISE_ARCHITECTURE_STUDY.md](../research/VERIFYWISE_ARCHITECTURE_STUDY.md), [research/CLEAN_ROOM_FEATURE_BACKLOG.md](../research/CLEAN_ROOM_FEATURE_BACKLOG.md).
