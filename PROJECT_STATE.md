# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.8.8` |
| **Current phase** | Public GitHub Pages pilot + export-candidate governance review gate |
| **Status** | Pilot **live** at `https://caesar-compliance.github.io/caesar-ai-regulation-watch/`; v0.8.8 aligns public HTML with JSON version labels and strengthens deploy verification |
| **Working branch** | `main` (after merge) |
| **Latest completed task** | v0.8.8 public HTML consistency redeploy + candidate review gate visibility in static HTML |
| **Next recommended step** | EUR-Lex deep pass; mapping review design; final export contract — no caesar-ai-evidence writes without approval |

---

## Static deployment (v0.8.5)

| Capability | Status |
|---|---|
| `docs/STATIC_DEPLOYMENT_ARCHITECTURE.md` | Yes |
| `docs/PUBLIC_RELEASE_CHECKLIST.md` | Yes |
| `docs/POST_DEPLOY_SMOKE_TESTS.md` | Yes |
| `docs/PUBLIC_DEPLOYMENT_BASELINE.md` | Yes (first deploy record) |
| `.github/workflows/deploy-static-site.yml` | Yes (`workflow_dispatch` only) |
| `npm run build:pages` | Yes (GitHub Pages base path) |
| `npm run verify:dist` | Yes |
| GitHub Pages source | **GitHub Actions** (enabled 20 May 2026) |
| Auto-deploy on push to `main` | **No** |
| Custom domain / DNS | **No** (deferred) |
| Secrets for deploy | **No** |
| First public deploy | **Yes** — run [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228), commit `57acfcf` |

**Public URL:** `https://caesar-compliance.github.io/caesar-ai-regulation-watch/`

---

## Evidence export candidates (v0.8.3+)

| Capability | Status |
|---|---|
| Gated candidate pipeline | Yes |
| Export-candidate governance review gate (v0.8.7) | Yes — 2 reviewed; 0 `client_use_allowed` |
| Final evidence export / caesar-ai-evidence ingest | **No** |
| `client_use_allowed: true` on candidates | **No** (policy) |

---

## Content review (v0.8.2)

| Capability | Status |
|---|---|
| Content review batch + `/content-review/` | Yes |
| `client_use_allowed: true` | **No** (policy) |

---

## Monitoring (v0.8.1)

| Capability | Status |
|---|---|
| `monitoring-cycle.yml` | Yes (unchanged semantics) |
| Scheduled PR / auto-merge | **No** |
| Deploy from monitoring | **No** |

---

## Boundaries

- Public deploy is manual-gated; pilot disclaimers required.
- Candidates are not final evidence; not legal advice; no compliance guarantee.
- `client_use_allowed` remains false on watcher outputs and export candidates.
- Push/PR CI: `validate-and-build.yml` only (no deploy).
