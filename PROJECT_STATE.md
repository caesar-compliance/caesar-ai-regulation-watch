# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.2` |
| **Current phase** | Public pilot — source resolution and content review |
| **Status** | Live on custom domain; v0.9.2 deployed (`8038f9d`) |
| **Working branch** | `main` (after merge) |
| **Latest completed task** | v0.9.2 — 24/26 leads confirmed; 16 content reviews; 6 v0.9.1 records reviewed |
| **Deployment ID** | `DEPLOY-20260520-009` — commit `8038f9d`, run [26133918817](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133918817) |
| **Git tag** | `regulation-watch-v0.9.2` on `8038f9d` (pending push after docs commit) |
| **Next recommended step** | Control Tower: human browser pass for Australia industry.gov.au, EUR-Lex CELEX, EDPB AI topic |

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

**v0.9.2 resolutions:** White House EO → Federal Register EO 14110 confirmed; Canada responsible-ai confirmed; Australia industry principles still pending (WAF).

---

## Content review (v0.9.2)

| Metric | Count |
|---|---|
| New batch | `content-review-2026-05-20-v092` |
| v0.9.1 minimal records reviewed | 6 |
| EUR-Lex follow-up entry | 1 |
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
