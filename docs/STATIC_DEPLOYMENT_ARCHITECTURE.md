# Static Deployment Architecture

**Prepared:** 20 May 2026  
**Phase:** v0.8.4 — deployment readiness (not production launch by default)

---

## Purpose

Define how Caesar AI Regulation Watch publishes its **read-only static Astro site** and **public JSON/RSS exports** without backend services, secrets, or custom domain configuration in this phase.

---

## What is deployed

| Artifact | Source | Public path (after deploy) |
|---|---|---|
| Static HTML/CSS/JS | `npm run build` → `dist/` | Site pages under GitHub Pages base path |
| Pagefind search index | `npm run build:search` | `/pagefind/*` (under base path) |
| JSON exports | `public/data/*.json` (from `generate:exports`) | `/data/*.json` |
| RSS (sample changes) | `public/feeds/changes.xml` | `/feeds/changes.xml` |

Key pages include: `/`, `/map/`, `/review-queue/`, `/content-review/`, `/evidence-export-candidates/`, `/exports/`, `/methodology/`, `/disclaimer/`.

---

## What is not deployed

- No backend API, database, or auth.
- No live watcher execution on deploy (watchers run only via `monitoring-cycle.yml` or locally).
- No writes to **caesar-ai-evidence** or any external repository.
- No final evidence export bundles (candidates only in v0.8.3+).
- No custom domain (`regulations.caesar.no`) or DNS changes in v0.8.4.
- No Cloudflare, Coolify, or third-party deploy actions (unless separately approved later).

---

## Default hosting: GitHub Pages (manual gate)

**Why GitHub Pages**

- Official GitHub Actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`).
- No repository secrets required for public pilot static content.
- Fits static `output: "static"` Astro build.
- Manual `workflow_dispatch` avoids accidental publication of unfinished pilot data.

**Expected public URL (project site)**

```text
https://caesar-compliance.github.io/caesar-ai-regulation-watch/
```

**Base path**

Deploy workflow sets:

```text
ASTRO_BASE_PATH=/caesar-ai-regulation-watch/
ASTRO_SITE=https://caesar-compliance.github.io
```

Local dev and merge-gate CI build **without** `ASTRO_BASE_PATH` (site root at `/`).

**Future custom domain**

When `regulations.caesar.no` is routed (DNS + TLS, separate approval):

- Remove or adjust `ASTRO_BASE_PATH` for production build.
- Set `ASTRO_SITE=https://regulations.caesar.no`.
- Re-run smoke tests in [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

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
5. `npm run generate:exports`
6. `npm run build:pages` (base path env + HTML path rewrite for GitHub Pages)
7. `npm run verify:dist`
8. Upload artifact → `deploy-pages`

**Not triggered automatically on merge to `main`.**

---

## Manual repository settings (Control Tower)

Enable once per repository (cannot be set from code alone):

1. **GitHub** → Repository → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. After first successful deploy workflow, note the environment URL under **Environments** → `github-pages`

No custom domain field should be filled in v0.8.4.

---

## Public content boundaries

Published pilot content must retain visible disclaimers:

- Not legal advice.
- No compliance guarantee.
- No complete global coverage claim.
- Manual sample and simulated watcher data require human review.
- Evidence export **candidates** are not final evidence; `client_use_allowed` remains false.
- Review queue and content review reflect governance support only.

See [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md) before each deploy.

---

## Data freshness and limitations

- Deployed JSON reflects YAML committed at build time — not live official sources.
- URL checks and watchers may be stale until monitoring cycle runs and a new deploy is performed.
- `verified_on_source` on records remains false unless explicitly set after human content review.

---

## Rollback

1. Re-run deploy workflow from a previous git tag/commit on `main`, **or**
2. GitHub → **Deployments** / **Pages** → roll back to prior deployment (if available), **or**
3. Disable Pages source temporarily in repository settings.

Document rollback date and reason in Control Tower notes.

---

## Related documents

- [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md)
- [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md)
- [CI_VALIDATION.md](CI_VALIDATION.md)
- [EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md](EVIDENCE_EXPORT_CANDIDATE_PIPELINE.md)
