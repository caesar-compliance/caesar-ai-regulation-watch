# Verified on source policy

**Effective:** v1.0.3 (20 May 2026)  
**Owner:** Control Tower (Artem)  
**Scope:** Caesar AI Regulation Watch registry records, timeline events, and downstream export gates

This policy governs when `verified_on_source: true` may ever be set in repository YAML or public exports. It is **not legal advice** and does **not** grant compliance certification, complete coverage, or client-ready evidence status.

---

## Default rule

- **`verified_on_source` is `false` by default** for every record, timeline event, source, and monitoring artifact.
- **No automated job, watcher, URL check, or intake batch may set `verified_on_source: true`.**
- Validation and CI **fail** if `verified_on_source: true` appears without an explicit, documented Control Tower exception (none exists as of v1.0.3).

---

## When `verified_on_source: true` may be considered (future only)

All of the following are required before Control Tower may approve a change request:

| Requirement | Meaning |
|---|---|
| **Control Tower approval** | Written decision in Control Tower records; not implied by implementation agent work |
| **Completed manual intake** | A `manual-source-verification-intake` entry with `intake_status` at least `observation_recorded` or `identity_confirmed_pending_control_tower` |
| **Official source identity** | Human browser confirms expected authority/domain/publisher for the official URL |
| **Legal instrument identity** (if applicable) | For laws/regulations, human confirms instrument title/CELEX/OJ reference on the official legal source — not a press page alone |
| **Non-copying attestation** | `content_not_copied: true`, `no_full_text_storage: true`, `no_legal_advice: true` on the intake entry |
| **Reviewer accountability** | `reviewer_role`, `access_date`, `official_url`, `limitations`, and short `reviewer_note` (no pasted legal text) |
| **Safety flags unchanged** | `client_use_allowed: false`, `final_evidence_allowed: false` unless separate policy explicitly changes (none today) |

`verified_on_source_approved: true` on an intake entry is a **separate** explicit flag reserved for Control Tower after intake review. It remains **`false` in v1.0.3**.

---

## What `verified_on_source: true` does **not** mean

- Not legal advice or official interpretation
- Not complete regulatory coverage
- Not production readiness or client readiness
- Not approval for **final evidence export** to `caesar-ai-evidence`
- Not automatic approval for **`client_use_allowed: true`**
- Not a claim that summaries, dates, or obligations in YAML match the full official text

---

## High-risk records

For binding legal instruments (e.g. EU AI Act CELEX), high-impact guidance, or items tied to export candidates:

- **Counsel review may be required** (`reviewer_role: counsel` or documented counsel sign-off) before Control Tower sets `verified_on_source: true`.
- EC overview pages, competitor trackers, or secondary sources **cannot** substitute for official instrument verification on EUR-Lex or the official gazette path.

---

## Workflow integration

1. Automated verification fails or is blocked → create or update **manual source verification intake** (do not loop automated retries).
2. Qualified reviewer records **browser observations** per [MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md](./MANUAL_SOURCE_VERIFICATION_INTAKE_GUIDE.md).
3. Control Tower reviews intake + existing source/content verification batches.
4. Only if policy satisfied → separate commit may set `verified_on_source: true` on the record (and matching content review fields).

See also [SOURCE_VERIFICATION_WORKFLOW.md](./SOURCE_VERIFICATION_WORKFLOW.md) and [CONTENT_REVIEW_WORKFLOW.md](./CONTENT_REVIEW_WORKFLOW.md).

---

## v1.0.3 status

- Manual intake batch created for Australia, EUR-Lex, and Japan METI — all **`pending_human_browser_input`**.
- **`verified_on_source` count remains 0** on all records and public snapshot exports.
