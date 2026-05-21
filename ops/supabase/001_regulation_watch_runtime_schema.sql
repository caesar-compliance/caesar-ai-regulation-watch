-- Caesar AI Regulation Watch — automation runtime schema (T073)
-- NOT applied automatically by T073. Apply manually after Supabase project bootstrap.
-- Metadata-only monitoring. No full legal text storage.

CREATE TABLE IF NOT EXISTS regulation_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata_only BOOLEAN NOT NULL DEFAULT TRUE,
  schedule_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regulation_sources_status ON regulation_sources (status);
CREATE INDEX IF NOT EXISTS idx_regulation_sources_schedule ON regulation_sources (schedule_enabled);

CREATE TABLE IF NOT EXISTS source_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL REFERENCES regulation_sources (source_key),
  run_type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  item_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_runs_source_key ON source_runs (source_key);
CREATE INDEX IF NOT EXISTS idx_source_runs_status ON source_runs (status);
CREATE INDEX IF NOT EXISTS idx_source_runs_started_at ON source_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS source_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL REFERENCES regulation_sources (source_key),
  run_id UUID REFERENCES source_runs (id),
  snapshot_hash TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL,
  storage_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_snapshots_source_key ON source_snapshots (source_key);
CREATE INDEX IF NOT EXISTS idx_source_snapshots_captured_at ON source_snapshots (captured_at DESC);

CREATE TABLE IF NOT EXISTS source_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL REFERENCES regulation_sources (source_key),
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  summary_excerpt TEXT,
  content_hash TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_key, external_id)
);

CREATE INDEX IF NOT EXISTS idx_source_items_source_key ON source_items (source_key);
CREATE INDEX IF NOT EXISTS idx_source_items_last_seen ON source_items (last_seen_at DESC);

CREATE TABLE IF NOT EXISTS detected_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL REFERENCES regulation_sources (source_key),
  item_id UUID REFERENCES source_items (id),
  change_type TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  old_hash TEXT,
  new_hash TEXT,
  detected_at TIMESTAMPTZ NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'pending',
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detected_changes_source_key ON detected_changes (source_key);
CREATE INDEX IF NOT EXISTS idx_detected_changes_review_status ON detected_changes (review_status);
CREATE INDEX IF NOT EXISTS idx_detected_changes_detected_at ON detected_changes (detected_at DESC);

CREATE TABLE IF NOT EXISTS review_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_change_id UUID REFERENCES detected_changes (id),
  candidate_status TEXT NOT NULL DEFAULT 'draft',
  jurisdiction_ids TEXT[] NOT NULL DEFAULT '{}',
  topic_ids TEXT[] NOT NULL DEFAULT '{}',
  proposed_title TEXT,
  proposed_summary TEXT,
  source_url TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_candidates_status ON review_candidates (candidate_status);

CREATE TABLE IF NOT EXISTS runtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_status TEXT NOT NULL,
  source_key TEXT,
  message TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runtime_events_type ON runtime_events (event_type);
CREATE INDEX IF NOT EXISTS idx_runtime_events_created_at ON runtime_events (created_at DESC);
