# T053 — Validation checklist

Run from repo root after `npm ci`:

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
git diff --check
node --check scripts/validate-source-adapter-allowlist.mjs
node --check scripts/validate-manual-source-intake-runs.mjs
node --check scripts/parse-source-adapter-fixture.mjs
node --check scripts/run-manual-source-intake.mjs
node --check scripts/generate-static-exports.mjs
node --check scripts/verify-dist-output.mjs
```

Safety gate script (forbidden flags + snapshot counts) — see T053 FINAL_REPORT.

Optional preview:

```bash
npm run preview -- --host 127.0.0.1 --port 4321
curl -fsSI http://127.0.0.1:4321/
curl -fsSI http://127.0.0.1:4321/source-adapters/
curl -fsSI http://127.0.0.1:4321/tracker/
```
