# T081 — Review Queue, Source Freshness, and Operator Workflow

**Date:** 22 May 2026  
**Version target:** v1.0.32  
**Branch:** `task/T081-review-queue-source-freshness-operator-workflow`

## Goal

Turn the v1.0.31 backend/product tracker into a more usable regulation monitoring product:

- Clear review queue UX for detected changes and review candidates
- Source freshness and coverage health signals
- Country/source “what needs review” states
- Local operator decision workflow (YAML/static-first) without opening legal/evidence/client gates
- Cron and all safety gates remain closed

## Scope

- Public exports: `regulation-review-queue.json`, `source-freshness.json`, `operator-review-summary.json`, `review-packets-index.json`
- Build/validate scripts for review queue and source freshness
- UI: `/review-queue/`, tracker/map/countries/jurisdiction/runtime-health enhancements
- Optional additive Supabase migration `004_review_queue_operator_workflow.sql` (not applied by default)

## Out of scope

- Cron / scheduled monitoring enablement
- Broad crawling, competitor scraping, full legal text storage
- Opening legal/evidence/client/publication gates
