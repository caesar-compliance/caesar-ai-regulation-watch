# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.7.1 · **Phase:** watcher diff hardening · **Mode:** read-only preview + manual watcher CLI + simulation.

---

## Immediate priority — Control Tower

1. Perform **record content review** on official sources; set `verified_on_source: true` only when summaries and dates are confirmed.
2. Work through `/review-queue/` — filter `legal_review_not_done` and `content_not_reviewed`.
3. Review simulated detected change on `/detected-changes/` (clearly marked; not an official update).
4. When ready, run `npm run watch:official` again for a **second live check** — expect real detected changes only if official metadata/hash differs.

---

## Validation commands

```bash
npm run validate:data
npm run watch:simulate-change
npm run generate:exports
npm run build
```

See `docs/WATCHER_DIFF_VALIDATION.md`.

---

## Next implementation

| Step | Description |
|---|---|
| Watcher expansion | Add more pilot watchers only after Control Tower approves scope per source |
| Production scheduling | Deferred — requires hosting, rate limits, and ops policy |
| Record expansion | Sector-specific sources per [docs/RECORD_EXPANSION_GAPS.md](docs/RECORD_EXPANSION_GAPS.md) |

---

## Completed

- v0.6.2 — URL remediation, source identity review
- v0.7.0 — First official-source watcher prototype
- v0.7.1 — Watcher diff hardening + simulation validation

See [ROADMAP.md](ROADMAP.md).
