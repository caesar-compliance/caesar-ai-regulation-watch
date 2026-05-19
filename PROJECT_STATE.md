# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.8.3` |
| **Current phase** | Evidence export candidate pipeline |
| **Status** | Gated local candidates + page + JSON export; no caesar-ai-evidence writes; no deploy |
| **Working branch** | `agent/v0.8.3-evidence-export-candidates` |
| **Latest completed task** | Candidate schema, generator, validation policy, `/evidence-export-candidates/` page |
| **Next recommended step** | Control Tower human review of candidates after content review progress |

---

## Watcher inventory (v0.8.0)

| Type | Count | Enabled |
|---|---|---|
| Page metadata | 2 | 2 |
| RSS/feed | 2 | 2 |
| API metadata | 1 | 1 |
| **Total watchers** | **5** | **5** |

---

## Evidence export candidates (v0.8.3)

| Capability | Status |
|---|---|
| `schemas/evidence-export-candidate.schema.json` | Yes |
| `scripts/generate-evidence-export-candidates.mjs` | Yes |
| `data/evidence-export-candidates/evidence-export-candidates-2026-05-20.yml` | Yes (5 candidates) |
| `/evidence-export-candidates/` page | Yes |
| `public/data/evidence-export-candidates.json` | Yes |
| Final evidence export / caesar-ai-evidence ingest | **No** |
| `client_use_allowed: true` on candidates | **No** (policy) |

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

- Candidates are not final evidence; not legal advice; no compliance guarantee.
- Monitoring is review-gated; not legal advice.
- `client_use_allowed` remains false on watcher outputs and export candidates.
- Push/PR CI still does not run live watchers (`validate-and-build.yml`).
