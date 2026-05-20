# Post-Deploy Smoke Tests

**Phase:** v1.0.0+ (Public Technical MVP)  
**After:** successful `deploy-static-site.yml` run

**Canonical base URL (custom domain):**

```text
https://regulation-watch.caesar.no/
```

**Legacy project URL (optional check after deploy):**

```text
https://caesar-compliance.github.io/caesar-ai-regulation-watch/
```

Record results in [DEPLOYMENTS.md](../DEPLOYMENTS.md) and [PUBLIC_DEPLOYMENT_BASELINE.md](PUBLIC_DEPLOYMENT_BASELINE.md).

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
| Source discovery | `{BASE}source-discovery/` |

## Public data (JSON)

| Check | Path |
|---|---|
| Snapshot | `{BASE}data/regulation-watch-snapshot.json` |
| Evidence candidates | `{BASE}data/evidence-export-candidates.json` |
| Review queue | `{BASE}data/review-queue.json` |
| Content reviews | `{BASE}data/content-reviews.json` |
| Candidate reviews | `{BASE}data/evidence-export-candidate-reviews.json` |
| Source discovery leads | `{BASE}data/source-discovery-leads.json` |

### Snapshot sanity (JSON body)

- [ ] `version` matches deployed product version (e.g. `1.0.0` for v1.0.0 deploy).
- [ ] `counts.source_discovery_lead_count` ≥ 20 (when v0.9.1+ deployed).
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
- [ ] Home banner shows current version from `project-version.ts` (not stale v0.5.1); footer matches (not stale v0.8.4).
- [ ] Phase label includes conservative pilot wording (e.g. "Public Technical MVP" for v1.0.0).
- [ ] Evidence candidates page shows governance review gate section with `reviewed_for_internal_governance_only` and `needs_more_source_review` in HTML (not only human labels).

## Links under base path

- [ ] In-page navigation (e.g. Jurisdictions → EU) stays under `{BASE}` (no broken root-only links).

---

## Failure response

1. Note failing URL and HTTP status.
2. Do not claim production readiness.
3. Fix on branch, merge to `main`, re-run deploy workflow with `DEPLOY` confirmation.
4. If rollback needed, see [STATIC_DEPLOYMENT_ARCHITECTURE.md](STATIC_DEPLOYMENT_ARCHITECTURE.md#rollback).
