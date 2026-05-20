# T054 — Single-source network dry-run approval architecture

**Branch:** `task/T054-single-source-network-dry-run-approval`  
**Base:** main @ `39f44e9`  
**Package version:** 1.0.8 (unchanged)

## Goal

Add a safe approval architecture for a future **one-off, Control Tower-approved** network dry-run against a single official RSS source — **planning only**, no live fetch in T054.

## Scope

- One approval packet: `T054-001` linked to T053 run `T053-001` / adapter `edpb-publications-rss`
- Schema, YAML registry, validation script
- Planning-only dry-run plan generator (`npm run build:network-dry-run-plan`)
- Guarded future runner stub (`npm run run:approved-network-dry-run`) — refuses in T054
- Read-only UI section on `/source-adapters/`
- Docs and work item reports

## Out of scope

- Live RSS/API fetch or crawl
- Scheduled monitoring
- Network candidate output in T054
- Public `public/data/` publication of dry-run artifacts
- Gate changes, deploy, tag, merge to main (Control Tower after PR review)

## Safety

All evidence gates remain `false`. `network_execution_allowed: false`. `generated/` plan output gitignored.
