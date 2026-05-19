# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.8.4` |
| **Current phase** | Static deployment readiness |
| **Status** | v0.8.4 on `main`: GitHub Pages deploy workflow (manual `DEPLOY` gate); **not** auto-deployed on merge; production launch not claimed |
| **Working branch** | `main` (after merge) |
| **Latest completed task** | Deployment architecture docs + `deploy-static-site.yml` + `verify:dist` |
| **Next recommended step** | Enable GitHub Pages (Actions source); run public release checklist; optional first manual deploy |

---

## Static deployment (v0.8.4)

| Capability | Status |
|---|---|
| `docs/STATIC_DEPLOYMENT_ARCHITECTURE.md` | Yes |
| `docs/PUBLIC_RELEASE_CHECKLIST.md` | Yes |
| `docs/POST_DEPLOY_SMOKE_TESTS.md` | Yes |
| `.github/workflows/deploy-static-site.yml` | Yes (`workflow_dispatch` only) |
| `npm run build:pages` | Yes (GitHub Pages base path) |
| `npm run verify:dist` | Yes |
| Auto-deploy on push to `main` | **No** |
| Custom domain / DNS | **No** (deferred) |
| Secrets for deploy | **No** |
| Actual production deploy executed | **Not by default** — manual workflow only |

**Expected preview URL (after manual deploy):** `https://caesar-compliance.github.io/caesar-ai-regulation-watch/`

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
