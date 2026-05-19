# Content Review Checklist

**Prepared:** 19 May 2026  
**Use with:** [CONTENT_REVIEW_WORKFLOW.md](CONTENT_REVIEW_WORKFLOW.md)

---

## Before you start

- [ ] Technical URL check exists or was run recently (`npm run check:urls` — not in CI).
- [ ] Source identity review completed for the `source_id` where possible.
- [ ] You are reviewing **official URLs only** (no competitor or unofficial mirrors).
- [ ] You will not copy long passages from official sites (short titles/references only).

---

## Record review (law / guidance / policy / implementation)

| Step | Check |
|---|---|
| 1 | Open `official_url_checked` in a browser |
| 2 | Confirm page is the expected instrument or authority theme (identity) |
| 3 | Compare **title** to official heading (high level) |
| 4 | Compare **summary_for_review** — not misleading? |
| 5 | Compare **legal_status** / **guidance_status** to official labels |
| 6 | Compare **key_dates** (if present) — each date on source? |
| 7 | Note any fields to fix in `fields_needing_update` |
| 8 | Choose `review_result` honestly (`not_checked` if you did not open the page) |
| 9 | Set `verified_on_source_after_check` only with documented support |
| 10 | Keep `client_use_allowed: false` |

### Review result guide

| Outcome | When to use |
|---|---|
| `matches_source_at_high_level` | Summary, status, dates align; high confidence |
| `partially_matches_source` | Mostly OK; specific fields need curator edit |
| `source_support_unclear` | Page ambiguous or incomplete review |
| `needs_update` | Material mismatch; update YAML before relying on record |
| `rejected_for_client_use` | Do not use even internally without rework |
| `not_checked` | No browser review performed this session |

---

## Detected change review

| Step | Check |
|---|---|
| 1 | Note `simulation: true` — treat as pipeline fixture unless proven otherwise |
| 2 | Open live official source / feed / API landing page |
| 3 | Compare watcher summary to what you see (metadata only) |
| 4 | Decide relevance: regulatory signal vs noise |
| 5 | Set `recommended_next_action` (see workflow doc) |
| 6 | Do **not** auto-create change records or auto-edit related records |
| 7 | Keep `client_use_allowed: false` |

### Recommended actions (detected changes)

| Action | Meaning |
|---|---|
| `keep_pending_review` | Signal may matter; stay in queue |
| `convert_to_change_record` | Human may draft a manual change record (separate step) |
| `update_existing_record` | Human may update linked record after source check |
| `ignore_noise` | Hash/title volatility; no governance action |
| `needs_human_legal_review` | Escalate; still not legal advice from this repo |
| `human_browser_content_review_required` | Placeholder when review not done in browser |

---

## After review

- [ ] YAML batch validates (`npm run validate:data`)
- [ ] Exports regenerated (`npm run generate:exports`)
- [ ] Review queue checked — reasons should reflect content status
- [ ] No bulk `verified_on_source: true` without per-item evidence
- [ ] No `client_use_allowed: true` anywhere
- [ ] PR/commit message states content review is not legal advice

---

## Explicit non-goals

- Do not state compliance or non-compliance for clients.
- Do not claim complete global coverage.
- Do not import competitor code, UI, or datasets.
- Do not enable write actions in the static site UI.
