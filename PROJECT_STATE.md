# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.3` |
| **Current phase** | Public pilot — targeted source verification |
| **Status** | Live on custom domain; v0.9.3 deployed (`b966574`) |
| **Working branch** | `main` (after merge) |
| **Latest completed task** | v0.9.3 — targeted verification batch; Australia pending (WAF); EUR-Lex blocked; EDPB 502 |
| **Deployment ID** | `DEPLOY-20260520-010` — commit `b966574`, run [26134336862](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26134336862) |
| **Git tag** | `regulation-watch-v0.9.3` on merge commit (after docs commit) |
| **Next recommended step** | Control Tower: human browser on industry.gov.au + EUR-Lex when accessible; re-check EDPB when site up |

---

## Versioning (ecosystem standard)

| ID type | Example | Use |
|---|---|---|
| Work item | `TXXX` | `work-items/` only — not public version |
| Product version | `v0.9.2` | Site footer, snapshot, `package.json` |
| Deployment ID | `DEPLOY-20260520-009` | Live — see [DEPLOYMENTS.md](DEPLOYMENTS.md) |
| Git tag | `regulation-watch-v0.9.2` | Points at deploy commit `8038f9d` |

---

## Source discovery (v0.9.2 resolution on v0.9.1 batch)

| Metric | v0.9.1 | After v0.9.2 |
|---|---|---|
| Discovery leads | 26 | 26 |
| Official source confirmed | 22 | 24 |
| Pending official review | 2 | 1 |
| Official source unclear | 1 | 0 |
| Rejected (not official) | 1 | 1 |

**v0.9.2 resolutions:** White House EO → Federal Register EO 14110 confirmed; Canada responsible-ai confirmed.

**v0.9.3 targeted verification:** Australia industry principles still `pending_official_review` (WAF/403); EUR-Lex CELEX 32024R1689 still HTTP 202; EDPB AI topic HTTP 502 (transient); EU AI Act candidate still `needs_more_source_review`.

---

## Content review (v0.9.3)

| Metric | Count |
|---|---|
| v0.9.3 batch | `content-review-2026-05-20-v093` (3 entries) |
| v0.9.3 source verification batch | `source-verification-2026-05-20-v093` (3 entries) |
| `client_use_allowed: true` | 0 |
| `verified_on_source_after_check: true` | 0 |

---

## Static deployment

| Capability | Status |
|---|---|
| `DEPLOYMENTS.md` | Yes |
| `docs/PUBLIC_DEPLOYMENT_BASELINE.md` | Yes |
| `.github/workflows/deploy-static-site.yml` | Yes |
| Custom domain | **regulation-watch.caesar.no** |
| Auto-deploy on push | **No** |

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no caesar-ai-evidence writes.
- `client_use_allowed: true` — **0** candidates and reviews.
- `final_evidence_allowed: true` — **0** reviews.
- Not legal advice; no compliance guarantee; pilot disclaimers required.
