# Public Deployment Baseline

**Phase:** v0.8.5 — first public GitHub Pages deploy  
**Deployment date:** 20 May 2026  
**Status:** Live (manual-gated pilot)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Deployed commit (current)** | `0bd0e76` (`merge: v0.8.5 first public deployment baseline`) |
| **First deploy commit** | `57acfcf` (`merge: v0.8.4 static deployment readiness`) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **First workflow run ID** | [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228) |
| **Latest workflow run ID** | _(see Actions after post-merge redeploy)_ |
| **Trigger** | `workflow_dispatch` with `confirm_disclaimers=DEPLOY` |
| **Result** | Success |
| **Public URL** | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ |
| **Hosting** | GitHub Pages (`build_type: workflow`) |
| **GitHub Pages enabled** | 20 May 2026 via API (`build_type: workflow`); was not configured before first deploy |

---

## Smoke-tested URLs (20 May 2026)

| Resource | URL | HTTP |
|---|---|---|
| Home | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ | 200 |
| Map | …/map/ | 200 |
| Review queue | …/review-queue/ | 200 |
| Content review | …/content-review/ | 200 |
| Evidence export candidates | …/evidence-export-candidates/ | 200 |
| Export samples | …/exports/ | 200 |
| Methodology | …/methodology/ | 200 |
| Disclaimer | …/disclaimer/ | 200 |
| Search | …/search/ | 200 |
| Snapshot JSON | …/data/regulation-watch-snapshot.json | 200 |
| Evidence candidates JSON | …/data/evidence-export-candidates.json | 200 |
| Changes RSS | …/feeds/changes.xml | 200 |
| Pagefind | …/pagefind/pagefind.js | 200 |

**Note:** `https://caesar-compliance.github.io/` (org root without project path) returns **404** — expected for a project site.

**Checks passed:**

- CSS/JS and nav links use `/caesar-ai-regulation-watch/` base path.
- Footer and banners: not legal advice; pilot/sample disclaimers visible.
- Evidence export candidates page: candidate-only / not client evidence.
- Exports page: sample-only; not caesar-ai-evidence output.
- `summary.client_use_allowed` = **0** in public JSON.

Full checklist: [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

---

## Policy baseline (unchanged)

| Policy | Status |
|---|---|
| Not legal advice / no compliance guarantee | Required on site |
| Evidence export **candidates** only | Yes — not final evidence |
| `client_use_allowed: true` | **0** candidates |
| `verified_on_source: true` (records) | Not set without human review |
| caesar-ai-evidence integration | **No** |
| Final evidence export | **No** |
| Backend / database / auth | **No** |
| Deploy secrets | **No** |
| Auto-deploy on push to `main` | **No** |

**Candidate counts at deploy:** 5 total; 2 blocked (content review); 3 blocked (simulation); 0 ready for human review; `client_use_allowed: 0`.

---

## Limitations

- Pilot data from committed YAML at build time — not live official sources.
- Manual samples and simulated watcher outputs require human review.
- No custom domain (`regulations.caesar.no`) or DNS in this baseline.
- No Cloudflare, Coolify, or production host beyond GitHub Pages.
- Monitoring cycle does not deploy; redeploy only via manual workflow.
- Content review batch largely `not_checked` — browser review pending.

---

## Rollback

1. Re-run **Deploy static site** from a previous commit on `main` (checkout that SHA in workflow if needed), **or**
2. GitHub → **Deployments** / **Environments** → `github-pages` → prior deployment (if listed), **or**
3. Temporarily disable Pages in repository settings.

Document rollback date and reason in Control Tower notes.

---

## Related documents

- [STATIC_DEPLOYMENT_ARCHITECTURE.md](STATIC_DEPLOYMENT_ARCHITECTURE.md)
- [PUBLIC_RELEASE_CHECKLIST.md](PUBLIC_RELEASE_CHECKLIST.md)
- [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md)
- [PROJECT_STATE.md](../PROJECT_STATE.md)
