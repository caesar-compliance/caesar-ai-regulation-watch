# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.4.1` |
| **Current phase** | Static site UX — search, filters, exports |
| **Status** | Read-only Astro preview with Pagefind search and generated JSON/RSS |
| **Working branch** | `agent/v0.4.1-search-ux-static-exports` |
| **Latest completed task** | Search, browse filters, methodology/disclaimer, static exports |
| **Next recommended step** | Control Tower page review; v0.5 Leaflet map |

---

## Site inventory (v0.4.1)

| Item | Value |
|---|---|
| Framework | Astro 5 + Pagefind 1.5 |
| Static routes | 23 HTML pages |
| Search | Pagefind — 23 pages indexed |
| JSON exports | 6 files in `public/data/` |
| RSS | `public/feeds/changes.xml` (sample changes) |
| Validation | 28 YAML checks passing |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.4.0 Static site skeleton | **Complete** |
| v0.4.1 Search, UX, exports | **Complete** (pending Control Tower review) |
| v0.5 Map, timelines | Not started |
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
