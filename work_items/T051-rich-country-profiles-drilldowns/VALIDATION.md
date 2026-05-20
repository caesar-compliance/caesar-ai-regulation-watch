# T051 — Validation

```bash
npm ci
npm run build:regulatory-updates
npm run generate:evidence-candidates
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
npm run build
git diff --check
node --check scripts/generate-static-exports.mjs
node --check scripts/verify-dist-output.mjs
node --check scripts/lib/tracker-drilldown.mjs
```

## Generated artifacts

```bash
test -f public/data/jurisdiction-profiles.json
test -f public/data/region-drilldowns.json
test -f public/data/topic-drilldowns.json
test -f dist/regions/index.html
test -f dist/topics/index.html
test -f dist/regions/europe/index.html
test -f dist/topics/eu_ai_act/index.html
test -f dist/data/jurisdiction-profiles.json
test -f dist/data/region-drilldowns.json
test -f dist/data/topic-drilldowns.json
```

## Safety gate check

```bash
node - <<'NODE'
const fs = require('fs');
const files = [
  'public/data/country-status.json',
  'public/data/regulatory-updates.json',
  'public/data/jurisdiction-profiles.json',
  'public/data/region-drilldowns.json',
  'public/data/topic-drilldowns.json',
  'public/data/regulation-watch-snapshot.json'
].filter(fs.existsSync);
let failed = false;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const forbidden = [
    '"verified_on_source":true',
    '"client_use_allowed":true',
    '"client_evidence_allowed":true',
    '"final_evidence_allowed":true',
    '"legal_change_claimed":true'
  ];
  for (const needle of forbidden) {
    if (text.includes(needle)) {
      console.error(`FORBIDDEN GATE TRUE in ${file}: ${needle}`);
      failed = true;
    }
  }
}
const snapshot = JSON.parse(fs.readFileSync('public/data/regulation-watch-snapshot.json', 'utf8'));
if (snapshot.version !== '1.0.8') failed = true;
if (snapshot.verified_on_source_count !== 0) failed = true;
if (snapshot.client_use_allowed_count !== 0) failed = true;
if (snapshot.legal_change_claimed_count !== 0) failed = true;
process.exit(failed ? 1 : 0);
NODE
```

## Manual checks

- [ ] `/jurisdictions/eu/` — profile hero, metrics, topics, compare links, safety panel
- [ ] `/regions/` and `/regions/europe/` — jurisdiction table, updates, compare link
- [ ] `/topics/` and `/topics/eu_ai_act/` — jurisdictions, updates, related sources
- [ ] Nav Regions/Topics present; gates remain false in exports
- [ ] No scraping; no competitor assets copied
