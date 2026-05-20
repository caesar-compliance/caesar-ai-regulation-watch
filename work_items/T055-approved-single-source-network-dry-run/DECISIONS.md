# T055 — Decisions

## Execution registry vs approval flags

- Persistent execution records do **not** include `network_execution_allowed` or `network_allowed`.
- Runtime permission uses Control Tower prompt + CLI + env + `T055-001` execution record.
- Approval YAML keeps `network_execution_allowed: false` (T054 planning posture unchanged).

## Single adapter lock

- Runner hard-requires `T054-001`, `T055-001`, `edpb-publications-rss` for T055 pilot.

## Output paths

- Candidates: `generated/network-dry-run-candidates/T054-001.json` (matches approval)
- Report: `generated/network-dry-run-reports/T055-001.json`
- Both gitignored; never copied to `public/data/`

## UI

- Read-only execution table on `/source-adapters/` — no run buttons, no previews.

## Recommended next

**T056** — Manual review promotion pipeline from one network dry-run candidate into a draft regulatory update record (still not verified, not client/evidence use, no publication until reviewed).
