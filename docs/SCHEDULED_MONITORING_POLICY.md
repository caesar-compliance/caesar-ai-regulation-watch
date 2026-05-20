# Scheduled monitoring policy (v0.9.9)

**Last updated:** 20 May 2026 (automation-first rebase — T046)

## v0.9.8 manual live metadata workflow (not scheduled)

| Workflow | Trigger | Schedule | Auto-commit |
|---|---|---|---|
| `manual-live-metadata-review.yml` | `workflow_dispatch` + `confirm_live_metadata=RUN` | **None** | **None** — artifact upload only |
| `monitoring-cycle.yml` | `workflow_dispatch` + daily cron | 06:00 UTC (cycle only) | Optional review PR only (manual merge) |

The cautious live metadata pilot for allowlisted official URLs is run through **Manual live metadata review** when operators need a fresh artifact pack. It does not replace CI validation and does not deploy the public site.

## Purpose

Provide **scheduled, policy-controlled automation** for official-source watchers. Automation-first product direction expects monitoring when sources are approved and technically safe — API/RSS/feed-first, then approved public official pages.

Monitoring detects possible metadata changes and can feed **regulatory update** records with confidence labels. It does **not** make legal conclusions, store full legal/source text, bypass technical controls, or enable client evidence without separate approval.

**Preferred order:** official API → RSS/Atom → official structured page → approved public page (metadata-only) → manual seed.

## Manual vs scheduled

| Mode | How | Persists watcher output |
|---|---|---|
| Local write | `npm run monitoring:cycle` | Yes |
| Local dry-run | `npm run monitoring:cycle:dry-run` | No (watchers use `--dry-run`) |
| Local report | `npm run monitoring:report` | No network |
| GitHub Actions (scheduled) | Daily 06:00 UTC schedule | **Artifacts only** — no PR |
| GitHub Actions (manual PR) | `workflow_dispatch` with `create_pr=true` | Optional review PR branch — **human merge only** |
| GitHub Actions (manual, no PR) | `workflow_dispatch` default | Artifacts only |

## Separation from CI validation

| Workflow | Purpose |
|---|---|
| `validate-and-build.yml` | Schema + referential integrity + static site build on push/PR — **no live fetches** |
| `monitoring-cycle.yml` | Live watcher fetch + validate + exports + build — **artifacts only** |

CI validation remains the merge gate. Monitoring is operational signal collection, not a substitute for human review.

## Automation outputs and assurance gates

- Detected changes may publish to public feeds when deterministic policy rules pass (allowed source, URL present, summary present, confidence visible, no legal advice wording).
- **Human review is optional** for normal tracker usefulness; use exceptions/confidence queues for low-confidence or blocked items.
- Monitoring does **not** set `verified_on_source: true` without Control Tower approval.
- Monitoring does **not** set `client_use_allowed: true` or `final_evidence_allowed: true`.
- Simulated or low-confidence items remain clearly labeled.

**Prohibited:** broad uncontrolled scraping; WAF/CAPTCHA bypass; stealth/proxy evasion; competitor dataset copying; full legal/source text storage in repo artifacts.

## Artifact / branch / PR policy

- **Scheduled runs (default):** upload artifacts only (`data/monitoring-runs/`, watcher runs, snapshots, JSON exports; 14-day retention). **No PR.**
- **Manual runs:** `workflow_dispatch` with `create_pr=false` (default) — same artifact-only behavior.
- **Manual review PR:** `workflow_dispatch` with `create_pr=true` opens or updates `monitoring/results-YYYY-MM-DD` **only when** `latest-monitoring-diff-summary.json` reports `has_meaningful_changes: true`.
- Committed paths on review PRs (configurable): `data/snapshots/**`, `data/watcher-runs/**`, `data/detected-changes/**`, `data/monitoring-runs/**`, `public/data/**`, `public/feeds/**` — never curated law/guidance YAML unless separately authored.
- **No automatic commits** to `main`.
- **No auto-merge** — reviewers merge or close PRs explicitly.
- **No deployment** from monitoring workflow.
- See `docs/MONITORING_PR_REVIEW_CHECKLIST.md`.

## Retry and soft-fail

Watchers use conservative retry and **soft-fail** (failed checks do not overwrite last good `latest.yml`). Monitoring reports `watcher_soft_error_count` and `errors_by_category` for triage — not legal classifications.

## Secrets

Current monitoring requires **no secrets**: public official URLs and APIs only, with a descriptive User-Agent.

## Concurrency

Local runs use `data/monitoring-runs/.monitoring-cycle.lock` to prevent overlapping cycles. GitHub Actions uses workflow concurrency (`cancel-in-progress`).

## Storage policy

Metadata-only snapshots: titles, links, dates, hashes. **No** full page, feed, or API response bodies.

## Future: Hetzner / Coolify worker

A dedicated worker VM could run `npm run monitoring:cycle` on a schedule and push artifacts or open PRs. v0.8.1 adds optional GitHub review PRs; hosting choice remains a Control Tower decision.

## Related docs

- `docs/MONITORING_RUNBOOK.md`
- `docs/WATCHER_PROTOTYPE.md`
- `docs/WATCHER_RELIABILITY_POLICY.md`
- `docs/CI_VALIDATION.md`
