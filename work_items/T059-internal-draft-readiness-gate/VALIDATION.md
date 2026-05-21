# T059 — Validation

## Commands

```bash
npm ci
npm run validate:source-adapters
npm run validate:manual-source-intake
npm run validate:network-dry-run-approvals
npm run validate:single-network-dry-run-executions
npm run validate:manual-review-promotions
npm run validate:manual-review-decisions
npm run validate:draft-regulatory-update-revisions
npm run validate:internal-draft-readiness-gates
npm run build:internal-draft-readiness-summary -- --readiness-id T059-001
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
npm run build
```

## Safe refusal

```bash
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001
```

Expected non-zero (no env/flag). PASS.

## Exclusion checks

- Public export exclusion (T056/T057/T058/T059 identifiers)
- Safety gate scan (no forbidden true flags)

## No live network

Do not set `CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN`. Do not rerun approved live dry-run.
