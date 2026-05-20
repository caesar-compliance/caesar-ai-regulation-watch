# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

**Current version:** v1.0.1 (in progress) · **Phase:** Public Technical MVP

**Canonical URL:** https://regulation-watch.caesar.no/

---

## Immediate priority (post v1.0.1 deploy)

1. **Australia** — human browser verification of `industry.gov.au` ethics principles HTML (automated still timeout).
2. **EUR-Lex** — human browser pass on CELEX 32024R1689; only then consider export-readiness gate change.
3. **Canada / Japan** — human browser re-check where v1.0.1 automated fetch timed out.
4. **Content review** — continue incremental batches; no `verified_on_source: true` without CT approval.
5. **Monitoring** — manual-gated pilot only; no scheduled broad crawl.

---

## Completed (v1.0.1 sprint)

- EDPB AI topic HTTP 200 re-check; source identity + content review refresh.
- UNESCO `check_artifact` → `benign_metadata_change`.
- Content review batch v101 (9 entries).
- Duplicate Finder `* 2.*` files removed from workspace.

---

## Deployment

1. Merge `agent/v1.0.1-source-verification-sprint` → `main`.
2. `npm run build:custom-domain` + `npm run verify:dist`.
3. Deploy with `confirm_disclaimers=DEPLOY`.
4. Tag `regulation-watch-v1.0.1` on deployed commit.

See [DEPLOYMENTS.md](DEPLOYMENTS.md) and [docs/PUBLIC_DEPLOYMENT_BASELINE.md](docs/PUBLIC_DEPLOYMENT_BASELINE.md).
