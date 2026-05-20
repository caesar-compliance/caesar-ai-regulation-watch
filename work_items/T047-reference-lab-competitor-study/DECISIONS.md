# T047 — Decisions

**Date:** 20 May 2026

---

## D1 — Reference lab location

**Decision:** Use shared lab under `~/Desktop/Projects/caesar-compliance/_reference-lab/regulation-watch/` for all Regulation Watch competitor and open-source study material.

**Rationale:** Keeps proprietary captures and GPL clones out of product repos; aligns with `REFERENCE_DRIVEN_BUILD_POLICY.md`.

---

## D2 — No third-party asset import

**Decision:** T047 outputs are documentation only. Zero import of competitor code, HTML, CSS, JS, datasets, marketing copy, or screenshots into `caesar-ai-regulation-watch`.

**Rationale:** Legal and product safety; clean-room implementation for public Caesar site.

---

## D3 — Open-source license handling

| Repo | License | Decision |
|------|---------|----------|
| `delschlangen/ai-legislation-tracker` | MIT | Study data model and CLI patterns; **rewrite** Caesar schemas and adapters; do not bulk-import JSON rows without official re-verification |
| `riadeane/airegulationmap` | GPL-3.0 | **Reference-only** for map UX and scoring dimensions; Caesar map must be clean-room (Astro + Caesar-owned or permissively licensed map libs) |

---

## D4 — Human review positioning

**Decision:** Human review, evidence export, and `verified_on_source` gates remain **optional future** premium/assurance features. First full MVP is automation-first public tracker.

**Rationale:** Matches T046 charter; competitors lead with map + feed + metrics, not review queues.

---

## D5 — Primary public benchmarks

**Decision:** Prioritize product patterns from Techieray, The Legal Wire, and automation-friendly open structures from delschlangen; map/score UX ideas from riadeane (concept only).

**Secondary:** IAPP (trust framing), DLA Piper (compare + edition snapshots), Bird & Bird (status matrix + hub pages).

---

## D6 — T048 next task

**Decision:** Recommend **T048 — Automation-first map + country status + updates feed skeleton** as next production task (see `docs/T048_RECOMMENDED_IMPLEMENTATION_PLAN.md`).

**Scope:** Data model + public pages skeleton; not full adapter fleet or AI layer.

---

## D7 — T046 merge dependency

**Decision:** Record that T046 automation-first docs were **not present on `main`** at T047 start (`d0fc3966`). T047 branch based from `docs/T046-automation-first-rebase` which contains T046 docs.

**Action:** Merge T046 to `main` before treating study backlog as production-approved on default branch.
