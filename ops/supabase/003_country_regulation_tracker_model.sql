-- T080 — Country/regulation tracker model (additive, idempotent)
-- Apply manually when dev Supabase credentials are configured.
-- Metadata-only. No full legal text storage.

CREATE TABLE IF NOT EXISTS jurisdiction_profiles (
  jurisdiction_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  region TEXT NOT NULL,
  status_headline TEXT,
  maturity_level TEXT,
  activity_level TEXT,
  source_freshness TEXT,
  coverage_confidence TEXT,
  monitored_sources_count INTEGER NOT NULL DEFAULT 0,
  regulation_records_count INTEGER NOT NULL DEFAULT 0,
  review_status TEXT NOT NULL DEFAULT 'review_required',
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regulation_records (
  regulation_id TEXT PRIMARY KEY,
  jurisdiction_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',
  date_published DATE,
  effective_date DATE,
  obligation_date DATE,
  topic_tags TEXT[] NOT NULL DEFAULT '{}',
  affected_actor_tags TEXT[] NOT NULL DEFAULT '{}',
  short_summary TEXT,
  review_status TEXT NOT NULL DEFAULT 'review_required',
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regulation_records_jurisdiction ON regulation_records (jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_regulation_records_status ON regulation_records (status);

CREATE TABLE IF NOT EXISTS regulation_record_sources (
  regulation_id TEXT NOT NULL REFERENCES regulation_records (regulation_id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  official_url TEXT NOT NULL,
  fetch_mode TEXT NOT NULL DEFAULT 'manual_review',
  PRIMARY KEY (regulation_id, source_key)
);

CREATE TABLE IF NOT EXISTS map_metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id TEXT NOT NULL,
  maturity_score INTEGER NOT NULL DEFAULT 0,
  activity_score INTEGER NOT NULL DEFAULT 0,
  freshness_score INTEGER NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  latest_change_at TIMESTAMPTZ,
  source_count INTEGER NOT NULL DEFAULT 0,
  regulation_count INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_map_metric_snapshots_jurisdiction ON map_metric_snapshots (jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_map_metric_snapshots_captured_at ON map_metric_snapshots (captured_at DESC);

-- Service role grants (dev writes via Worker/scripts)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON jurisdiction_profiles TO service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON regulation_records TO service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON regulation_record_sources TO service_role;
    GRANT SELECT, INSERT, UPDATE ON map_metric_snapshots TO service_role;
  END IF;
END $$;
