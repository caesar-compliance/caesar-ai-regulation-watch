# T075C — Decisions

1. **Deterministic `checked_at`** — use latest fixture `snapshot_at` from diff sources (not `new Date()` at build) to avoid dirty diffs on every run.
2. **Separate review page** — `/source-pilot/review/` hosts filterable table; overview stays on `/source-pilot/`.
3. **Client-side filters only** — inline script on review page; no CDN, auth, or analytics.
4. **Candidates from fixture diffs only** — sources with a single fixture version produce no review candidates until a second fixture exists.
5. **Runtime status** — `source_pilot_reviewer_ready` signals offline reviewer export; does not imply live monitoring or Supabase connected.
