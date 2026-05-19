# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.6.2 · **Phase:** URL remediation + source identity review · **Mode:** read-only preview.

---

## Immediate priority — Control Tower

1. Perform **record content review** on official sources; set `verified_on_source: true` only when summaries and dates are confirmed.
2. Resolve remaining technical issues: Congress.gov (HTTP 403 to bots), OAIC redirect path review.
3. Work through `/review-queue/` — filter `legal_review_not_done` and `content_not_reviewed`.
3. Review [docs/RECORD_EXPANSION_GAPS.md](docs/RECORD_EXPANSION_GAPS.md); add sources before new records where gaps exist.
4. Sign off legal-safe language on curated summaries (no obligation claims).

---

## Next implementation

| Step | Description |
|---|---|
| Human verification | Close `not_checked` verifications; optionally mark `review_status: reviewed` |
| Record expansion | Add sector-specific sources (UK ICO, US Federal Register instruments) per gaps log |
| v0.6+ watchers | After Control Tower approves fetch targets — not started |

---

## Completed

- v0.4.0 — Astro static site skeleton
- v0.4.1 — Pagefind search, filters, methodology/disclaimer, JSON/RSS exports
- v0.5.0 — Global jurisdiction/source expansion, timelines, CI validate/build
- v0.5.1 — Static SVG global map, read-only review queue
- v0.6.0 — Curated global records, verification workflow, 3 timelines, `/verification/` page
- v0.6.1 — Technical URL verification script, url-check batch, review queue filters, `url-checks.json`
- v0.6.2 — URL remediation log, source identity review batch, remediated official URLs

See [ROADMAP.md](ROADMAP.md).
