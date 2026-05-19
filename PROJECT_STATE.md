# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.6.1` |
| **Current phase** | Technical URL verification + refined review queue |
| **Status** | Read-only Astro site with URL check batch, verification log, Pagefind, JSON/RSS, CI validate/build (no live URL checks in CI) |
| **Working branch** | `agent/v0.6.1-url-verification-review-queue` |
| **Latest completed task** | Technical URL verification pass and review queue separation |
| **Next recommended step** | Control Tower human source identity review; fix unreachable/redirected URLs in registry |

---

## Site inventory (v0.6.1)

| Item | Value |
|---|---|
| Framework | Astro 5 + Pagefind 1.5 |
| Static routes | 74 HTML pages |
| Search | Pagefind — 74 pages indexed |
| Jurisdictions | 13 (EU, Norway + 11 global) |
| Sources | 28 official registry entries |
| Records | 15 (3 pilot samples + 12 curated v0.6.0) |
| Timelines | 5 |
| Verifications | 12 human (`not_checked`) + 41 technical URL checks |
| JSON exports | 10 files in `public/data/` |
| RSS | `public/feeds/changes.xml` (sample changes only) |
| Validation | 77 YAML checks passing |
| CI | `validate-and-build.yml` on push/PR |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.4.0 Static site skeleton | **Complete** |
| v0.4.1 Search, UX, exports | **Complete** |
| v0.5.0 Global data, timelines, CI | **Complete** |
| v0.5.1 Map + review queue | **Complete** |
| v0.6.0 Curated records + verification | **Complete** |
| v0.6.1 Technical URL verification | **Complete** (pending Control Tower content review) |
| v0.6+ Watchers | Not started |

---

## Boundaries

- No watchers, backend APIs, database, auth, or runtime remote fetching.
- No competitor code or datasets imported.
- All content is manual YAML for governance review support only — not legal advice.
