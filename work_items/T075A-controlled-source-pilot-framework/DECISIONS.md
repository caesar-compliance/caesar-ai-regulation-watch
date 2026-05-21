# T075A — Decisions

1. **Two pilot sources only** — `edpb-publications-rss`, `edps-news-rss`; no broad allowlist expansion.
2. **Fixture-only execution** — dry-run reads `fixtures/runtime/source-pilot/`; no HTTP in T075A scripts.
3. **Separate registry** — `source-pilot-registry.yml` distinct from T052 adapter allowlist; runtime-focused.
4. **No version bump** — Control Tower handles release after merge.
5. **Runtime status** — `source_pilot_framework_ready`; does not imply live monitoring.
