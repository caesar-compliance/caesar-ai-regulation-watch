# T086 — Decisions

## Root cause

`source_runs.source_key` FK to `regulation_sources.source_key`. Dev DB had only 2 registry rows (EDPB, EDPS). PostgREST returned HTTP 409 on insert for the four T084-promoted automated keys.

Not a `source_runs` uniqueness collision (no per-run unique constraint beyond `id`).

## Alignment approach

1. **`npm run runtime:align-dev-source-registry`** — upserts 6 automated keys from `monitoring-pilot-registry.yml` via `ensureRegulationSource` (pg).
2. **`ops/supabase/005_runtime_source_registry_alignment.sql`** — same rows for manual/idempotent SQL apply.
3. **Worker `ensureRegulationSourceRow`** — REST upsert before `source_runs` insert (v1.0.37 code; redeploy optional when DB pre-aligned).

## Worker redeploy

Local `wrangler deploy` blocked (no `CLOUDFLARE_API_TOKEN` in environment). DB alignment alone restores bounded inserts on deployed T085 Worker. v1.0.37 Worker code committed for next operator deploy.

## Verification without live RUN_TOKEN

`run-local-six-source-write-verify.mjs` — Supabase REST `source_runs` insert for all 6 keys (6/6 pass, 0 FK errors).

## Protected gates

Unchanged — all remain false.
