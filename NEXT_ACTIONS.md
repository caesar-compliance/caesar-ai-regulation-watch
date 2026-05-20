# Next Actions — Caesar AI Regulation Watch

**Last updated:** 20 May 2026 · **Version:** v1.0.4 (in progress)

**URL:** https://regulation-watch.caesar.no/

---

## Immediate (Control Tower — post v1.0.4)

1. **Deploy v1.0.4** — merge autonomous worker branch, validate CI, deploy, tag `regulation-watch-v1.0.4`.
2. **EUR-Lex** — autonomous pass confirms CELEX via EFTA EEA-Lex official alternative only; EUR-Lex consolidated text still blocked (HTTP 202). Decide whether EFTA alternative is sufficient for internal governance or EUR-Lex human/policy step still required.
3. **Australia / Japan** — autonomous pass: `access_failed` (timeout). Optional: enable Playwright browser worker (no stealth) or accept machine-unverifiable until environment allows official reachability.
4. **`verified_on_source`** — do not set `true` without explicit Control Tower approval per [VERIFIED_ON_SOURCE_POLICY.md](docs/VERIFIED_ON_SOURCE_POLICY.md).

---

## Completed (v1.0.4 — branch)

- Autonomous verification schema, allowlist, worker script, batch `autonomous-source-verification-2026-05-20-v103.yml`.
- Public export `/data/autonomous-source-verifications.json` and snapshot counts.
- `/source-verification/` page — autonomous results + policy gate (manual intake supplementary).

---

## Deploy

Merge → validate on `main` → `gh workflow run deploy-static-site.yml -f confirm_disclaimers=DEPLOY` → tag `regulation-watch-v1.0.4` on deployed commit.
