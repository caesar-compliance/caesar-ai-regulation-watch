# T053 — Manual approved source intake runner

**Branch:** `task/T053-manual-approved-source-intake-runner`  
**Base:** main @ `d373957` (post-T052 merge)  
**Package version:** 1.0.8 (unchanged)

## Goal

Add a safe, manual-gated runner that transforms one approved source adapter from the T052 allowlist into local metadata candidate files — **fixture-first**, no live network, no scheduling.

## Scope

- One pilot run: `T053-001` → adapter `edpb-publications-rss`
- `manual-intake-runs.yml` + JSON schema + validation script
- CLI runner: `npm run run:manual-source-intake`
- Read-only UI section on `/source-adapters/`
- Docs and work item reports

## Out of scope

- Live RSS/API fetch
- Scheduled monitoring
- Public `public/data/` publication of intake candidates
- Gate changes, deploy, tag, merge to main (Control Tower after PR review)

## Safety

All evidence gates remain `false`. `network_allowed: false` by default. `generated/` output gitignored.
