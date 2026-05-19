# Project State — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.7.1` |
| **Current phase** | Watcher diff hardening + simulated change validation |
| **Status** | Read-only Astro site + manual metadata watcher CLI + simulation mode; CI validate/build only (no watcher in CI) |
| **Working branch** | `agent/v0.7.1-watcher-diff-hardening` |
| **Latest completed task** | v0.7.1 watcher diff classification, simulation command, review queue/export validation |
| **Next recommended step** | Control Tower: record content review; second live watcher run when ready |

---

## Site inventory (v0.7.1)

| Item | Value |
|---|---|
| Framework | Astro 5 + Pagefind 1.5 |
| Watchers (pilot) | 2 enabled (`official_page_metadata`) |
| Snapshots | 2 live baselines + simulation fixture copies when simulated |
| Detected changes | 0 real + 1 simulated (after `watch:simulate-change`) |
| Watcher run modes | `live_manual`, `simulation`, `dry_run` |
| CI | `validate-and-build.yml` (no watcher step) |

---

## Phase checklist

| Phase | Status |
|---|---|
| v0.7.0 Watcher prototype | **Complete** |
| v0.7.1 Diff hardening + simulation | **Complete** |
| Production watcher scheduling | Not started |
| Backend / API / database / auth | Not started |

---

## Boundaries

- Watchers run via `npm run watch:official` only — not in CI or cron.
- Simulation via `npm run watch:simulate-change` — fixtures only, no network.
- Metadata-only snapshots; no full page body storage in repo.
- No legal conclusions from watcher diffs; human review required.
- No competitor code or datasets imported.
