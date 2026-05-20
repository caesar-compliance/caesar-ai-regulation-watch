# T056 — Manual review promotion pipeline

**Branch:** `task/T056-manual-review-promotion-pipeline`  
**Base:** main after T055 merge (`39d81f1`)

## Goal

Promote one T055 network dry-run candidate into a draft manual-review regulatory update record. No publication, no source verification, no gate changes, no new network request.

## Deliverables

- Promotion schema + registry (`T056-001`)
- Draft regulatory update under `data/regulatory-updates/drafts/`
- `validate:manual-review-promotions` and `build:manual-review-promotion`
- Read-only UI section on `/source-adapters/`
- Documentation and work-item reports

## Safety

- No live network in T056
- No `public/data` publication of draft or T055 generated output
- All evidence/legal/client gates remain `false`
