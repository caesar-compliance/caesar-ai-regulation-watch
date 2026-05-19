# Next Actions — Caesar AI Regulation Watch

**Last updated:** 19 May 2026

Prioritized work after completion of the **full-scale product blueprint** (v0.1). Still **no product code**, **no dependencies**, **no watchers** until v0.2 is approved.

---

## Immediate priority (v0.2)

### 1. Approve pilot jurisdiction set

**Owner:** Control tower (Artem)

Proposed pilot:

- `eu` — EU AI Act, EU AI Office, EUR-Lex references
- `no` — Norway implementation, Datatilsynet
- Optional wave: `gb`, `us` (federal selected sources only)

Document coverage limits on each profile.

### 2. Create official source registry files

**Owner:** Agent after approval

- Add `data/sources/` YAML or JSON per [docs/DATA_MODEL_DRAFT.md](docs/DATA_MODEL_DRAFT.md)
- Each entry: URL, credibility tier, fetch method, attribution, license notes
- Minimum 5 sources for EU/Norway pilot

### 3. Freeze entity schemas for pilot

**Owner:** Agent + hub coordination

- JSON Schema for: Jurisdiction, OfficialSource, ChangeRecord, SummaryRecord
- Confirm field alignment with `caesar-ai-evidence` regulation-change (cross-repo issue or hub spec update)

### 4. Draft control & evidence mapping v0.1

**Owner:** Agent with review

- `mappings/controls/` and `mappings/evidence/` sample tables
- Relationship types: `may_affect`, `suggested_review` only
- Example: EU AI Office GPAI guidance → vendor review + model documentation evidence

---

## Safe autonomous tasks (after v0.2 approval)

- Add validated sample JSON under `data/` (no fetchers)
- JSON Schema validation script (language TBD — prefer zero new deps or hub-standard tool)
- Static HTML mock pages from samples (no framework lock-in yet)
- Update REPO_INVENTORY and CHANGELOG per change

---

## Requires control tower approval

- Any live HTTP fetch or crawler
- Changing review policy (e.g. publishing AI drafts without review)
- Importing third-party datasets (AI Legislation Tracker, OECD bulk)
- Package manager or CI workflow introduction
- Public domain DNS (`regulations.caesar.no`)

---

## Blocked until dependency clears

| Task | Blocked by |
|---|---|
| Evidence export validator test | `caesar-ai-evidence` regulation-change schema stability |
| Governance OS inbox implementation | OS repo and API spec |
| Automated AI summaries | Review workflow tooling decision |

---

## Cross-repository coordination

1. **caesar-ai-evidence** — regulation-change schema review
2. **caesar-ai-governance-hub** — control taxonomy reference in standards or specs
3. **caesar-ai-governance-os** — regulatory inbox module spec (documentation only for now)

---

## Suggested implementation order (first code)

When v0.2 is approved, implement in this order:

1. `data/` registry files + JSON Schema
2. Sample change records + mappings (manual)
3. Static site generator reading `data/` (minimal)
4. RSS/JSON export from same build
5. Only then: pilot watcher for one RSS source

This matches [ROADMAP.md](ROADMAP.md) v0.2 → v0.5.
