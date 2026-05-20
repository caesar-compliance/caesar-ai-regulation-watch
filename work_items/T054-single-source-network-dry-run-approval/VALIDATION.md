# T054 — Validation

## Prerequisites

- `npm ci`
- Branch `task/T054-single-source-network-dry-run-approval` from main @ `39f44e9`
- Package version `1.0.8`

## New checks

```bash
npm run validate:network-dry-run-approvals
npm run build:network-dry-run-plan -- --approval-id T054-001
npm run run:approved-network-dry-run -- --approval-id T054-001
```

**Expected:** `run:approved-network-dry-run` exits non-zero with message containing  
`Network dry-run execution is not enabled in T054` — treat as **PASS**.

## Existing chain

```bash
npm run validate:source-adapters
npm run validate:manual-source-intake
npm run build:source-adapter-fixtures
npm run run:manual-source-intake -- --run-id T053-001 --fixture fixtures/source-adapters/rss-sample.xml
npm run build:regulatory-updates
npm run generate:evidence-candidates
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
npm run build
```

## Static checks

```bash
git diff --check
node --check scripts/validate-network-dry-run-approvals.mjs
node --check scripts/build-network-dry-run-plan.mjs
node --check scripts/run-approved-network-dry-run.mjs
```

## Safety gate script

Run the forbidden-flag Node check from the task brief against YAML/JSON artifacts (excluding non-existent network candidate file).

## Network import check

Confirm T054 scripts contain no `fetch`, `http`, `https`, `axios`, or `got` imports.

## Optional preview

```bash
npm run preview -- --host 127.0.0.1 --port 4321
curl -fsSI http://127.0.0.1:4321/source-adapters/
```
