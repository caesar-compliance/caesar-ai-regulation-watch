# Caesar AI Regulation Watch (`caesar-ai-regulation-watch`)

> Automated regulatory tracking feed and controls mapping engine, part of the [Caesar AI Governance Hub](https://github.com/caesar-compliance/caesar-ai-governance-hub) ecosystem.

---

## 📖 Overview

**`caesar-ai-regulation-watch`** is an automated crawler and parser designed to track legislative updates—such as EU AI Act amendments, official guidelines, NIST AI RMF releases, and local Norway implementations—and map them directly to internal corporate compliance controls.

This repository serves as a watcher and regulatory registry within the Caesar AI Governance Hub ecosystem at [caesar.no](https://caesar.no), bridging abstract legal texts with actionable codebase controls.

### 🚦 Project Status
> [!NOTE]
> This repository is currently in the **repository foundation** stage. Legislative crawlers, parse patterns, and control-to-clause databases are scheduled for subsequent development phases.

---

## 👥 Who It Is For

*   **Legal Counsel & Compliance Officers:** To monitor real-time updates in global AI regulations and see how legislative revisions impact existing compliance mandates.
*   **CTOs & AI Systems Owners:** To bridge abstract legal texts into concrete, technical requirements that need verification in active systems.
*   **AI Auditors:** To verify that controls are mapped directly to active legislative clauses (e.g., EU AI Act Article 9 risk criteria).

---

## 🛠️ How It Connects

### 1. Caesar AI Governance Hub Connection
`caesar-ai-regulation-watch` is the legal intelligence layer of the ecosystem. It monitors the shifting regulatory landscape, updating high-level policy frameworks and control maps that dictate auditing parameters within the hub.

### 2. Connection to `caesar-ai-evidence`
All parsed policy updates, new checklists, and compliance mappings are compiled and exported strictly matching the `regulation-change` schemas maintained in [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence).

---

## ⚖️ Important Disclaimer

> [!IMPORTANT]
> **No Compliance Guarantees:** `caesar-ai-regulation-watch` is a data tracking and policy parsing tool that maps public legislative texts to compliance controls. It **does not guarantee regulatory compliance**, legal clearance, or audit approvals. Regulatory compliance remains a holistic legal, operational, and organizational state determined by accredited auditors, legal experts, and competent authorities.

---

## 📂 Repository Directory

*   **[SPEC.md](SPEC.md)** — Legislative sources registries, parser models, and control maps specs.
*   **[ARCHITECTURE.md](ARCHITECTURE.md)** — Scraper modules layout, parsing pipelines, and mapping databases.
*   **[ROADMAP.md](ROADMAP.md)** — Multi-phase project development roadmap.
*   **[CHANGELOG.md](CHANGELOG.md)** — Chronological release history.
*   **[REPO_INVENTORY.md](REPO_INVENTORY.md)** — Structural file index of this codebase.
*   **[PROJECT_STATE.md](PROJECT_STATE.md)** — Project phase, metadata tracker, and boundaries.
*   **[NEXT_ACTIONS.md](NEXT_ACTIONS.md)** — Task execution lists and autonomous boundaries.
*   **[docs/RESEARCH_CONTEXT.md](docs/RESEARCH_CONTEXT.md)** — Functional domain research and strategic context.
*   **[docs/DECISION_LOG.md](docs/DECISION_LOG.md)** — Architectural decision log history.
