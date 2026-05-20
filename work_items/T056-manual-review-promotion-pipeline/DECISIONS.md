# T056 — Decisions

## Draft location

Draft regulatory updates are stored under `data/regulatory-updates/drafts/` rather than top-level `data/regulatory-updates/*.yml` because `listRegulatoryUpdateFiles()` only indexes top-level YAML files. This keeps drafts out of `validate:data` regulatory-update schema validation and public exports without weakening published update invariants.

## Candidate selection

When local generated output exists, the promotion packet references `T055-001-T054-001-1` (first candidate in feed order). The builder can also select the first candidate by sorted `candidate_id` when refreshing the draft.

## Promotion mode

`local_generated_candidate` when `generated/network-dry-run-candidates/T054-001.json` exists; `fixture_candidate` with `fixtures/promotion/T054-001-candidate.json` only when generated output is missing (no network rerun).

## No publication controls

The `/source-adapters/` page remains read-only: no approve, publish, or verify buttons. Candidate titles are not rendered in the UI beyond identifiers and paths.

## Gates unchanged

T056 does not set `verified_on_source`, `client_use_allowed`, `client_evidence_allowed`, `final_evidence_allowed`, or `legal_change_claimed` to true anywhere in repo or exports.
