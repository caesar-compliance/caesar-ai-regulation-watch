-- T079 — REST API grants for Worker / service_role (metadata-only runtime tables)
-- Apply after 001_regulation_watch_runtime_schema.sql on dev Supabase.

GRANT SELECT, INSERT, UPDATE ON public.regulation_sources TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.source_runs TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.source_snapshots TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.source_items TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.detected_changes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.review_candidates TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.runtime_events TO service_role;
