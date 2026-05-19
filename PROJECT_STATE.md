# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Product name** | Caesar AI Regulation Watch |
| **Current version** | `v0.3.0` |
| **Current phase** | Sample law / guidance / change records (data-model validation) |
| **Status** | Static manual data only — no watchers, UI, APIs, or automated monitoring |
| **Working branch** | `agent/v0.3.0-sample-regulation-records` |
| **Latest completed task** | Added manual sample law, guidance, change, and mapping records |
| **Active work item** | Control Tower review of sample record content |
| **Next recommended step** | Align control/evidence refs with hub taxonomy; approve static site skeleton or v0.4 watchers |

---

## Data inventory

| Layer | Count | Guide |
|---|---|---|
| Jurisdictions | 2 | [PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) |
| Sources | 7 | [PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) |
| Laws | 1 sample | [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) |
| Guidance | 2 samples | [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) |
| Changes | 2 manual samples | [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) |
| Mappings | 2 files (4 entries) | [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) |
| Schemas | 7 JSON Schema files | `schemas/` |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.1 Foundation & blueprint | **Complete** |
| v0.2.0 Pilot registry (EU/Norway) | **Complete** (approved) |
| v0.3.0 Sample records | **Complete** (pending content review) |
| v0.3.1 Static site skeleton | Not started |
| v0.4 Watchers | Not started |
| v0.5 Public site & feeds | Not started |
| v1.0 Pilot release | Not started |

---

## Boundaries (no-touch / deferred)

| Item | Rule |
|---|---|
| Watchers / crawlers / schedulers | **Not implemented** |
| UI / static site build | **Not implemented** (v0.3.1 optional) |
| Package managers | **Do not add** |
| APIs and external integrations | **Not implemented** |
| Automated change detection | **Not implemented** — change YAML is manual sample only |

---

## Ecosystem links

- **Hub:** [caesar-ai-governance-hub](https://github.com/caesar-compliance/caesar-ai-governance-hub)
- **Evidence format:** [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence)
- **Target public URL:** `regulations.caesar.no` (planned)
