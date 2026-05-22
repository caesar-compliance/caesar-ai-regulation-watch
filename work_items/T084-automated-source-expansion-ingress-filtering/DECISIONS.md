# T084 — Decisions

## Automated source promotions (verified 2026-05-22)

| source_key | Feed | Result |
|---|---|---|
| `eu-digital-strategy-ai-framework` | `https://digital-strategy.ec.europa.eu/en/rss.xml` | HTTP 200 RSS |
| `us-nist-ai-rmf` | `https://www.nist.gov/news-events/news/rss.xml` | HTTP 200 RSS |
| `france-cnil-ai-fr` | `https://www.cnil.fr/fr/rss.xml` | HTTP 200 RSS |
| `uk-dsit-organisation` | GOV.UK Atom | HTTP 200 Atom |

## Kept manual (audit)

| source_key | Reason |
|---|---|
| `uk-ico-ai-guidance` | ICO news RSS URL 404 |
| `us-ftc-ai-guidance` | FTC feeds HTTP 403 |
| `oecd-ai-policy-observatory` | No stable RSS (404) |
| `council-of-europe-ai-framework` | RSS probe 403/WAF |
| `eur-lex-ai-act-entry` | EUR-Lex WAF — high fetch_risk |
| Other law portals / hubs | No stable metadata feed or page-only |

## Ingress filtering

- Suppressed items remain in `cards[]` full export; default UI uses `operator_queue_cards` (non-suppressed ingress only).
- Operator decisions override suppression for active workflow states.
- `suppress_noise` uses T083 relevance + recommended action + per-source `default_signal_threshold`.
- Public suppressed section exposes metadata only (title, reason_codes) — no extra body text.

## Worker

- `PILOT_ALLOWLIST` extended to 6 keys; deploy required when Worker code changes.
