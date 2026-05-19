# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.3.2` |
| **Current phase** | Third-party acceleration policy and adoption plan |
| **Status** | Static manual data only — no third-party code imported; no watchers, UI, APIs, databases, or automated monitoring |
| **Working branch** | `agent/v0.3.2-third-party-acceleration-audit` |
| **Latest completed task** | Third-party acceleration audit and adoption plan |
| **Next recommended step** | Cross-repo alignment with `caesar-ai-evidence`; v0.3.3 static site + ajv CI |

---

## Data inventory

| Layer | Count | Guide |
|---|---|---|
| Jurisdictions / sources | 2 / 7 | [PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) |
| Law / guidance / change samples | 1 / 2 / 2 | [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) |
| Taxonomies | 8 files | [TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md) |
| Export samples | 2 records | [EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) |
| Acceleration research | 4 files + 2 policy docs | [THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md) |
| Schemas | 9 JSON Schema files | `schemas/` |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.1 Foundation & blueprint | **Complete** |
| v0.2.0 Pilot registry | **Complete** (approved) |
| v0.3.0 Sample records | **Complete** (approved) |
| v0.3.1 Taxonomy & export contract | **Complete** (pending cross-repo alignment) |
| v0.3.2 Acceleration plan | **Complete** |
| v0.3.3 Static site & schema CI | Not started |
| v0.4 Watchers | Not started |
| v1.0 Pilot release | Not started |

---

## Boundaries

- No third-party source code, package managers, or competitor datasets in v0.3.2.
- Competitor features are **benchmark inputs only** ([docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md)).
- Future implementation may use approved open-source dependencies and official-source ingestion per [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md).
- Watchers, UI, APIs, schedulers, databases, automated monitoring, and export **runtime** are **not implemented**.

---

## Ecosystem links

- [caesar-ai-governance-hub](https://github.com/caesar-compliance/caesar-ai-governance-hub)
- [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence) — export alignment pending
