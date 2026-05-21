# Regulation Watch Monitor Worker (scaffold)

T073 scaffold only — **not deployed**, no scheduled cron, no live network in repo CI.

## Routes

- `GET /health` — readiness probe
- `POST /run/:sourceKey` — manual source check (requires `Authorization: Bearer <RUN_TOKEN>`)

## Safety

- Allowlisted `source_key` values only
- Metadata-only RSS fetch stub (no full legal text)
- Supabase insert stubs — wire after project bootstrap
- Configure secrets in Cloudflare dashboard; never commit credentials

## Local dev (future)

Copy `wrangler.toml.example` to `wrangler.toml` and set secrets locally. Do not enable cron until Control Tower approves scheduled monitoring.
