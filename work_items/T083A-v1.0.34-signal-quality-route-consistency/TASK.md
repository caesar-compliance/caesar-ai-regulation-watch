# T083A — v1.0.34 Signal Quality Route Consistency Hotfix

**Date:** 22 May 2026  
**Branch:** `hotfix/T083A-v1.0.34-signal-quality-route-consistency`  
**Version:** 1.0.34 (no bump)

## Problem

T083 deploy (v1.0.34) passed smoke for JSON (`signal-quality-summary.json`) but external checks reported `/`, `/tracker/`, and `/review-queue/` leading with v1.0.33 / T082 copy while T083 signal-quality state was only obvious on JSON routes.

## Scope

- Foreground T083 on `/` and `/tracker/` above T082 sections.
- Expose explicit `signal_score`, `ai_regulation_relevance`, `signal_category`, `recommended_operator_action`, and `reason_codes` markers on review-queue cards.
- Extend `validate:public-route-consistency`, `verify:dist`, and `smoke:live-routes` to fail on T082-only HTML when product version is 1.0.34.
- Redeploy static site if needed.

## Out of scope

- New signal rules, Supabase writes, Worker deploy, cron, secrets, gate openings.
