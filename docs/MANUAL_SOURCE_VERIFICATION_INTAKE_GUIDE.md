# Manual source verification intake guide

**Audience:** Control Tower (Artem) and qualified reviewers  
**Version:** v1.0.3  
**Data file pattern:** `data/verifications/manual-source-verification-intake-*.yml`

Use this guide when automated or headless checks are blocked (WAF, bot gate, timeout, 403) and official identity must be confirmed in a **real human browser**.

---

## Principles

- **Official URL only** — open the URL in `official_url`; follow redirects manually and record `final_url`.
- **No full text storage** — record short visible metadata only (title, publisher, date, identifier). Do not paste instrument body text into YAML or notes.
- **No legal advice** — observations describe what was visible, not compliance conclusions.
- **Do not bypass protections** — no CAPTCHA-solving services, scrapers, or competitor mirrors for verification.
- **This intake does not auto-set `verified_on_source`** — completing an intake supports a future Control Tower gate decision only.

---

## Steps for qualified reviewer

1. Open the intake entry in the latest batch (v1.0.3: `manual-source-verification-intake-2026-05-20-v103.yml`).
2. In a normal desktop browser (logged in or not per your standard test profile), navigate to `official_url`.
3. If the page loads, set `browser_observation.page_loaded: true` and fill:
   - `visible_title` — browser tab or H1-level title (short)
   - `visible_publisher` — e.g. "European Union", "Australian Government"
   - `visible_date` — only if clearly shown on the page (or `null`)
   - `celex_or_official_identifier` — e.g. `32024R1689` when visible on EUR-Lex
   - `final_url` — URL after redirects
4. Set `source_identity_confirmed: true` only if domain, branding, and page purpose match the registry source.
5. For **legal instruments**, set `full_instrument_identity_confirmed: true` only if the official legal text page shows the expected regulation title and identifier (not a summary microsite alone).
6. Keep `content_not_copied`, `no_legal_advice`, `no_full_text_storage` as `true`.
7. Keep `client_use_allowed`, `final_evidence_allowed`, `verified_on_source_requested`, `verified_on_source_approved` as **`false`**.
8. Add a short `reviewer_note` (max 500 characters) — workflow notes only, no copied clauses.
9. Update `limitations` with anything that prevented full confirmation (language, partial load, PDF-only, etc.).
10. Set `intake_status` to `observation_recorded` or `identity_confirmed_pending_control_tower` as appropriate.
11. Set `next_action` to `submit_to_control_tower` when ready for Artem review.

---

## If the page does not load

- Set `page_loaded: false` (or leave `null` if not attempted yet).
- Leave observation text fields `null`.
- Keep `source_identity_confirmed` and `full_instrument_identity_confirmed` as `false`.
- Document the blocker in `limitations` (403, timeout, bot gate, geo block).
- Set `intake_status: pending_human_browser_input` and `next_action: await_qualified_human_browser`.

Do **not** fill plausible titles from memory or secondary sources.

---

## EUR-Lex (EU AI Act) specifics

- Use **`access_method: human_browser_with_js`** — JavaScript must be enabled.
- Target CELEX **32024R1689** on EUR-Lex; confirm instrument identity on the official legal content view.
- EC digital-strategy or press pages may be noted in `limitations` as corroboration only — they do not satisfy `full_instrument_identity_confirmed` alone.

---

## After intake

- Control Tower reviews against [VERIFIED_ON_SOURCE_POLICY.md](./VERIFIED_ON_SOURCE_POLICY.md).
- Update `source-verification-*.yml` / `content-review-*.yml` in a separate commit if needed.
- **`verified_on_source: true` on records** requires explicit Control Tower approval in a follow-up release — not implied by intake completion.

---

## Validation

Run `npm run validate:data` after editing intake YAML. Policy checks reject `client_use_allowed: true`, `verified_on_source_approved: true`, and long pasted text in `reviewer_note`.
