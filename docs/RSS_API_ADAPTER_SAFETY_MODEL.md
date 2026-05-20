# RSS / API adapter safety model

**Task:** T052  
**Status:** Architecture and offline validation only — **no live adapters enabled**

---

## Design principles

1. **Adapters are not scrapers** — RSS/Atom/API adapters read structured publication metadata (title, link, date, short summary snippet). They do not crawl site graphs, harvest article bodies, or store consolidated legal text.

2. **Allowlist-first** — Every adapter must appear in `data/source-adapters/source-adapter-allowlist.yml` with explicit `allowed_host`, `collection_mode`, and safety flags before any future run is discussed.

3. **Default off** — New adapters use `status: disabled` or `draft` and `collection_mode: fixture_only` or `manual_network_disabled`.

4. **No schedule until separately approved** — `schedule_enabled: false` is schema-enforced. Scheduled monitoring remains governed by [SCHEDULED_MONITORING_POLICY.md](SCHEDULED_MONITORING_POLICY.md).

5. **Metadata-only output** — Normalized candidates include `metadata_only: true` and closed evidence gates. Fixture parser writes to `generated/source-adapter-fixture-candidates.json` (local build artifact; not deployed as legal records).

---

## Collection modes

| Mode | Meaning |
|---|---|
| `fixture_only` | Parser/validator uses local XML fixtures only (`fixtures/source-adapters/`). |
| `manual_network_disabled` | Official URL registered; network fetch blocked until Control Tower approves adapter. |
| `manual_network_approved` | Reserved for future one-off manual runs; requires `status: approved_for_manual_run`. Still not scheduled automation. |

---

## Disallowed source classes

- Paywalled or login-required sources (`paywall_login_required: true` → reject at validation).
- Known CAPTCHA/WAF/bot-gate sources without explicit policy (e.g. EUR-Lex automated fetch stays `disabled`).
- Competitor trackers, law-firm dashboards, or proprietary datasets.
- Broad portal crawls (`broad_crawl_allowed` must remain `false`).

---

## Fixture-only prototype (T052)

```bash
npm run build:source-adapter-fixtures
```

- Reads `fixtures/source-adapters/rss-sample.xml` and `atom-sample.xml` only.
- **Never** fetches `endpoint_url` values from the allowlist.
- Proves normalization shape for future intake without network I/O.

---

## Gates (remain closed)

| Gate | T052 value |
|---|---|
| `verified_on_source` | `false` |
| `client_use_allowed` | `false` |
| `client_evidence_allowed` | `false` |
| `final_evidence_allowed` | `false` |
| `legal_change_claimed` | `false` |
| `legal_text_publication_allowed` | `false` |

Future live runs require **separate Control Tower approval** per adapter and per runbook — not implied by T052 merge.
