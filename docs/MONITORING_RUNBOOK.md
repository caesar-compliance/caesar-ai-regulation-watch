# Monitoring runbook (v0.9.8)

**Last updated:** 20 May 2026

## v0.9.8 manual-gated live metadata artifact workflow

- **Workflow:** `.github/workflows/manual-live-metadata-review.yml` — `workflow_dispatch` only; input `confirm_live_metadata=RUN` required.
- **Not** scheduled; **not** auto-commit to `main`; **not** auto-merge; **not** deploy; **not** client or final evidence.
- **Steps:** `npm ci` → `npm run validate:data` → `npm run monitoring:live-artifact` → `npm run monitoring:policy-check` → upload artifact `live-metadata-review-pack-<run_id>`.
- **Artifact pack** (under `tmp/live-metadata-review-pack/` locally): `live-metadata-run.json`, `change-review-pack.json`, `metadata-review-summary.md`, `policy-checks.json`, `source-allowlist.json`, `README.md`.
- **Local:** `npm run monitoring:live-artifact` then `npm run monitoring:policy-check` (writes to `tmp/`, not `public/data/`).
- **Review:** download artifact from Actions; triage metadata deltas on official URLs; do not treat as legal/regulatory change claims.

## v0.9.7 live metadata review triage

- Triage batch: `data/monitoring/metadata-review-triage-2026-05-20-v097.yml` (classifies v0.9.6 pilot `metadata_changed_needs_review` items).
- Policy: `docs/METADATA_COMPARISON_POLICY.md` — weak headers, title normalization, not legal change claims.
- Public: `/data/metadata-review-triage.json`, `/monitoring/` triage section.
- Hardened compare: `scripts/run-live-metadata-pilot.mjs` (null baseline → live `Last-Modified`/`ETag` treated as benign when sole delta).

## v0.9.6 cautious live metadata pilot

- Allowlist (max 5): `data/monitoring/live-metadata-pilot-allowlist-2026-05-20-v096.yml`.
- Live run: `data/monitoring/live-metadata-run-2026-05-20-v096.yml` (one HEAD/GET per source; metadata only; no body storage).
- Change review pack: `data/monitoring/change-review-pack-2026-05-20-v096.yml` (not a legal change claim).
- CLI: `npm run monitoring:live-metadata` (network required; compares to `monitoring-run-2026-05-20-v095`).
- Public: `/data/live-metadata-runs.json`, `/data/change-review-packs.json`, `/monitoring/` pilot section.
- **Not** scheduled monitoring; **not** broad crawl; blocked sources (EUR-Lex, EDPB, Australia WAF) excluded from allowlist.

## v0.9.5 monitoring adapter pack + deterministic pack run

- Config pack: `data/monitoring/source-configs-2026-05-20-v095.yml` (adapter_type, fetch_scope, diff_policy per source).
- Pack run: `data/monitoring/monitoring-run-2026-05-20-v095.yml` (offline/deterministic; metadata snapshots; no legal text storage).
- CLI: `npm run monitoring:pack` (regenerates pack run from latest source-configs batch).
- Public: `/monitoring/`, `/data/monitoring-source-configs.json`, `/data/monitoring-runs.json`, `/data/watcher-eligibility.json`.
- Blocked sources (EUR-Lex bot challenge, EDPB 502, Australia WAF) stay `manual_only` / `allowed_to_fetch: false`.

## v0.9.4 watcher eligibility (baseline)

- Eligibility: `data/monitoring/watcher-eligibility-2026-05-20.yml`.
- Prior run: `data/monitoring/monitoring-run-2026-05-20-v094.yml`.

## Quick commands

```bash
# Full cycle: watchers → validate → exports → build → report
npm run monitoring:cycle

# Dry-run watchers only (no snapshot writes); still validates/builds current data
npm run monitoring:cycle:dry-run

# Report from existing state (no network)
npm run monitoring:report

# Diff summary vs last commit (for PR gating / local triage)
npm run monitoring:summary

# Cautious live metadata pilot (v0.9.6; one request per allowlisted URL)
npm run monitoring:live-metadata

# Manual artifact pack to tmp/ (v0.9.8; no public/data writes)
npm run monitoring:live-artifact
npm run monitoring:policy-check
```

Reports: `data/monitoring-runs/monitoring-cycle-YYYY-MM-DD.yml`  
Diff summary: `data/monitoring-runs/latest-monitoring-diff-summary.json`

## GitHub Actions (manual)

### Manual live metadata review (v0.9.8 — preferred for cautious pilot)

1. Open **Actions** → **Manual live metadata review**.
2. **Run workflow** → set `confirm_live_metadata` to `RUN`.
3. Download artifact `live-metadata-review-pack-<run_id>` when complete.
4. Read `metadata-review-summary.md` and `policy-checks.json` before triage.
5. **No** commits, PRs, merges, or deploy from this workflow.

### Monitoring cycle (watchers — separate)

1. Open **Actions** → **Monitoring cycle**.
2. **Run workflow** → choose mode: `write`, `dry_run`, or `report_only`.
3. Optional: set `create_pr=true` to open/update a review PR when meaningful changes exist.
4. Optional: `commit_snapshots` / `commit_exports` (default `true`) control PR file scope.
5. Download artifacts after completion (monitoring + watcher outputs).
6. **Do not** expect auto-updates on `main` unless you merge a review PR yourself.

**Scheduled runs:** daily 06:00 UTC on **Monitoring cycle** only — **artifacts only**, no PR (see `docs/SCHEDULED_MONITORING_POLICY.md`). The v0.9.8 manual live metadata workflow has **no** schedule.

## Monitoring review PRs (v0.8.1)

| Trigger | PR created? |
|---|---|
| Schedule | No |
| `workflow_dispatch`, `create_pr=false` | No |
| `workflow_dispatch`, `create_pr=true`, meaningful changes | Yes → `monitoring/results-YYYY-MM-DD` |
| `workflow_dispatch`, `create_pr=true`, no meaningful changes | No (artifact + summary only) |

After a PR is opened:

1. Follow `docs/MONITORING_PR_REVIEW_CHECKLIST.md`.
2. Merge only after human review — **never** auto-merge.
3. Close without merge if changes are noise (baselines, timestamps, simulations).
4. Open a **separate** PR for curated content updates (`data/laws`, `data/guidance`, etc.).

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
