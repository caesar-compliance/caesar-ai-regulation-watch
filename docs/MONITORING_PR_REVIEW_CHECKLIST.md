# Monitoring PR review checklist (v0.8.1)

**Last updated:** 19 May 2026

Use this checklist when reviewing a **monitoring results** pull request opened from `monitoring-cycle.yml` (`create_pr=true`). These PRs contain generated watcher/monitoring data only — not curated legal conclusions.

## Before you merge

### 1. Watcher run summary

- [ ] Open `data/monitoring-runs/monitoring-cycle-YYYY-MM-DD.yml` in the PR.
- [ ] Confirm `overall_status`, `watchers_checked`, `watcher_soft_error_count`, and phase statuses (`validation_status`, `exports_status`, `build_status`).
- [ ] Open linked `data/watcher-runs/watcher-run-YYYY-MM-DD.yml` if present.
- [ ] Triage any soft errors — confirm `latest.yml` still points at last good snapshot when applicable.

### 2. Detected changes

- [ ] List new files under `data/detected-changes/`.
- [ ] **Ignore** items with `simulation: true` unless you are validating the pipeline.
- [ ] For each **real** detected change, open the official source URL yourself — do not trust hashes or summaries alone.
- [ ] Confirm the change is relevant to Caesar scope (jurisdiction, source, topic).

### 3. Content review (v0.8.2)

- [ ] For any record or detected change you rely on, check `content_review_status` and `data/verifications/content-review-*.yml`.
- [ ] Do not merge monitoring output that implies client-use approval — `client_use_allowed` must remain false.
- [ ] Log content review outcomes in a separate curator PR if summaries/dates need updating (see [CONTENT_REVIEW_CHECKLIST.md](./CONTENT_REVIEW_CHECKLIST.md)).

### 4. Official source identity

- [ ] Match `source_id` / `watcher_id` to `data/sources/` registry entries.
- [ ] Confirm URL/domain is the expected official or registered authoritative source.
- [ ] Do not treat Federal Register API listings, feed titles, or page metadata as confirmed regulatory impact.

### 4. Governance flags (do not auto-approve)

- [ ] Do **not** set `verified_on_source: true` from watcher output alone.
- [ ] Do **not** set `client_use_allowed: true` without Control Tower approval.
- [ ] Do **not** merge AI-generated or watcher-derived text as public legal summaries.
- [ ] Do **not** treat this PR as legal advice or a compliance guarantee.

### 5. Snapshots and noise

- [ ] Review new `data/snapshots/**/snap-*.yml` files — metadata only, no bodies.
- [ ] Discard or close PR sections that are baseline-only churn with no real signal.
- [ ] Check `data/monitoring-runs/latest-monitoring-diff-summary.json` for `has_meaningful_changes` and `recommended_action`.

### 6. Exports and site data

- [ ] If `public/data/*` changed, skim `review-queue.json` and `detected-changes.json` exports for unexpected items.
- [ ] Confirm no full page/feed/API bodies appear in committed files.

## After review — decide one path

| Outcome | Action |
|---|---|
| Meaningful, valid signals | Merge PR as **pending_review** monitoring data; open follow-up content review task |
| Noisy snapshots / false positive | Close PR without merge; optionally delete branch; adjust watcher config |
| Watcher misconfiguration | Merge only triage notes or fix config in a separate human-authored PR |
| Legal/content update needed | Create a **separate** human-curated PR for `data/laws`, `data/guidance`, etc. |

## Related docs

- `docs/MONITORING_RUNBOOK.md`
- `docs/SCHEDULED_MONITORING_POLICY.md`
- `docs/WATCHER_DIFF_VALIDATION.md`
- `docs/SNAPSHOT_AND_DIFF_POLICY.md`
