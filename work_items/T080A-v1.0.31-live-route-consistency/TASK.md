# T080A — v1.0.31 Live Route Consistency Hotfix

**Date:** 22 May 2026  
**Version:** v1.0.31 (no semver bump)  
**Branch:** `hotfix/T080A-v1.0.31-live-route-consistency`

## Problem

After T080 deploy (DEPLOY-20260522-049), `/countries/`, `/jurisdictions/[id]/`, and `/compare/` render T080 exports, but `/`, `/tracker/`, and `/map/` drift:

- `src/pages/map.astro` shadows `src/pages/map/index.astro` → live `/map/` serves legacy display-only map.
- Homepage stats/copy use legacy `getPilotSummary()` YAML counts and hardcoded “13 jurisdictions”.
- README status block still references v1.0.30.

## Goal

Systematically wire root, tracker, and map routes to T080 public exports (`tracker-summary.json`, profile cards, map metrics) and add validation to prevent recurrence.

## Out of scope

No new source expansion, Supabase apply/writes, Worker deploy, cron, secrets, or gate changes.
