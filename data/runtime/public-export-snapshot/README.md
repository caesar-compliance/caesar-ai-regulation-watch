# T078 public export snapshot (metadata-only)

Committed, public-safe payloads from the T078 dev Supabase monitoring pilot smoke run.
Used when `build:runtime-public-export` runs without DB credentials (CI / GitHub Pages deploy).

- No credentials, legal text, or full article bodies.
- `review_required` and safety flags remain enforced at export time.
- Refresh after an approved local pilot run: copy payloads from `public/data/` or re-run
  `npm run build:runtime-public-export` with `.env.runtime.local`, then update these files.
