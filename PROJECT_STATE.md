# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.5.0` |
| **Current phase** | Global static data foundation + timelines + CI |
| **Status** | Read-only Astro site with expanded jurisdictions/sources, timelines, Pagefind, JSON/RSS, CI validate/build |
| **Working branch** | `agent/v0.5.0-global-data-timeline-ci` |
| **Latest completed task** | Global YAML expansion, timelines, CI guardrails |
| **Next recommended step** | Control Tower review of expanded registry; human URL/date verification |

---

## Site inventory (v0.5.0)

| Item | Value |
|---|---|
| Framework | Astro 5 + Pagefind 1.5 |
| Static routes | 55 HTML pages |
| Search | Pagefind — 55 pages indexed |
| Jurisdictions | 13 (EU, Norway + 11 global) |
| Sources | 27 official registry entries |
| Timelines | 2 sample timelines |
| JSON exports | 7 files in `public/data/` |
| RSS | `public/feeds/changes.xml` (sample changes only) |
| Validation | 59 YAML checks passing |
| CI | `validate-and-build.yml` on push/PR |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.4.0 Static site skeleton | **Complete** |
| v0.4.1 Search, UX, exports | **Complete** |
| v0.5.0 Global data, timelines, CI | **Complete** (pending Control Tower review) |
| v0.5 Map (Leaflet) | Not started |
| v0.6 Watchers | Not started |

---

## Boundaries

- No watchers, APIs, database, authentication, or remote ingestion.
- JSON/RSS are generated from local YAML only; marked sample-only where applicable.
- Official-source-first data remains the rule.

---

## Ecosystem links

- [caesar-ai-governance-hub](https://github.com/caesar-compliance/caesar-ai-governance-hub)
- [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence) — export alignment pending
