# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.9.8 · **Phase:** public pilot — manual-gated live metadata artifact review · **Branch:** `main` (after merge)

**Canonical URL:** https://regulation-watch.caesar.no/

---

## Immediate priority

1. ~~**v0.9.2 source lead resolution**~~ — White House EO → Federal Register; Canada confirmed; Australia pending (WAF).
2. ~~**v0.9.2 content review batch**~~ — six v0.9.1 minimal records + EUR-Lex follow-up in `content-review-2026-05-20-v092.yml`.
3. ~~**Deploy and tag**~~ — `DEPLOY-20260520-009` live; tag `regulation-watch-v0.9.2` after docs commit.
4. ~~**v0.9.3 targeted verification pass**~~ — batch `source-verification-2026-05-20-v093` + `content-review-2026-05-20-v093`; limitations documented.
5. ~~**v0.9.4 watcher eligibility**~~ — `watcher-eligibility-2026-05-20` (15 entries); deterministic `monitoring-run-2026-05-20-v094`.
6. ~~**v0.9.5 monitoring adapter pack**~~ — `source-configs-2026-05-20-v095`; `monitoring-run-2026-05-20-v095`; `npm run monitoring:pack`.
7. ~~**Deploy v0.9.5**~~ — `DEPLOY-20260520-012` live; tag `regulation-watch-v0.9.5`.
8. ~~**v0.9.6 cautious live metadata pilot**~~ — allowlist v096; live run + change review pack; `npm run monitoring:live-metadata`.
9. ~~**Deploy v0.9.6**~~ — `DEPLOY-20260520-013` live; tag `regulation-watch-v0.9.6`.
10. ~~**v0.9.7 live metadata triage**~~ — `metadata-review-triage-2026-05-20-v097`; benign NIST/UK GOV; UNESCO `check_artifact`.
11. ~~**Deploy v0.9.7**~~ — complete (`DEPLOY-20260520-014`).
12. ~~**v0.9.8 manual artifact workflow**~~ — deployed `DEPLOY-20260520-015`; workflow test [26162701373](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26162701373); tag `regulation-watch-v0.9.8`.
13. **Optional Control Tower** — confirm UNESCO page on official source if substantive change suspected (metadata alone insufficient).
13. **Human browser verification (remaining)** — Australia `industry.gov.au`; EUR-Lex CELEX; EDPB AI topic when stable.

---

## Deployment (ongoing)

1. **Pre-deploy:** `docs/PUBLIC_RELEASE_CHECKLIST.md`.
2. **Build parity:** `npm run build:custom-domain` + `npm run verify:dist` (root `/`, no project base path).
3. **Post-deploy:** smoke tests; update `DEPLOYMENTS.md` and `docs/PUBLIC_DEPLOYMENT_BASELINE.md`.

---

## Commands

```bash
npm run build                    # local / CI (root base path)
npm run build:custom-domain      # production custom domain (parity with deploy workflow)
npm run verify:dist              # after build:custom-domain
npm run validate:data
npm run generate:evidence-candidates
npm run generate:exports
npm run monitoring:pack          # regenerate deterministic pack run YAML
npm run monitoring:live-metadata # cautious live pilot (network; max 5 URLs)
```

---

## Not in scope

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates or reviews
- Auto-deploy on every merge to `main`

See [ROADMAP.md](ROADMAP.md), [DEPLOYMENTS.md](DEPLOYMENTS.md), and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
