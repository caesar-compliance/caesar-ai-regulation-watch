# Source Verification Workflow

**Prepared:** 19 May 2026  
**Version:** v0.6.0

---

## Purpose

This workflow supports **systematic human review** of official URLs linked from the Caesar AI Regulation Watch registry. Verification records document what was checked, when, and whether an item remains suitable for governance review support.

Verification is **not** legal advice and **does not** grant compliance certification.

---

## When to verify

| Trigger | Action |
|---|---|
| New curated record added | Create verification entry with `check_result: not_checked` until a human checks the URL |
| Source `official_url` changes | Re-verify; set prior verification to `needs_update` on the item |
| Review queue flags `verified_on_source_false` | Prioritise timeline events and records with unverified dates |
| Before client-facing export | Human reviewer must set `client_use_allowed: true` only with strong evidence |

---

## Verification record fields

Each entry in `data/verifications/*.yml` validates against `schemas/source-verification.schema.json`.

| Field | Description |
|---|---|
| `verification_id` | Unique ID for this check |
| `verified_date` | Date check performed (ISO `YYYY-MM-DD`) |
| `verifier_type` | `human_reviewer`, `curator_batch`, or `automated_check_pending` |
| `item_type` | `source`, `record`, `timeline_event`, or `change` |
| `item_id` | ID of the verified item |
| `source_id` | Registry source used |
| `official_url_checked` | Exact URL visited or intended for check |
| `check_result` | See allowed values below |
| `page_title_or_reference` | Optional human note of page title or citation |
| `notes` | Free-text reviewer notes |
| `review_status_after_check` | Item review status after check |
| `client_use_allowed` | `false` unless verification is genuinely strong |
| `legal_safe_note` | Required disclaimer per entry |

### Allowed `check_result` values

| Value | Meaning |
|---|---|
| `reachable_matches_expected_source` | URL loads; content matches expected authority/instrument |
| `reachable_needs_human_review` | URL loads; content scope or language needs expert review |
| `unreachable` | URL failed to load |
| `redirected` | URL redirects; confirm canonical destination |
| `not_checked` | Placeholder; no live check performed yet |
| `uncertain` | Check attempted; outcome unclear |

---

## Review steps (human)

1. Open the item in the site (`/records/`, `/sources/`, `/timelines/`, or `/review-queue/`).
2. Follow the **official source** link (never competitor tracker pages).
3. Confirm the page is from the expected authority (domain, branding, instrument title).
4. Update or create a verification YAML entry with the actual `check_result`.
5. If dates or summaries are confirmed, set `verified_on_source: true` on the record or timeline event in YAML (separate commit).
6. Set `review_status: reviewed` only when Control Tower approves for your use case.
7. Set `client_use_allowed: true` only when verification is genuinely strong — default is `false`.

---

## Batch files

| File | Description |
|---|---|
| [source-verification-2026-05-19.yml](../data/verifications/source-verification-2026-05-19.yml) | v0.6.0 curated records batch (`not_checked`) |

Static export: `/data/verifications.json` (generated at build).

Site page: [/verification/](/verification/) (read-only summary).

---

## Integration with review queue

The review queue export includes:

- Records with `review_status` not `reviewed`
- Records with `verified_on_source: false` when set on the entity
- Verification entries with `check_result` of `not_checked` or `uncertain`
- Unverified timeline events

---

## Legal-safe defaults

- Do not auto-mark items reviewed in CI.
- Do not scrape competitor sites for verification.
- Do not copy official legal text into summaries.
- Official sources control; Caesar summaries are `summary_for_review` only.

See also [TAXONOMY_AND_REVIEW_WORKFLOW.md](TAXONOMY_AND_REVIEW_WORKFLOW.md) and [RECORD_EXPANSION_GAPS.md](RECORD_EXPANSION_GAPS.md).
