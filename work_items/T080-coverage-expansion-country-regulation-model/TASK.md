# T080 — Coverage Expansion + Country/Regulation Data Model

**Date:** 22 May 2026  
**Release target:** v1.0.31 — Coverage Expansion and Country Regulation Model  
**Branch:** `task/T080-coverage-expansion-country-regulation-model`

## Goal

Expand Regulation Watch from T079 dev Worker MVP toward Techieray/VerifyWise-style product tracking:

- Expanded official source registry (20–30 sources)
- VerifyWise-style jurisdiction profile cards and named regulation records
- Techieray-style map metrics (maturity, activity, freshness, confidence)
- Public JSON exports for tracker UI
- UI upgrades on `/map/`, `/tracker/`, `/countries/`, `/jurisdictions/[id]/`, `/compare/`
- Optional additive Supabase migration (YAML-first if not applied)

## Out of scope

- Cron / scheduled monitoring
- Competitor scraping or database import
- Full legal text storage
- Legal/evidence/client gates opened
- Destructive Supabase changes

## Acceptance

- 25 pilot sources (2 automated RSS, 23 manual review)
- 20 regulation records, 18 profile cards in public export
- Validators and full `npm run build` pass
- Live deploy with smoke on tracker pages and new JSON exports
