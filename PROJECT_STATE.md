# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Product name** | Caesar AI Regulation Watch |
| **Current version** | `v0.2.0` |
| **Current phase** | Pilot EU/Norway official source registry |
| **Status** | Static registry / data foundation only — no watchers, UI, APIs, or automated monitoring |
| **Gate** | Pending Control Tower URL and scope review before v0.3 |
| **Working branch** | `agent/v0.2.0-pilot-source-registry` |
| **Latest completed task** | Added pilot EU/Norway official source registry foundation |
| **Active work item** | Control Tower URL and scope review |
| **Next recommended step** | Approve registry entries; begin v0.3 sample law/change records |

---

## Pilot registry summary

| Asset | Count |
|---|---|
| Jurisdictions | 2 (`eu`, `norway`) |
| Official sources | 7 (all `official_primary`, `pending_review`) |
| Schemas | 2 (jurisdiction, source) |

Guide: [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md)

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.1 Foundation & blueprint | **Complete** |
| v0.2.0 Pilot registry (EU/Norway) | **Complete** (pending review) |
| v0.3 Pilot curated data | Not started |
| v0.4 Watchers | Not started |
| v0.5 Public site & feeds | Not started |
| v1.0 Pilot release | Not started |

---

## Boundaries (no-touch / deferred)

| Item | Rule |
|---|---|
| `docs/RESEARCH_CONTEXT.md` | Preserve; extend only with explicit approval |
| Watchers / crawlers / schedulers | **Not implemented** |
| UI / static site build | **Not implemented** |
| Package managers | **Do not add** |
| APIs and external integrations | **Not implemented** |
| Sibling repos | Read hub only; do not edit |

---

## Ecosystem links

- **Hub:** [caesar-ai-governance-hub](https://github.com/caesar-compliance/caesar-ai-governance-hub)
- **Evidence format:** [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence)
- **Target public URL:** `regulations.caesar.no` (planned)
