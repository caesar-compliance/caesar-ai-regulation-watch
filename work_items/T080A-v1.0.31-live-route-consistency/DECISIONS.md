# T080A — Decisions

## Route shadowing

**Decision:** Delete `src/pages/map.astro`. T080 map lives only at `src/pages/map/index.astro`.

**Rationale:** Astro resolves both to `/map/`; the flat `map.astro` won and served the pre-T078 CoverageMap page on live.

## Shared summary helper

**Decision:** Add `src/lib/public-route-summary.ts` reading `tracker-summary.json` + monitoring status + profile cards / map markers.

**Rationale:** Homepage, validation, and future routes need one build-time source aligned with T080 exports — not duplicate hardcoded counts.

## Version

**Decision:** Remain at `1.0.31`; tag `regulation-watch-v1.0.31` unchanged.

**Rationale:** Hotfix for deploy wiring only; no new product slice.

## Validation

**Decision:** `npm run validate:public-route-consistency` after `build:site`; extend `verify:dist` stale patterns for v1.0.21/29/30 and legacy map title.
