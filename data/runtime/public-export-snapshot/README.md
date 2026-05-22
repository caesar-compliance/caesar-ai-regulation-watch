# T078/T079 public export snapshot (metadata-only)

Committed, public-safe payloads from dev Supabase monitoring pilot + T079 Worker run.
Used when `build:runtime-public-export` runs without DB credentials (CI / GitHub Pages deploy).

- No credentials, legal text, or full article bodies.
- `review_required` and safety flags remain enforced at export time.
- Refresh after an approved local pilot run: copy payloads from `public/data/` or re-run
  `npm run build:runtime-public-export` with `.env.runtime.local`, then update these files.
