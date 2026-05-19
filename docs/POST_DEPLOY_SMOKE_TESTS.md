# Post-Deploy Smoke Tests

**Phase:** v0.8.7  
**After:** successful `deploy-static-site.yml` run

**Last recorded pass:** 20 May 2026 — deploy run [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228). See [PUBLIC_DEPLOYMENT_BASELINE.md](PUBLIC_DEPLOYMENT_BASELINE.md).

**Base URL (GitHub Pages project site):**

```text
https://caesar-compliance.github.io/caesar-ai-regulation-watch/
```

Replace `{BASE}` below with that URL (trailing slash optional).

---

## Pages (HTTP 200)

| Check | Path |
|---|---|
| Home | `{BASE}` |
| Map | `{BASE}map/` |
| Review queue | `{BASE}review-queue/` |
| Content review | `{BASE}content-review/` |
| Evidence export candidates | `{BASE}evidence-export-candidates/` |
| Export samples | `{BASE}exports/` |
| Methodology | `{BASE}methodology/` |
| Disclaimer | `{BASE}disclaimer/` |

## Public data (JSON)

| Check | Path |
|---|---|
| Snapshot | `{BASE}data/regulation-watch-snapshot.json` |
| Evidence candidates | `{BASE}data/evidence-export-candidates.json` |
| Review queue | `{BASE}data/review-queue.json` |
| Content reviews | `{BASE}data/content-reviews.json` |
| Candidate reviews | `{BASE}data/evidence-export-candidate-reviews.json` |

### Snapshot sanity (JSON body)

- [ ] `version` is `0.8.7` (or later pilot version string).
- [ ] `disclaimer` present and non-empty.
- [ ] `counts.evidence_export_candidates_client_use_allowed` is **0** (if field present).
- [ ] `data_files.evidence_export_candidates` path resolves.

### Evidence candidates export

- [ ] `candidate_only` / `not_final_evidence` flags true (if present).
- [ ] `summary.client_use_allowed` is **0**.
- [ ] No item has `"client_use_allowed": true`.

## Search (optional)

- [ ] `{BASE}search/` loads.
- [ ] Pagefind assets load: `{BASE}pagefind/pagefind.js` (200).

## Disclaimer visibility

- [ ] Home or global layout shows pilot / not legal advice messaging.
- [ ] Evidence export candidates page shows **candidate-only** banner and governance review gate status for reviewed candidates.
- [ ] Home banner shows **v0.8.7** (not stale v0.5.1); footer shows **v0.8.7** (not stale v0.8.4).

## Links under base path

- [ ] In-page navigation (e.g. Jurisdictions → EU) stays under `{BASE}` (no broken root-only links).

---

## Failure response

1. Note failing URL and HTTP status.
2. Do not claim production readiness.
3. Fix on branch, merge to `main`, re-run deploy workflow with `DEPLOY` confirmation.
4. If rollback needed, see [STATIC_DEPLOYMENT_ARCHITECTURE.md](STATIC_DEPLOYMENT_ARCHITECTURE.md#rollback).
