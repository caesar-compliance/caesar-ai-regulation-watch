# Network dry-run approval model

**Task:** T054 — Single-source network dry-run approval architecture  
**Version:** v1.0.8 (post-T053 on main; not deployed as v1.0.8 until Control Tower approves)

---

## Purpose

T054 adds a **planning-only approval architecture** for a future **one-off, manually approved** network dry-run against a single official RSS/API source. It does **not** run live network collection, scheduling, publication, or evidence export.

| File | Role |
|---|---|
| `data/source-adapters/network-dry-run-approvals.yml` | Approval packet registry (one pilot: `T054-001`) |
| `schemas/network-dry-run-approval.schema.json` | Schema validation |
| `scripts/validate-network-dry-run-approvals.mjs` | Safety + allowlist + manual-run cross-check |
| `scripts/build-network-dry-run-plan.mjs` | Planning-only dry-run plan JSON (no fetch) |
| `scripts/run-approved-network-dry-run.mjs` | Guarded future runner (refuses execution in T054) |

---

## Pilot approval (T054-001)

| Field | Value |
|---|---|
| **Approval** | `T054-001` |
| **Linked manual run** | `T053-001` |
| **Adapter** | `edpb-publications-rss` (official EDPB publications RSS) |
| **Mode** | `planning_only` |
| **Status** | `ready_for_control_tower_review` |
| **Network execution** | `network_execution_allowed: false` |
| **Plan output** | `generated/network-dry-run-plans/T054-001.json` (gitignored) |
| **Future candidate path** | `generated/network-dry-run-candidates/T054-001.json` (not created in T054) |

**Why EDPB RSS:** Same official source as T053 fixture intake; allowlist entry has no paywall/WAF, `schedule_enabled: false`, metadata-only, all evidence gates false.

---

## Planning workflow (T054)

1. Validate approvals: `npm run validate:network-dry-run-approvals`
2. Generate dry-run plan (no network):

```bash
npm run build:network-dry-run-plan -- --approval-id T054-001
```

3. Review `generated/network-dry-run-plans/T054-001.json` locally (not deployed to `public/data/`).

The plan generator **never** calls `fetch`, HTTP clients, or crawlers. It does **not** write network candidate output in T054.

---

## Future execution (T055 — not in T054)

A future **T055** task may execute **one** approved dry-run only after:

- Explicit **Control Tower approval**;
- Approval status `approved_for_future_single_run` with `network_execution_allowed: true` (not set in T054);
- CLI: `--approval-id`, `--i-understand-this-runs-network`;
- Environment: `CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES`;
- **One-off command** — no scheduling, no publication, gates unchanged.

T054 future runner stub (expected safe refusal):

```bash
npm run run:approved-network-dry-run -- --approval-id T054-001
```

Exits non-zero with: *Network dry-run execution is not enabled in T054; use T055 after Control Tower approval.*

---

## Safety invariants

| Rule | T054 value |
|---|---|
| Live network collection | **No** |
| Scheduled monitoring | **No** |
| Broad crawl | **No** |
| Full legal text storage | **No** |
| Evidence / client-use gates | **All false** |
| `verified_on_source` / `legal_change_claimed` | **false** |
| Public evidence export | **No** |
| `public/data/` network candidates | **No** |

---

## Related docs

- [SOURCE_ADAPTER_ALLOWLIST.md](SOURCE_ADAPTER_ALLOWLIST.md)
- [MANUAL_SOURCE_INTAKE_RUNNER.md](MANUAL_SOURCE_INTAKE_RUNNER.md)
- [RSS_API_ADAPTER_SAFETY_MODEL.md](RSS_API_ADAPTER_SAFETY_MODEL.md)
