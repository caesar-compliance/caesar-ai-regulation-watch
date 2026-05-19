# Timeline model — Caesar AI Regulation Watch

**Last updated:** 19 May 2026  
**Version:** v0.5.0 (static foundation)

## Purpose

Timelines provide a **chronological, source-linked view** of regulatory milestones for governance review. They complement law/guidance records and the change log but do **not** replace official legal texts.

## Scope limits

- Timelines are **curated manual YAML** — no automated ingestion or watchers.
- Events are **samples or review placeholders** unless explicitly marked reviewed after human verification.
- `verified_on_source: false` means the repository has **not** confirmed the date on the cited official URL.
- Timelines must **not** be presented as complete legal chronologies or compliance deadlines.

## File location

- Data: `data/timelines/*.yml`
- Schema: `schemas/timeline.schema.json`
- Static export: `public/data/timelines.json` (generated at build)
- Site: `/timelines/` index and `/timelines/{timeline_id}/` detail pages

## Record shape

| Field | Description |
|-------|-------------|
| `timeline_id` | Stable slug |
| `title` | Human-readable timeline title |
| `jurisdiction_id` | Primary jurisdiction slug (international timelines may still anchor to a jurisdiction for grouping) |
| `related_record_id` | Optional link to a law/guidance `record_id` |
| `source_ids` | Registry sources used for this timeline |
| `events` | Ordered list of milestone events |
| `review_status` | Timeline-level review gate |
| `legal_safe_note` | Required disclaimer |

### Event fields

| Field | Description |
|-------|-------------|
| `event_id` | Stable slug within the timeline |
| `date` | ISO date (`YYYY-MM-DD`) |
| `event_type` | `publication`, `entry_into_force`, `deadline`, `guidance`, `implementation`, `policy_announcement`, `monitoring`, `other` |
| `title` | Short label |
| `summary_for_review` | Neutral summary for internal review — not client legal advice |
| `source_id` | Must exist in `data/sources/` |
| `verified_on_source` | Boolean — `true` only after human confirms on official source |
| `review_status` | Per-event review gate |
| `legal_safe_note` | Per-event disclaimer |

## Review workflow

1. Add or edit timeline YAML.
2. Run `npm run validate:data` (schema + referential checks).
3. Human reviewer verifies dates and summaries on **official URLs** only.
4. Set `verified_on_source: true` and `review_status: reviewed` only when appropriate.
5. Regenerate exports and build static site.

## What v0.5.0 does not include

- Automated deadline calculators
- Calendar subscriptions
- RSS for timelines (changes RSS remains change-focused)
- Integration with Control Tower or evidence exports (future phase)

See also: `docs/GLOBAL_COVERAGE_EXPANSION.md`, `docs/CI_VALIDATION.md`.
