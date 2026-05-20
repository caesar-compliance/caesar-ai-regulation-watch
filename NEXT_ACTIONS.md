# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v0.9.0 · **Phase:** public pilot — custom domain · **Branch:** `main` (after merge)

**Canonical URL:** https://regulation-watch.caesar.no/

---

## Immediate priority

1. ~~**Deploy v0.9.0**~~ — Done (`DEPLOY-20260520-007`, run [26132704545](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26132704545), commit `6779c28`).
2. ~~**Smoke test / hygiene**~~ — Custom domain smoke pass 20 May 2026; see [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
3. ~~**Tag**~~ — `regulation-watch-v0.9.0` on `6779c28`.
4. **EUR-Lex deep pass** — EU AI Act candidate remains `needs_more_source_review`.

---

## Deployment (ongoing)

1. **Pre-deploy:** `docs/PUBLIC_RELEASE_CHECKLIST.md`.
2. **Build parity:** `npm run build:custom-domain` + `npm run verify:dist` (root `/`, no project base path).
3. **Post-deploy:** smoke tests; update `DEPLOYMENTS.md` and `docs/PUBLIC_DEPLOYMENT_BASELINE.md`.
4. ~~**Legacy URL**~~ — `https://caesar-compliance.github.io/caesar-ai-regulation-watch/` **301** to custom domain (may use `http://` target; HTTPS works on canonical host).

---

## Commands

```bash
npm run build                    # local / CI (root base path)
npm run build:custom-domain      # production custom domain (parity with deploy workflow)
npm run verify:dist              # after build:custom-domain
npm run build:pages              # legacy GitHub project path only (rollback reference)
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
