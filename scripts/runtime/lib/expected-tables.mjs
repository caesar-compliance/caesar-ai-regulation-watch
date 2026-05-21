#!/usr/bin/env node
/** Tables from ops/supabase/001_regulation_watch_runtime_schema.sql */
export const RUNTIME_SCHEMA_NAME = "public";

export const EXPECTED_RUNTIME_TABLES = [
  "regulation_sources",
  "source_runs",
  "source_snapshots",
  "source_items",
  "detected_changes",
  "review_candidates",
  "runtime_events",
];
