# Development Roadmap — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

This roadmap reflects the **full-scale product vision**, delivered in disciplined phases. No product code, package managers, or watchers until registry and pilot data are approved.

---

## Phase overview

```text
v0.1 Foundation ──> v0.2 Registry & model ──> v0.3 Pilot data ──> v0.4 Watchers ──> v0.5 Public site & feeds ──> v1.0 Pilot release
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

## v0.2 — Source registry & data model (documentation → files)

**Status:** Next

**Goal:** Approve and commit machine-readable registry **without** automated watchers.

**Deliverables:**

- Jurisdiction YAML/JSON for pilot set (EU, Norway minimum)
- Official source registry entries with credibility tiers
- JSON Schema or JSON Schema draft for core entities
- Control/evidence mapping taxonomy v0.1 (with hub)
- Alignment check with `caesar-ai-evidence` regulation-change draft

**Exit criteria:** Schema validates sample files; hub quality gate language review passed.

---

## v0.3 — Pilot curated data & static skeleton

**Status:** Planned

**Goal:** Manually curated sample content proving the model.

**Deliverables:**

- Sample law/guidance records for EU AI Act cluster and Norway
- Sample change records with affected controls/evidence
- Timeline files for pilot jurisdictions
- Static site skeleton (globe placeholder + jurisdiction page template)
- No automated fetching

**Exit criteria:** Static pages render from data; every page has source links and disclaimers.

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
