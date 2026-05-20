# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v1.0.0` |
| **Current phase** | Public Technical MVP |
| **Status** | Live — v1.0.0 deployed (`a3b3b3b`); tag `regulation-watch-v1.0.0` |
| **Latest deployment** | `DEPLOY-20260520-018` — v1.0.0, commit `a3b3b3b`, run [26164212587](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26164212587) |
| **Git tag (live)** | `regulation-watch-v1.0.0` → `a3b3b3b` |
| **Control Tower decision** | **APPROVED_WITH_LIMITATIONS** — [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md) |
| **Working branch** | `main` (after merge) |
| **Prior deployment** | `DEPLOY-20260520-017` — v1.0.0-rc1, commit `0765327`, run [26163494827](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163494827) |
| **Prior tag** | `regulation-watch-v1.0.0-rc1` → `0765327` |

---

## v1.0.0 scope (Public Technical MVP)

| Property | Value |
|---|---|
| Type | Public Technical MVP — scope freeze + version label + docs |
| New features | **None** |
| New jurisdictions/sources | **None** |
| Monitoring allowlist expansion | **None** |
| Scheduled monitoring | **None** |
| Client / final evidence | **None** — `client_use_allowed: 0`; no final export |
| Known source limitations | Australia WAF, EUR-Lex HTTP 202, EDPB 502, UNESCO `check_artifact`, `verified_on_source: 0`, incomplete content review — **accepted limitations** |

**Important:** v1.0.0 is **not** a production legal tracker, **not** complete coverage, **not** legal advice, **not** client evidence. See [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md).

---

## MVP readiness summary (v0.9.9 audit base)

| Area | Verdict |
|---|---|
| Public site + custom domain | Operational — Public Technical MVP |
| Data validation + exports | Operational |
| Governance gates | Enforced (`client_use_allowed: 0`) |
| Manual monitoring workflow | Operational (v0.9.8) |
| Final v1.0.0 | **Approved with limitations** — source/content gaps accepted as documented limitations |

Full module assessment: [docs/MVP_READINESS_AUDIT.md](docs/MVP_READINESS_AUDIT.md).  
Scope freeze: [docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md](docs/V1_TECHNICAL_MVP_SCOPE_FREEZE.md).

---

## Manual live metadata artifact workflow (v0.9.8)

| Property | Value |
|---|---|
| Workflow | `manual-live-metadata-review.yml` |
| Trigger | `workflow_dispatch` only |
| Confirmation | `confirm_live_metadata=RUN` |
| Auto-commit / auto-merge | No |
| Artifact | `live-metadata-review-pack-<run_id>` |
| Local | `npm run monitoring:live-artifact` → `tmp/live-metadata-review-pack/` |

## Live metadata triage (v0.9.7)

| Metric | Count |
|---|---|
| Triage items (v0.9.6 candidates) | 3 |
| `benign_metadata_change` | 2 |
| `check_artifact` | 1 |
| `legal_change_claimed` | 0 |
| Review queue (post-triage live metadata) | 1 |

## Cautious live metadata pilot (v0.9.6)

| Metric | Count |
|---|---|
| Allowlisted sources | 5 |
| `metadata_check_ok` | 2 |
| `metadata_changed_needs_review` (raw) | 3 |
| `client_use_allowed: true` | 0 |

## Monitoring adapter pack (v0.9.5)

| Metric | Count |
|---|---|
| Source configs | 15 |
| Fetchable | 12 |
| Manual/blocked | 3 |
| `change_detected_count` | 0 |

## Source discovery (v0.9.1–v0.9.3)

| Metric | Count |
|---|---|
| Discovery leads | 26 |
| Official source confirmed | 24 |
| Pending official review | 1 (Australia) |
| Rejected | 1 |

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no caesar-ai-evidence writes.
- `client_use_allowed: true` — **0** across eligibility, monitoring, candidates, reviews.
- Not legal advice; no compliance guarantee; not complete coverage.
- No broad scraping; scheduled production monitoring not enabled.

---

## Static deployment

| Capability | Status |
|---|---|
| Custom domain | **regulation-watch.caesar.no** |
| Auto-deploy on push | **No** (workflow_dispatch) |
