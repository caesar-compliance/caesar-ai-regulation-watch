# T083 — Signal Quality, Noise Filtering, and Review Prioritization

**Date:** 22 May 2026  
**Version target:** v1.0.34  
**Branch:** `task/T083-signal-quality-noise-filtering-review-prioritization`

## Goal

Move Regulation Watch from “backend detects RSS items” to “backend prioritizes real AI-regulation signals” via a deterministic, transparent scoring layer before the operator queue.

## Deliverables

- `data/runtime/signal-quality-rules.yml`
- `scripts/runtime/lib/signal-quality.mjs`
- `scripts/runtime/validate-signal-quality.mjs`
- Enriched `regulation-review-queue.json` cards + `signal-quality-summary.json`
- Review packets with signal fields and legal-verification disclaimer
- UI: `/review-queue/`, `/tracker/`, `/runtime-health/`, `/jurisdictions/[id]/`
- Operator guide and project docs update

## Constraints

- No cron, no broad crawl, no Supabase writes, no Worker deploy unless required
- All legal/evidence/client gates remain `false`
- No legal verification claims
