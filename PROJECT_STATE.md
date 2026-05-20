# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v1.0.0-rc1` (release candidate — not final v1.0.0) |
| **Current phase** | Public technical MVP candidate |
| **Status** | Live on custom domain; v1.0.0-rc1 deployed (`0765327`); tag `regulation-watch-v1.0.0-rc1` |
| **Working branch** | `main` |
| **Latest completed task** | v1.0.0 final Control Tower decision pack (docs only — no new features) |
| **Prior deployment** | `DEPLOY-20260520-017` — v1.0.0-rc1, commit `0765327`, run [26163494827](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26163494827) |
| **Git tag (live)** | `regulation-watch-v1.0.0-rc1` → `0765327` |
| **Next recommended step** | Control Tower: sign [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md) — final v1.0.0 pending decision |
| **Final v1.0.0 status** | **Pending Control Tower decision** — not approved; no `regulation-watch-v1.0.0` tag |

---

## v1.0.0-rc1 scope (live)

| Property | Value |
|---|---|
| Type | Release candidate — scope freeze + docs + version bump |
| New features | **None** |
| New jurisdictions/sources | **None** |
| Monitoring allowlist expansion | **None** |
| Scheduled monitoring | **None** |
| Client / final evidence | **None** — `client_use_allowed: 0`; no final export |
| Known source limitations | Australia WAF, EUR-Lex HTTP 202, EDPB 502, UNESCO `check_artifact`, `verified_on_source: 0`, incomplete content review |

**Important:** v1.0.0-rc1 is live. **Final v1.0.0** requires Control Tower sign-off in [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md).

## v1.0.0 final decision pack (this task)

| Property | Value |
|---|---|
| Type | Governance/release docs only |
| New features | **None** |
| Docs added | `V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md` |
| Docs updated | `V1_RELEASE_CANDIDATE_CHECKLIST.md`, `PROJECT_STATE.md`, `NEXT_ACTIONS.md`, `CHANGELOG.md` |
| Final tag | **Not created** — pending CT decision |

---

## MVP readiness summary (v0.9.9 audit base)

| Area | Verdict |
|---|---|
| Public site + custom domain | Operational — public technical MVP candidate |
| Data validation + exports | Operational |
| Governance gates | Enforced (`client_use_allowed: 0`) |
| Manual monitoring workflow | Operational (v0.9.8) |
| Final v1.0.0 readiness | **Blocked / pending CT review** — see [docs/V1_MVP_BLOCKERS_AND_DECISIONS.md](docs/V1_MVP_BLOCKERS_AND_DECISIONS.md) |

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
