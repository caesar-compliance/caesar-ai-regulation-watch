# Development Roadmap — caesar-ai-regulation-watch

This document outlines the core developmental milestones and phases planned for `caesar-ai-regulation-watch`.

---

## 🚦 Project Phases

```
v0.1 Foundation ──> v0.2 Mapping Draft ──> v0.3 Scraper Rules ──> v0.4 UI Dashboard ──> v1.0 Stable
```

### Phase v0.1 — Repository Foundation
*   **Goal:** Establish clean repository layout, standards documentation, license parameters, and workspace registries.
*   **Status:** **Active / Complete** (19 May 2026)
*   **Key Deliverables:**
    *   Shared Caesar ecosystem scaffolding (`PROJECT_STATE.md`, `NEXT_ACTIONS.md`, `docs/DECISION_LOG.md`).
    *   System specifications and module data-flow maps (`SPEC.md`, `ARCHITECTURE.md`).

### Phase v0.2 — First Functional Mapping Draft
*   **Goal:** Establish the baseline control-to-clause database structures and YAML mapping files.
*   **Status:** Planned
*   **Key Deliverables:**
    *   Relational mapping registry mapping Article 9/14/50 to controls.
    *   LIGHT CLI registry reader printing regulatory checklists.

### Phase v0.3 — Scraper Rules & Source Registries
*   **Goal:** Construct scheduled cron parser scripts and retrieve official EU/Norway legislative updates.
*   **Status:** Planned
*   **Key Deliverables:**
    *   Scraper adapters for EUR-Lex RSS feeds.
    *   Content extractor normalizer libraries.
    *   Exporter formatted to `caesar-ai-evidence` schemas.

### Phase v0.4 — UI Dashboard & Static Site
*   **Goal:** Build static public site and warning alerts.
*   **Status:** Planned
*   **Key Deliverables:**
    *   Static site generator hosting AI Act timelines.
    *   Webhook change alerts (Slack/Teams).

### Phase v1.0 — Stable Initial Release
*   **Goal:** Verified scheduled regulatory watcher service.
*   **Status:** Planned
*   **Key Deliverables:**
    *   Real-time monitoring of 5+ global regulatory sources.
    *   Central integration feeding legal updates to `caesar-ai-governance-os`.
