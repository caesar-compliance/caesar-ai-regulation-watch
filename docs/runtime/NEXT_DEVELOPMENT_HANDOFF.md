# Regulation Watch — Next development handoff

**Frozen:** 22 May 2026 (T014 closeout)  
**Branch:** `main` @ `d3dbe70`  
**Status:** First activated Caesar runtime — infrastructure complete; product development next.

## 1. Current state

| Item | Status |
|------|--------|
| GitHub `dev-runtime` environment | Configured (secrets + safety variables) |
| Supabase schema applied (dev) | **Yes** — via workflow run `26261526568` (Session Pooler URL) |
| DB health | `connected` — all 7 runtime tables present |
| Cloudflare Worker deployed | **Yes** — workflow run `26261632137` |
| UptimeRobot Worker monitor | **Yes** — key `regulation-watch-worker-healthz`, ID `803129624` |
| Cron | **Off** |
| Network execution | **Off** |
| Live ingestion | **Off** |
| DNS / custom routes | **Not modified** |

### Completed activation tasks (do not repeat unless rollback)

- **T013A** — validation-only workflow (`26261076213`)
- **T013B-FIX** — schema apply with pooler `SUPABASE_DB_URL` (`26261526568`)
- **T013C** — Worker deploy + post-deploy smoke (`26261632137`)
- **T013D** — UptimeRobot monitor enabled (governance hub `52f5741`)

## 2. Runtime infrastructure

| Resource | Value |
|----------|--------|
| Supabase project | `caesar-regulation-watch-dev` |
| Supabase schema | `regulation_watch` (GitHub env); local health may report `public` — confirm in Supabase dashboard |
| Cloudflare Worker | `regulation-watch-monitor-dev` |
| Worker URL | `https://regulation-watch-monitor-dev.nazzarkoartem.workers.dev` |
| GitHub environment | `dev-runtime` |
| UptimeRobot | `regulation-watch-worker-healthz` → `/healthz` (enabled) |

### Health endpoints (verified 200)

- `GET /healthz`, `/readyz`, `/version`, `/health`

## 3. Exact next steps (product — not infrastructure)

Infrastructure activation is **closed**. Tomorrow, work from `main` on product features only.

### Local validation (always first)

```bash
npm run runtime:services:check
npm run validate:runtime-services-readiness
npm run runtime:db:health
npm run runtime:smoke
```

### Do **not** re-run unless Control Tower approves

- `apply_schema=YES` (schema already applied)
- `deploy_worker=YES` (Worker already live)
- `enable_cron=YES`, `enable_network=YES`, `run_live_ingestion_once=YES`

### First product tasks (suggested order)

1. **Source registry** — populate `regulation_sources` metadata (no live fetch without gates).
2. **Dry-run monitoring cycle** — `npm run monitoring:cycle:dry-run` / `runtime:source-pilot:dry-run`; verify `source_runs`, `detected_changes` flow.
3. **Review candidates** — UI/API for `review_candidates` from detected changes.
4. **Worker persistence** — implement Supabase writes in Worker (still stubbed); keep `POST /run` disabled until approved.

## 4. What must remain gated

| Gate | Rule |
|------|------|
| Schema apply | No re-apply without migration review |
| Cron | No `enable_cron=YES` until `scheduled()` handler exists |
| Network execution | No `enable_network=YES` without approval |
| Live ingestion | No `run_live_ingestion_once=YES` / `ENABLE_LIVE_INGESTION=true` |
| DNS / routes | No custom domains in dev without Control Tower |
| Source fetching | No production RSS/legal fetch in CI by default |

## 5. Product direction

Regulation Watch monitors **regulatory source metadata**, **snapshots**, **detected changes**, and **review candidates** — not full legal text publication. Focus:

- Curated source list and run history
- Change detection and human review queue
- Runtime events for auditability
- Public site remains static/read-only export surfaces

## 6. AI agent instructions

1. `git pull --ff-only origin main` — stay on `main` (`d3dbe70` or later).
2. Read this file and `docs/runtime/DEV_RUNTIME_ACTIVATION.md`.
3. Run validation commands before any feature work.
4. **Do not** create branches unless necessary; small commits on `main`.
5. Secrets: `.env.runtime.local`, `.env.cloudflare.local` only — never commit.
6. Commit safe tracked data/docs only; no secrets in JSON exports.
7. End with a short report: commands run, pass/fail, files changed, blockers.

## References

- `docs/runtime/DEV_RUNTIME_ACTIVATION.md`
- `docs/runtime/EXTERNAL_SERVICE_ONBOARDING_CHECKLIST.md`
- Governance hub: `docs/operations/RUNTIME_INFRASTRUCTURE_CLOSEOUT.md`
