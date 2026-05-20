# T055 — Validation

## Preconditions

- Branch `task/T055-approved-single-source-network-dry-run` from main @ `98ed630`
- Package `1.0.8`
- `generated/` gitignored

## Commands

```bash
npm ci
npm run validate:source-adapters
npm run validate:manual-source-intake
npm run validate:network-dry-run-approvals
npm run validate:single-network-dry-run-executions
npm run build:source-adapter-fixtures
npm run run:manual-source-intake -- --run-id T053-001 --fixture fixtures/source-adapters/rss-sample.xml
npm run build:network-dry-run-plan -- --approval-id T054-001
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001
npm run build:regulatory-updates
npm run generate:evidence-candidates
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
npm run build
```

## Safe refusal (expected PASS via non-zero exit)

```bash
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001
```

## Live dry-run (exactly once)

```bash
CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES npm run run:approved-network-dry-run -- \
  --approval-id T054-001 --execution-id T055-001 --i-understand-this-runs-network
```

## Post-run checks

- `generated/network-dry-run-candidates/T054-001.json` exists
- `generated/network-dry-run-reports/T055-001.json` exists
- Safety gate node scripts (forbidden flags, network guard)
- `git status --short -- generated/` — untracked only

## Static checks

```bash
git diff --check
node --check scripts/validate-single-network-dry-run-executions.mjs
node --check scripts/run-approved-network-dry-run.mjs
```
