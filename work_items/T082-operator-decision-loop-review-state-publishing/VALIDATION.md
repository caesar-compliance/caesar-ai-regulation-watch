# T082 — Validation

## Required commands

```bash
git diff --check
npm run validate:operator-decisions
npm run validate:review-queue
npm run validate:source-freshness
npm run validate:source-registry
npm run validate:automation-runtime
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run validate:monitoring-output
npm run validate:public-export-consistency
npm run validate:public-route-consistency
npm run build
npm run verify:dist
```

## validate:operator-decisions failures

- Unknown `candidate_id`
- Duplicate `decision_id`
- Unsupported `decision`
- Personal email in `reviewer_label`
- Any protected gate `true`
- Legal advice claims (excluding “not legal advice” disclaimers)
- Missing `source_checked_url` for `needs_source_check` / `accept_for_tracking`
- `accept_for_tracking` claiming legal verification

## Post-deploy smoke

- `/`, `/tracker/`, `/review-queue/`, `/runtime-health/`, `/countries/`, `/jurisdictions/france/`
- `/data/regulation-review-queue.json`, `/data/operator-review-summary.json`, `/data/review-packets-index.json`
