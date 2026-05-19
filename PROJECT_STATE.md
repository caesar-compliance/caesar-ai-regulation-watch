# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.7.4` |
| **Current phase** | Live API watcher + feed reliability |
| **Status** | Manual page + feed + API watchers; CI validate/build only |
| **Working branch** | `agent/v0.7.4-edps-federal-register-live-api` |
| **Latest completed task** | EDPS feed parser fix; Federal Register API enabled; live baselines |
| **Next recommended step** | Control Tower: review Federal Register API baseline scope; schedule second manual watcher run for real diffs |

---

## Watcher inventory (v0.7.4)

| Type | Count | Enabled |
|---|---|---|
| Page metadata | 2 | 2 |
| RSS/feed | 2 | 2 |
| API metadata | 1 | 1 |
| **Total watchers** | **5** | **5** |

| Detected changes | Real | Simulated |
|---|---|---|
| Page | 0 | 1 (v0.7.1 simulation) |
| Feed | 0 | 1 (v0.7.2 simulation) |
| API | 0 | 1 (v0.7.3 simulation) |

---

## Latest live run (2026-05-19)

- **Run ID:** `watcher-run-2026-05-19`
- **Checked:** 5 (page=2, feed=2, api=1)
- **Errors:** 0
- **New baselines:** EDPS feed, Federal Register API
- **Real detected changes:** 0

---

## Boundaries

- `npm run watch:official` — manual only; not CI.
- Feed/API snapshots: entry/result title, link, date, hash only — no document bodies.
- No legal conclusions; `client_use_allowed` remains false.
