# Deployments — Caesar AI Regulation Watch

Authoritative log of **public deployment events**. Product version (`vX.Y.Z`) is separate from deployment ID and GitHub Actions run ID.

**Standard:** [caesar-ai-governance-hub — Versioning and Deployment](https://github.com/caesar-compliance/caesar-ai-governance-hub/blob/main/docs/VERSIONING_AND_DEPLOYMENT_STANDARD.md)

**Canonical public URL (v0.9.0+):** https://regulation-watch.caesar.no/

---

## Deployment table

| Deployment ID | Product Version | Date | Commit | GitHub Run ID | Environment | Public URL | Domain mode | Smoke test | Notes |
|---|---|---|---|---|---|---|---|---|---|
| DEPLOY-20260520-001 | v0.8.5 | 20 May 2026 | `57acfcf` | [26130431228](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26130431228) | github-pages | https://caesar-compliance.github.io/caesar-ai-regulation-watch/ | project-path | pass | First GitHub Pages pilot deploy. *Historical — partial record.* |
| DEPLOY-20260520-002 | v0.8.6 | 20 May 2026 | `956730b` | *see baseline* | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Content review candidate refresh. *Historical — run ID in PUBLIC_DEPLOYMENT_BASELINE if updated.* |
| DEPLOY-20260520-003 | v0.8.7 | 20 May 2026 | `a3ded91` | *see baseline* | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Export review gate. *Historical.* |
| DEPLOY-20260520-004 | v0.8.8 | 20 May 2026 | `52ac0c1` | *see baseline* | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Public HTML version consistency. *Historical.* |
| DEPLOY-20260520-005 | v0.8.9 | 20 May 2026 | `4e987c0` | [26131903261](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26131903261) | github-pages | …/caesar-ai-regulation-watch/ | project-path | pass | Source verification refresh; superseded by custom domain. |
| DEPLOY-20260520-006 | v0.9.0 | 20 May 2026 | `6aedd49` | [26132437149](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26132437149) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Ecosystem versioning standard; legacy project URL redirects here; tag `regulation-watch-v0.9.0`. *Superseded by DEPLOY-20260520-007 (commit alignment).* |
| DEPLOY-20260520-007 | v0.9.0 | 20 May 2026 | `6779c28` | [26132704545](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26132704545) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | v0.9.0 hygiene redeploy — live site aligned with tag `regulation-watch-v0.9.0` / docs commit on `main`. |
| DEPLOY-20260520-008 | v0.9.1 | 20 May 2026 | `8040212` | [26133482897](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133482897) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Competitor-assisted source discovery — 26 leads, 9 new sources, `/source-discovery/` page. |
| DEPLOY-20260520-009 | v0.9.2 | 20 May 2026 | `8038f9d` | [26133918817](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26133918817) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Source lead resolution (24/26 confirmed); first content review batch for v0.9.1 records; 16 content reviews exported. |
| DEPLOY-20260520-010 | v0.9.3 | 20 May 2026 | `b966574` | [26134336862](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26134336862) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Targeted human/browser source verification batch (Australia, EUR-Lex, EDPB); 41 verifications, 19 content reviews exported. *Deploy commit behind docs-only `17f4dc3` on main until v0.9.4.* |
| DEPLOY-20260520-011 | v0.9.4 | 20 May 2026 | `7029059` | [26160434304](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160434304) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Watcher eligibility (15 entries, 12 fetch-eligible); deterministic monitoring run v094; `/monitoring/` + `watcher-eligibility.json`. |
| DEPLOY-20260520-012 | v0.9.5 | 20 May 2026 | `5d43122` | [26160894726](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26160894726) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Monitoring adapter/config pack (15 configs, 12 fetchable); deterministic pack run v095; `monitoring-source-configs.json`. |
| DEPLOY-20260520-013 | v0.9.6 | 20 May 2026 | `644c448` | [26161681675](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26161681675) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Cautious live metadata pilot (5 allowlisted URLs, one request each); `live-metadata-runs.json`, `change-review-packs.json`; 3 metadata review candidates. |
| DEPLOY-20260520-014 | v0.9.7 | 20 May 2026 | `aa94d88` | [26162113701](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162113701) | github-pages | https://regulation-watch.caesar.no/ | custom-domain-root | pass | Live metadata triage (3 candidates: 2 benign, 1 check_artifact); `metadata-review-triage.json`; hardened comparison policy; tag `regulation-watch-v0.9.7` on deployed commit. |

---

## How to record a new deployment

1. Run **Deploy static site** with `confirm_disclaimers=DEPLOY`.
2. After success, add a row with next `DEPLOY-YYYYMMDD-NNN`, product version, commit SHA, run ID, smoke result.
3. Update [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md) summary if baseline changes.

---

## Legacy project URL

`https://caesar-compliance.github.io/caesar-ai-regulation-watch/` may continue to serve an older build or redirect depending on GitHub Pages configuration after custom-domain deploy. Document behavior in smoke test / baseline after v0.9.0 deploy.
