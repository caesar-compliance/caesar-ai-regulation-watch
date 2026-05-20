# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v1.0.1` |
| **Current phase** | Public Technical MVP |
| **Status** | v1.0.1 source verification sprint — deploy pending on branch merge |
| **Prior live release** | v1.0.0 — `a3b3b3b`; tag `regulation-watch-v1.0.0` |
| **Control Tower decision** | **APPROVED_WITH_LIMITATIONS** (v1.0.0) — unchanged |
| **Working branch** | `agent/v1.0.1-source-verification-sprint` |

---

## v1.0.1 sprint (source verification + hygiene)

| Target | v1.0.1 outcome |
|---|---|
| **Australia WAF** | Still blocked (automated timeout) — `pending_official_review` unchanged |
| **EUR-Lex HTTP 202** | Still HTTP 202 — `needs_more_source_review` unchanged |
| **EDPB HTTP 502** | **Resolved** — HTTP 200 re-check; eligibility updated |
| **UNESCO check_artifact** | **Resolved** — reclassified `benign_metadata_change` |
| **Content review** | +9 batch entries (8 new records + EDPB refresh) |
| **New features** | **None** |
| **Monitoring allowlist** | **Unchanged** (5 URLs) |

**Important:** Still not legal advice, not complete coverage, not client evidence, not production legal tracker.

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no caesar-ai-evidence writes.
- `client_use_allowed: true` — **0** across eligibility, monitoring, candidates, reviews.
- `verified_on_source: true` — **0** on records (by design).
- Not legal advice; no compliance guarantee; not complete coverage.

---

## Static deployment

| Capability | Status |
|---|---|
| Custom domain | **regulation-watch.caesar.no** |
| Auto-deploy on push | **No** (workflow_dispatch) |
