# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.8.1` |
| **Current phase** | Monitoring review PR workflow |
| **Status** | Monitoring cycle + optional review PR + CI validate/build; no deploy |
| **Working branch** | `agent/v0.8.1-monitoring-pr-workflow` |
| **Latest completed task** | Diff summary script + optional GitHub review PR |
| **Next recommended step** | Control Tower: create `monitoring-review` label; trial manual `create_pr=true` run |

---

## Watcher inventory (v0.8.0)

| Type | Count | Enabled |
|---|---|---|
| Page metadata | 2 | 2 |
| RSS/feed | 2 | 2 |
| API metadata | 1 | 1 |
| **Total watchers** | **5** | **5** |

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
