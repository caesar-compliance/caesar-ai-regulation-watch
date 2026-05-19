# Public Deployment Baseline

**Phase:** v0.8.8 — public HTML/JSON version consistency + candidate review gate visibility  
**Deployment date:** 20 May 2026  
**Status:** Live (manual-gated pilot)

---

## Deployment record

| Field | Value |
|---|---|
| **Repository** | [caesar-compliance/caesar-ai-regulation-watch](https://github.com/caesar-compliance/caesar-ai-regulation-watch) |
| **Deployed commit (current)** | `52ac0c1` (`merge: v0.8.8 public html consistency redeploy`) |
| **Prior deploy commit** | `a3ded91` (`merge: v0.8.7 export review gate and public consistency`) |
| **First deploy commit** | `57acfcf` (`merge: v0.8.4 static deployment readiness`) |
| **v0.8.6 deploy commit** | `956730b` (superseded) |
| **Workflow** | [Deploy static site](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/workflows/deploy-static-site.yml) |
| **First workflow run ID** | [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228) |
| **Latest workflow run ID** | [26131537159](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26131537159) |
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
| Candidate reviews JSON | …/data/evidence-export-candidate-reviews.json | 200 |
| Content reviews JSON | …/data/content-reviews.json | 200 |
| Changes RSS | …/feeds/changes.xml | 200 |
| Pagefind | …/pagefind/pagefind.js | 200 |

**Note:** `https://caesar-compliance.github.io/` (org root without project path) returns **404** — expected for a project site.

**Checks passed:**

- Home/footer show **v0.8.8** (no stale v0.5.1 / v0.8.4 labels).
- CSS/JS and nav links use `/caesar-ai-regulation-watch/` base path.
- Footer and banners: not legal advice; pilot/sample disclaimers visible.
- Evidence export candidates page: candidate-only; governance review gate status for 2 manual samples.
- Exports page: sample-only; not caesar-ai-evidence output.
- `summary.client_use_allowed` = **0** in public JSON.
- `snapshot.version` = **0.8.8**.
- Evidence candidates HTML includes machine-readable review statuses (`reviewed_for_internal_governance_only`, `needs_more_source_review`).

Full checklist: [POST_DEPLOY_SMOKE_TESTS.md](POST_DEPLOY_SMOKE_TESTS.md).

---

## Policy baseline (unchanged)

| Policy | Status |
|---|---|
| Not legal advice / no compliance guarantee | Required on site |
| Evidence export **candidates** only | Yes — not final evidence |
| `client_use_allowed: true` | **0** candidates and reviews |
| `final_evidence_allowed: true` | **0** reviews |
| `verified_on_source: true` (records) | Not set without human review |
| caesar-ai-evidence integration | **No** |
| Final evidence export | **No** |
| Backend / database / auth | **No** |
| Deploy secrets | **No** |
| Auto-deploy on push to `main` | **No** |

**Candidate counts at deploy (v0.8.8):** 5 total; 2 `ready_for_human_review`; 3 `blocked_simulation_only`; 0 `blocked_pending_content_review`; `client_use_allowed: 0`.

**Candidate governance reviews:** 2 reviewed — 1 `reviewed_for_internal_governance_only`, 1 `needs_more_source_review`; simulated candidates not reviewed for export readiness.

---

## Limitations

- Pilot data from committed YAML at build time — not live official sources.
- Manual samples and simulated watcher outputs require human review.
- No custom domain (`regulations.caesar.no`) or DNS in this baseline.
- No Cloudflare, Coolify, or production host beyond GitHub Pages.
- Monitoring cycle does not deploy; redeploy only via manual workflow.
- EUR-Lex deep read still limited (bot protection); EU AI Act candidate remains `needs_more_source_review`.

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
- [EVIDENCE_EXPORT_CANDIDATE_REVIEW_WORKFLOW.md](EVIDENCE_EXPORT_CANDIDATE_REVIEW_WORKFLOW.md)
- [PROJECT_STATE.md](../PROJECT_STATE.md)
