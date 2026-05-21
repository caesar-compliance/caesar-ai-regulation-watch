# Supabase runtime setup (Regulation Watch)

Minimal steps for Artem — no secrets in git.

## 1. Create project

1. Create a Supabase project for Regulation Watch runtime (Postgres).
2. Note **Project URL**, **Project ref**, and **Database connection string** (URI, session mode).
3. Copy **anon key** only if you need client-side access later; keep **service role key** local only.

## 2. Local credentials

```bash
cp .env.runtime.example .env.runtime.local
```

Fill in `.env.runtime.local` (never commit):

- `SUPABASE_URL` — project URL
- `SUPABASE_PROJECT_REF` — project ref
- `SUPABASE_DB_URL` — Postgres connection string (Settings → Database)
- `SUPABASE_ANON_KEY` — optional for future client use
- `SUPABASE_SERVICE_ROLE_KEY` — local only if needed for admin scripts

Keep these false unless Control Tower approves otherwise:

- `REGWATCH_APPLY_SUPABASE_SCHEMA=false`
- `REGWATCH_ENABLE_LIVE_INGESTION=false`
- `REGWATCH_ENABLE_SCHEDULED_MONITORING=false`
- `REGWATCH_ENABLE_NETWORK_EXECUTION=false`

## 3. Health check

```bash
npm run runtime:db:health
npm run validate:runtime-db-health
```

Public export: `public/data/runtime-db-health.json` (metadata only).

## 4. Apply schema (manual, explicit)

Only when credentials exist and you intend to apply:

1. Set `REGWATCH_APPLY_SUPABASE_SCHEMA=true` in `.env.runtime.local`.
2. Run:

```bash
npm run runtime:supabase:apply
```

3. Re-run health check; set `REGWATCH_APPLY_SUPABASE_SCHEMA=false` again after apply.

Schema file: `ops/supabase/001_regulation_watch_runtime_schema.sql`

Uses `psql` if installed, otherwise Node `pg` (devDependency).

## 5. Safety

- No scheduled monitoring from this repo task.
- No Cloudflare Worker deploy from Supabase setup alone.
- Metadata-only tables; no full legal text storage.
