# Development Roadmap — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

This roadmap reflects the **full-scale product vision**, delivered in disciplined phases.

**Current (v0.3.2):** third-party acceleration policy and adoption plan — still no watchers, UI, APIs, imported dependencies, or automated monitoring. **Next:** Cross-repo evidence alignment; v0.3.3 static site skeleton + CI validation.

---

## Phase overview

```text
v0.1 Foundation ──> v0.2.0 Registry ──> v0.3.0 Samples ──> v0.3.1 Taxonomy/export ──> v0.3.2 Acceleration plan ──> v0.3.3 Static site/CI ──> v0.4 Watchers ──> v0.5 Public site & feeds ──> v1.0 Pilot release
```

---

## v0.1 — Repository foundation & blueprint

**Status:** Complete (19 May 2026)

**Goal:** Ecosystem-aligned repo with full-scale product documentation.

**Deliverables:**

- [x] Hub-aligned README, SPEC, ARCHITECTURE, ROADMAP
- [x] [docs/FULL_SCALE_PRODUCT_BLUEPRINT.md](docs/FULL_SCALE_PRODUCT_BLUEPRINT.md)
- [x] [docs/COMPETITOR_BENCHMARKS.md](docs/COMPETITOR_BENCHMARKS.md)
- [x] [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md)
- [x] [docs/UI_UX_VISION.md](docs/UI_UX_VISION.md)
- [x] PROJECT_STATE, NEXT_ACTIONS, DECISION_LOG, CHANGELOG

---

## v0.2.0 — Pilot source registry (EU & Norway)

**Status:** Complete on branch `agent/v0.2.0-pilot-source-registry` (19 May 2026) — pending Control Tower URL review

**Goal:** Machine-readable registry **without** automated watchers.

**Deliverables:**

- [x] Jurisdiction YAML: `data/jurisdictions/eu.yml`, `norway.yml`
- [x] Seven official source YAML files under `data/sources/`
- [x] JSON Schema: `schemas/jurisdiction.schema.json`, `schemas/source.schema.json`
- [x] [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md)
- [ ] Control Tower review (`review_status: reviewed`)
- [ ] Control/evidence mapping taxonomy v0.1 (deferred to post-review)
- [ ] Alignment check with `caesar-ai-evidence` regulation-change draft

**Exit criteria:** Control Tower approves URLs and scope text; optional schema validation in CI (future).

---

## v0.3.0 — Sample records (data-model validation)

**Status:** Complete on branch `agent/v0.3.0-sample-regulation-records` (19 May 2026) — pending Control Tower content review

**Goal:** Manual sample law, guidance, change, and mapping YAML proving the entity model **without** watchers or UI.

**Deliverables:**

- [x] `data/laws/eu-ai-act.yml`
- [x] `data/guidance/` — EU AI Office GPAI, Datatilsynet AI/privacy samples
- [x] `data/changes/` — two manual change samples
- [x] `mappings/` — control and evidence mapping samples
- [x] JSON Schemas for law, guidance, change, mappings
- [x] [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md)
- [ ] Control Tower review of sample content and placeholder control/evidence refs
- [ ] Timeline files (optional follow-up)
- [ ] Static site skeleton (deferred — separate approval)

**Exit criteria:** Schemas validate sample YAML; hub/evidence taxonomy alignment documented.

---

## v0.3.1 — Taxonomy, review workflow, and export contract

**Status:** Complete on branch `agent/v0.3.1-taxonomy-export-contract` (19 May 2026)

**Goal:** Stabilise allowed values, review states, draft control/evidence refs, and export record shape before watchers or UI.

**Deliverables:**

- [x] `data/taxonomies/` (8 taxonomy files)
- [x] `schemas/taxonomy.schema.json`, `schemas/evidence-export-record.schema.json`
- [x] `exports/samples/regulation-change-export.sample.yml`
- [x] [docs/TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md), [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md)
- [x] Updated mappings with `regulation_watch.control.*` / `regulation_watch.evidence.*` draft refs
- [ ] Cross-repo confirmation with `caesar-ai-evidence` regulation-change schema

