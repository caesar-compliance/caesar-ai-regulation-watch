# Static Deployment Architecture

**Prepared:** 20 May 2026  
**Phase:** v0.9.0 — custom domain production build

---

## Purpose

Define how Caesar AI Regulation Watch publishes its **read-only static Astro site** and **public JSON/RSS exports** without backend services or secrets.

---

## What is deployed

| Artifact | Source | Public path (after deploy) |
|---|---|---|
| Static HTML/CSS/JS | `npm run build:custom-domain` → `dist/` | Site pages at site root `/` |
| Pagefind search index | `npm run build:search` | `/pagefind/*` |
| JSON exports | `public/data/*.json` (from `generate:exports`) | `/data/*.json` |
| RSS (sample changes) | `public/feeds/changes.xml` | `/feeds/changes.xml` |

Key pages include: `/`, `/map/`, `/review-queue/`, `/content-review/`, `/evidence-export-candidates/`, `/exports/`, `/methodology/`, `/disclaimer/`.

---

## What is not deployed

- No backend API, database, or auth.
- No live watcher execution on deploy (watchers run only via `monitoring-cycle.yml` or locally).
- No writes to **caesar-ai-evidence** or any external repository.
- No final evidence export bundles (candidates only).
- No Cloudflare, Coolify, or third-party deploy actions (unless separately approved later).

---

## Canonical hosting: GitHub Pages + custom domain

**Public URL (v0.9.0+)**

```text
https://regulation-watch.caesar.no/
```

**DNS (configured by Control Tower)**

```text
regulation-watch.caesar.no  CNAME  caesar-compliance.github.io
```

**Production build**

```text
ASTRO_SITE=https://regulation-watch.caesar.no
npm run build:custom-domain
```

No `ASTRO_BASE_PATH` — site root is `/`.

**Legacy project URL (rollback reference)**

```text
https://caesar-compliance.github.io/caesar-ai-regulation-watch/
npm run build:pages   # sets ASTRO_BASE_PATH=/caesar-ai-regulation-watch/
```

Local dev and merge-gate CI use `npm run build` without base path (root `/`).

---

## Workflows

| Workflow | Trigger | Deploy? |
|---|---|---|
| `validate-and-build.yml` | push, pull_request | **No** — validate + build only |
| `monitoring-cycle.yml` | schedule, workflow_dispatch | **No** — artifacts only |
| `deploy-static-site.yml` | **workflow_dispatch only** | **Yes** — GitHub Pages |

### Deploy pipeline (`deploy-static-site.yml`)

1. Operator types `DEPLOY` in `confirm_disclaimers` input (manual gate).
2. `npm ci`
3. `npm run generate:evidence-candidates`
4. `npm run validate:data`
5. `npm run generate:exports` with `ASTRO_SITE=https://regulation-watch.caesar.no`
6. `npm run build:custom-domain`
7. `npm run verify:dist`
8. Upload artifact → `deploy-pages`

**Not triggered automatically on merge to `main`.**

Deployment events are logged in [DEPLOYMENTS.md](../DEPLOYMENTS.md).

---

## Manual repository settings (Control Tower)

1. **GitHub** → Repository → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. **Custom domain:** `regulation-watch.caesar.no`
4. Enable **Enforce HTTPS** when certificate is issued

---

## Public content boundaries

Published pilot content must retain visible disclaimers:

- Not legal advice.
- No compliance guarantee.
- No complete global coverage claim.
- Evidence export **candidates** are not final evidence; `client_use_allowed` remains false.

See [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md) before each deploy.

---

## Related documents

- [DEPLOYMENTS.md](../DEPLOYMENTS.md)
- [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md)
- [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md)
- [PUBLIC_DEPLOYMENT_BASELINE.md](PUBLIC_DEPLOYMENT_BASELINE.md)
- [CI_VALIDATION.md](CI_VALIDATION.md)
