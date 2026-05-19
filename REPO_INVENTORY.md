# Repository Inventory — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

Living registry of tracked files and their roles.

---

## Root documentation

| File | Role |
|---|---|
| **README.md** | Public entry; v0.3.0 status; registry and sample record links |
| **SPEC.md** | Requirements; v0.2.0 registry + v0.3.0 samples |
| **ARCHITECTURE.md** | Static data layers; sample records as manual YAML |
| **ROADMAP.md** | Phases through v0.3.0 sample records |
| **CHANGELOG.md** | Semver history |
| **REPO_INVENTORY.md** | This file |
| **PROJECT_STATE.md** | v0.3.0 phase and data counts |
| **NEXT_ACTIONS.md** | Control Tower sample review priorities |

---

## data/

### jurisdictions/ & sources/ (v0.2.0)

| File | Role |
|---|---|
| **data/jurisdictions/eu.yml** | EU jurisdiction profile |
| **data/jurisdictions/norway.yml** | Norway (`related_frameworks`: eu, eea) |
| **data/sources/*.yml** | Seven pilot official sources |

### laws/, guidance/, changes/ (v0.3.0 samples)

| File | Role |
|---|---|
| **data/laws/eu-ai-act.yml** | Manual sample EU AI Act law record |
| **data/guidance/eu-ai-office-general-purpose-ai.yml** | Manual sample EU AI Office GPAI guidance pointer |
| **data/guidance/datatilsynet-ai-privacy.yml** | Manual sample Datatilsynet AI/privacy guidance pointer |
| **data/changes/sample-eu-ai-act-status-change.yml** | Manual sample EUR-Lex metadata change (illustrative) |
| **data/changes/sample-datatilsynet-guidance-change.yml** | Manual sample Datatilsynet guidance change (illustrative) |

---

## mappings/ (v0.3.0 samples)

| File | Role |
|---|---|
| **mappings/change-to-controls.sample.yml** | Sample `may_affect_controls` / `suggested_control_review` mappings |
| **mappings/change-to-evidence.sample.yml** | Sample `may_affect_evidence` / `suggested_evidence_review` mappings |

---

## schemas/

| File | Role |
|---|---|
| **schemas/jurisdiction.schema.json** | Jurisdiction YAML |
| **schemas/source.schema.json** | Source YAML |
| **schemas/law.schema.json** | Law sample records |
| **schemas/guidance.schema.json** | Guidance sample records |
| **schemas/change.schema.json** | Change sample records |
| **schemas/change-control-mapping.schema.json** | Per-item control mapping |
| **schemas/change-evidence-mapping.schema.json** | Per-item evidence mapping |

---

## docs/

| File | Role |
|---|---|
| **docs/PILOT_SOURCE_REGISTRY.md** | v0.2.0 EU/Norway source registry guide |
| **docs/SAMPLE_RECORDS_GUIDE.md** | v0.3.0 sample records guide |
| **docs/FULL_SCALE_PRODUCT_BLUEPRINT.md** | Master product blueprint |
| **docs/COMPETITOR_BENCHMARKS.md** | Benchmark study notes |
| **docs/DATA_MODEL_DRAFT.md** | Full entity model draft |
| **docs/UI_UX_VISION.md** | Public site UX direction |
| **docs/DECISION_LOG.md** | Decisions DEC-001–011 |
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
| `data/timelines/` | Timeline events |
| `site/` | Static site source |

---

## Update guidelines

1. Register new `data/` or `mappings/` files in this inventory.
2. Bump [CHANGELOG.md](CHANGELOG.md) on substantive data changes.
3. Keep manual vs automated origin clear in change records.
