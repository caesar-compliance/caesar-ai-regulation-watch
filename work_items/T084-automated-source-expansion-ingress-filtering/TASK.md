# T084 — Automated Source Expansion and Ingress Signal Filtering

**Date:** 22 May 2026  
**Branch:** `task/T084-automated-source-expansion-ingress-filtering`  
**Version target:** v1.0.35

## Goal

Expand controlled automated monitoring from 2 to 6 official RSS/Atom sources and apply T083 signal-quality rules at ingress/export time so the default operator review queue shows only candidate-level cards.

## Scope

- Registry T084 fields (`automation_mode`, `noise_budget`, `fetch_risk`, etc.)
- Promote 4 manual sources with verified feeds (EC digital strategy, NIST news, CNIL FR, UK DSIT Atom)
- Ingress filter library + `ingress-filter-summary.json`
- UI: tracker, review-queue, runtime-health, sources pilot table
- `validate:ingress-filtering`
- Worker allowlist sync (6 sources)
- Cron remains disabled; all gates closed

## Out of scope

- Cron/scheduled monitoring enablement
- Broad crawling, competitor copying, full legal text storage
- FTC/OECD/CoE/UK ICO automation (feeds blocked or 404)
