# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.7` |
| **Current phase** | Public pilot — live metadata triage + stable baseline hardening |
| **Status** | v0.9.7 implementation complete; deploy pending |
| **Working branch** | `agent/v0.9.7-live-metadata-triage` → merge `main` |
| **Latest completed task** | v0.9.7 — triage 3 live metadata review candidates; comparison policy hardening |
| **Deployment ID** | (pending v0.9.7 deploy) |
| **Git tag** | `regulation-watch-v0.9.7` (after deploy on main) |
| **Next recommended step** | Deploy v0.9.7; optional UNESCO check_artifact human confirm on official page |

---

## Live metadata triage (v0.9.7)

| Metric | Count |
|---|---|
| Triage items (v0.9.6 candidates) | 3 |
| `benign_metadata_change` | 2 |
| `check_artifact` | 1 |
| `legal_change_claimed` | 0 |
| Review queue (post-triage live metadata) | 1 |

**Triage batch:** `metadata-review-triage-2026-05-20-v097` — related run `live-metadata-run-2026-05-20-v096`.

## Cautious live metadata pilot (v0.9.6 run, v0.9.7 triage)

| Metric | Count |
|---|---|
| Allowlisted sources | 5 |
| Live checks | 5 |
| `metadata_check_ok` | 2 |
| `metadata_changed_needs_review` (raw pilot) | 3 |
| `metadata_check_failed` | 0 |
| `client_use_allowed: true` | 0 |

**Latest live run:** `live-metadata-run-2026-05-20-v096` — compared to `monitoring-run-2026-05-20-v095`.

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
