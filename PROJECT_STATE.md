# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.5` |
| **Current phase** | Public pilot — monitoring adapter pack + deterministic pack run |
| **Status** | Live on custom domain; v0.9.5 deployed (`5d43122`) |
| **Working branch** | `main` |
| **Latest completed task** | v0.9.5 — monitoring adapter pack + deterministic pack run v095 |
| **Deployment ID** | `DEPLOY-20260520-012` — commit `5d43122`, run [26160894726](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160894726) |
| **Git tag** | `regulation-watch-v0.9.5` (after docs commit) |
| **Next recommended step** | Control Tower: human browser on blocked sources; optional single-URL live metadata pilot |

---

## Monitoring adapter pack (v0.9.5)

| Metric | Count |
|---|---|
| Source configs | 15 |
| Fetchable (static_page metadata) | 12 |
| Manual-only / not fetched | 3 |
| Pack run checks | 15 |
| `metadata_snapshot_created` | 10 |
| `no_change_snapshot_created` | 2 |
| Blocked / manual not checked | 3 |
| `change_detected_count` | 0 |
| `client_use_allowed: true` | 0 |

**Latest pack run:** `monitoring-run-2026-05-20-v095` — deterministic local; config batch `source-configs-2026-05-20-v095`.

## Watcher eligibility (v0.9.4 batch, unchanged)

| Metric | Count |
|---|---|
| Eligibility entries | 15 |
| Watcher-eligible (url_status_check, allowed_to_fetch) | 12 |
| Manual-only | 3 |

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
