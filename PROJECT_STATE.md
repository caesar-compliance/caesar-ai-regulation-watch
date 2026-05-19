# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.4.0` |
| **Current phase** | Read-only Astro static site skeleton |
| **Status** | Static YAML + generated HTML preview — no watchers, APIs, database, auth, or external integrations |
| **Working branch** | `agent/v0.4.0-static-site-skeleton` |
| **Latest completed task** | Astro static site from pilot `data/` |
| **Next recommended step** | Control Tower review of public pages; cross-repo evidence alignment; v0.5 map/search |

---

## Site inventory (v0.4.0)

| Item | Value |
|---|---|
| Framework | Astro 5 (static output) |
| Build output | `dist/` |
| Pages generated | 20 static routes |
| Validation | `npm run validate:data` (28 checks passed) |
| Dependencies | `astro`, `js-yaml`, `ajv`, `ajv-formats` |

---

## Data inventory

| Layer | Count | Guide |
|---|---|---|
| Jurisdictions / sources | 2 / 7 | [PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) |
| Law / guidance / change samples | 1 / 2 / 2 | [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) |
| Taxonomies | 8 files | [TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md) |
| Export samples | 2 records | [EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) |
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
| v0.3.3 VerifyWise clean-room study | **Complete** |
| v0.4.0 Static public site skeleton | **Complete** (pending Control Tower page review) |
| v0.5 Map, search, feeds | Not started |
| v0.6 Watchers | Not started |
| v1.0 Pilot release | Not started |

---

## Boundaries

- No VerifyWise or competitor source code in the repository.
- Static site is **read-only** — no runtime YAML loading, no remote fetch in app code.
- All sample content shows review/pending banners where applicable.
- Watchers, APIs, schedulers, databases, authentication, and export **runtime** are **not implemented**.
- Official-source-first data remains the rule.

---

## Ecosystem links

- [caesar-ai-governance-hub](https://github.com/caesar-compliance/caesar-ai-governance-hub)
- [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence) — export alignment pending
