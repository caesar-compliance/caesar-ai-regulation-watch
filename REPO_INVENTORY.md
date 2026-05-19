# Repository Inventory — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

Living registry of tracked files and their roles.

---

## Root documentation

| File | Role |
|---|---|
| **README.md** | Public entry: vision, pilot registry link, doc map |
| **SPEC.md** | Requirements; v0.2.0 pilot data paths |
| **ARCHITECTURE.md** | Layers; static registry as data foundation |
| **ROADMAP.md** | Phases; v0.2.0 marked complete (pending review) |
| **CHANGELOG.md** | Semver history |
| **REPO_INVENTORY.md** | This file |
| **PROJECT_STATE.md** | Phase v0.2.0, registry counts |
| **NEXT_ACTIONS.md** | Control Tower review → v0.3 |

---

## data/ (v0.2.0 pilot)

| File | Role |
|---|---|
| **data/jurisdictions/eu.yml** | EU supranational jurisdiction profile |
| **data/jurisdictions/norway.yml** | Norway jurisdiction profile (EEA monitoring linkage) |
| **data/sources/eu-ai-act.yml** | EUR-Lex AI Act instrument entry |
| **data/sources/eu-ai-office.yml** | Commission AI Office / framework pages |
| **data/sources/eur-lex.yml** | EUR-Lex portal monitoring entry point |
| **data/sources/edpb.yml** | European Data Protection Board |
| **data/sources/edps.yml** | European Data Protection Supervisor |
| **data/sources/norway-ai-act-implementation.yml** | regjeringen.no AI / implementation pages |
| **data/sources/datatilsynet.yml** | Datatilsynet (Norwegian DPA) |

---

## schemas/

| File | Role |
|---|---|
| **schemas/jurisdiction.schema.json** | JSON Schema for jurisdiction YAML |
| **schemas/source.schema.json** | JSON Schema for source YAML |

---

## docs/

| File | Role |
|---|---|
| **docs/PILOT_SOURCE_REGISTRY.md** | Pilot registry guide, gaps, review workflow |
| **docs/FULL_SCALE_PRODUCT_BLUEPRINT.md** | Master product blueprint |
| **docs/COMPETITOR_BENCHMARKS.md** | Benchmark study notes |
| **docs/DATA_MODEL_DRAFT.md** | Full entity model draft |
| **docs/UI_UX_VISION.md** | Public site UX direction |
| **docs/DECISION_LOG.md** | Decisions DEC-001–009 |
| **docs/RESEARCH_CONTEXT.md** | Domain research (preserve) |

---

## Work areas

| Path | Role |
|---|---|
| **work-items/.gitkeep** | Task sandbox placeholder |

---

## Planned (not yet created)

| Path | Role |
|---|---|
| `data/laws/` | Law/instrument records (v0.3) |
| `data/guidance/` | Guidance records (v0.3) |
| `data/changes/` | Change records (v0.3) |
| `data/timelines/` | Timeline events (v0.3) |
| `mappings/controls/` | Control links |
| `mappings/evidence/` | Evidence suggestions |
| `site/` | Static site source |

---

## Update guidelines

1. Add new registry files to the tables above.
2. Bump [CHANGELOG.md](CHANGELOG.md) on registry changes.
3. Keep `review_status` accurate after Control Tower review.
