# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.7.0` |
| **Current phase** | First official-source watcher prototype |
| **Status** | Read-only Astro site + manual metadata watcher CLI; CI validate/build only (no watcher in CI) |
| **Working branch** | `agent/v0.7.0-first-watcher-prototype` |
| **Latest completed task** | v0.7.0 watcher prototype (eu-ai-office, datatilsynet pilots) |
| **Next recommended step** | Control Tower record content review; second watcher run to validate diff detection |

---

## Site inventory (v0.7.0)

| Item | Value |
|---|---|
| Framework | Astro 5 + Pagefind 1.5 |
| Static routes | 78 HTML pages |
| Search | Pagefind — 78 pages indexed |
| Jurisdictions | 13 |
| Sources | 28 |
| Records | 15 |
| Timelines | 5 |
| Watchers (pilot) | 2 enabled (`official_page_metadata`) |
| Snapshots | 2 baseline (metadata only) |
| Detected changes | 0 |
| Latest watcher run | `watcher-run-2026-05-19` |
| JSON exports | 14 files in `public/data/` |
| Validation | 82 YAML checks passing |
| CI | `validate-and-build.yml` (no watcher step) |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.6.2 URL remediation + source identity | **Complete** |
| v0.7.0 Watcher prototype | **Complete** (manual CLI; 2 pilot sources) |
| Production watcher scheduling | Not started |
| Backend / API / database / auth | Not started |

---

## Boundaries

- Watchers run via `npm run watch:official` only — not in CI or cron.
- Metadata-only snapshots; no full page body storage in repo.
- No legal conclusions from watcher diffs; human review required.
- No competitor code or datasets imported.
