# T080B — Final Live Route Artifact / Cache Consistency

**Date:** 22 May 2026  
**Version:** v1.0.31 (verification only)

## Problem

External live checks still report v1.0.29 / 13 jurisdictions / legacy map on `/`, `/tracker/`, `/map/` after T080A, while `/countries/` and `/compare/` show v1.0.31.

## Goal

Prove deployed artifact and live URLs match T080/T080A, or fix and redeploy if not.

## Approach

1. Inspect local `dist/` after `npm run build`.
2. Re-check Astro route shadowing (`map.astro` removed in T080A).
3. Cache-busted and normal `curl` against `regulation-watch.caesar.no`.
4. Compare GitHub Pages deploy commit to `main`.
5. Add `npm run smoke:live-routes` for repeatable post-deploy verification.
