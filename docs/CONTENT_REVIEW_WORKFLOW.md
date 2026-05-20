# Content Review Workflow

**Prepared:** 19 May 2026  
**Last updated:** 20 May 2026  
**Phase:** v1.0.3 — content review with manual source verification intake gate

---

## Purpose

Content review is a **human governance step** that checks whether curated summaries, dates, and status labels in this repository are **supported at a high level** by an official source page the reviewer actually opened in a browser.

It is **not** legal advice, **not** a compliance determination, and **not** client-use approval.

---

## Three review layers (do not conflate)

| Layer | What it checks | Typical artifact | Client use? |
|---|---|---|---|
| **Technical URL check** | Reachability, redirects, HTTP status | `data/verifications/url-check-*.yml` | No |
| **Source identity review** | Official domain / authority URL matches registry entry | `data/verifications/source-identity-review-*.yml` | No |
| **Content review** | Summary, dates, status vs official page (high level) | `data/verifications/content-review-*.yml` | **No** (policy: remains false) |

A reachable URL and confirmed source identity **do not** replace content review.

---

## What content review confirms

When a human reviewer completes content review with documented evidence:

- The **official URL** was opened and belongs to the expected authority.
- The record **title** and **summary_for_review** are not materially misleading at a high level compared to the official page.
- **Dates** and **status** fields in the record are source-supported or explicitly flagged for update.
- A **detected change** is relevant enough to keep in the review queue or warrants a specific next action (see checklist).

---

## What content review does not confirm

- Legal obligations for any organisation or client.
- Complete regulatory coverage or timeliness worldwide.
- That `client_use_allowed` may be set to `true` (remains **false** unless a future Control Tower policy explicitly changes this).
- That watcher metadata diffs are official legal changes (especially **simulated** diffs).
- That automated hash or title changes should auto-update YAML records.

---

## Workflow

```text
1. Confirm technical URL + source identity (prior layers) where possible
2. If automated checks are blocked, use manual source verification intake (v1.0.3) — do not loop automated retries
3. Open official_url_checked in a browser (human only)
4. Compare summary, dates, status fields to the live official page
5. Log outcome in content-review-YYYY-MM-DD.yml
6. Update record/detected-change fields only when evidence supports it
7. Regenerate exports and re-check review queue
```

### `verified_on_source`

**v1.0.3:** `verified_on_source` remains **0** on all records. No automatic changes from content review or manual intake batches.

Set `verified_on_source: true` on a record **only when** Control Tower explicitly approves per [VERIFIED_ON_SOURCE_POLICY.md](./VERIFIED_ON_SOURCE_POLICY.md), including:

- Completed [manual source verification intake](./MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md) where required (blocked sources), **and**
- A human opened the official source in a browser during content review, **and**
- Key title, summary, status, and date fields are source-supported, **and**
- `review_result` is `matches_source_at_high_level` with `source_support_level: high`, **and**
- No material fields are listed in `fields_needing_update`.

If uncertain, keep `verified_on_source: false`.

### `client_use_allowed`

Always **`false`** in content review batches for v0.8.2. Content-reviewed items may still appear in the review queue with reason `client_use_not_allowed` to keep the distinction visible.

---

## Uncertain official pages

If the page is ambiguous, paywalled, wrong language without verified translation, or only partially readable:

- Use `review_result: source_support_unclear` or `not_checked`.
- Use `source_support_level: unclear` or `low`.
- List uncertain fields in `fields_needing_update`.
- Do **not** set `verified_on_source: true`.

---

## Detected changes from watchers

1. Open the official source (not only snapshot hashes).
2. Decide if the signal is regulatory intelligence or noise.
3. Log `recommended_next_action` — e.g. `keep_pending_review`, `ignore_noise`, `convert_to_change_record` (human-only, never automatic).
4. **Never** auto-convert simulated changes into real change records.

---

## Logging `fields_needing_update`

Use stable field names, for example:

- `summary_for_review`
- `legal_status` / `guidance_status`
- `key_dates`
- `official_url`
- `title`

Add a short note in `summary_review_note`, `date_review_note`, or `status_review_note` explaining what a curator should fix.

---

## v0.8.6 batch (20 May 2026)

First human source-access pass on all 9 entries in `data/verifications/content-review-2026-05-19.yml`:

- 6 registry/sample records: `reviewed_content_summary` (mix of `matches_source_at_high_level` and `partially_matches_source`).
- 3 simulated detected changes: `reviewed_content_summary` with `source_support_unclear` — simulations not confirmed on live sources.
- `verified_on_source_after_check` remains **false** on every entry; `client_use_allowed` remains **false**.
- EUR-Lex CELEX page for EU AI Act: bot-protection limited automated read — see `content-review-law-eu-ai-act-2024-1689` notes.
- **v0.8.9 (20 May 2026):** EU AI Act — EUR-Lex HTTP 202; EC AI Act overview corroborates CELEX 32024R1689 at high level. Datatilsynet — official AI theme hub URL linked on `guidance-datatilsynet-ai-privacy`.

After this batch, regenerate candidates (`npm run generate:evidence-candidates`) and exports before deploy.

## v0.9.2 batch (20 May 2026)

First content review pass on six minimal records from v0.9.1 source discovery (`content-review-2026-05-20-v092.yml`):

- Five records: `matches_source_at_high_level` with `reviewed_content_summary` (EU Service Desk, EC digital strategy, NIST hub, UK AI assurance, AI Verify Foundation).
- EDPB AI topic index: `source_support_unclear` (HTTP 502 transient during v0.9.2 pass).
- EUR-Lex follow-up on `law-eu-ai-act-2024-1689`: `partially_matches_source`; EUR-Lex HTTP 202 unchanged.
- `verified_on_source_after_check` remains **false** on every entry; `client_use_allowed` remains **false**.

---

## Related documents

- [CONTENT_REVIEW_CHECKLIST.md](CONTENT_REVIEW_CHECKLIST.md)
- [SOURCE_VERIFICATION_WORKFLOW.md](SOURCE_VERIFICATION_WORKFLOW.md)
- [URL_VERIFICATION_POLICY.md](URL_VERIFICATION_POLICY.md)
- [TAXONOMY_AND_REVIEW_WORKFLOW.md](TAXONOMY_AND_REVIEW_WORKFLOW.md)
- [MONITORING_PR_REVIEW_CHECKLIST.md](MONITORING_PR_REVIEW_CHECKLIST.md)
