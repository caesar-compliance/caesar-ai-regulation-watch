# T050 — Validation

```bash
npm run build:regulatory-updates
npm run validate:data
npm run build
git diff --check
node --check scripts/lib/tracker-scoring.mjs
```

## Manual checks

- [ ] `/tracker/` — choropleth tiles, legend, regional panel
- [ ] `/compare/` — multi-select, table for 2–4 ids
- [ ] `/countries/` — maturity/activity lines
- [ ] `/data/country-status.json` — scoring fields present
- [ ] `/data/jurisdiction-comparison.json` — comparison rows
- [ ] Disclaimers visible; gates remain false in seeds/exports
- [ ] No new npm dependencies
