# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.3.2 · **Phase:** third-party acceleration plan · **Mode:** static manual data only; no imports.

---

## Immediate priority — Cross-repo alignment

**Owner:** Control Tower + `caesar-ai-evidence` maintainers

1. Review [docs/EVIDENCE_EXPORT_CONTRACT.md](docs/EVIDENCE_EXPORT_CONTRACT.md) and [exports/samples/regulation-change-export.sample.yml](exports/samples/regulation-change-export.sample.yml).
2. Confirm or revise draft refs: `regulation_watch.control.*`, `regulation_watch.evidence.*`.
3. Map export fields to `caesar-ai-evidence` **regulation-change** schema (or document gaps).
4. Set `reference_alignment: aligned` only when confirmed in evidence repo.

---

## Control Tower — acceleration plan review

1. Approve [docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md](docs/THIRD_PARTY_CODE_AND_DATA_POLICY.md).
2. Review [docs/ACCELERATION_DECISION_MATRIX.md](docs/ACCELERATION_DECISION_MATRIX.md) priorities.
3. Confirm **blocked** items (Fairly repo — no LICENSE) until clarified.
4. Approve v0.4 official-source watcher order in [research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md](research/OFFICIAL_SOURCE_INGESTION_CANDIDATES.md).

---

## Next safe implementation steps (after alignment)

| Step | Description |
|---|---|
| v0.3.3 CI | Add `package.json` only with **ajv** + validate `data/` against `schemas/` |
| v0.3.3 static site | Astro skeleton reading `data/` + taxonomies |
| Timeline YAML | `data/timelines/` for EU/Norway |
| v0.4 watchers | EU AI Office + Datatilsynet RSS first; EUR-Lex API after |

Do **not** import Techieray API data into public Caesar feeds without Commercial tier and legal review.

---

## Completed

- v0.2.0 — EU/Norway source registry
- v0.3.0 — sample law/guidance/change/mappings
- v0.3.1 — taxonomies, export contract, draft ref convention
- v0.3.2 — third-party acceleration policy and research

See [ROADMAP.md](ROADMAP.md).
