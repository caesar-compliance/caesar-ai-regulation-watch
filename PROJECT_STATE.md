# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.1` |
| **Current phase** | Public pilot — competitor-assisted official source discovery |
| **Status** | Live on custom domain; v0.9.1 deployed (`8040212`) |
| **Working branch** | `main` (after merge) |
| **Latest completed task** | v0.9.1 — 26 discovery leads, 9 new sources, 6 minimal records; deployed |
| **Deployment ID** | `DEPLOY-20260520-008` — commit `8040212`, run [26133482897](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133482897) |
| **Git tag** | `regulation-watch-v0.9.1` on `8040212` |
| **Next recommended step** | Control Tower: URL re-check for pending/unclear leads; EUR-Lex deep pass |

---

## Versioning (ecosystem standard)

| ID type | Example | Use |
|---|---|---|
| Work item | `TXXX` | `work-items/` only — not public version |
| Product version | `v0.9.1` | Site footer, snapshot, `package.json` |
| Deployment ID | `DEPLOY-20260520-008` | Live — see [DEPLOYMENTS.md](DEPLOYMENTS.md) |
| Git tag | `regulation-watch-v0.9.1` | Points at deploy commit `8040212` |

---

## Source discovery (v0.9.1)

| Metric | Count |
|---|---|
| Discovery leads | 26 |
| Official source confirmed | 22 |
| Pending official review | 2 |
| Official source unclear | 1 |
| Rejected (not official) | 1 |
| Promoted new `source_id` | 9 |
| New sources in registry | 9 |
| New minimal records | 6 |

Policy: [docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md](docs/COMPETITOR_ASSISTED_SOURCE_DISCOVERY_POLICY.md)

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
