/**
 * T078 — Runtime monitoring public exports (build-time JSON).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

function readJson<T>(name: string, fallback: T): T {
  const full = path.join(PUBLIC_DATA, name);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8")) as T;
}

export interface MonitoringStatus {
  generated_at?: string;
  status?: string;
  backend_mvp?: string;
  monitored_source_count?: number;
  automated_source_count?: number;
  automated_rss_source_count?: number;
  manual_source_count?: number;
  manual_review_source_count?: number;
  detected_changes_count?: number;
  review_candidates_count?: number;
  export_source?: string;
  live_ingestion_enabled?: boolean;
  scheduled_monitoring_enabled?: boolean;
  latest_run?: {
    run_id: string;
    source_key: string;
    status: string;
    item_count: number;
  } | null;
  review_required?: boolean;
  public_note?: string;
}

export interface DetectedChangeExport {
  change_id: string;
  source_key: string;
  change_type: string;
  change_summary: string;
  review_status: string;
  detected_at: string;
  review_required: boolean;
}

export interface ReviewCandidateExport {
  candidate_id: string;
  proposed_title: string | null;
  proposed_summary: string | null;
  source_url: string | null;
  jurisdiction_ids: string[];
  candidate_status: string;
  review_required: boolean;
}

export interface MapMarker {
  jurisdiction_id: string;
  label: string;
  region: string;
  status_bucket?: string;
  status_headline?: string;
  maturity_index?: number;
  activity_index?: number;
  maturity_score: number;
  activity_score: number;
  freshness_score?: number;
  confidence_score?: number;
  maturity_level?: string;
  activity_level?: string;
  source_freshness?: string;
  coverage_confidence?: string;
  monitored_source_count?: number;
  source_count?: number;
  regulation_count?: number;
  review_required: boolean;
  review_status?: string;
}

export interface RegulationRecordExport {
  regulation_id: string;
  jurisdiction_id: string;
  title: string;
  source_url: string;
  source_type: string;
  status: string;
  date_published?: string | null;
  effective_date?: string | null;
  obligation_date?: string | null;
  topic_tags: string[];
  affected_actor_tags?: string[];
  short_summary: string;
  review_status: string;
  review_required: boolean;
}

export interface JurisdictionProfileCard {
  jurisdiction_id: string;
  display_name: string;
  region: string;
  status_headline: string;
  maturity_level: string;
  activity_level: string;
  source_freshness: string;
  coverage_confidence: string;
  monitored_sources_count: number;
  regulation_records_count: number;
  maturity_score: number;
  activity_score: number;
  freshness_score: number;
  confidence_score: number;
  review_status: string;
  review_required: boolean;
}

export interface TrackerSummary {
  countries_covered?: number;
  regulations_tracked?: number;
  monitored_source_count?: number;
  automated_source_count?: number;
  manual_review_source_count?: number;
  detected_changes_count?: number;
  review_candidates_count?: number;
  scheduled_monitoring_enabled?: boolean;
  live_ingestion_enabled?: boolean;
  status?: string;
}

export function getMonitoringStatus(): MonitoringStatus {
  return readJson<MonitoringStatus>("runtime-monitoring-status.json", {
    status: "not_generated",
    review_required: true,
  });
}

export function getDetectedChanges(): DetectedChangeExport[] {
  const data = readJson<{ changes?: DetectedChangeExport[] }>(
    "regulation-detected-changes.json",
    { changes: [] },
  );
  return data.changes ?? [];
}

export function getReviewCandidates(): ReviewCandidateExport[] {
  const data = readJson<{ candidates?: ReviewCandidateExport[] }>(
    "regulation-review-candidates.json",
    { candidates: [] },
  );
  return data.candidates ?? [];
}

export function getMapMarkers(): MapMarker[] {
  const data = readJson<{ markers?: MapMarker[] }>("regulation-map-metrics.json", {
    markers: [],
  });
  return data.markers ?? [];
}

export function getCountryCoverage() {
  const data = readJson<{ jurisdictions?: unknown[] }>(
    "regulation-country-coverage.json",
    { jurisdictions: [] },
  );
  return data.jurisdictions ?? [];
}

export function coverageForJurisdiction(jurisdictionId: string) {
  const rows = getCountryCoverage() as {
    jurisdiction_id: string;
    display_name?: string;
    status_headline?: string;
    monitored_sources?: { source_key: string; source_name: string; official_url: string; fetch_mode: string }[];
    automated_sources?: number;
    manual_sources?: number;
    regulation_records_count?: number;
    maturity_index?: number;
    activity_index?: number;
    freshness_score?: number;
    confidence_score?: number;
  }[];
  return rows.find((r) => r.jurisdiction_id === jurisdictionId) ?? null;
}

export function getRegulationRecords(): RegulationRecordExport[] {
  const data = readJson<{ records?: RegulationRecordExport[] }>(
    "regulation-records.json",
    { records: [] },
  );
  return data.records ?? [];
}

export function regulationRecordsForJurisdiction(jurisdictionId: string) {
  return getRegulationRecords().filter((r) => r.jurisdiction_id === jurisdictionId);
}

export function getJurisdictionProfileCards(): JurisdictionProfileCard[] {
  const data = readJson<{ cards?: JurisdictionProfileCard[] }>(
    "jurisdiction-profile-cards.json",
    { cards: [] },
  );
  return data.cards ?? [];
}

export function profileCardForJurisdiction(jurisdictionId: string) {
  return (
    getJurisdictionProfileCards().find((c) => c.jurisdiction_id === jurisdictionId) ??
    null
  );
}

export function getTrackerSummary(): TrackerSummary {
  return readJson<TrackerSummary>("tracker-summary.json", {});
}

export function mapMarkerForJurisdiction(jurisdictionId: string) {
  return getMapMarkers().find((m) => m.jurisdiction_id === jurisdictionId) ?? null;
}
