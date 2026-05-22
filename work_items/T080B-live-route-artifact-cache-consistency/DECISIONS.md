# T080B — Decisions

## No code route changes

**Decision:** Do not change Astro routes or redeploy — investigation shows artifact and live URLs already correct at `1b50fcd` / `1aedc39`.

**Rationale:** Local `dist/` and cache-busted live HTML lack all stale markers; T080A deploy run `26295890931` is on production CDN.

## External check staleness

**Decision:** Classify mismatch as **stale external check / CDN cache window**, not a deploy defect.

**Rationale:** GitHub Pages serves `cache-control: max-age=600` (10 minutes). Checks run before T080A deploy or without cache bust can read superseded HTML until TTL expires.

## Live smoke script

**Decision:** Add `scripts/smoke-live-routes.mjs` (`npm run smoke:live-routes`) for operators and post-deploy gates.

## DEPLOYMENTS log

**Decision:** Record T080A production deploy as `DEPLOY-20260522-050` (was missing from table).
