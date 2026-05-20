# Monitoring snapshots (metadata-only)

Snapshots under `data/snapshots/` and monitoring-run outputs under `data/monitoring/` are **metadata-only** for change detection pilots.

- No full legal text or HTML body storage in the repository.
- No competitor content copied from tracker sites.
- Not client evidence; `client_use_allowed` and `final_evidence_allowed` remain false.
- Change detection is provisional; human review required before any record update.
- Deterministic local runs may compare against existing snapshot pointers without live fetch.

See `docs/SNAPSHOT_AND_DIFF_POLICY.md` and `docs/WATCHER_DIFF_VALIDATION.md`.
