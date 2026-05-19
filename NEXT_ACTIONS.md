# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.3.1 · **Phase:** taxonomy, review workflow, and evidence-export contract · **Mode:** static manual data only.

---

## Immediate priority — Cross-repo alignment

**Owner:** Control Tower + `caesar-ai-evidence` maintainers

1. Review [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) and [exports/samples/regulation-change-export.sample.yml](exports/samples/regulation-change-export.sample.yml).
2. Confirm or revise draft refs: `regulation_watch.control.*`, `regulation_watch.evidence.*`.
3. Map export fields to `caesar-ai-evidence` **regulation-change** schema (or document gaps).
4. Set `reference_alignment: aligned` only when confirmed in evidence repo.
5. Approve review-status taxonomy for production workflows.

---

## Control Tower — optional content review

- Spot-check sample export summaries and mapping rationales.
- Confirm `record_origin` boundaries in [TAXONOMY_AND_REVIEW_WORKFLOW.md](docs/TAXONOMY_AND_REVIEW_WORKFLOW.md) are sufficient.

---

## Next safe steps (after alignment)

| Step | Description |
|---|---|
| v0.3.2 static site | Read-only HTML from `data/` + taxonomies |
| Timeline YAML | `data/timelines/` for EU/Norway |
| v0.4 watchers | Only after explicit approval and fetch policy |

---

## Completed

- v0.2.0 — EU/Norway source registry
- v0.3.0 — sample law/guidance/change/mappings
- v0.3.1 — taxonomies, export contract, draft ref convention

See [ROADMAP.md](ROADMAP.md).
