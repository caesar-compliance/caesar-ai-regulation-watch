# Single-source network dry-run (T055)

**Task:** T055 — Execute one approved single-source network dry-run  
**Version:** v1.0.8 (code on main branch; live site remains v1.0.7)

---

## Purpose

T055 proves the T052–T054 architecture can perform **exactly one** controlled, metadata-only network dry-run against one official allowlisted source — without enabling scheduled monitoring, publication, evidence export, or legal-change claims.

| File | Role |
|---|---|
| `data/source-adapters/single-network-dry-run-executions.yml` | Execution control registry (`T055-001`) |
| `schemas/single-network-dry-run-execution.schema.json` | Schema validation |
| `scripts/validate-single-network-dry-run-executions.mjs` | Safety + cross-checks |
| `scripts/run-approved-network-dry-run.mjs` | Guarded runner (one GET when fully armed) |

---

## Pilot execution (T055-001)

| Field | Value |
|---|---|
| **Execution** | `T055-001` |
| **Approval** | `T054-001` |
| **Manual run** | `T053-001` |
| **Adapter** | `edpb-publications-rss` (official EDPB publications RSS) |
| **Mode** | `one_off_network_dry_run` |
| **Status** | `control_tower_approved_for_one_off_run` |
| **Max network requests** | 1 |
| **Max items** | 5 |
| **Max bytes** | 500000 |
| **Timeout** | 20 seconds |
| **Candidate output** | `generated/network-dry-run-candidates/T054-001.json` (gitignored) |
| **Report output** | `generated/network-dry-run-reports/T055-001.json` (gitignored) |

Runtime permission is **not** stored as `network_execution_allowed` or `network_allowed` on execution records. It requires:

1. Control Tower approval in the T055 task prompt;
2. CLI `--i-understand-this-runs-network`;
3. Environment `CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES`;
4. Matching `--approval-id T054-001` and `--execution-id T055-001`.

---

## Approved one-off command

```bash
CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES npm run run:approved-network-dry-run -- \
  --approval-id T054-001 \
  --execution-id T055-001 \
  --i-understand-this-runs-network
```

Safe refusal (expected non-zero) without env/flag:

```bash
npm run run:approved-network-dry-run -- --approval-id T054-001 --execution-id T055-001
```

---

## What T055 does not do

- No scraping or broad crawling
- No scheduled monitoring
- No publication to `public/data/`
- No full legal text storage
- No source verification (`verified_on_source` stays false)
- No legal-change claims
- No final evidence export or caesar-ai-evidence integration
- No deploy, tag, or merge-to-main without separate Control Tower review

Future runs require a **new** Control Tower approval and execution record.

---

## Validation

```bash
npm run validate:single-network-dry-run-executions
```

Wired into `npm run validate:data`.

---

## After T055 — T056 promotion (no rerun)

T056 promotes one local `generated/network-dry-run-candidates/` entry into a draft regulatory update under `data/regulatory-updates/drafts/`. See [MANUAL_REVIEW_PROMOTION_PIPELINE.md](MANUAL_REVIEW_PROMOTION_PIPELINE.md). T056 does not rerun network or publish candidates.

## Related docs

- [MANUAL_REVIEW_PROMOTION_PIPELINE.md](MANUAL_REVIEW_PROMOTION_PIPELINE.md)
- [NETWORK_DRY_RUN_APPROVAL_MODEL.md](NETWORK_DRY_RUN_APPROVAL_MODEL.md)
- [MANUAL_SOURCE_INTAKE_RUNNER.md](MANUAL_SOURCE_INTAKE_RUNNER.md)
- [SOURCE_ADAPTER_ALLOWLIST.md](SOURCE_ADAPTER_ALLOWLIST.md)
- [RSS_API_ADAPTER_SAFETY_MODEL.md](RSS_API_ADAPTER_SAFETY_MODEL.md)
