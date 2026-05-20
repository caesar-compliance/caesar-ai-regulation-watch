# Source adapter allowlist

**Task:** T052 — API/RSS source adapter planning + allowlist architecture  
**Version:** v1.0.8 (post-T051 on main; not deployed as v1.0.8 until Control Tower approves)

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

## Related docs

- [RSS_API_ADAPTER_SAFETY_MODEL.md](RSS_API_ADAPTER_SAFETY_MODEL.md)
- [SCHEDULED_MONITORING_POLICY.md](SCHEDULED_MONITORING_POLICY.md)
- [WATCHER_RELIABILITY_POLICY.md](WATCHER_RELIABILITY_POLICY.md)
- Existing offline adapters: `scripts/lib/source-adapters/` (separate from T052 allowlist gate)
