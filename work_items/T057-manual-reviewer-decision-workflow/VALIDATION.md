# T057 — Validation

## Prerequisites

- T056 merged to main (`manual-review-promotions.yml`, `data/regulatory-updates/drafts/T056-001.yml`)
- Optional: local `generated/network-dry-run-candidates/T054-001.json` for promotion build (fixture fallback in CI)

## Commands

```bash
npm ci
npm run validate:manual-review-decisions
npm run build:manual-review-decision-summary -- --decision-id T057-001
npm run validate:data
npm run generate:exports
npm run build
```

## Safe refusal (required)

```bash
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001
```

Expected: non-zero safe refusal (no `CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN`).

## Public export exclusion

T056 draft and T057 decision identifiers must not appear in `public/data/regulatory-updates.json` or snapshot exports.
