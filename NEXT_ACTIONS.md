# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026 · **Version:** v1.0.3

**URL:** https://regulation-watch.caesar.no/

---

## Immediate (Control Tower — post v1.0.3)

1. **Australia** — qualified human browser: complete `intake-australia-industry-ai-principles-v103` observations in manual intake YAML.
2. **EUR-Lex** — human browser with JavaScript on CELEX 32024R1689: complete `intake-eu-ai-act-eurlex-v103`.
3. **Japan METI** — human browser on official METI AI pages: complete `intake-japan-meti-ai-v103`.
4. **`verified_on_source`** — do not set `true` without explicit Control Tower approval per [VERIFIED_ON_SOURCE_POLICY.md](docs/VERIFIED_ON_SOURCE_POLICY.md).

---

## Completed (v1.0.3)

- Manual source verification intake schema, batch, validation, public export.
- `verified_on_source` policy gate documentation.
- `/source-verification/` public status page (no private reviewer notes in JSON export).

---

## Deploy

Merge → validate on `main` → `gh workflow run deploy-static-site.yml -f confirm_disclaimers=DEPLOY` → tag `regulation-watch-v1.0.3` on deployed commit.
