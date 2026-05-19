# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.8.2` |
| **Current phase** | Content review workflow |
| **Status** | Content review batch + page + exports; monitoring cycle unchanged; no deploy |
| **Working branch** | `agent/v0.8.2-content-review-workflow` |
| **Latest completed task** | Content review schema, batch, docs, `/content-review/` page |
| **Next recommended step** | Human browser content review on priority records; update batch with real outcomes |

---

## Watcher inventory (v0.8.0)

| Type | Count | Enabled |
|---|---|---|
| Page metadata | 2 | 2 |
| RSS/feed | 2 | 2 |
| API metadata | 1 | 1 |
| **Total watchers** | **5** | **5** |

---

## Content review (v0.8.2)

| Capability | Status |
|---|---|
| `schemas/content-review.schema.json` | Yes |
| `data/verifications/content-review-*.yml` | Yes (9-item pilot batch) |
| `/content-review/` page | Yes |
| `public/data/content-reviews.json` | Yes |
| `client_use_allowed: true` | **No** (policy) |
| Auto-update records from watchers | **No** |

---

## Monitoring (v0.8.1)

| Capability | Status |
|---|---|
| Local `npm run monitoring:cycle` | Yes |
| Local `npm run monitoring:summary` | Yes |
| GitHub `monitoring-cycle.yml` | Yes (`workflow_dispatch` + daily 06:00 UTC) |
| Scheduled PR | **No** (artifacts only) |
| Manual review PR | Optional (`create_pr=true`) |
| Auto-merge | **No** |
| Deploy | **No** |
| Secrets | **None** |

---

## Boundaries

- Monitoring is review-gated; not legal advice.
- `client_use_allowed` remains false on watcher outputs.
- Push/PR CI still does not run live watchers (`validate-and-build.yml`).
