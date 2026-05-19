# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.7.2` |
| **Current phase** | Source adapters + RSS/feed watchers |
| **Status** | Manual page + feed watchers; CI validate/build only |
| **Working branch** | `agent/v0.7.2-feed-watchers-source-adapters` |
| **Latest completed task** | Feed watcher adapter + EDPB/EDPS pilot feeds |
| **Next recommended step** | Control Tower: retry EDPS feed; review feed detected changes |

---

## Watcher inventory (v0.7.2)

| Type | Count | Enabled |
|---|---|---|
| Page metadata | 2 | 2 |
| RSS/feed | 2 | 2 |
| **Total watchers** | **4** | **4** |

| Detected changes | Real | Simulated |
|---|---|---|
| Page | 0 | 1 (v0.7.1 simulation) |
| Feed | 0 | 1 (v0.7.2 simulation) |

---

## Boundaries

- `npm run watch:official` — manual only; not CI.
- Feed snapshots: entry title/link/date/hash only — no article bodies.
- No legal conclusions; `client_use_allowed` remains false.
