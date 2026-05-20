# Manual source intake runner

**Task:** T053 — Manual approved source intake runner  
**Version:** v1.0.8 (post-T052 on main; not deployed as v1.0.8 until Control Tower approves)

---

## Purpose

T053 adds a **manual-gated, fixture-first** runner that transforms one approved source adapter (from the T052 allowlist) into **local metadata candidate JSON** for human review. It does not enable live RSS/API collection, scheduling, or publication to `public/data/`.

| File | Role |
|---|---|
| `data/source-adapters/manual-intake-runs.yml` | Run registry (one pilot: `T053-001`) |
| `schemas/manual-source-intake-run.schema.json` | Schema validation |
| `scripts/validate-manual-source-intake-runs.mjs` | Safety + allowlist cross-check |
| `scripts/run-manual-source-intake.mjs` | Fixture-only runner (CLI) |

---

## Pilot run (T053-001)

| Field | Value |
|---|---|
| **Adapter** | `edpb-publications-rss` (official EDPB publications RSS — T052 allowlist) |
| **Mode** | `fixture_only` |
| **Status** | `draft` |
| **Network** | `network_allowed: false` |
| **Output** | `generated/source-intake-candidates/T053-001.json` (gitignored) |

**Why EDPB RSS:** Official EU public feed; already in allowlist with `fixture_only`, no paywall/WAF flags, all evidence gates false, `schedule_enabled: false`. Aligns with `fixtures/source-adapters/rss-sample.xml`.

---

## Fixture-first workflow

1. Validate config: `npm run validate:manual-source-intake`
2. Run fixture parser (optional baseline): `npm run build:source-adapter-fixtures`
3. Execute manual intake:

```bash
npm run run:manual-source-intake -- --run-id T053-001 --fixture fixtures/source-adapters/rss-sample.xml
```

4. Review `generated/source-intake-candidates/T053-001.json` locally (not deployed).

The runner **requires** `--run-id` and `--fixture`. It rejects `--network` / `--allow-network`. It only accepts run statuses: `draft`, `ready_for_manual_review`, `completed_fixture_only`.

---

## What this is not

| Not allowed (T053) | Notes |
|---|---|
| Live network fetch by default | `network_allowed: false`; fixture path only |
| Scheduled monitoring | `schedule_enabled: false` on run and adapter |
| Scraping / broad crawl | Adapter `broad_crawl_allowed: false` |
| Full legal text storage | `stores_full_text: false`; snippets capped |
| Legal change claims | `legal_change_claimed: false` |
| Source verification | `verified_on_source: false` |
| Client / evidence use | All evidence gates `false` |
| Public publication | Output stays under `generated/` (gitignored) |

---

## Network dry-run approval (T054 — planning only)

T054 links pilot run `T053-001` to approval packet `T054-001` for a **future** one-off network dry-run. T054 does **not** fetch the live endpoint.

| Step | Command |
|---|---|
| Validate approval | `npm run validate:network-dry-run-approvals` |
| Generate plan | `npm run build:network-dry-run-plan -- --approval-id T054-001` |
| Future runner (refuses in T054) | `npm run run:approved-network-dry-run -- --approval-id T054-001` |

See [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md). Execution remains **T055** after Control Tower approval.

---

## Related docs

- [SOURCE_ADAPTER_ALLOWLIST.md](SOURCE_ADAPTER_ALLOWLIST.md)
- [RSS_API_ADAPTER_SAFETY_MODEL.md](RSS_API_ADAPTER_SAFETY_MODEL.md)
- [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md)
- `work_items/T053-manual-approved-source-intake-runner/`
- `work_items/T054-single-source-network-dry-run-approval/`
