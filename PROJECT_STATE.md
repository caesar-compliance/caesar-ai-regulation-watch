# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v0.9.0` |
| **Current phase** | Public pilot — custom domain + deployment/version standard |
| **Status** | Live on custom domain; deploy commit aligned with tag `regulation-watch-v0.9.0` |
| **Working branch** | `main` |
| **Latest completed task** | v0.9.0 deployment hygiene — redeploy `6779c28`, HTTPS enforced, smoke pass |
| **Next recommended step** | Hub standardization (separate work item); no product version bump |

---

## Versioning (ecosystem standard)

| ID type | Example | Use |
|---|---|---|
| Work item | `TXXX` | `work-items/` only — not public version |
| Product version | `v0.9.0` | Site footer, snapshot, `package.json` |
| Deployment ID | `DEPLOY-20260520-007` | Current publish — see [DEPLOYMENTS.md](DEPLOYMENTS.md) |
| Git tag | `regulation-watch-v0.9.0` | Points at `6779c28` on `main` |

Hub standard: [VERSIONING_AND_DEPLOYMENT_STANDARD](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/docs/VERSIONING_AND_DEPLOYMENT_STANDARD.md)

---

## Static deployment

| Capability | Status |
|---|---|
| `DEPLOYMENTS.md` | Yes — deployment event log |
| `docs/PUBLIC_DEPLOYMENT_BASELINE.md` | Yes |
| `.github/workflows/deploy-static-site.yml` | Yes — `build:custom-domain`, root `/` |
| `npm run build:custom-domain` | Yes |
| GitHub Pages custom domain | **regulation-watch.caesar.no** (DNS CNAME → caesar-compliance.github.io) |
| Legacy project URL | `https://caesar-compliance.github.io/caesar-ai-regulation-watch/` — 301 to custom domain |
| Auto-deploy on push | **No** |

---

## Policy baseline (unchanged)

- Evidence export **candidates** only; no final evidence export; no caesar-ai-evidence writes.
- `client_use_allowed: true` — **0** candidates and reviews.
- `final_evidence_allowed: true` — **0** reviews.
- Not legal advice; no compliance guarantee; pilot disclaimers required.
