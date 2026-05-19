# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.2.0 · **Phase:** pilot EU/Norway official source registry · **Mode:** static data only (no watchers, UI, APIs, or automated monitoring).

Prioritized work after v0.2.0 registry delivery. Still **no package managers**.

---

## Immediate priority — Control Tower review

**Owner:** Artem (Control Tower)

1. Open [docs/PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md) and each file under `data/`.
2. Verify every `official_url` resolves and matches intended monitoring scope.
3. Confirm wording does not overclaim coverage or imply legal advice.
4. Set `review_status: reviewed` on approved entries (or archive incorrect entries).
5. Note gaps to add in a future registry wave (e.g. Lovdata, ENISA).

---

## Next safe implementation steps (after review)

### v0.3 — Sample curated records

- Add `data/laws/` and `data/guidance/` samples for EU AI Act and Norway implementation (manual, no fetchers).
- Add `data/changes/` sample change records with `pending_review` summaries.
- Add `mappings/controls/` and `mappings/evidence/` v0.1 samples (`may_affect`, `suggested_review` only).

### Validation (optional, no new deps without approval)

- Shell or Python one-off to YAML→JSON + JSON Schema validate against `schemas/`.
- Do not add npm/pip packages without Control Tower approval.

### Cross-repo

- Confirm `regulation-change` field alignment with `caesar-ai-evidence`.

---

## Still blocked / requires approval

| Task | Gate |
|---|---|
| Live HTTP fetch / watcher | Control Tower + v0.4 phase |
| Static site generator | v0.3 skeleton approval |
| AI summary automation | Review workflow decision |
| Third-party dataset import | License review |
| CI with schema validation | Package manager decision |

---

## Completed (v0.2.0)

- [x] `data/jurisdictions/eu.yml`, `norway.yml`
- [x] Seven `data/sources/*.yml` pilot entries
- [x] `schemas/jurisdiction.schema.json`, `schemas/source.schema.json`
- [x] `docs/PILOT_SOURCE_REGISTRY.md`

See [ROADMAP.md](ROADMAP.md).
