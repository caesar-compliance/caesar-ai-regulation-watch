# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.9.3 · **Phase:** public pilot — targeted source verification · **Branch:** `main` (after merge)

**Canonical URL:** https://regulation-watch.caesar.no/

---

## Immediate priority

1. ~~**v0.9.2 source lead resolution**~~ — White House EO → Federal Register; Canada confirmed; Australia pending (WAF).
2. ~~**v0.9.2 content review batch**~~ — six v0.9.1 minimal records + EUR-Lex follow-up in `content-review-2026-05-20-v092.yml`.
3. ~~**Deploy and tag**~~ — `DEPLOY-20260520-009` live; tag `regulation-watch-v0.9.2` after docs commit.
4. ~~**v0.9.3 targeted verification pass**~~ — batch `source-verification-2026-05-20-v093` + `content-review-2026-05-20-v093`; limitations documented.
5. **Human browser verification (remaining)** — Australia `industry.gov.au` ethics principles HTML (WAF); EUR-Lex CELEX 32024R1689 full instrument; EDPB AI topic when edpb.europa.eu returns HTTP 200.

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
```

---

## Not in scope

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates or reviews
- Auto-deploy on every merge to `main`

See [ROADMAP.md](ROADMAP.md), [DEPLOYMENTS.md](DEPLOYMENTS.md), and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
