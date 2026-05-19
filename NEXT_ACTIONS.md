# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.6.1 · **Phase:** technical URL verification + refined review queue · **Mode:** read-only preview.

---

## Immediate priority — Control Tower

1. Review technical URL results at `/verification/` and `data/verifications/url-check-2026-05-19.yml`; fix unreachable/redirected registry URLs where needed.
2. Perform **human** source identity review per [docs/SOURCE_VERIFICATION_WORKFLOW.md](docs/SOURCE_VERIFICATION_WORKFLOW.md); do not conflate with technical `check_result` in url-check batch.
3. Work through `/review-queue/` filters (technical URL vs content review); set `verified_on_source: true` only when confirmed on official sources.
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

See [ROADMAP.md](ROADMAP.md).
