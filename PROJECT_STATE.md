# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

| Field | Value |
|---|---|
| **Current version** | `v1.0.4` |
| **Status** | Live — `5c19b28`; tag `regulation-watch-v1.0.4` |
| **Deployment** | `DEPLOY-20260520-022` — [26168769688](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26168769688) |
| **Previous live** | `v1.0.3` — tag `regulation-watch-v1.0.3` → `16965d9` |
| **Phase** | Public Technical MVP |

## v1.0.4 summary (in progress)

- **Autonomous official-source verification worker** — `npm run source:verify:autonomous`, schema, allowlist, batch export, `/source-verification/` page refresh.
- **No WAF/bot bypass** — metadata-only fetch, official SPARQL/Cellar attempts, EFTA EEA-Lex official alternative for CELEX identity where EUR-Lex blocked.
- **Browser worker** — not bundled (Playwright pending); documented in workflow.
- `verified_on_source: 0` · `client_use_allowed: 0` · `final_evidence_allowed: 0` unchanged.

## v1.0.3 summary (previous live)

- Manual source verification intake — supplementary placeholders for blocked sources.
- Australia / EUR-Lex / Japan blockers documented; autonomous worker replaces manual-only primary path in v1.0.4.
