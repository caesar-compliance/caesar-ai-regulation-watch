# Official source watcher prototype (v0.7.4)

**Last updated:** 19 May 2026

## Purpose

The first **safe** automated monitoring step for Caesar AI Regulation Watch: check a **very small** set of official URLs already in the source registry, store **metadata-only** snapshots, and create **pending detected-change** records when a meaningful technical diff appears.

This is **not** legal advice, **not** a compliance guarantee, and **not** production scheduling.

## Pilot watchers

| Watcher ID | Adapter | Source | Jurisdiction |
|---|---|---|---|
| `watcher-eu-ai-office` | page metadata | `eu-ai-office` | EU |
| `watcher-datatilsynet` | page metadata | `datatilsynet` | Norway |
| `watcher-edpb-feed` | RSS/feed | `edpb` | EU |
| `watcher-edps-feed` | RSS/feed | `edps` | EU |
| `watcher-us-federal-register-api` | API metadata | `us-federal-register` | US Federal |

See `docs/SOURCE_ADAPTERS.md`, `docs/FEED_WATCHER_CANDIDATES.md`, and `docs/API_WATCHER_CANDIDATES.md`.

**v0.7.4:** Federal Register API watcher enabled (narrow query, metadata-only). EDPS feed parser limit fixed; feed diagnostics on soft-fail. Watchers remain **manual CLI only** — not scheduled, not in CI.

Configuration: `data/watchers/official-source-watchers.yml`

## How to run

```bash
# Single watcher pass
npm run watch:official

# Full monitoring cycle (watchers + validate + exports + build + report)
npm run monitoring:cycle
```

See `docs/MONITORING_RUNBOOK.md`. Push/PR CI does **not** run watchers; use `monitoring-cycle.yml` or local cycle.

Simulation (fixtures only, no network):

```bash
npm run watch:simulate-change
```

See `docs/WATCHER_DIFF_VALIDATION.md` for the full validation sequence.

Optional flags:

- `--dry-run` — no writes
- `--skip-network` — no HTTP requests

Environment:

- `WATCHER_RUN_DATE` — run log filename date (default `2026-05-19`)
- `WATCHER_TIMEOUT_MS` — fetch timeout (default `20000`)

## What the watcher does

1. Loads enabled watchers from YAML.
2. Fetches each `official_url` (GET, follow redirects, timeout).
3. Computes metadata: HTTP status, final URL, content-type, etag, last-modified, title (simple HTML parse), content length, SHA-256 hashes (raw body and normalized text).
4. Writes snapshot YAML under `data/snapshots/<source_id>/`.
5. Updates `latest.yml` pointer on success.
6. Compares with previous snapshot using hardened diff classification (`changed_fields`, `significance_level`, noise control).
7. If meaningful diff, writes `data/detected-changes/<id>.yml` (never sets `client_use_allowed: true`).
8. Writes run log to `data/watcher-runs/watcher-run-<date>.yml` with `run_mode: live_manual`.

## What it does not do

- Store full page bodies in the repository.
- Draw legal conclusions or update law/guidance records.
- Set `verified_on_source: true` or `client_use_allowed: true`.
- Run in CI (see `docs/CI_VALIDATION.md`).
- Schedule production cron jobs (future Control Tower work).
- Broad crawling or competitor site monitoring.

## Human review

All detected changes have `human_review_required: true` and `review_status: pending_review`. Reviewers confirm changes on the **live official source** before any curated record update.

## Related docs

- `docs/SNAPSHOT_AND_DIFF_POLICY.md`
- `docs/SOURCE_VERIFICATION_WORKFLOW.md`
- `docs/MAP_AND_REVIEW_QUEUE.md`
