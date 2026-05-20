# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.9.6 · **Phase:** public pilot — cautious live metadata pilot · **Branch:** merge `agent/v0.9.6-live-metadata-pilot` → `main`

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
9. **Deploy v0.9.6** — merge, CI, custom-domain deploy, tag `regulation-watch-v0.9.6`.
10. **Control Tower review** — triage 3 `metadata_changed_needs_review` items (US NIST last-modified; UK etag; UNESCO title/headers); not legal change claims.
11. **Human browser verification (remaining)** — Australia `industry.gov.au`; EUR-Lex CELEX; EDPB AI topic when stable.

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
