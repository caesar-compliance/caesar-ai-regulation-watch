# Source adapter allowlist

**Tasks:** T052 — allowlist architecture; T053 — manual intake runner
**Version:** v1.0.8 (post-T051/T052 on main; not deployed as v1.0.8 until Control Tower approves)

---

## Purpose

The source adapter allowlist is the **manual-gated registry** for future RSS, Atom, API, and single-page metadata adapters. It defines which official sources may eventually be considered for **metadata-only** intake — without enabling live collection, scheduled monitoring, or scraping.

Data file: `data/source-adapters/source-adapter-allowlist.yml`  
Schema: `schemas/source-adapter-allowlist.schema.json`  
Validation: `npm run validate:source-adapters`

---

## What this is not

| Not allowed (T052) | Notes |
|---|---|
| Scraping or broad crawling | `broad_crawl_allowed` must stay `false` |
| Scheduled source monitoring | `schedule_enabled` must stay `false` |
| Live network collection by default | All entries `disabled` or `draft`; `fixture_only` or `manual_network_disabled` |
| Full legal text storage | `stores_full_text: false`; `stores_metadata_only: true` |
| Legal change claims | `legal_change_claimed: false` |
| Client or evidence use | `client_use_allowed`, `client_evidence_allowed`, `final_evidence_allowed` remain `false` |
| Source verification | `verified_on_source: false` until separate workflow |
| Competitor sources | Only official/public candidates already in Caesar registry |

---

## Allowlist review

Before any adapter moves toward a manual network run:

1. **Control Tower** approves the specific `adapter_id` and `collection_mode`.
2. `status` may become `approved_for_manual_run` only with `collection_mode: manual_network_approved`.
3. `approved_for_manual_run` does **not** enable scheduling — separate policy applies.
4. Paywall, login, CAPTCHA, or WAF-risk sources stay **disallowed** or `disabled`.
5. `endpoint_url` / `source_url` host must match `allowed_host`.

---

## Public surfaces

- **JSON export:** `/data/source-adapter-allowlist.json` (redacted safety summary; no secrets or run triggers).
- **Page:** `/source-adapters/` — read-only registry view; no “run now” controls.

---

## Manual intake runs (T053)

After an adapter is registered here, a **manual intake run** may reference it in `data/source-adapters/manual-intake-runs.yml`. T053 adds one pilot run (`T053-001` → `edpb-publications-rss`) with `fixture_only` mode. See [MANUAL_SOURCE_INTAKE_RUNNER.md](MANUAL_SOURCE_INTAKE_RUNNER.md).

- Validation: `npm run validate:manual-source-intake`
- Fixture runner: `npm run run:manual-source-intake -- --run-id T053-001 --fixture fixtures/source-adapters/rss-sample.xml`
- Output: `generated/source-intake-candidates/` (local, gitignored; not `public/data/`)

---

## Network dry-run approvals (T054)

After manual fixture intake (T053), a **network dry-run approval packet** may reference the same adapter in `data/source-adapters/network-dry-run-approvals.yml`. T054 adds one pilot (`T054-001` → `T053-001` / `edpb-publications-rss`) with `planning_only` mode and `network_execution_allowed: false`. See [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md).

- Validation: `npm run validate:network-dry-run-approvals`
- Plan generator: `npm run build:network-dry-run-plan -- --approval-id T054-001`
- Plans: `generated/network-dry-run-plans/` (local, gitignored; not `public/data/`)

## Single-source network dry-run execution (T055)

T055 adds `data/source-adapters/single-network-dry-run-executions.yml` (`T055-001`) and executes exactly one approved metadata-only GET for `edpb-publications-rss`. Output stays under `generated/network-dry-run-candidates/` and `generated/network-dry-run-reports/` (gitignored). See [SINGLE_SOURCE_NETWORK_DRY_RUN.md](SINGLE_SOURCE_NETWORK_DRY_RUN.md).

- Validation: `npm run validate:single-network-dry-run-executions`
- Safe refusal: `npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001`

---

## Related docs

- [MANUAL_SOURCE_INTAKE_RUNNER.md](MANUAL_SOURCE_INTAKE_RUNNER.md)
- [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md)
- [SINGLE_SOURCE_NETWORK_DRY_RUN.md](SINGLE_SOURCE_NETWORK_DRY_RUN.md)
- [RSS_API_ADAPTER_SAFETY_MODEL.md](RSS_API_ADAPTER_SAFETY_MODEL.md)
- [SCHEDULED_MONITORING_POLICY.md](SCHEDULED_MONITORING_POLICY.md)
- [WATCHER_RELIABILITY_POLICY.md](WATCHER_RELIABILITY_POLICY.md)
- Existing offline adapters: `scripts/lib/source-adapters/` (separate from T052 allowlist gate)
