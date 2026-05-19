# Development Roadmap — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

This roadmap reflects the **full-scale product vision**, delivered in disciplined phases.

**Current (v0.7.0):** first official-source watcher prototype (2 pilot sources, manual CLI, metadata-only snapshots). **Next:** Control Tower record content review; validate diff detection on second watcher run; expand watchers only after approval.

---

## Phase overview

```text
v0.1 Foundation ──> v0.2.0 Registry ──> v0.3.0 Samples ──> v0.3.1 Taxonomy/export ──> v0.3.2 Acceleration ──> v0.3.3 VerifyWise study ──> v0.4.0 Static site ──> v0.5 Map/search/feeds ──> v0.6 Watchers ──> v1.0 Pilot release
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

## v0.3.3 — VerifyWise clean-room architecture study

**Status:** Complete on branch `agent/v0.3.3-verifywise-cleanroom-architecture` (19 May 2026)

**Goal:** Study VerifyWise as architecture/UX reference only; produce clean-room backlog and v0.4.0 static site plan without importing code.

**Deliverables:**

- [x] [research/VERIFYWISE_ARCHITECTURE_STUDY.md](research/VERIFYWISE_ARCHITECTURE_STUDY.md)
- [x] [research/CLEAN_ROOM_FEATURE_BACKLOG.md](research/CLEAN_ROOM_FEATURE_BACKLOG.md)
- [x] [docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md)
- [x] [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md)
- [x] Updated README, SPEC, ARCHITECTURE, benchmarks, DECISION_LOG

**Exit criteria:** No VerifyWise files committed; Control Tower accepts clean-room plan; Astro recommended for v0.4.0.

---

## v0.4.0 — Static public site skeleton (read-only)

**Status:** Complete on branch `agent/v0.4.0-static-site-skeleton` (19 May 2026)

**Goal:** Read-only static public site from `data/` using Astro; ajv validation script.

**Deliverables:**

- [x] Astro project (`src/`, `package.json`, `astro.config.mjs`)
- [x] Pages: home, jurisdictions, sources, records, changes, exports
- [x] `scripts/validate-data.mjs` — 28 YAML validations passing
- [x] Taxonomy-driven badges; review/sample banners
- [ ] Control Tower review of generated pages
- [ ] GitHub Actions CI (optional follow-up)

**Exit criteria:** `npm run build` succeeds; no backend or watchers.

---

## v0.4.1 — Search, browse UX, static exports

**Status:** Complete on branch `agent/v0.4.1-search-ux-static-exports` (19 May 2026)

**Deliverables:**

- [x] Pagefind search (`/search/`)
- [x] Client-side filters (records, sources, changes)
- [x] Methodology and disclaimer pages
- [x] `generate:exports` — JSON + RSS
- [x] UI polish (nav, footer, mobile)

---

## v0.5.0 — Global data foundation, timelines, CI

**Status:** Complete on branch `agent/v0.5.0-global-data-timeline-ci` (19 May 2026)

**Deliverables:**

- [x] 11 new jurisdiction profiles + ~20 official sources
- [x] `data/timelines/` + schema + `/timelines/` pages
- [x] GitHub Actions validate → generate → build
- [ ] Leaflet map (deferred)

---

## v0.5.1 — Static map and review queue

**Status:** Complete on branch `agent/v0.5.1-map-review-queue` (19 May 2026)

**Deliverables:**

- [x] Jurisdiction `map` metadata (13 markers)
- [x] `/map/` static SVG (no Leaflet, no remote tiles)
- [x] `/review-queue/` read-only with filters
- [x] `map-coverage.json` and `review-queue.json` exports
- [ ] Optional Leaflet basemap (future, if approved)

---

## v0.6 — Watchers & change detection (pilot sources only)

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
