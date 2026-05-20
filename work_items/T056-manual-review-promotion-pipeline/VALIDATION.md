# T056 — Validation

## Preconditions

- T055 merged to main (PR #15, squash `10bdc4c`)
- Local `generated/network-dry-run-candidates/T054-001.json` present (optional; fixture fallback exists)

## Commands

```bash
npm ci
npm run validate:source-adapters
npm run validate:manual-source-intake
npm run validate:network-dry-run-approvals
npm run validate:single-network-dry-run-executions
npm run validate:manual-review-promotions
npm run build:source-adapter-fixtures
npm run run:manual-source-intake -- --run-id T053-001 --fixture fixtures/source-adapters/rss-sample.xml
npm run build:network-dry-run-plan -- --approval-id T054-001
npm run build:manual-review-promotion -- --promotion-id T056-001
npm run validate:manual-review-promotions
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001  # expect refusal
npm run build:regulatory-updates
npm run generate:evidence-candidates
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
npm run build
git diff --check
```

## Safety scans

- Gate scan on adapter/promotion/draft YAML and public exports
- Public export exclusion check for `T056-001`

## Expected

- Safe refusal (non-zero) for approved network runner without env/flags
- No live network rerun during T056
- Draft not present in `public/data/regulatory-updates.json`
