# Watcher diff validation (v0.9.7)

**Last updated:** 20 May 2026

## Live metadata triage (v0.9.7)

- Triage export: `public/data/metadata-review-triage.json` (from `data/monitoring/metadata-review-triage-*.yml`).
- Validates: `legal_change_claimed: false`, `client_use_allowed: false`, `human_review_required` aligned with triage classification.
- Monitoring page shows triage classifications; metadata change ≠ legal change.

## Purpose

Validate the end-to-end path from metadata snapshot diff → detected change record → static JSON export → site pages → human review queue — **without** drawing legal conclusions or storing full page bodies.

## Live manual watcher

```bash
npm run watch:official
```

- Fetches configured official URLs (pilot: `eu-ai-office`, `datatilsynet`).
- Writes metadata-only snapshots under `data/snapshots/<source_id>/`.
- Updates `latest.yml` only on successful fetch (failed runs preserve prior snapshot).
- Compares with previous snapshot using hardened diff classification (`scripts/lib/watcher-diff.mjs`).
- Creates real detected changes only when a meaningful diff is found (not on first baseline).
- Writes run log to `data/watcher-runs/watcher-run-<date>.yml` with `run_mode: live_manual`.

Optional flags: `--dry-run`, `--skip-network`.

**Not run in CI** — see `docs/CI_VALIDATION.md`.

## Simulation tests (safe, local)

Page metadata:

```bash
npm run watch:simulate-change
```

Feed metadata:

```bash
npm run watch:simulate-feed-change
```

- Reads fixtures from `test-fixtures/watcher-snapshots/` only.
- **No network** requests.
- **Does not** update `latest.yml` pointers for real baselines.
- Copies fixture snapshots into `data/snapshots/` with fixture IDs (separate from live `latest`).
- Writes a clearly marked simulated detected change, e.g. `data/detected-changes/simulated-eu-ai-office-change-2026-05-19.yml`.
- Writes `data/watcher-runs/watcher-run-simulation-2026-05-19.yml` with `run_mode: simulation`.

Simulated records include:

- `simulation: true`
- `client_use_allowed: false`
- `human_review_required: true`
- `legal_safe_note` stating simulation only

## Real vs simulated detected changes

| Aspect | Real (live watcher) | Simulated |
|---|---|---|
| Source | Official URL fetch | Local YAML fixtures |
| `simulation` field | absent / false | `true` |
| Review queue reason | `detected_change_pending_review` | `simulated_detected_change_pending_review` |
| Legal meaning | Possible page metadata change — confirm on live source | Pipeline test only; not an official update |
| `latest.yml` | Updated on successful live check | Not overwritten |

## Review queue integration

After `npm run generate:exports`, pending detected changes appear in:

- `/review-queue/` (static page)
- `public/data/review-queue.json`

Each item links to `/detected-changes/<id>/` with reasons such as `human_review_required` and `legal_review_not_done`. **No automatic record updates.**

## Why simulation is needed

The first live watcher run establishes baselines with **no** detected change (nothing to compare). Simulation proves diff classification, export, pages, and review queue wiring without waiting for a real official page change or mutating production baselines.

## Policies (prototype)

- **No full page body storage** — hashes and HTTP metadata only (`docs/SNAPSHOT_AND_DIFF_POLICY.md`).
- **No legal conclusions** — `change_summary_for_review` describes technical signals only.
- **Noise control** — volatile HTTP fields (ETag, Last-Modified, content length) down-ranked unless content hash/title signals present (`minimum_change_policy`).
- **Not final semantic diff** — normalized text hash is a coarse signal; human must confirm on official source.

## Validation sequence

```bash
npm run validate:data
npm run watch:official
npm run watch:simulate-change
npm run validate:data
npm run generate:exports
npm run build
```

## Related docs

- `docs/WATCHER_PROTOTYPE.md`
- `docs/SNAPSHOT_AND_DIFF_POLICY.md`
- `docs/MAP_AND_REVIEW_QUEUE.md`
