# Manual review promotion pipeline (T056)

T056 promotes **one** local network dry-run candidate into a **draft** regulatory update record for human review. It does **not** publish updates, verify sources, or open evidence/client gates.

## Purpose

After T055 executes a one-off approved network dry-run, T056:

1. Selects one candidate from local `generated/network-dry-run-candidates/` (or a fixture when generated output is absent).
2. Registers a manual-review promotion packet (`T056-001`).
3. Writes a draft regulatory update under `data/regulatory-updates/drafts/` (excluded from `listRegulatoryUpdateFiles()` and public exports).
4. Keeps all safety gates closed until separate Control Tower review.

## Safety invariants

| Rule | Value |
|------|-------|
| `review_required` | `true` |
| `metadata_only` | `true` |
| `stores_full_text` | `false` |
| `publication_allowed` | `false` |
| `public_export_allowed` | `false` |
| `verified_on_source` | `false` |
| `client_use_allowed` | `false` |
| `client_evidence_allowed` | `false` |
| `final_evidence_allowed` | `false` |
| `legal_change_claimed` | `false` |
| Live network in T056 | **No** |
| Publish T055 `generated/` to `public/data` | **No** |

## Data and scripts

| Path | Role |
|------|------|
| `data/source-adapters/manual-review-promotions.yml` | Promotion registry (pilot `T056-001`) |
| `data/regulatory-updates/drafts/T056-001.yml` | Draft update (not exported) |
| `schemas/manual-review-promotion.schema.json` | Promotion packet schema |
| `schemas/draft-regulatory-update.schema.json` | Draft update schema |
| `npm run validate:manual-review-promotions` | Validation (no network) |
| `npm run build:manual-review-promotion -- --promotion-id T056-001` | Refresh draft from candidate metadata |

Draft updates live under `data/regulatory-updates/drafts/` so they are **not** picked up by `scripts/lib/load-regulatory-updates.mjs` (top-level files only).

## Workflow

```text
T055 local generated candidate (gitignored)
  → T056 promotion packet (YAML registry)
    → draft regulatory update (drafts/ only)
      → future T057+ human reviewer decision (still no auto-publication)
```

## Future publication

Publication to the public updates feed requires a **separate** task with explicit Control Tower approval. T056 does not:

- mark `verified_on_source: true`;
- enable client or evidence use;
- claim legal change;
- copy full legal text;
- rerun network requests.

See also [SINGLE_SOURCE_NETWORK_DRY_RUN.md](SINGLE_SOURCE_NETWORK_DRY_RUN.md) and [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md).
