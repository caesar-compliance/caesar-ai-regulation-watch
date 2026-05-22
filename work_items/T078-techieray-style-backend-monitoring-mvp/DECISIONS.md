# T078 — Decisions

## Pilot registry

- **9 sources** in `monitoring-pilot-registry.yml`: 2 automated RSS (EDPB, EDPS) + 7 manual-review official pages (EU digital strategy, EUR-Lex AI Act entry, OECD.AI, Council of Europe AI hub, NIST AI RMF, UK ICO AI guidance, Singapore PDPC).
- **No CNIL** in automated pilot — no stable feed verified; can be added as manual_review when curated.
- **Council of Europe** registered from official `coe.int` AI page; not copied from competitors.

## Network execution

- Global flags `REGWATCH_ENABLE_*` remain **false** for CI/safety scripts.
- Pilot network fetch requires CLI `--allow-network` on `run-monitoring-pilot.mjs` only (dev manual run).

## Worker

- Allowlist narrowed to **2 RSS keys** aligned with automated pilot (EDPB, EDPS).
- `POST /run-pilot` and `POST /run/:sourceKey` require Bearer `RUN_TOKEN`.
- Cron handler exists but **no-op unless** `REGWATCH_ENABLE_SCHEDULED_MONITORING=true`.

## Public exports

- All exports include `review_required: true` and `legal_change_claimed: false`.
- DB-backed fields when `SUPABASE_DB_URL` available; registry-only fallback for CI.

## UI

- New `/map/` route; tracker dashboard cards; VerifyWise-style jurisdiction source panels.
- Wording: **detected change** not verified legal change.
