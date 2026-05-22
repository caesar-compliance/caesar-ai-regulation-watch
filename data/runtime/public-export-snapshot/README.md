# T085 public export snapshot (metadata-only)

Committed, public-safe payloads from dev Supabase monitoring pilot + T085 six-source Worker run.
Used when `build:runtime-public-export` runs without DB credentials (CI / static deploy).

- No credentials, legal text, or full article bodies.
- `review_required` and safety flags remain enforced at export time.
- Refresh after an approved runtime export: `npm run refresh:public-export-snapshot` (from committed `public/data/`), then `npm run validate:public-export-snapshot`.
- Includes `worker-pilot-run.payload.json` so CI builds preserve 2 success / 4 handled errors without `generated/`.
