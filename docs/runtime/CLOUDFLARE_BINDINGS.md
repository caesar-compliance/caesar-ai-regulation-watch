# Cloudflare bindings — Regulation Watch (dev)

Worker: `regulation-watch-monitor-dev`  
Config manifest: `config/runtime/cloudflare-bindings.dev.json`

## Planned dev bindings

| Binding | Type | Status | Purpose |
|---------|------|--------|---------|
| KV cache | KV namespace | Optional / not provisioned | Short-lived fetch cache for allowlisted RSS metadata |
| R2 snapshots | R2 bucket | Optional / not provisioned | Metadata snapshot blobs (no full legal text) |
| Queue jobs | Queue | Optional / not provisioned | Async source-run jobs when cron is explicitly enabled |

Primary database: **Supabase** (`caesar-regulation-watch-dev`). Do not add D1 unless a future task requires edge SQL.

## Provisioning policy

- Bindings are **documented only** in this task unless already referenced in worker code.
- No `wrangler r2/kv/queue create` commands run by default.
- Use dry-run provision scripts only when added in a later task with explicit operator approval.

## Worker secrets (via `wrangler secret put`)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (from GitHub `SUPABASE_SECRET_KEY` in CI)
- `RUN_TOKEN` (optional, for `POST /run/:sourceKey`)

Never commit secret values.
