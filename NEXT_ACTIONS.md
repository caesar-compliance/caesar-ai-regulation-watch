# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.7.4 · **Phase:** live API watcher + feed reliability · **Mode:** read-only preview + manual watcher CLI.

---

## Immediate priority — Control Tower

1. Review **Federal Register API baseline** on `/watchers/watcher-us-federal-register-api/` — confirm narrow `artificial intelligence` query scope is acceptable for ongoing monitoring.
2. Review **EDPS feed baseline** on `/watchers/watcher-edps-feed/` — confirm entry metadata (title/link/date) is sufficient for governance signals.
3. Work through `/review-queue/` — 89 items; watcher errors cleared after v0.7.4 run.
4. Run `npm run watch:official` again after ~1 week (or when a source update is expected) — **real** feed/API detected changes only if metadata differs from latest snapshot.

---

## Validation commands

```bash
npm run validate:data
npm run watch:official
npm run generate:exports
npm run build
```

See `docs/WATCHER_DIFF_VALIDATION.md`, `docs/API_WATCHER_CANDIDATES.md`.

---

## Next implementation

| Step | Description |
|---|---|
| Second live diff | Compare against EDPS + Federal Register baselines; triage any real detected changes |
| Production scheduling | Deferred — requires hosting, rate limits, and ops policy |
| Record expansion | Sector-specific sources per [docs/RECORD_EXPANSION_GAPS.md](docs/RECORD_EXPANSION_GAPS.md) |

---

## Completed

- v0.7.3 — Watcher reliability, API adapter, Federal Register watcher (disabled)
- v0.7.4 — EDPS parser fix, feed diagnostics, Federal Register API enabled, live baselines

See [ROADMAP.md](ROADMAP.md).
