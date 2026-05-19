# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.3.3 · **Phase:** VerifyWise clean-room study complete · **Mode:** static manual data only; no imports.

---

## Immediate priority — Control Tower

**Owner:** Control Tower

1. Review [research/VERIFYWISE_ARCHITECTURE_STUDY.md](research/VERIFYWISE_ARCHITECTURE_STUDY.md) and confirm no VerifyWise code was committed.
2. Approve [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md) for v0.4.0 implementation.
3. Approve [docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md](docs/NEXT_IMPLEMENTATION_ARCHITECTURE_OPTIONS.md) — **Astro** recommended.
4. Approve adding `site/package.json` (Astro, js-yaml, ajv) in v0.4.0 implementation branch.

---

## Cross-repo alignment (parallel)

**Owner:** Control Tower + `caesar-ai-evidence` maintainers

1. Review [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) and export samples.
2. Confirm or revise draft refs: `regulation_watch.control.*`, `regulation_watch.evidence.*`.
3. Map export fields to `caesar-ai-evidence` regulation-change schema.

---

## Next safe implementation (after approval)

| Step | Description |
|---|---|
| v0.4.0 static site | Implement Astro `site/` per [docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md](docs/V0_4_STATIC_SITE_IMPLEMENTATION_PLAN.md) |
| v0.4.1 CI | `npm run validate` — ajv all `data/` against `schemas/` |
| v0.5 | Pagefind, Leaflet map, timelines, RSS/JSON |
| v0.6 watchers | EU AI Office + Datatilsynet RSS first |

Do **not** copy VerifyWise UI, schemas, or code. Do **not** import Techieray API data into public feeds without Commercial tier and legal review.

---

## Completed

- v0.2.0 — EU/Norway source registry
- v0.3.0 — sample law/guidance/change/mappings
- v0.3.1 — taxonomies, export contract, draft ref convention
- v0.3.2 — third-party acceleration policy and research
- v0.3.3 — VerifyWise clean-room architecture study and v0.4 plan

See [ROADMAP.md](ROADMAP.md).
