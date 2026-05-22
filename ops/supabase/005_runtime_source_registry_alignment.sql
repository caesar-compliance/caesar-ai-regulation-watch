-- T086 — Idempotent runtime source registry alignment (dev apply)
-- Upserts six automated pilot sources from monitoring-pilot-registry.yml.
-- Additive only. No destructive changes. Metadata-only.

INSERT INTO regulation_sources (
  source_key, source_name, source_type, source_url, status, metadata_only, schedule_enabled
) VALUES
  (
    'edpb-publications-rss',
    'European Data Protection Board (EDPB) — publications RSS',
    'rss',
    'https://www.edpb.europa.eu/feed/publications_en',
    'active',
    true,
    false
  ),
  (
    'edps-news-rss',
    'European Data Protection Supervisor (EDPS) — news RSS',
    'rss',
    'https://www.edps.europa.eu/feed/news_en',
    'active',
    true,
    false
  ),
  (
    'eu-digital-strategy-ai-framework',
    'European Commission — Digital strategy news RSS (AI policy)',
    'rss',
    'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    'active',
    true,
    false
  ),
  (
    'us-nist-ai-rmf',
    'NIST — News RSS (AI / cybersecurity policy signals)',
    'rss',
    'https://www.nist.gov/itl/ai-risk-management-framework',
    'active',
    true,
    false
  ),
  (
    'france-cnil-ai-fr',
    'CNIL — News RSS (French)',
    'rss',
    'https://www.cnil.fr/fr/intelligence-artificielle',
    'active',
    true,
    false
  ),
  (
    'uk-dsit-organisation',
    'UK DSIT — Department updates (GOV.UK Atom)',
    'atom',
    'https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology',
    'active',
    true,
    false
  )
ON CONFLICT (source_key) DO UPDATE SET
  source_name = EXCLUDED.source_name,
  source_type = EXCLUDED.source_type,
  source_url = EXCLUDED.source_url,
  metadata_only = EXCLUDED.metadata_only,
  schedule_enabled = EXCLUDED.schedule_enabled,
  updated_at = NOW();
