# T053 — Decisions

## Pilot adapter: `edpb-publications-rss`

- Official EU EDPB publications RSS; already in T052 allowlist as `draft` / `fixture_only`.
- No paywall, no CAPTCHA/WAF flag, all gates false, `schedule_enabled: false`, `broad_crawl_allowed: false`.
- Matches existing `fixtures/source-adapters/rss-sample.xml` used by T052 fixture parser.

## Fixture-only default

- Run mode `fixture_only`; `network_allowed: false`.
- CLI rejects `--network` / `--allow-network`.
- No HTTP client in runner script.

## Generated output not committed

- `generated/` is gitignored (repo convention from T052).
- Document reproduce command in `docs/MANUAL_SOURCE_INTAKE_RUNNER.md`.
- Do not add intake candidates to `public/data/` in T053.

## Validation wired into `validate:data`

- After source adapter allowlist check, run `validate-manual-source-intake-runs.mjs`.

## UI: read-only table only

- Manual intake runs section on `/source-adapters/` — no run button, no live controls.

## Version / deploy

- Package stays `1.0.8`; no tag; no deploy; live site remains v1.0.7.
