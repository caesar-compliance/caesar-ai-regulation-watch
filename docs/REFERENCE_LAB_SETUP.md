# Reference Lab Setup — Caesar Regulation Watch

**Date:** 20 May 2026  
**Status:** Operational guide for local competitor and open-source study

---

## 1. Shared local path

All Caesar compliance reference material for Regulation Watch lives under:

```text
~/Desktop/Projects/caesar-compliance/_reference-lab/
```

Regulation Watch–specific content:

```text
~/Desktop/Projects/caesar-compliance/_reference-lab/regulation-watch/
├── notes/                    # Study indexes (OPEN_SOURCE_REPOS_CLONED.md, PUBLIC_SITE_CAPTURES.md)
├── repos/                    # Git clones (read-only study)
│   ├── delschlangen-ai-legislation-tracker/
│   └── riadeane-airegulationmap/
└── site-captures/            # Single-request curl HTML + capture notes (not full crawls)
    ├── techieray/
    ├── the-legal-wire/
    ├── iapp/
    ├── dla-piper/
    └── bird-and-bird/
```

Product repo (Caesar-native outputs only):

```text
~/Desktop/Projects/caesar-compliance/caesar-ai-regulation-watch/
```

---

## 2. What belongs in the reference lab

| Belongs in `_reference-lab` | Does not belong in product repos |
|-----------------------------|----------------------------------|
| Git clones of open-source trackers | Full clone trees |
| `curl` HTML captures for UX study | Raw `page.html` from competitors |
| Capture **notes** (Caesar-written observations) | Competitor marketing copy |
| Screenshots (if taken later) | Screenshot archives in git |
| License files from upstream repos | Upstream `node_modules`, `dist`, datasets |
| Clone metadata (commit SHA, date) | `regdata.js`, `regulation_data.csv`, etc. |

The lab is a **local research workspace**. It is not published with Caesar product sites and should not be committed into `caesar-ai-regulation-watch`.

---

## 3. What must never enter a Caesar repo

From `REFERENCE_DRIVEN_BUILD_POLICY.md` and T047 constraints:

1. **Competitor code** — HTML, CSS, JS bundles, WordPress plugins, map dist files.
2. **Competitor datasets** — jurisdiction tables, `regdata.js`, scraped CSV/JSON corpora.
3. **Competitor text** — country summaries, law firm guides, IAPP article body, table images with proprietary write-ups.
4. **Full page captures** — raw `page.html` dumps used only in the lab.
5. **GPL-3.0 source** — e.g. `riadeane/airegulationmap` frontend modules (reference-only).
6. **Unverified third-party rows** — even MIT datasets must be re-checked against official sources before any Caesar seed import.

Allowed in Caesar repos:

- Original summaries and findings (this doc set).
- Feature matrices and architecture notes.
- Implementation backlog and task plans.
- Properly licensed, explicitly approved imports with `THIRD_PARTY_NOTICES.md` entries.

---

## 4. How to use the lab (read-only workflow)

1. **Clone or refresh** reference repos into `regulation-watch/repos/` (outside product git).
2. **Capture** public competitor URLs with documented method (`curl`, notes only in lab).
3. **Study** structure, UX patterns, data dimensions — write observations in lab `notes.md` or Caesar `docs/`.
4. **Decide** license path (rewrite vs attributed MIT import vs blocked).
5. **Implement** in product repo via clean-room Caesar code and official-source data only.

Never edit `_reference-lab` from product automation tasks except lab maintenance tasks explicitly scoped to the compliance repo.

---

## 5. How other Caesar projects should reuse the same lab

| Project | Suggested lab subfolder | Product outputs |
|---------|-------------------------|-----------------|
| `caesar-ai-regulation-watch` | `regulation-watch/` | Tracker docs, schemas, Astro UI |
| `caesar-ai-evidence` | `evidence/` (future) | Evidence mapping patterns only |
| `caesar-ai-governance-hub` | Hub-level index linking to lab paths | Cross-product links, no clones |
| Other compliance repos | `_reference-lab/<product>/` | Same pattern: lab = raw, product = native |

**Rules for all Caesar projects:**

- One shared `_reference-lab` under `caesar-compliance` (or org-agreed path).
- Product repos link to lab path in docs; they do not submodule the lab.
- Study outputs flow in as **markdown specs**, not lab files.
- GLOBAL / per-product reference policy documents stay in product `docs/`.

---

## 6. Regulation Watch lab inventory (May 2026)

| Asset | Purpose |
|-------|---------|
| `delschlangen-ai-legislation-tracker` | MIT — JSON legislation model, CLI query patterns |
| `riadeane-airegulationmap` | GPL-3.0 — map/score UX reference only |
| Techieray capture notes | Map + feed + metrics + compare patterns |
| The Legal Wire capture notes | Country cards + source links |
| IAPP capture notes | Professional resource framing |
| DLA Piper capture notes | Multi-jurisdiction filter + compare + editions |
| Bird & Bird capture notes | Status matrix + jurisdiction hub |

See T047 outputs: `COMPETITOR_FEATURE_MATRIX.md`, `OPEN_SOURCE_ARCHITECTURE_FINDINGS.md`, `PUBLIC_COMPETITOR_UX_FINDINGS.md`.

---

## 7. Related Caesar docs

- [REFERENCE_DRIVEN_BUILD_POLICY.md](REFERENCE_DRIVEN_BUILD_POLICY.md)
- [THIRD_PARTY_CODE_AND_DATA_POLICY.md](THIRD_PARTY_CODE_AND_DATA_POLICY.md)
- [AUTOMATION_FIRST_PRODUCT_CHARTER.md](AUTOMATION_FIRST_PRODUCT_CHARTER.md)
- [COMPETITOR_FEATURE_MATRIX.md](COMPETITOR_FEATURE_MATRIX.md)
