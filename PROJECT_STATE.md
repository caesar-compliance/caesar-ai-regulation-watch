# Project State — Caesar AI Regulation Watch

**Last updated:** 20 May 2026

---

## Operational metadata

| Field | Value |
|---|---|
| **Repository** | `caesar-ai-regulation-watch` |
| **Current version** | `v1.0.1` |
| **Current phase** | Public Technical MVP |
| **Status** | Live — v1.0.1 deployed (`489f9e7`); tag `regulation-watch-v1.0.1` |
| **Latest deployment** | `DEPLOY-20260520-019` — run [26165712249](https://github.com/caesar-compliance/caesar-ai-regulation-watch/actions/runs/26165712249) |
| **Control Tower decision** | **APPROVED_WITH_LIMITATIONS** (v1.0.0) — unchanged |

---

## v1.0.1 source verification sprint

| Target | Outcome |
|---|---|
| **EDPB** | **Improved** — HTTP 200; topic index re-confirmed |
| **UNESCO** | **Improved** — `benign_metadata_change` |
| **Content review** | **19 → 28** exported reviews |
| **Australia** | Unchanged — `pending_official_review` |
| **EUR-Lex** | Unchanged — HTTP 202; `needs_more_source_review` |

No new jurisdictions, monitoring allowlist expansion, or client/final evidence.

---

## Policy baseline (unchanged)

- `client_use_allowed: 0`; `verified_on_source: 0`; `legal_change_claimed: 0`
- Not legal advice; not complete coverage; not client evidence

---

## Static deployment

| Capability | Status |
|---|---|
| Custom domain | **regulation-watch.caesar.no** |
| Auto-deploy | **No** (workflow_dispatch) |