**Exit criteria:** Taxonomies and export samples validate; Control Tower accepts draft ref convention.

---

## v0.3.2 — Third-party acceleration audit & adoption plan

**Status:** Complete on branch `agent/v0.3.2-third-party-acceleration-audit` (19 May 2026)

**Goal:** Document how to accelerate delivery using permissive open source, official sources, and licensed APIs — without importing third-party code in this release.

**Deliverables:**

- [x] [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md)
- [x] [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md)
- [x] [research/THIRD_PARTY_ACCELERATION_AUDIT.md](research/THIRD_PARTY_ACCELERATION_AUDIT.md)
- [x] [research/OPEN_SOURCE_COMPONENT_SHORTLIST.md](research/OPEN_SOURCE_COMPONENT_SHORTLIST.md)
- [x] [research/COMPETITOR_FEATURE_REPLICATION_PLAN.md](research/COMPETITOR_FEATURE_REPLICATION_PLAN.md)
- [x] [research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md](research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md)
- [x] Updated README, SPEC, ARCHITECTURE, benchmarks, DECISION_LOG

**Exit criteria:** Control Tower accepts policy; no package managers or vendored code committed.

---

## v0.3.3 — Static site skeleton & schema CI (optional)

**Status:** Planned

**Goal:** Read-only static pages from `data/` plus JSON Schema validation in CI (no automated fetching).

**Deliverables:** Astro (or approved SSG) skeleton; ajv validation; jurisdiction listing; source links and disclaimers on every page.

---

## v0.4 — Watchers & change detection (pilot sources only)

**Status:** Planned

**Goal:** Detect changes on a **small** set of approved RSS/HTML sources.

**Deliverables:**

- Snapshot store and diff pipeline (pilot)
- Change records with `pending` review status
- Internal review checklist (manual)
- Still no public AI summaries without approval

**Exit criteria:** At least one real detected change processed end-to-end in staging.

**Requires:** Control tower approval for live fetch targets and rate limits.

---

## v0.5 — Public site, RSS, JSON, evidence export

**Status:** Planned

**Goal:** Public intelligence layer suitable for consultants and ecosystem demos.

**Deliverables:**

- `regulations.caesar.no` or GitHub Pages deployment
- Global map + jurisdiction profiles (pilot depth)
- RSS and JSON exports
- Reviewed summaries for published changes
- `regulation-change` export samples for caesar-ai-evidence
- Methodology and disclaimer pages

**Exit criteria:** Definition of done for “public pilot” agreed in hub QUALITY_GATES.

---

## v1.0 — Stable pilot release

**Status:** Planned

**Goal:** Reliable monitoring for agreed pilot jurisdictions with governance mapping.

**Deliverables:**

- N official sources under active monitoring (target set TBD at v0.2)
- Documented review SLA for public publish
- Evidence export documented and tested against evidence validator
- Governance OS integration **spec** (implementation may be in OS repo)
- Expanded jurisdiction list (incremental, no “global complete” claim)

---

## Post–v1.0 themes (backlog)

| Theme | Description |
|---|---|
| **More jurisdictions** | Registry-driven expansion |
| **AI summary automation** | With mandatory review queue |
| **Comparison view** | Side-by-side jurisdictions |
| **Client alerts** | Email/webhook via Governance OS |
| **Open dataset integration** | AI Legislation Tracker etc., per license |
| **Enforcement calendar** | Tracked dates with verification flags |
| **Consultant memo templates** | Export packs for client delivery |

---

## Dependency on ecosystem

| Dependency | Phase |
|---|---|
| `caesar-ai-evidence` regulation-change schema | v0.2–v0.5 |
| Hub control taxonomy | v0.2 |
| `caesar-ai-governance-os` inbox spec | v1.0+ |
| `caesar-ai-vendor-watch` patterns | reference for change UX |

---

## What we are not scheduling yet

- Package manager selection
- Production database
- Authenticated multi-tenant API
- Mobile apps
- Legal opinion content authored by Caesar

See [NEXT_ACTIONS.md](NEXT_ACTIONS.md) for immediate tasks.
