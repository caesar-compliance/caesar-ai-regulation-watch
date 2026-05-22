# T078A decisions

## Snapshot-first CI deploy

When no `DATABASE_URL` / Supabase URL is available at build time, public monitoring exports are rebuilt from `data/runtime/public-export-snapshot/` (T078 dev smoke metadata). This keeps GitHub Pages deterministic without credentials.

## Status vocabulary

| Status | Meaning |
|--------|---------|
| `backend_monitoring_mvp` | Fresh export from dev Supabase during local/approved build |
| `backend_smoke_passed_public_export_ready` | Snapshot applied; counts match T078 smoke report |
| `backend_smoke_passed_public_export_pending` | Registry only; no snapshot and no DB |
| `not_configured` | **Disallowed** after T078 when registry exists |

## No semver bump

Remain at `1.0.29`; hotfix only. Tag unchanged unless Control Tower requests `1.0.29-hotfix`.

## Legal / safety

No `legal_change_claimed`, no publication/client gates enabled. Snapshot is metadata-only (titles, summaries, hashes).
