# T052 — Decisions

## Public export included

- Added `public/data/source-adapter-allowlist.json` via `generate:exports` with redacted fields only (no endpoint secrets beyond public official URLs already in registry).
- Rationale: consistent with other governance exports; supports automation-first API-ready posture without run triggers.

## Generated fixture candidates gitignored

- `generated/source-adapter-fixture-candidates.json` is build-local only (`.gitignore` adds `generated/`).
- Rationale: matches tmp/build artifact pattern; not required in public `dist` for deploy.

## Nav link placement

- No new main nav item (crowded nav).
- Linked from `/sources/` banner and `/monitoring/` T052 section.

## Pilot allowlist size

- Nine adapters aligned to existing `data/sources/` entries (EDPB/EDPS RSS drafts, EU/UK/US/OECD webpage metadata).
- EUR-Lex entries remain `disabled` with `captcha_or_waf_risk: true` documented.

## validate:data integration

- `validate:data` invokes `validate:source-adapters` after YAML validation passes.
