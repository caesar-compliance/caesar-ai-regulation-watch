# Operator review workflow (T082)

Static-first operator decisions for Caesar AI Regulation Watch monitoring candidates. This workflow does **not** open legal, evidence, client, or publication gates.

## Scope

- Review **metadata-only** signals from bounded RSS/metadata pilot runs.
- Record triage in `data/runtime/operator-review-decisions.yml`.
- Rebuild public JSON exports for the read-only static site.
- No Supabase writes, no Worker deploy, no cron enablement from this file alone.

## Review packets

1. Generate or refresh packets:
   ```bash
   npm run build:review-packets
   ```
2. Read packets under `data/runtime/review-packets/` (also copied under the T081 work item folder).
3. Open the official source URL from each packet — confirm relevance only; do not store full legal text in the repo.

## Editing decisions

File: `data/runtime/operator-review-decisions.yml`

Each decision must include:

| Field | Required | Notes |
|-------|----------|-------|
| `decision_id` | yes | Unique string |
| `candidate_id` | yes | Must match `regulation-review-candidates.json` |
| `decision` | yes | See allowed values below |
| `reviewer_label` | yes | Team label only — **no personal email** |
| `decided_at` | yes | ISO-8601 timestamp |
| `rationale` | yes | Internal reasoning — no legal advice wording |
| `public_note` | optional | Short public-safe note when visibility allows |
| `public_visibility` | yes | `blocked`, `internal_summary_only`, or `public_summary_candidate` |
| `gate_overrides` | yes | All keys must remain `false` unless Control Tower approves separately |
| `source_checked_url` | if applicable | Required for `needs_source_check` and `accept_for_tracking` |
| `safety_notes` | recommended | Reinforce metadata-only / gates closed |

### Allowed `decision` values

| Decision | Queue `review_status` | Use when |
|----------|----------------------|----------|
| `keep_review_required` | `review_required` | Still needs triage |
| `mark_in_review` | `in_review` | Operator is actively reviewing |
| `dismiss_noise` | `dismissed` | Duplicate/noise metadata only |
| `accept_for_tracking` | `accepted_for_tracking` | Follow internally — **not legal verification** |
| `needs_source_check` | `needs_source_check` | Official URL must be confirmed |
| `needs_legal_review` | `needs_legal_review` | Escalate to separate legal workflow (gates still closed here) |

### Forbidden claims

- No legal advice language in `public_note`, `rationale`, or `safety_notes`.
- Do not state "verified legal change", "compliance required", or "verified on source" unless a separate approved workflow opens gates (not this file).
- Do not set any gate to `true` in `gate_overrides` from routine operator triage.
- Do not commit secrets, `.env.*.local`, or `.local/` paths.

## Rebuild commands

From repository root:

```bash
npm run validate:operator-decisions
npm run build:review-queue-export
npm run build:source-freshness-export
npm run build:review-packets
npm run validate:review-queue
npm run validate:source-freshness
```

Full site build (includes validations):

```bash
npm run build
npm run verify:dist
```

## Deploy commands

After validation passes on `main`:

1. Commit and push branch; fast-forward merge to `main` when approved.
2. Tag: `regulation-watch-v1.0.33` (or current release tag).
3. Trigger GitHub Actions static deploy with `confirm_disclaimers=DEPLOY` if required by workflow.
4. Smoke test: `/`, `/tracker/`, `/review-queue/`, `/runtime-health/`, `/countries/`, `/jurisdictions/france/`, and `/data/*.json` exports listed in the release checklist.

## Safety gates (remain false)

Unless explicitly approved in Control Tower / legal workflow:

- `verified_on_source`
- `client_use_allowed`
- `client_evidence_allowed`
- `final_evidence_allowed`
- `legal_change_claimed`
- `publication_allowed`
- `public_export_allowed`

`npm run validate:operator-decisions` fails if any of these are `true` in decision YAML.

## Cron and live ingestion

- Scheduled monitoring: **disabled**
- Cron: **disabled**
- Do not enable from operator YAML or routine export rebuilds
