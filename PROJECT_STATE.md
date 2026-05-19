# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.6.0` |
| **Current phase** | Curated global records + source verification workflow |
| **Status** | Read-only Astro site with 15 records, verification log, 5 timelines, Pagefind, JSON/RSS, CI validate/build |
| **Working branch** | `agent/v0.6.0-curated-records-verification` |
| **Latest completed task** | Manually curated global records and source verification workflow |
| **Next recommended step** | Control Tower human URL verification; close gaps in `RECORD_EXPANSION_GAPS.md` |

---

## Site inventory (v0.6.0)

| Item | Value |
|---|---|
| Framework | Astro 5 + Pagefind 1.5 |
| Static routes | 74 HTML pages |
| Search | Pagefind — 74 pages indexed |
| Jurisdictions | 13 (EU, Norway + 11 global) |
| Sources | 28 official registry entries |
| Records | 15 (3 pilot samples + 12 curated v0.6.0) |
| Timelines | 5 |
| Verifications | 12 (`not_checked` batch) |
| JSON exports | 9 files in `public/data/` |
| RSS | `public/feeds/changes.xml` (sample changes only) |
| Validation | 76 YAML checks passing |
| CI | `validate-and-build.yml` on push/PR |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.4.0 Static site skeleton | **Complete** |
| v0.4.1 Search, UX, exports | **Complete** |
| v0.5.0 Global data, timelines, CI | **Complete** |
| v0.5.1 Map + review queue | **Complete** |
| v0.6.0 Curated records + verification | **Complete** (pending Control Tower URL review) |
| v0.6+ Watchers | Not started |

---

## Boundaries

- No watchers, backend APIs, database, auth, or runtime remote fetching.
- No competitor code or datasets imported.
- All content is manual YAML for governance review support only — not legal advice.
