# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

| Field | Value |
|---|---|
| **Current version** | `v1.0.3` |
| **Status** | In release — manual verification intake + policy gate |
| **Previous live** | `v1.0.2` — tag `regulation-watch-v1.0.2` → `d36909e` |
| **Phase** | Public Technical MVP |

## v1.0.3 summary

- **Manual source verification intake** — schema, batch, public export, `/source-verification/` page.
- **`verified_on_source` policy gate** — [VERIFIED_ON_SOURCE_POLICY.md](docs/VERIFIED_ON_SOURCE_POLICY.md); no `verified_on_source: true` in this release.
- **Australia / EUR-Lex / Japan** — intake placeholders `pending_human_browser_input`; automated blockers documented, not retried.
- `verified_on_source: 0` · `client_use_allowed: 0` · `final_evidence_allowed: 0` unchanged.

## v1.0.2 summary (previous live)

- Canada source/content review **improved** (HTTP 200).
- Content reviews **36** (was 28).
- Australia / EUR-Lex / Japan blockers **documented** in v1.0.2 verification batch.
