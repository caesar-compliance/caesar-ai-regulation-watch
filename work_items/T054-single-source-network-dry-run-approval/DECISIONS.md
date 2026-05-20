# T054 — Decisions

## Adapter selection

**`edpb-publications-rss`** — same official EDPB publications RSS as T053 manual intake (`T053-001`). Allowlist entry: no paywall, no WAF/CAPTCHA, `schedule_enabled: false`, metadata-only, all gates false.

## Single approval packet

Only **`T054-001`** — no multi-source approvals; no `network_execution_allowed: true` in T054.

## Generated artifacts

- **Plan:** `generated/network-dry-run-plans/T054-001.json` — produced by plan generator; **gitignored** (not committed).
- **Candidates:** path reserved in approval YAML; **not created** in T054.

## Future runner behavior

T054 stub always refuses execution with explicit T054 message. Partial flags (`--approval-id` only) still exit non-zero for validation harness. Full T055 execution requires Control Tower approval, env var, and CLI acknowledgment flags.

## UI

Read-only table on `/source-adapters/` — no run buttons, no endpoint preview, no legal text.

## Version / deploy

Package stays **1.0.8**. No tag. No deploy. Live site remains **v1.0.7**.
