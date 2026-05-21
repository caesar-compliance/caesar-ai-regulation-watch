# External service onboarding checklist — Regulation Watch

**Account:** Account A (hub policy)  
**Supabase project:** `caesar-regulation-watch-dev`  
**Cloudflare worker:** `regulation-watch-monitor-dev`

Do **not** paste emails, tokens, keys, or database URLs into tracked repo files or chat logs.

---

## 1. Supabase Free (required)

1. Log in to **Account A** (see hub `.local/EXTERNAL_SERVICES_ACCOUNT_MAP.local.md` for login — local only).
2. Create or select project **`caesar-regulation-watch-dev`**.
3. Copy from Supabase dashboard (Settings → API / Database):
   - `SUPABASE_URL`
   - `SUPABASE_PROJECT_REF`
   - `SUPABASE_DB_URL` (Postgres connection string, session mode)
4. Copy **new API keys** (Settings → API → API Keys):
   - `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`) — safe for client-side use when needed
   - `SUPABASE_SECRET_KEY` (`sb_secret_...`) — **server/local scripts only; never commit or paste into tracked files**
5. Set `SUPABASE_API_KEY_MODE=new` in `.env.runtime.local`.
6. Legacy `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are **optional fallback only** for older tooling.
7. Paste **only** into `.env.runtime.local` (never commit):

```bash
cp .env.runtime.example .env.runtime.local
# edit .env.runtime.local locally
```

8. Keep safety flags **false**:

   - `REGWATCH_APPLY_SUPABASE_SCHEMA=false` until you intend to apply schema manually
   - `REGWATCH_ENABLE_LIVE_INGESTION=false`
   - `REGWATCH_ENABLE_SCHEDULED_MONITORING=false`
   - `REGWATCH_ENABLE_NETWORK_EXECUTION=false`

9. Verify presence (no secret values printed; checker reports prefix type only):

```bash
npm run runtime:services:check
npm run validate:runtime-services-readiness
```

10. When ready for connectivity check (still no migration unless you set apply flag):

```bash
npm run runtime:db:health
npm run validate:runtime-db-health
```

**Do not** run `npm run runtime:supabase:apply` until credentials are correct and Control Tower approves schema apply.

---

## 2. Cloudflare Free (required for future Worker)

1. Log in to **Account A** Cloudflare dashboard.
2. Create a **narrow** API token (Workers + account read as needed; no broad account takeover).
3. Note **Account ID** and choose worker name (example default: `regulation-watch-monitor-dev`).
4. Paste **only** into `.env.cloudflare.local`:

```bash
cp .env.cloudflare.example .env.cloudflare.local
# edit .env.cloudflare.local locally
```

5. Keep deploy disabled:

   - `CLOUDFLARE_ENABLE_WORKER_DEPLOY=false`
   - `CLOUDFLARE_ENABLE_CRON_TRIGGER=false`

6. Run `npm run runtime:services:check` — Cloudflare fields should show **present** (values not printed).

**Do not** deploy Worker or enable cron in T076A.

---

## 3. UptimeRobot (manual external)

1. Create a free UptimeRobot (or equivalent) account — operator choice.
2. After public deploy, add HTTP monitors (keyword optional) for:

   - `/`
   - `/automation/`
   - `/runtime-health/`
   - `/runtime-services/`
   - `/data/automation-runtime-manifest.json`
   - `/data/runtime-db-health.json`
   - `/data/runtime-services-readiness.json`
   - `/data/source-pilot-status.json`

3. Base URL: `https://regulation-watch.caesar.no` (custom domain).

This step is **not** automated in the repo; `uptime_manual_setup_required` stays true until you configure monitors.

---

## 4. GitHub (optional token)

- **Source of truth:** `caesar-compliance/caesar-ai-regulation-watch` — existing Pages + Actions deploy pipeline.
- Fine-grained personal access tokens are **optional** for local automation only.
- If used, store in `.env.github.local` (ignored) — never commit.
- No change required if Actions deploy already works from the org.

---

## 5. Verification commands (safe)

```bash
npm run runtime:services:check
npm run validate:runtime-services-readiness
npm run validate:automation-runtime
npm run build:automation-runtime-manifest
```

Open `/runtime-services/` locally after `npm run build:custom-domain` or `npm run dev`.

---

## GitHub Actions environment (`dev-runtime`)

Runtime deploy credentials for AI agents and GitHub Actions are stored in the repository environment **`dev-runtime`** (`caesar-compliance/caesar-ai-regulation-watch`), not in tracked files.

- **Secrets (names only):** `CLOUDFLARE_API_TOKEN`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_URL`
- **Variables:** Supabase/Cloudflare identifiers, `RUNTIME_ENV=dev`, and safety flags (`ENABLE_LIVE_INGESTION=false`, `ENABLE_SCHEDULED_MONITORING=false`, `ENABLE_NETWORK_EXECUTION=false`, `APPLY_SUPABASE_SCHEMA=false`, `CLOUDFLARE_ENABLE_CRON_TRIGGER=false`, `CLOUDFLARE_ENABLE_WORKER_DEPLOY=true`)
- After local validation passes, an agent may trigger controlled dev Worker deploy workflows; cron, live ingestion, and schema apply remain off unless explicitly approved.
- Do not copy secret values into docs, issues, or chat.

---

## Out of scope for this checklist

- Supabase migration apply
- Cloudflare Worker deploy
- Scheduled monitoring / cron
- Live ingestion
- Network source fetches
- Broad scraping or legal conclusions
