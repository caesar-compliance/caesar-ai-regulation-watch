# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.4` |
| **Current phase** | Public pilot — watcher eligibility + deterministic monitoring run |
| **Status** | v0.9.4 in progress (deploy pending after merge) |
| **Working branch** | `agent/v0.9.4-watcher-expansion-confirmed-sources` |
| **Latest completed task** | v0.9.4 — watcher eligibility for 15 confirmed/blocked sources; local monitoring run v094 |
| **Prior deploy** | v0.9.3 `b966574` (docs commit `17f4dc3` on main — deploy/tag mismatch noted) |
| **Next recommended step** | Control Tower: deploy v0.9.4; human browser on blocked sources (Australia, EUR-Lex, EDPB) |

---

## Watcher eligibility (v0.9.4)

| Metric | Count |
|---|---|
| Eligibility entries | 15 |
| Watcher-eligible (url_status_check, allowed_to_fetch) | 12 |
| Manual-only | 3 |
| Blocked / no automated fetch | 3 |
| `client_use_allowed: true` | 0 |
| `final_evidence_allowed: true` | 0 |

**v0.9.4 monitoring run:** `monitoring-run-2026-05-20-v094` — deterministic local; `change_detected_count: 0`; 4 checks require human review (Canada unstable flag + 3 manual/blocked).

---

## Source discovery (v0.9.1 batch, v0.9.3 verification)

| Metric | Count |
|---|---|
| Discovery leads | 26 |
| Official source confirmed | 24 |
| Pending official review | 1 (Australia industry.gov.au) |
| Rejected (not official) | 1 |

**Blocked from automated monitoring:** EUR-Lex CELEX (HTTP 202); EDPB AI topic (HTTP 502 v0.9.3); Australia industry.gov.au (WAF).

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no caesar-ai-evidence writes.
- `client_use_allowed: true` — **0** across eligibility, monitoring run, candidates, reviews.
- Not legal advice; no compliance guarantee; pilot disclaimers required.
- No broad scraping; scheduled monitoring remains manual/gated per SCHEDULED_MONITORING_POLICY.md.

---

## Static deployment

| Capability | Status |
|---|---|
| Custom domain | **regulation-watch.caesar.no** |
| Auto-deploy on push | **No** (workflow_dispatch) |
