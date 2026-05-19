# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.7.0 · **Phase:** official-source watcher prototype · **Mode:** read-only preview + manual watcher CLI.

---

## Immediate priority — Control Tower

1. Perform **record content review** on official sources; set `verified_on_source: true` only when summaries and dates are confirmed.
2. Work through `/review-queue/` — filter `legal_review_not_done` and `content_not_reviewed`.
3. After content review baseline, run `npm run watch:official` again to validate **diff detection** (expect detected-change records only when metadata/hash differs).
4. Review any `detected_change` or `watcher_error` items on `/detected-changes/` and `/watchers/`.

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
- v0.7.0 — First official-source watcher prototype (`docs/WATCHER_PROTOTYPE.md`)

See [ROADMAP.md](ROADMAP.md).
