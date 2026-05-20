# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v1.0.0 · **Phase:** Public Technical MVP · **Branch:** `main`

**Canonical URL:** https://regulation-watch.caesar.no/

**Control Tower:** **APPROVED_WITH_LIMITATIONS** — see [docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md](docs/V1_FINAL_CONTROL_TOWER_DECISION_RECORD.md).

---

## Immediate priority (post v1.0.0)

1. **Source verification** — Australia WAF manual browser check; EUR-Lex HTTP 202 human review; EDPB re-check when stable.
2. **Content review** — expand beyond 19 reviewed items; no `verified_on_source: true` without explicit CT approval.
3. **UNESCO `check_artifact`** — Control Tower confirm on official source.
4. **Monitoring** — continue manual-gated pilot only; no scheduled broad crawl without policy update.
5. **Evidence** — candidates only; no final export; no `client_use_allowed: true`; no caesar-ai-evidence writes.

---

## Completed (v1.0.0 release)

- Control Tower **APPROVED_WITH_LIMITATIONS** for Public Technical MVP.
- Version labels `v1.0.0` / package `1.0.0`.
- v1.0.0-rc1 path — deployed `DEPLOY-20260520-017`; tag `regulation-watch-v1.0.0-rc1`.
- v0.9.x pilot stack — readiness audit, monitoring, source discovery, content review.

---

## Deployment (ongoing)

1. **Pre-deploy:** [docs/PUBLIC_RELEASE_CHECKLIST.md](docs/PUBLIC_RELEASE_CHECKLIST.md).
2. **Build parity:** `npm run build:custom-domain` + `npm run verify:dist`.
3. **Post-deploy:** smoke tests; update `DEPLOYMENTS.md` and `docs/PUBLIC_DEPLOYMENT_BASELINE.md`.
4. **Tag:** `regulation-watch-v1.0.0` on **deployed** main commit only.

---

## Commands

```bash
npm run build:custom-domain
npm run verify:dist
npm run validate:data
npm run generate:evidence-candidates
npm run generate:exports
npm run monitoring:pack
npm run monitoring:live-artifact    # local artifact pack (tmp/)
npm run monitoring:policy-check
```

---

## Not in scope

- Final evidence export to caesar-ai-evidence
- `client_use_allowed: true` on candidates or reviews
- Auto-deploy on every merge to `main`
- New jurisdictions or monitoring allowlist expansion (without Control Tower approval)
- Production-ready / complete coverage / legal advice / client-ready evidence claims

See [ROADMAP.md](ROADMAP.md), [DEPLOYMENTS.md](DEPLOYMENTS.md), and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
