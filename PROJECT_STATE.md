# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.8.6` |
| **Current phase** | First public GitHub Pages pilot + first content review batch |
| **Status** | v0.8.5 pilot **live** at `https://caesar-compliance.github.io/caesar-ai-regulation-watch/`; v0.8.6 merges content review + candidate refresh (redeploy after merge) |
| **Working branch** | `main` (after merge) |
| **Latest completed task** | v0.8.6 first source/content review batch (9 items) + evidence candidate regeneration |
| **Next recommended step** | Redeploy public site after merge; second review batch / EUR-Lex deep pass; custom domain deferred |

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

## Evidence export candidates (v0.8.3)

| Capability | Status |
|---|---|
| Gated candidate pipeline | Yes |
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
