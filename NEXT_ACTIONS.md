# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

**Current version:** v0.3.0 · **Phase:** sample records (data-model validation) · **Mode:** static manual data only.

---

## Immediate priority — Control Tower review (v0.3.0)

**Owner:** Artem (Control Tower)

1. Review [docs/SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md) and all files under `data/laws/`, `data/guidance/`, `data/changes/`, `mappings/`.
2. Confirm sample summaries and dates are acceptable for internal testing (verify `key_dates` on EUR-Lex where used).
3. Approve or revise placeholder `ctrl_*` and `ev_*` refs vs hub / `caesar-ai-evidence` taxonomy.
4. Set `review_status: reviewed` on records when appropriate.
5. Decide: proceed to **v0.3.1 static site skeleton** or pause until evidence export shape is agreed.

---

## Next safe steps (after sample review)

| Step | Description |
|---|---|
| Evidence alignment | Document `regulation-change` export mapping from `change_id` + mappings |
| Timeline YAML | Optional `data/timelines/` for EU and Norway pilot |
| Static site | Read-only HTML from `data/` (v0.3.1 — no framework lock-in without approval) |
| Registry expansion | Additional sources (Lovdata, ENISA) as separate registry wave |

---

## Still blocked / requires approval

| Task | Gate |
|---|---|
| Live HTTP fetch / watcher | v0.4 + explicit Control Tower approval |
| AI-generated summaries on records | Review workflow policy |
| Package manager / CI validation | Control Tower decision |
| Client-facing export | All records `reviewed` |

---

## Completed

### v0.2.0

- [x] EU/Norway jurisdiction and source registry
- [x] Registry schemas and [PILOT_SOURCE_REGISTRY.md](docs/PILOT_SOURCE_REGISTRY.md)

### v0.3.0

- [x] Sample law, guidance, change YAML
- [x] Control and evidence mapping samples
- [x] Entity schemas and [SAMPLE_RECORDS_GUIDE.md](docs/SAMPLE_RECORDS_GUIDE.md)

See [ROADMAP.md](ROADMAP.md).
