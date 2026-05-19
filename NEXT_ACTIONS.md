# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.4.0 · **Phase:** static site skeleton · **Mode:** read-only preview from YAML.

---

## Immediate priority — Control Tower

**Owner:** Control Tower

1. Review generated static pages (`npm run build` → open `dist/index.html` or `npm run dev`).
2. Confirm legal-safe language, disclaimers, and pending-review banners on sample content.
3. Approve pilot URLs and scope text on jurisdiction/source pages.
4. Approve proceeding to v0.5 (Pagefind, Leaflet, timelines, RSS/JSON).

---

## Cross-repo alignment (parallel)

**Owner:** Control Tower + `caesar-ai-evidence` maintainers

1. Review [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) against evidence repo schema.
2. Confirm draft refs: `regulation_watch.control.*`, `regulation_watch.evidence.*`.

---

## Next safe implementation (after review)

| Step | Description |
|---|---|
| v0.5 map | Leaflet jurisdiction map (list fallback) |
| v0.5 search | Pagefind on built HTML |
| v0.5 timelines | `data/timelines/` + milestone pages |
| v0.5 feeds | Static RSS/JSON export files |
| v0.6 watchers | EU AI Office + Datatilsynet RSS (separate from site) |
| CI | GitHub Actions: `validate:data` + `build` on PR |

---

## Completed

- v0.2.0 — EU/Norway source registry
- v0.3.0 — sample records
- v0.3.1 — taxonomies and export contract
- v0.3.2 — acceleration policy
- v0.3.3 — VerifyWise clean-room study
- v0.4.0 — Astro static site skeleton

See [ROADMAP.md](ROADMAP.md).
