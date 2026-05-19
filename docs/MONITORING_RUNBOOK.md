# Monitoring runbook (v0.8.0)

**Last updated:** 19 May 2026

## Quick commands

```bash
# Full cycle: watchers → validate → exports → build → report
npm run monitoring:cycle

# Dry-run watchers only (no snapshot writes); still validates/builds current data
npm run monitoring:cycle:dry-run

# Report from existing state (no network)
npm run monitoring:report
```

Reports: `data/monitoring-runs/monitoring-cycle-YYYY-MM-DD.yml`

## GitHub Actions (manual)

1. Open **Actions** → **Monitoring cycle**.
2. **Run workflow** → choose mode: `write`, `dry_run`, or `report_only`.
3. Download artifacts after completion (monitoring + watcher outputs).
4. **Do not** expect auto-updates on `main` — triage artifacts locally.

Scheduled runs: daily 06:00 UTC (see `docs/SCHEDULED_MONITORING_POLICY.md` to disable).

## Reading a monitoring report

| Field | Meaning |
|---|---|
| `overall_status` | `passed`, `partial` (soft watcher errors), `failed`, or `report_only` |
| `watchers_checked` | Enabled watchers that completed without hard failure |
| `watcher_soft_error_count` | Soft-fail watcher errors (latest snapshot preserved) |
| `detected_changes_created` | New detected-change files this cycle (write mode) |
| `real_detected_changes` | Non-simulation detected changes in repo |
| `validation_status` / `build_status` | Post-watcher pipeline health |

## When a watcher detects a change

1. Open `/detected-changes/` — confirm **not** marked simulation.
2. Open the source on the **official URL** — confirm the update yourself.
3. Use `/review-queue/` — item should include `detected_change_pending_review`.
4. **Do not** mark records `verified_on_source: true` from watcher output alone.
5. **Do not** set `client_use_allowed: true` without Control Tower approval.

## When a watcher fails (soft error)

1. Check `/watchers/{id}/` — error category and feed diagnostics if present.
2. Confirm whether `latest.yml` still points at last good snapshot.
3. Re-run after transient issues (rate limit, timeout).
4. If persistent, update watcher config notes or disable until scope review.

## When the monitoring cycle fails

1. Read `data/monitoring-runs/monitoring-cycle-*.yml` — `error_message`, `phase_notes`.
2. Fix data/schema issues → `npm run validate:data`.
3. Re-run `npm run monitoring:cycle`.
4. Review queue may show `monitoring_run_failed` until the next successful cycle.

## Premature review pitfalls

- Watcher hash/feed/API diffs are **signals**, not legal analysis.
- Federal Register API results are search listings, not confirmed regulatory impact.
- Simulated changes are pipeline tests only.

## Related pages

- `/monitoring/` — latest cycle summary
- `/watchers/` — per-watcher status
- `/review-queue/` — human triage list
- `/methodology/` — governance approach
