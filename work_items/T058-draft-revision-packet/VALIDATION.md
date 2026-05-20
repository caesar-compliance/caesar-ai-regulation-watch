# T058 — Validation

## Commands

```bash
npm ci
npm run validate:draft-regulatory-update-revisions
npm run build:draft-revision-summary -- --revision-id T058-001
npm run validate:manual-review-promotions
npm run validate:manual-review-decisions
npm run validate:data
npm run generate:exports
npm run build
```

## Safe refusal (expected PASS)

```bash
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001
```

Must exit non-zero without `CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN`.

## Public export exclusion

T056 draft, T057 decision, and T058 revision identifiers must not appear in `public/data/regulatory-updates.json` or snapshot exports.

## Safety gate scan

All legal/evidence/client gates and publication/export flags must remain closed/false in revision registry, draft, and public snapshot counts.
