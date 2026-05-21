/**
 * Load curated YAML from data/ at build time. No remote fetching.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export type ReviewStatus =
  | "draft"
  | "pending_review"
  | "reviewed"
  | "reviewed_source_identity_only"
  | "needs_update"
  | "needs_human_review"
  | "rejected_for_client_use"
  | "archived";

export interface JurisdictionMapMeta {
  display_name: string;
  latitude: number;
  longitude: number;
  marker_type: "country_capital" | "institutional" | "international_framework" | "display_only";
  coverage_status: "pilot" | "expanded" | "international" | "high_priority";
  map_note: string;
}

export interface Jurisdiction {
  jurisdiction_id: string;
  name: string;
  type: string;
  region: string;
  parent_jurisdiction?: string | null;
  related_frameworks?: string[];
  regulatory_focus: string[];
  monitoring_priority: string;
  notes: string;
  review_status: ReviewStatus;
  map: JurisdictionMapMeta;
}

export interface Source {
  source_id: string;
  title: string;
  jurisdiction_id: string;
  source_type: string;
  credibility_level: string;
  official_url: string | null;
  monitoring_scope: string;
  expected_update_types: string[];
  related_topics: string[];
  review_status: ReviewStatus;
  notes: string;
}

export interface KeyDate {
  label: string;
  date: string;
  verified_on_source?: boolean;
  notes?: string;
}

export type RecordType = "law" | "guidance" | "policy_framework" | "implementation_update";

export type VerificationCheckResult =
  | "reachable_matches_expected_source"
  | "reachable_needs_human_review"
  | "unreachable"
  | "redirected"
  | "not_checked"
  | "uncertain";

export type UrlCheckResult =
  | "reachable"
  | "reachable_redirected"
  | "unreachable"
  | "timeout"
  | "dns_error"
  | "network_error"
  | "not_checked"
  | "uncertain";

export type ContentReviewStatus =
  | "not_reviewed"
  | "needs_human_review"
  | "reviewed_source_identity_only"
  | "reviewed_content_summary"
  | "needs_update"
  | "rejected_for_client_use";

export type ContentReviewResult =
  | "matches_source_at_high_level"
  | "partially_matches_source"
  | "source_support_unclear"
  | "needs_update"
  | "rejected_for_client_use"
  | "not_checked";

export type SourceSupportLevel = "high" | "medium" | "low" | "unclear";

export interface ContentReviewEntry {
  content_review_id: string;
  review_date: string;
  reviewer_type: string;
  item_type:
    | "law"
    | "guidance"
    | "policy_framework"
    | "implementation_update"
    | "detected_change"
    | "timeline_event";
  item_id: string;
  jurisdiction_id: string;
  source_id: string;
  official_url_checked: string;
  review_scope: string;
  review_result: ContentReviewResult;
  source_support_level: SourceSupportLevel;
  reviewed_fields: string[];
  fields_needing_update: string[];
  summary_review_note: string;
  date_review_note: string;
  status_review_note: string;
  recommended_next_action: string;
  content_review_status_after_check: ContentReviewStatus;
  verified_on_source_after_check: boolean;
  client_use_allowed: boolean;
  legal_safe_note: string;
}

export interface ContentReviewBatch {
  content_review_batch_id: string;
  review_date: string;
  verifier_type: string;
  content_reviews: ContentReviewEntry[];
  legal_safe_note: string;
}

export type ContentReviewEntryWithBatch = ContentReviewEntry & {
  content_review_batch_id: string;
};

export interface UrlCheckEntry {
  url_check_id: string;
  checked_date: string;
  checker_type: string;
  item_type: "source" | "record" | "law" | "guidance";
  item_id: string;
  source_id?: string;
  original_url: string;
  final_url: string;
  http_status: number | null;
  check_result: UrlCheckResult;
  redirect_detected: boolean;
  domain_matches_expected: boolean | null;
  title_or_reference?: string;
  technical_note?: string;
  content_review_status: ContentReviewStatus;
  client_use_allowed: boolean;
  legal_safe_note: string;
}

export interface UrlCheckBatch {
  url_check_batch_id: string;
  checked_date: string;
  checker_type: string;
  url_checks: UrlCheckEntry[];
  legal_safe_note: string;
}

export interface LawRecord {
  record_id: string;
  record_type: "law";
  record_origin: string;
  title: string;
  jurisdiction_id: string;
  source_id: string;
  legal_status: string;
  official_url: string;
  summary_for_review: string;
  key_dates: KeyDate[];
  affected_topics: string[];
  verified_on_source?: boolean;
  content_review_status?: ContentReviewStatus;
  last_content_review_id?: string;
  review_status: ReviewStatus;
  legal_safe_note: string;
}

export interface GuidanceRecord {
  record_id: string;
  record_type: "guidance" | "policy_framework" | "implementation_update";
  record_origin: string;
  title: string;
  jurisdiction_id: string;
  source_id: string;
  guidance_status: string;
  official_url: string;
  summary_for_review: string;
  affected_topics: string[];
  verified_on_source?: boolean;
  content_review_status?: ContentReviewStatus;
  last_content_review_id?: string;
  review_status: ReviewStatus;
  legal_safe_note: string;
}

export interface SourceVerificationEntry {
  verification_id: string;
  verified_date: string;
  verifier_type: string;
  item_type: "source" | "record" | "timeline_event" | "change";
  item_id: string;
  source_id: string;
  official_url_checked: string;
  check_result: VerificationCheckResult;
  page_title_or_reference?: string;
  notes?: string;
  review_status_after_check: ReviewStatus;
  client_use_allowed: boolean;
  legal_safe_note: string;
}

export interface SourceVerificationBatch {
  verification_batch_id: string;
  verified_date: string;
  verifier_type: string;
  verifications: SourceVerificationEntry[];
  legal_safe_note: string;
}

export type SourceVerificationEntryWithBatch = SourceVerificationEntry & {
  verification_batch_id: string;
};

export type ManualIntakeStatus =
  | "pending_human_browser_input"
  | "observation_recorded"
  | "identity_confirmed_pending_control_tower"
  | "submitted_for_control_tower"
  | "closed_no_verification";

export interface ManualBrowserObservation {
  page_loaded: boolean | null;
  visible_title: string | null;
  visible_publisher: string | null;
  visible_date: string | null;
  celex_or_official_identifier: string | null;
  final_url: string | null;
}

export interface ManualSourceVerificationIntakeEntry {
  intake_id: string;
  intake_status: ManualIntakeStatus;
  related_source_id: string;
  related_record_id?: string;
  related_candidate_id?: string;
  related_verification_id?: string;
  official_url: string;
  verification_target: string;
  access_method: string;
  reviewer_role: string;
  access_date: string;
  browser_observation: ManualBrowserObservation;
  source_identity_confirmed: boolean;
  full_instrument_identity_confirmed: boolean;
  content_not_copied: boolean;
  no_legal_advice: boolean;
  no_full_text_storage: boolean;
  client_use_allowed: boolean;
  final_evidence_allowed: boolean;
  verified_on_source_requested: boolean;
  verified_on_source_approved: boolean;
  limitations: string;
  reviewer_note?: string;
  next_action: string;
  legal_safe_note: string;
}

export interface ManualSourceVerificationIntakeBatch {
  manual_source_verification_intake_batch_id: string;
  intake_date: string;
  verifier_type: string;
  legal_safe_note: string;
  intakes: ManualSourceVerificationIntakeEntry[];
}

export type ManualSourceVerificationIntakeWithBatch = ManualSourceVerificationIntakeEntry & {
  manual_source_verification_intake_batch_id: string;
};

export type AutonomousVerificationResult =
  | "machine_verified_identity"
  | "official_api_verified_identity"
  | "official_sparql_verified_identity"
  | "browser_worker_verified_identity"
  | "official_alternative_verified_identity"
  | "machine_unverifiable"
  | "blocked_by_waf_or_bot_gate"
  | "access_failed"
  | "needs_human_policy_decision";

export interface AutonomousSourceVerificationEntry {
  verification_id: string;
  related_source_id: string;
  related_record_id?: string;
  related_candidate_id?: string;
  official_url: string;
  verification_strategy: string;
  verification_result: AutonomousVerificationResult;
  http_status: number | null;
  final_url: string | null;
  visible_or_extracted_title: string | null;
  official_identifier: string | null;
  publisher_or_authority: string | null;
  source_identity_confirmed: boolean;
  full_instrument_identity_confirmed: boolean;
  limitations: string;
  next_action: string;
  checked_at: string;
  strategies_attempted?: string[];
}

export interface AutonomousSourceVerificationBatch {
  autonomous_source_verification_batch_id: string;
  run_date: string;
  verifier_type: string;
  legal_safe_note: string;
  verifications: AutonomousSourceVerificationEntry[];
}

export type AutonomousSourceVerificationWithBatch = AutonomousSourceVerificationEntry & {
  autonomous_source_verification_batch_id: string;
};

export type RegulationRecord = (LawRecord | GuidanceRecord) & {
  status: string;
};

export interface ChangeRecord {
  change_id: string;
  record_origin: string;
  related_record_id: string;
  source_id: string;
  jurisdiction_id: string;
  detected_date: string;
  change_type: string;
  change_summary_for_review: string;
  confidence_level: string;
  requires_human_review: boolean;
  possible_impact: string;
  review_status: ReviewStatus;
  legal_safe_note: string;
}

export interface ExportRecord {
  export_record_id: string;
  source_change_id: string;
  jurisdiction_id: string;
  related_record_id: string;
  export_type: string;
  summary_for_review: string;
  may_affect_controls: { control_ref: string; rationale: string; reference_alignment: string }[];
  may_affect_evidence: { evidence_ref: string; rationale: string; reference_alignment: string }[];
  suggested_review_actions: { action_type: string; rationale: string; target_ref?: string }[];
  human_review_required: boolean;
  legal_safe_note: string;
  created_from: string;
  review_status: ReviewStatus;
}

export type EvidenceExportCandidateStatus =
  | "blocked_pending_content_review"
  | "blocked_simulation_only"
  | "ready_for_human_review"
  | "rejected_for_client_use";

export interface EvidenceExportCandidate {
  candidate_id: string;
  source_item_type: "change_record" | "detected_change";
  source_item_id: string;
  jurisdiction_id: string;
  source_id: string;
  related_record_id?: string;
  export_type: "regulation_change_candidate";
  candidate_status: EvidenceExportCandidateStatus;
  eligibility_reasons: string[];
  blocking_reasons: string[];
  summary_for_review: string;
  may_affect_controls: { control_ref: string; rationale: string; reference_alignment: string }[];
  may_affect_evidence: { evidence_ref: string; rationale: string; reference_alignment: string }[];
  suggested_review_actions: { action_type: string; rationale: string; target_ref?: string }[];
  human_review_required: true;
  client_use_allowed: false;
  verified_on_source_required: true;
  created_from: "manual_sample" | "watcher_detected_change" | "simulated_detected_change";
  content_review_id?: string;
  provenance: {
    generated_by: string;
    generated_at: string;
    source_data_paths: string[];
    mapping_ids?: string[];
    export_sample_record_id?: string;
  };
  legal_safe_note: string;
}

export interface EvidenceExportCandidateBatch {
  evidence_export_candidate_batch_id: string;
  generated_at: string;
  pipeline_version: string;
  legal_safe_note: string;
  candidates: EvidenceExportCandidate[];
}

export interface EvidenceExportCandidateWithBatch extends EvidenceExportCandidate {
  evidence_export_candidate_batch_id: string;
  candidate_review_status?: EvidenceExportCandidateReviewStatus | null;
  candidate_review_id?: string | null;
}

export type EvidenceExportCandidateReviewStatus =
  | "reviewed_for_internal_governance_only"
  | "needs_more_source_review"
  | "needs_mapping_review"
  | "rejected_for_export_candidate_use"
  | "review_not_applicable";

export interface EvidenceExportCandidateReview {
  candidate_review_id: string;
  candidate_id: string;
  review_date: string;
  reviewer_type: string;
  review_purpose: "governance_export_readiness_only";
  candidate_review_status: EvidenceExportCandidateReviewStatus;
  content_review_id?: string;
  governance_review_summary: string;
  checks_performed: string[];
  governance_findings?: string[];
  recommended_next_action?: string;
  human_review_required: true;
  client_use_allowed: false;
  final_evidence_allowed: false;
  qualified_advisor_review_required: true;
  legal_safe_note: string;
}

export interface EvidenceExportCandidateReviewBatch {
  evidence_export_candidate_review_batch_id: string;
  review_date: string;
  verifier_type: string;
  legal_safe_note: string;
  candidate_reviews: EvidenceExportCandidateReview[];
}

export interface TaxonomyValue {
  value_id: string;
  label: string;
  description: string;
}

export interface Taxonomy {
  taxonomy_id: string;
  title: string;
  values: TaxonomyValue[];
}

export interface TimelineEvent {
  event_id: string;
  date: string;
  event_type: string;
  title: string;
  summary_for_review: string;
  source_id: string;
  verified_on_source: boolean;
  review_status: ReviewStatus;
  legal_safe_note: string;
}

export interface Timeline {
  timeline_id: string;
  title: string;
  jurisdiction_id: string;
  related_record_id?: string | null;
  source_ids: string[];
  events: TimelineEvent[];
  review_status: ReviewStatus;
  legal_safe_note: string;
}

export type WatcherType =
  | "official_page_metadata"
  | "official_rss_or_feed"
  | "official_api_metadata"
  | "manual_only";

export interface OfficialWatcher {
  watcher_id: string;
  adapter_id?: string;
  source_id: string;
  jurisdiction_id: string;
  watcher_type: WatcherType;
  official_url: string;
  feed_url?: string;
  feed_format?: string;
  entry_identity_fields?: string[];
  entry_date_fields?: string[];
  max_entries_per_check?: number;
  create_detected_change_for_new_entries?: boolean;
  create_detected_change_for_changed_entries?: boolean;
  enabled: boolean;
  monitoring_scope: string;
  check_frequency_recommendation: string;
  change_detection_mode: string;
  snapshot_policy: string;
  review_status: ReviewStatus;
  legal_safe_note: string;
}

export interface SourceSnapshot {
  snapshot_id: string;
  watcher_id: string;
  source_id: string;
  jurisdiction_id: string;
  checked_at: string;
  original_url: string;
  final_url: string;
  http_status: number | null;
  content_type: string | null;
  etag: string | null;
  last_modified: string | null;
  title: string | null;
  content_hash: string | null;
  normalized_text_hash: string | null;
  content_length: number | null;
  snapshot_kind: "baseline" | "periodic_check" | "error_placeholder";
  storage_policy: string;
  fetch_error?: string;
  legal_safe_note: string;
}

export interface WatcherRunResult {
  watcher_id: string;
  source_id: string;
  status: string;
  snapshot_id: string | null;
  previous_snapshot_id?: string | null;
  detected_change_id: string | null;
  error_message: string | null;
}

export type WatcherRunMode = "live_manual" | "simulation" | "dry_run";

export interface WatcherRun {
  run_id: string;
  run_date: string;
  run_mode: WatcherRunMode;
  mode?: string;
  safe_mode?: boolean;
  fixture_only?: boolean;
  network_disabled?: boolean;
  preserves_latest_snapshots?: boolean;
  watcher_count: number;
  checked_count: number;
  changed_count: number;
  error_count: number;
  detected_change_ids?: string[];
  error_summaries?: { watcher_id: string; source_id: string; message: string }[];
  results: WatcherRunResult[];
  legal_safe_note: string;
}

export type SignificanceLevel = "low" | "medium" | "high";

export interface FeedSnapshotEntry {
  entry_id: string;
  guid?: string | null;
  link?: string | null;
  title?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  entry_hash: string;
}

export interface FeedSnapshot {
  snapshot_id: string;
  watcher_id: string;
  source_id: string;
  jurisdiction_id: string;
  adapter_id: "official_rss_or_feed";
  checked_at: string;
  feed_url: string;
  final_url: string;
  http_status: number | null;
  feed_title: string | null;
  feed_entry_count: number;
  entries: FeedSnapshotEntry[];
  entries_aggregate_hash: string | null;
  snapshot_kind: "feed_metadata" | "error_placeholder";
  storage_policy: string;
  fetch_error?: string;
  legal_safe_note: string;
}

export interface DetectedChange {
  detected_change_id: string;
  watcher_id: string;
  source_id: string;
  jurisdiction_id: string;
  detected_at: string;
  simulation?: boolean;
  adapter_id?: string;
  change_type: string;
  feed_entries_affected?: FeedSnapshotEntry[];
  api_results_affected?: {
    result_id: string;
    title?: string | null;
    link?: string | null;
    publication_date?: string | null;
  }[];
  error_category?: string;
  source_adapter_type?: string;
  changed_fields: string[];
  previous_snapshot_id: string;
  current_snapshot_id: string;
  previous_value_summary: Record<string, string>;
  current_value_summary: Record<string, string>;
  previous_snapshot_summary: Record<string, unknown>;
  current_snapshot_summary: Record<string, unknown>;
  ignored_fields?: string[];
  volatile_field_note?: string | null;
  minimum_change_policy?: string;
  change_summary_for_review: string;
  significance_level: SignificanceLevel;
  confidence_level?: SignificanceLevel;
  human_review_required: boolean;
  review_status: ReviewStatus;
  review_queue_reason: string;
  client_use_allowed: false;
  content_review_status?: ContentReviewStatus;
  last_content_review_id?: string;
  review_result?: ContentReviewResult;
  recommended_next_action?: string;
  legal_safe_note: string;
}

function readYamlDir<T>(dir: string): T[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")) as T);
}

function readYamlFile<T>(relPath: string): T | null {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return yaml.load(fs.readFileSync(abs, "utf8")) as T;
}

export function getJurisdictions(): Jurisdiction[] {
  return readYamlDir<Jurisdiction>("data/jurisdictions").sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getJurisdiction(id: string): Jurisdiction | undefined {
  return getJurisdictions().find((j) => j.jurisdiction_id === id);
}

export function getSources(): Source[] {
  return readYamlDir<Source>("data/sources").sort((a, b) => a.title.localeCompare(b.title));
}

export function getSource(id: string): Source | undefined {
  return getSources().find((s) => s.source_id === id);
}

export function getLaws(): LawRecord[] {
  return readYamlDir<LawRecord>("data/laws");
}

export function getGuidance(): GuidanceRecord[] {
  return readYamlDir<GuidanceRecord>("data/guidance");
}

export function getRecords(): RegulationRecord[] {
  const laws = getLaws().map((r) => ({ ...r, status: r.legal_status }));
  const guidance = getGuidance().map((r) => ({ ...r, status: r.guidance_status }));
  return [...laws, ...guidance].sort((a, b) => a.title.localeCompare(b.title));
}

export function getRecord(id: string): RegulationRecord | undefined {
  return getRecords().find((r) => r.record_id === id);
}

export function getChanges(): ChangeRecord[] {
  return readYamlDir<ChangeRecord>("data/changes").sort(
    (a, b) => b.detected_date.localeCompare(a.detected_date),
  );
}

export function getChange(id: string): ChangeRecord | undefined {
  return getChanges().find((c) => c.change_id === id);
}

export function getExportSamples(): ExportRecord[] {
  const file = readYamlFile<{ exports: ExportRecord[] }>(
    "exports/samples/regulation-change-export.sample.yml",
  );
  return file?.exports ?? [];
}

export function getEvidenceExportCandidateReviewBatches(): EvidenceExportCandidateReviewBatch[] {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter(
      (f) =>
        f.startsWith("evidence-export-candidate-review") &&
        (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .map((f) =>
      yaml.load(fs.readFileSync(path.join(abs, f), "utf8")) as EvidenceExportCandidateReviewBatch,
    )
    .sort((a, b) => b.review_date.localeCompare(a.review_date));
}

export function getEvidenceExportCandidateReviews(): (EvidenceExportCandidateReview & {
  evidence_export_candidate_review_batch_id: string;
})[] {
  return getEvidenceExportCandidateReviewBatches().flatMap((b) =>
    b.candidate_reviews.map((r) => ({
      ...r,
      evidence_export_candidate_review_batch_id: b.evidence_export_candidate_review_batch_id,
    })),
  );
}

function latestCandidateReviewByCandidateId(): Map<string, EvidenceExportCandidateReview> {
  const map = new Map<string, EvidenceExportCandidateReview>();
  for (const r of getEvidenceExportCandidateReviews()) {
    const existing = map.get(r.candidate_id);
    if (!existing || r.review_date >= existing.review_date) {
      map.set(r.candidate_id, r);
    }
  }
  return map;
}

export function getEvidenceExportCandidateBatches(): EvidenceExportCandidateBatch[] {
  return readYamlDir<EvidenceExportCandidateBatch>("data/evidence-export-candidates").sort(
    (a, b) => b.generated_at.localeCompare(a.generated_at),
  );
}

export function getEvidenceExportCandidates(): EvidenceExportCandidateWithBatch[] {
  const reviewByCandidate = latestCandidateReviewByCandidateId();
  return getEvidenceExportCandidateBatches().flatMap((b) =>
    b.candidates.map((c) => {
      const review = reviewByCandidate.get(c.candidate_id);
      return {
        ...c,
        evidence_export_candidate_batch_id: b.evidence_export_candidate_batch_id,
        candidate_review_status: review?.candidate_review_status ?? null,
        candidate_review_id: review?.candidate_review_id ?? null,
      };
    }),
  );
}

export function getEvidenceExportCandidate(id: string): EvidenceExportCandidateWithBatch | undefined {
  return getEvidenceExportCandidates().find((c) => c.candidate_id === id);
}

export function getTaxonomies(): Record<string, Taxonomy> {
  const files = readYamlDir<Taxonomy>("data/taxonomies");
  return Object.fromEntries(files.map((t) => [t.taxonomy_id, t]));
}

export function taxonomyLabel(
  taxonomies: Record<string, Taxonomy>,
  taxonomyId: string,
  valueId: string,
): string {
  const entry = taxonomies[taxonomyId]?.values.find((v) => v.value_id === valueId);
  return entry?.label ?? humanizeFallback(valueId);
}

function humanizeFallback(id: string): string {
  return id.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function sourcesForJurisdiction(jurisdictionId: string): Source[] {
  return getSources().filter((s) => s.jurisdiction_id === jurisdictionId);
}

export function recordsForJurisdiction(jurisdictionId: string): RegulationRecord[] {
  return getRecords().filter((r) => r.jurisdiction_id === jurisdictionId);
}

export function changesForJurisdiction(jurisdictionId: string): ChangeRecord[] {
  return getChanges().filter((c) => c.jurisdiction_id === jurisdictionId);
}

export function changesForRecord(recordId: string): ChangeRecord[] {
  return getChanges().filter((c) => c.related_record_id === recordId);
}

export function getTimelines(): Timeline[] {
  return readYamlDir<Timeline>("data/timelines").sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

export function getTimeline(id: string): Timeline | undefined {
  return getTimelines().find((t) => t.timeline_id === id);
}

export function timelinesForJurisdiction(jurisdictionId: string): Timeline[] {
  return getTimelines().filter((t) => t.jurisdiction_id === jurisdictionId);
}

export function timelinesForRecord(recordId: string): Timeline[] {
  return getTimelines().filter((t) => t.related_record_id === recordId);
}

function verificationYamlFiles(): string[] {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter(
      (f) =>
        (f.startsWith("source-verification") || f.startsWith("source-identity-review")) &&
        (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .map((f) => path.join(abs, f));
}

function urlCheckYamlFiles(): string[] {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.startsWith("url-check") && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .map((f) => path.join(abs, f));
}

function contentReviewYamlFiles(): string[] {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.startsWith("content-review") && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .map((f) => path.join(abs, f));
}

export function getVerificationBatches(): SourceVerificationBatch[] {
  return verificationYamlFiles()
    .map((f) => yaml.load(fs.readFileSync(f, "utf8")) as SourceVerificationBatch)
    .sort((a, b) => b.verified_date.localeCompare(a.verified_date));
}

export function getVerifications(): SourceVerificationEntryWithBatch[] {
  return getVerificationBatches().flatMap((b) =>
    b.verifications.map((v) => ({ ...v, verification_batch_id: b.verification_batch_id })),
  );
}

export function getSourceIdentityVerifications(): SourceVerificationEntryWithBatch[] {
  return getVerifications().filter((v) =>
    v.verification_batch_id.startsWith("source-identity-review"),
  );
}

export function getRecordContentVerifications(): SourceVerificationEntryWithBatch[] {
  return getVerifications().filter((v) =>
    v.verification_batch_id.startsWith("source-verification"),
  );
}

export function getContentReviewBatches(): ContentReviewBatch[] {
  return contentReviewYamlFiles()
    .map((f) => yaml.load(fs.readFileSync(f, "utf8")) as ContentReviewBatch)
    .sort((a, b) => b.review_date.localeCompare(a.review_date));
}

export function getContentReviews(): ContentReviewEntryWithBatch[] {
  return getContentReviewBatches().flatMap((b) =>
    b.content_reviews.map((cr) => ({
      ...cr,
      content_review_batch_id: b.content_review_batch_id,
    })),
  );
}

function manualIntakeYamlFiles(): string[] {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter(
      (f) =>
        f.startsWith("manual-source-verification-intake") &&
        (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .map((f) => path.join(abs, f));
}

export function getManualSourceVerificationIntakeBatches(): ManualSourceVerificationIntakeBatch[] {
  return manualIntakeYamlFiles()
    .map((f) => yaml.load(fs.readFileSync(f, "utf8")) as ManualSourceVerificationIntakeBatch)
    .sort((a, b) => b.intake_date.localeCompare(a.intake_date));
}

export function getManualSourceVerificationIntakes(): ManualSourceVerificationIntakeWithBatch[] {
  return getManualSourceVerificationIntakeBatches().flatMap((b) =>
    b.intakes.map((intake) => ({
      ...intake,
      manual_source_verification_intake_batch_id: b.manual_source_verification_intake_batch_id,
    })),
  );
}

function autonomousVerificationYamlFiles(): string[] {
  const abs = path.join(ROOT, "data/verifications");
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter(
      (f) =>
        f.startsWith("autonomous-source-verification-") &&
        !f.includes("allowlist") &&
        (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .map((f) => path.join(abs, f));
}

export function getAutonomousSourceVerificationBatches(): AutonomousSourceVerificationBatch[] {
  return autonomousVerificationYamlFiles()
    .map((f) => yaml.load(fs.readFileSync(f, "utf8")) as AutonomousSourceVerificationBatch)
    .sort((a, b) => b.run_date.localeCompare(a.run_date));
}

export function getAutonomousSourceVerifications(): AutonomousSourceVerificationWithBatch[] {
  return getAutonomousSourceVerificationBatches().flatMap((b) =>
    b.verifications.map((v) => ({
      ...v,
      autonomous_source_verification_batch_id: b.autonomous_source_verification_batch_id,
    })),
  );
}

export function latestContentReviewForItem(
  itemId: string,
): ContentReviewEntryWithBatch | undefined {
  const entries = getContentReviews().filter((cr) => cr.item_id === itemId);
  if (entries.length === 0) return undefined;
  return [...entries].sort((a, b) => b.review_date.localeCompare(a.review_date))[0];
}

export function latestIdentityVerificationForSource(
  sourceId: string,
): SourceVerificationEntryWithBatch | undefined {
  const entries = getSourceIdentityVerifications().filter(
    (v) => v.item_type === "source" && v.item_id === sourceId,
  );
  if (entries.length === 0) return undefined;
  return [...entries].sort((a, b) => b.verified_date.localeCompare(a.verified_date))[0];
}

export function getUrlCheckBatches(): UrlCheckBatch[] {
  return urlCheckYamlFiles()
    .map((f) => yaml.load(fs.readFileSync(f, "utf8")) as UrlCheckBatch)
    .sort((a, b) => b.checked_date.localeCompare(a.checked_date));
}

export function getUrlChecks(): UrlCheckEntry[] {
  return getUrlCheckBatches().flatMap((b) => b.url_checks);
}

export function latestUrlCheckForItem(
  itemType: string,
  itemId: string,
): UrlCheckEntry | undefined {
  const entries = getUrlChecks().filter(
    (c) => c.item_type === itemType && c.item_id === itemId,
  );
  if (entries.length === 0) return undefined;
  return [...entries].sort((a, b) => b.checked_date.localeCompare(a.checked_date))[0];
}

export function latestUrlCheckForSource(sourceId: string): UrlCheckEntry | undefined {
  const entries = getUrlChecks().filter(
    (c) => c.item_type === "source" && c.item_id === sourceId,
  );
  if (entries.length === 0) return undefined;
  return [...entries].sort((a, b) => b.checked_date.localeCompare(a.checked_date))[0];
}

export function verificationsForItem(itemId: string): SourceVerificationEntry[] {
  return getVerifications().filter((v) => v.item_id === itemId);
}

export function latestVerificationForItem(
  itemId: string,
): SourceVerificationEntry | undefined {
  const entries = verificationsForItem(itemId);
  if (entries.length === 0) return undefined;
  return [...entries].sort((a, b) => b.verified_date.localeCompare(a.verified_date))[0];
}

export function jurisdictionCoverage(jurisdictionId: string) {
  const records = recordsForJurisdiction(jurisdictionId);
  const pendingRecords = records.filter((r) => r.review_status !== "reviewed").length;
  const unverifiedRecords = records.filter((r) => r.verified_on_source === false).length;
  return {
    sources: sourcesForJurisdiction(jurisdictionId).length,
    records: records.length,
    changes: changesForJurisdiction(jurisdictionId).length,
    timelines: timelinesForJurisdiction(jurisdictionId).length,
    pending_review: pendingRecords,
    unverified_on_source: unverifiedRecords,
  };
}

export function getWatchers(): OfficialWatcher[] {
  const file = readYamlFile<{ watchers: OfficialWatcher[] }>(
    "data/watchers/official-source-watchers.yml",
  );
  return file?.watchers ?? [];
}

export function getWatcher(id: string): OfficialWatcher | undefined {
  return getWatchers().find((w) => w.watcher_id === id);
}

export function getSnapshots(): SourceSnapshot[] {
  const root = path.join(ROOT, "data/snapshots");
  if (!fs.existsSync(root)) return [];
  const items: SourceSnapshot[] = [];
  for (const sourceDir of fs.readdirSync(root)) {
    const dir = path.join(root, sourceDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".yml") || f === "latest.yml") continue;
      items.push(
        yaml.load(fs.readFileSync(path.join(dir, f), "utf8")) as SourceSnapshot,
      );
    }
  }
  return items.sort((a, b) => b.checked_at.localeCompare(a.checked_at));
}

export function latestSnapshotForSource(sourceId: string): SourceSnapshot | undefined {
  const pointerPath = path.join(ROOT, "data/snapshots", sourceId, "latest.yml");
  if (!fs.existsSync(pointerPath)) {
    return getSnapshots().find((s) => s.source_id === sourceId);
  }
  const pointer = yaml.load(fs.readFileSync(pointerPath, "utf8")) as {
    snapshot_id?: string;
  };
  if (!pointer?.snapshot_id) return undefined;
  const snapPath = path.join(
    ROOT,
    "data/snapshots",
    sourceId,
    `${pointer.snapshot_id}.yml`,
  );
  if (!fs.existsSync(snapPath)) return undefined;
  return yaml.load(fs.readFileSync(snapPath, "utf8")) as SourceSnapshot;
}

export function snapshotsForSource(sourceId: string): SourceSnapshot[] {
  return getSnapshots().filter((s) => s.source_id === sourceId);
}

export function getWatcherRuns(): WatcherRun[] {
  return readYamlDir<WatcherRun>("data/watcher-runs").sort((a, b) =>
    b.run_date.localeCompare(a.run_date),
  );
}

export function latestWatcherRun(): WatcherRun | undefined {
  return getWatcherRuns()[0];
}

export type MonitoringCycleMode = "dry_run" | "write" | "report_only";

export type MonitoringPhaseStatus = "passed" | "failed" | "skipped" | "not_run";

export interface MonitoringRun {
  monitoring_run_id: string;
  run_date: string;
  mode: MonitoringCycleMode;
  started_at?: string;
  finished_at?: string | null;
  watchers_configured: number;
  watchers_checked: number;
  watcher_success_count: number;
  watcher_soft_error_count: number;
  watcher_run_id?: string | null;
  detected_changes_created: number;
  real_detected_changes: number;
  simulated_detected_changes: number;
  validation_status: MonitoringPhaseStatus;
  exports_status?: MonitoringPhaseStatus;
  build_status: MonitoringPhaseStatus;
  watchers_status?: MonitoringPhaseStatus;
  overall_status?: "passed" | "failed" | "partial" | "report_only";
  review_queue_count: number;
  errors_by_category?: Record<string, number>;
  phase_notes?: string[];
  error_message?: string | null;
  legal_safe_note: string;
}

export function getMonitoringRuns(): MonitoringRun[] {
  return readYamlDir<MonitoringRun>("data/monitoring-runs")
    .filter((r) => r?.monitoring_run_id)
    .sort((a, b) => b.run_date.localeCompare(a.run_date));
}

export function latestMonitoringRun(): MonitoringRun | undefined {
  return getMonitoringRuns()[0];
}

export interface MonitoringDiffSummary {
  generated_at: string;
  run_date: string;
  has_meaningful_changes: boolean;
  has_detected_changes: boolean;
  has_watcher_errors: boolean;
  recommended_action: string;
  new_real_detected_change_count: number;
  legal_safe_note: string;
}

export function latestMonitoringDiffSummary(): MonitoringDiffSummary | undefined {
  const abs = path.join(ROOT, "data/monitoring-runs/latest-monitoring-diff-summary.json");
  if (!fs.existsSync(abs)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(abs, "utf8")) as MonitoringDiffSummary;
  } catch {
    return undefined;
  }
}

export interface WatcherEligibilityFlags {
  eligible_basic_url_check: boolean;
  eligible_feed_check: boolean;
  eligible_api_check: boolean;
  manual_review_required: boolean;
  blocked_by_waf_or_bot_protection: boolean;
  excluded_not_official: boolean;
  excluded_unstable: boolean;
}

export interface WatcherEligibilityEntry {
  source_id: string;
  jurisdiction_id: string;
  official_url: string;
  source_category: string;
  source_discovery_status: string;
  watcher_eligibility: WatcherEligibilityFlags;
  eligibility_reason: string;
  monitoring_method: "url_status_check" | "feed_check" | "api_check" | "manual_only" | "none";
  allowed_to_fetch: boolean;
  fetch_limits: string;
  client_use_allowed: false;
  final_evidence_allowed: false;
  created_from: string;
  access_date: string;
  limitations: string;
  watcher_eligibility_batch_id?: string;
}

export function getWatcherEligibilityEntries(): WatcherEligibilityEntry[] {
  const dir = path.join(ROOT, "data/monitoring");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("watcher-eligibility-") && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .sort()
    .reverse();
  if (files.length === 0) return [];
  const batch = readYamlFile<{
    watcher_eligibility_batch_id: string;
    entries?: WatcherEligibilityEntry[];
  }>(path.join("data/monitoring", files[0]));
  return (batch?.entries ?? []).map((e) => ({
    ...e,
    watcher_eligibility_batch_id: batch?.watcher_eligibility_batch_id,
  }));
}

export type WatcherMonitoringCheckResult =
  | "no_change_snapshot_created"
  | "status_check_ok"
  | "metadata_snapshot_created"
  | "status_check_failed"
  | "fetch_failed_needs_review"
  | "manual_only_not_checked"
  | "blocked_not_checked";

export interface MonitoringSourceConfig {
  source_id: string;
  jurisdiction_id: string;
  official_url: string;
  monitoring_method: string;
  adapter_type: "static_page" | "feed" | "official_api" | "manual_only";
  allowed_to_fetch: boolean;
  fetch_scope: string;
  diff_policy: string;
  limitations: string;
  monitoring_source_config_batch_id?: string;
}

export interface WatcherMonitoringCheck {
  source_id: string;
  url: string;
  adapter_type?: string;
  fetch_scope?: string;
  monitoring_method: string;
  check_result: WatcherMonitoringCheckResult;
  http_status?: number | null;
  title?: string | null;
  change_detected: boolean;
  requires_human_review: boolean;
  notes: string;
  client_use_allowed: false;
  final_evidence_allowed: false;
}

export interface WatcherMonitoringRun {
  monitoring_run_id: string;
  run_date: string;
  run_timestamp: string;
  mode: "deterministic_local" | "dry_run" | "report_only";
  product_version?: string;
  monitoring_source_config_batch_id?: string;
  watcher_eligibility_batch_id: string;
  overall_status?: "completed" | "partial" | "report_only";
  change_detected_count?: number;
  legal_safe_note: string;
  checks: WatcherMonitoringCheck[];
}

export function getWatcherMonitoringRuns(): WatcherMonitoringRun[] {
  const dir = path.join(ROOT, "data/monitoring");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.startsWith("monitoring-run-") && (f.endsWith(".yml") || f.endsWith(".yaml")),
    )
    .map((f) => readYamlFile<WatcherMonitoringRun>(path.join("data/monitoring", f)))
    .filter((r): r is WatcherMonitoringRun => Boolean(r?.monitoring_run_id))
    .sort(
      (a, b) =>
        b.run_date.localeCompare(a.run_date) ||
        b.monitoring_run_id.localeCompare(a.monitoring_run_id),
    );
}

export function latestWatcherMonitoringRun(): WatcherMonitoringRun | undefined {
  return getWatcherMonitoringRuns()[0];
}

export function getMonitoringSourceConfigs(): MonitoringSourceConfig[] {
  const dir = path.join(ROOT, "data/monitoring");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("source-configs-") && (f.endsWith(".yml") || f.endsWith(".yaml")))
    .sort()
    .reverse();
  if (files.length === 0) return [];
  const batch = readYamlFile<{
    monitoring_source_config_batch_id: string;
    configs?: MonitoringSourceConfig[];
  }>(path.join("data/monitoring", files[0]));
  return (batch?.configs ?? []).map((c) => ({
    ...c,
    monitoring_source_config_batch_id: batch?.monitoring_source_config_batch_id,
  }));
}

export function getDetectedChanges(): DetectedChange[] {
  return readYamlDir<DetectedChange>("data/detected-changes").sort((a, b) =>
    b.detected_at.localeCompare(a.detected_at),
  );
}

export function getDetectedChange(id: string): DetectedChange | undefined {
  return getDetectedChanges().find((d) => d.detected_change_id === id);
}

export function detectedChangesForSource(sourceId: string): DetectedChange[] {
  return getDetectedChanges().filter((d) => d.source_id === sourceId);
}

export type SourceDiscoveryVerificationStatus =
  | "pending_official_review"
  | "official_source_confirmed"
  | "official_source_unclear"
  | "rejected_not_official";

export interface SourceDiscoveryLead {
  lead_id: string;
  discovered_from_type: "competitor_tracker" | "official_site" | "manual_research";
  discovered_from_url: string;
  competitor_name?: string;
  lead_found_via?: string;
  candidate_official_url: string;
  jurisdiction_id: string;
  source_category: string;
  official_source_verified: boolean;
  verification_status: SourceDiscoveryVerificationStatus;
  verified_title?: string;
  http_status?: number;
  access_date: string;
  promoted_source_id?: string;
  existing_source_id?: string;
  notes: string;
  source_discovery_batch_id?: string;
}

export interface SourceDiscoveryBatch {
  source_discovery_batch_id: string;
  generated_at: string;
  legal_safe_note: string;
  leads: SourceDiscoveryLead[];
}

export function getSourceDiscoveryBatches(): SourceDiscoveryBatch[] {
  return readYamlDir<SourceDiscoveryBatch>("data/source-discovery").sort((a, b) =>
    b.generated_at.localeCompare(a.generated_at),
  );
}

export function getSourceDiscoveryLeads(): SourceDiscoveryLead[] {
  const batch = getSourceDiscoveryBatches()[0];
  if (!batch) return [];
  return (batch.leads ?? []).map((lead) => ({
    ...lead,
    source_discovery_batch_id: batch.source_discovery_batch_id,
  }));
}

export function getSourceDiscoverySummary() {
  const leads = getSourceDiscoveryLeads();
  return {
    total: leads.length,
    official_source_confirmed: leads.filter(
      (l) => l.verification_status === "official_source_confirmed",
    ).length,
    pending_official_review: leads.filter(
      (l) => l.verification_status === "pending_official_review",
    ).length,
    official_source_unclear: leads.filter(
      (l) => l.verification_status === "official_source_unclear",
    ).length,
    rejected_not_official: leads.filter(
      (l) => l.verification_status === "rejected_not_official",
    ).length,
    promoted_new_sources: leads.filter((l) => l.promoted_source_id).length,
  };
}

export interface SourceAdapterAllowlistEntry {
  adapter_id: string;
  source_id: string;
  source_name: string;
  jurisdiction_ids: string[];
  region: string;
  source_type: string;
  adapter_kind: string;
  status: string;
  collection_mode: string;
  endpoint_url?: string;
  source_url?: string;
  allowed_host: string;
  paywall_login_required: boolean;
  captcha_or_waf_risk: boolean;
  stores_metadata_only: boolean;
  schedule_enabled: boolean;
  broad_crawl_allowed: boolean;
  owner_review_required: boolean;
  notes?: string;
}

export interface SourceAdapterAllowlistDoc {
  source_adapter_allowlist_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  adapters: SourceAdapterAllowlistEntry[];
}

export function getSourceAdapterAllowlist(): SourceAdapterAllowlistDoc | null {
  const file = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as SourceAdapterAllowlistDoc;
}

export function getSourceAdapterAllowlistEntries(): SourceAdapterAllowlistEntry[] {
  return getSourceAdapterAllowlist()?.adapters ?? [];
}

export interface ManualSourceIntakeRun {
  run_id: string;
  adapter_id: string;
  source_id: string;
  mode: string;
  status: string;
  approval_required: boolean;
  network_allowed: boolean;
  schedule_enabled: boolean;
  stores_metadata_only: boolean;
  stores_full_text: boolean;
  output_path: string;
  verified_on_source: boolean;
  client_use_allowed: boolean;
  client_evidence_allowed: boolean;
  final_evidence_allowed: boolean;
  legal_change_claimed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ManualSourceIntakeRunsDoc {
  manual_source_intake_runs_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  runs: ManualSourceIntakeRun[];
}

export function getManualSourceIntakeRuns(): ManualSourceIntakeRunsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as ManualSourceIntakeRunsDoc;
}

export function getManualSourceIntakeRunEntries(): ManualSourceIntakeRun[] {
  return getManualSourceIntakeRuns()?.runs ?? [];
}

export interface NetworkDryRunGateState {
  verified_on_source: boolean;
  client_use_allowed: boolean;
  client_evidence_allowed: boolean;
  final_evidence_allowed: boolean;
  legal_change_claimed: boolean;
}

export interface NetworkDryRunApproval {
  approval_id: string;
  run_id: string;
  adapter_id: string;
  source_id: string;
  source_name: string;
  source_type: string;
  allowed_host: string;
  endpoint_url: string;
  mode: string;
  status: string;
  control_tower_approval_required: boolean;
  network_execution_allowed: boolean;
  schedule_enabled: boolean;
  broad_crawl_allowed: boolean;
  max_items: number;
  max_bytes: number;
  timeout_seconds: number;
  output_path: string;
  dry_run_plan_path: string;
  gates: NetworkDryRunGateState;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkDryRunApprovalsDoc {
  network_dry_run_approvals_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  approvals: NetworkDryRunApproval[];
}

export function getNetworkDryRunApprovals(): NetworkDryRunApprovalsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as NetworkDryRunApprovalsDoc;
}

export function getNetworkDryRunApprovalEntries(): NetworkDryRunApproval[] {
  return getNetworkDryRunApprovals()?.approvals ?? [];
}

export interface SingleNetworkDryRunExecution {
  execution_id: string;
  approval_id: string;
  run_id: string;
  adapter_id: string;
  source_id: string;
  mode: string;
  status: string;
  control_tower_approval_reference: string;
  schedule_enabled: boolean;
  broad_crawl_allowed: boolean;
  max_network_requests: number;
  max_items: number;
  max_bytes: number;
  timeout_seconds: number;
  stores_metadata_only: boolean;
  stores_full_text: boolean;
  legal_text_publication_allowed: boolean;
  output_path: string;
  report_path: string;
  gates: NetworkDryRunGateState;
  created_at: string;
  updated_at: string;
}

export interface SingleNetworkDryRunExecutionsDoc {
  single_network_dry_run_executions_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  executions: SingleNetworkDryRunExecution[];
}

export function getSingleNetworkDryRunExecutions(): SingleNetworkDryRunExecutionsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/single-network-dry-run-executions.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as SingleNetworkDryRunExecutionsDoc;
}

export function getSingleNetworkDryRunExecutionEntries(): SingleNetworkDryRunExecution[] {
  return getSingleNetworkDryRunExecutions()?.executions ?? [];
}

export interface ManualReviewPromotionSafety {
  metadata_only: boolean;
  stores_full_text: boolean;
  publication_allowed: boolean;
  public_export_allowed: boolean;
  requires_human_review: boolean;
  source_verification_required_before_publication: boolean;
}

export interface ManualReviewPromotionFields {
  title: string;
  url: string;
  published_at: string;
  summary_snippet: string | null;
  jurisdiction_ids: string[];
  detected_topics: string[];
  source_name: string;
}

export interface ManualReviewPromotion {
  promotion_id: string;
  source_execution_id: string;
  source_approval_id: string;
  source_run_id: string;
  source_adapter_id: string;
  source_id: string;
  candidate_id: string;
  source_candidate_path: string;
  status: string;
  review_required: boolean;
  reviewer_role: string;
  promotion_mode: string;
  draft_update_path: string;
  created_at: string;
  updated_at: string;
  fields: ManualReviewPromotionFields;
  gates: NetworkDryRunGateState;
  safety: ManualReviewPromotionSafety;
}

export interface ManualReviewPromotionsDoc {
  manual_review_promotions_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  promotions: ManualReviewPromotion[];
}

export function getManualReviewPromotions(): ManualReviewPromotionsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as ManualReviewPromotionsDoc;
}

export function getManualReviewPromotionEntries(): ManualReviewPromotion[] {
  return getManualReviewPromotions()?.promotions ?? [];
}

export interface ManualReviewDecisionSafety {
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  source_verification_completed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_followup_before_publication: boolean;
}

export interface ManualReviewDecision {
  decision_id: string;
  promotion_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_execution_id: string;
  source_approval_id: string;
  source_adapter_id: string;
  reviewer_role: string;
  decision: string;
  decision_status: string;
  decision_scope: string;
  review_notes: string;
  requested_changes: string[];
  decided_at: string;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: ManualReviewDecisionSafety;
}

export interface ManualReviewDecisionsDoc {
  manual_review_decisions_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  decisions: ManualReviewDecision[];
}

export function getManualReviewDecisions(): ManualReviewDecisionsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as ManualReviewDecisionsDoc;
}

export function getManualReviewDecisionEntries(): ManualReviewDecision[] {
  return getManualReviewDecisions()?.decisions ?? [];
}

export interface DraftRevisionSafety {
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  source_verification_completed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_followup_before_publication: boolean;
}

export interface DraftRegulatoryUpdateRevision {
  revision_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_promotion_id: string;
  source_decision_id: string;
  revision_status: string;
  revision_scope: string;
  revision_reason: string;
  revision_notes: string;
  requested_changes_addressed: string[];
  requested_changes_remaining: string[];
  changed_fields: string[];
  reviewer_followup_required: boolean;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: DraftRevisionSafety;
}

export interface DraftRegulatoryUpdateRevisionsDoc {
  draft_regulatory_update_revisions_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  revisions: DraftRegulatoryUpdateRevision[];
}

export function getDraftRegulatoryUpdateRevisions(): DraftRegulatoryUpdateRevisionsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/draft-regulatory-update-revisions.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as DraftRegulatoryUpdateRevisionsDoc;
}

export function getDraftRegulatoryUpdateRevisionEntries(): DraftRegulatoryUpdateRevision[] {
  return getDraftRegulatoryUpdateRevisions()?.revisions ?? [];
}

export interface InternalDraftReadinessSafety {
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  source_verification_completed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_source_verification_before_publication: boolean;
  requires_legal_review_before_publication: boolean;
  requires_separate_publication_approval: boolean;
}

export interface InternalDraftReadinessGate {
  readiness_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_promotion_id: string;
  source_decision_id: string;
  source_revision_id: string;
  gate_status: string;
  gate_scope: string;
  readiness_result: string;
  readiness_summary: string;
  blockers: string[];
  satisfied_conditions: string[];
  next_required_step: string;
  reviewer_followup_required: boolean;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: InternalDraftReadinessSafety;
}

export interface InternalDraftReadinessGatesDoc {
  internal_draft_readiness_gates_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  gates: InternalDraftReadinessGate[];
}

export function getInternalDraftReadinessGates(): InternalDraftReadinessGatesDoc | null {
  const file = path.join(ROOT, "data/source-adapters/internal-draft-readiness-gates.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as InternalDraftReadinessGatesDoc;
}

export function getInternalDraftReadinessGateEntries(): InternalDraftReadinessGate[] {
  return getInternalDraftReadinessGates()?.gates ?? [];
}

export type SourceVerificationChecklistItemStatus =
  | "pending"
  | "local_data_present"
  | "blocked";

export type SourceVerificationChecklistItemKey =
  | "source_url_accessibility_check"
  | "source_identity_match_check"
  | "publication_date_match_check"
  | "title_match_check"
  | "summary_rewrite_check"
  | "topic_jurisdiction_confirmation_check"
  | "no_full_text_storage_check"
  | "public_export_exclusion_check";

export interface SourceVerificationChecklistItem {
  item_key: SourceVerificationChecklistItemKey;
  status: SourceVerificationChecklistItemStatus;
  notes?: string;
}

export interface SourceVerificationChecklistSafety {
  verified_on_source: boolean;
  publication_allowed: boolean;
  public_export_allowed: boolean;
  client_use_allowed: boolean;
  final_evidence_allowed: boolean;
  legal_change_claimed: boolean;
  source_verification_completed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
}

export interface SourceVerificationChecklist {
  checklist_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_readiness_gate_id?: string;
  source_adapter_id: string;
  source_id: string;
  source_url: string;
  status: string;
  verification_scope: string;
  checklist_items: SourceVerificationChecklistItem[];
  blockers: string[];
  next_required_step: string;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: SourceVerificationChecklistSafety;
}

export interface SourceVerificationChecklistsDoc {
  source_verification_checklists_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  checklists: SourceVerificationChecklist[];
}

export type SourceVerificationItemResult =
  | "manual_pass"
  | "manual_fail"
  | "needs_follow_up"
  | "not_checked";

export type SourceVerificationOverallResult =
  | "partial_pass_needs_follow_up"
  | "blocked"
  | "ready_for_final_legal_review";

export interface SourceVerificationResultItem {
  item_id: SourceVerificationChecklistItemKey;
  result: SourceVerificationItemResult;
  note?: string;
  checked_by_role: string;
  checked_at: string;
}

export interface SourceVerificationResultSafety {
  final_source_verification_completed: boolean;
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_final_legal_approval: boolean;
}

export interface SourceVerificationResult {
  result_id: string;
  checklist_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_adapter_id: string;
  source_id: string;
  source_url: string;
  result_scope: string;
  result_status: string;
  item_results: SourceVerificationResultItem[];
  overall_result: SourceVerificationOverallResult;
  blockers_remaining: string[];
  next_required_step: string;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: SourceVerificationResultSafety;
}

export interface SourceVerificationResultsDoc {
  source_verification_results_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  results: SourceVerificationResult[];
}

export interface DraftRegulatoryUpdate {
  draft_id: string;
  update_id: string;
  title: string;
  source_url: string;
  source_id: string;
  jurisdiction_ids: string[];
  topic_ids: string[];
  published_at: string;
  source_published_at?: string;
  summary: string;
  status: string;
  review_status: string;
  intake_method: string;
  source_execution_id?: string;
  source_approval_id?: string;
  source_adapter_id: string;
  promotion_id?: string;
  candidate_id?: string;
  latest_review_decision_id?: string;
  latest_revision_id?: string;
  latest_readiness_gate_id?: string;
  latest_source_verification_result_id?: string;
  source_verification_result?: SourceVerificationOverallResult;
  latest_final_legal_review_packet_id?: string;
  latest_final_legal_review_decision_id?: string;
  latest_final_legal_review_response_id?: string;
  final_legal_review_decision?: string;
  final_legal_review_status?: string;
  final_legal_review_response_status?: string;
  conservative_summary_revision_applied?: boolean;
  readiness_result?: string;
  next_required_step?: string;
  final_source_verification_completed?: boolean;
  final_legal_approval_completed?: boolean;
  final_legal_approval_required?: boolean;
  verified_on_source: boolean;
  client_use_allowed: boolean;
  client_evidence_allowed: boolean;
  final_evidence_allowed: boolean;
  legal_change_claimed: boolean;
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
}

export type FinalLegalReviewItemStatus =
  | "pending"
  | "needs_follow_up"
  | "blocked"
  | "local_metadata_available";

export interface FinalLegalReviewItem {
  item_id: string;
  status: FinalLegalReviewItemStatus;
  note?: string;
  reviewer_role: string;
}

export interface FinalLegalReviewPacketSafety {
  final_legal_approval_completed: boolean;
  final_source_verification_completed: boolean;
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_final_approval_before_publication: boolean;
}

export interface FinalLegalReviewPacket {
  packet_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_verification_result_id: string;
  checklist_id: string;
  promotion_id: string;
  decision_id: string;
  revision_id: string;
  readiness_id: string;
  packet_scope: string;
  packet_status: string;
  review_stage: string;
  legal_review_items: FinalLegalReviewItem[];
  blockers_remaining: string[];
  next_required_step: string;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: FinalLegalReviewPacketSafety;
}

export interface FinalLegalReviewPacketsDoc {
  final_legal_review_packets_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  packets: FinalLegalReviewPacket[];
}

export interface SourceVerificationCockpitCase {
  checklist: SourceVerificationChecklist;
  result: SourceVerificationResult | null;
  draft: DraftRegulatoryUpdate | null;
  promotion: ManualReviewPromotion | null;
  decision: ManualReviewDecision | null;
  revision: DraftRegulatoryUpdateRevision | null;
  readinessGate: InternalDraftReadinessGate | null;
  execution: SingleNetworkDryRunExecution | null;
  approval: NetworkDryRunApproval | null;
}

export interface FinalLegalReviewDecisionSafety {
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  final_legal_approval_completed: boolean;
  final_source_verification_completed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_separate_publication_approval: boolean;
  requires_separate_evidence_approval: boolean;
}

export interface FinalLegalReviewDecision {
  decision_id: string;
  packet_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_verification_result_id: string;
  reviewer_role: string;
  decision_scope: string;
  decision: string;
  decision_status: string;
  decision_summary: string;
  required_changes: string[];
  approval_limitations: string[];
  next_required_step: string;
  decided_at: string;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: FinalLegalReviewDecisionSafety;
}

export interface FinalLegalReviewDecisionsDoc {
  final_legal_review_decisions_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  decisions: FinalLegalReviewDecision[];
}

export type FinalLegalReviewRevisionChangeStatus =
  | "addressed_metadata_only"
  | "partially_addressed"
  | "still_blocked";

export interface FinalLegalReviewRevisionAddressedChange {
  change_id: string;
  status: FinalLegalReviewRevisionChangeStatus;
  response_note: string;
}

export interface FinalLegalReviewRevisionResponseSafety {
  final_legal_approval_completed: boolean;
  final_source_verification_completed: boolean;
  publication_allowed: boolean;
  public_export_allowed: boolean;
  evidence_export_allowed: boolean;
  metadata_only: boolean;
  stores_full_text: boolean;
  requires_reviewer_recheck: boolean;
  requires_separate_publication_approval: boolean;
  requires_separate_evidence_approval: boolean;
}

export interface FinalLegalReviewRevisionResponse {
  response_id: string;
  decision_id: string;
  packet_id: string;
  draft_update_id: string;
  draft_update_path: string;
  source_verification_result_id: string;
  response_scope: string;
  response_status: string;
  response_summary: string;
  addressed_changes: FinalLegalReviewRevisionAddressedChange[];
  remaining_blockers: string[];
  next_required_step: string;
  created_at: string;
  updated_at: string;
  gates: NetworkDryRunGateState;
  safety: FinalLegalReviewRevisionResponseSafety;
}

export interface FinalLegalReviewRevisionResponsesDoc {
  final_legal_review_revision_responses_id: string;
  generated_at: string;
  product_version: string;
  legal_safe_note: string;
  no_live_collection: boolean;
  no_scheduled_monitoring: boolean;
  responses: FinalLegalReviewRevisionResponse[];
}

export interface FinalLegalReviewCockpitCase {
  packet: FinalLegalReviewPacket;
  finalLegalDecision: FinalLegalReviewDecision | null;
  revisionResponse: FinalLegalReviewRevisionResponse | null;
  draft: DraftRegulatoryUpdate | null;
  result: SourceVerificationResult | null;
  checklist: SourceVerificationChecklist | null;
  promotion: ManualReviewPromotion | null;
  decision: ManualReviewDecision | null;
  revision: DraftRegulatoryUpdateRevision | null;
  readinessGate: InternalDraftReadinessGate | null;
  execution: SingleNetworkDryRunExecution | null;
  approval: NetworkDryRunApproval | null;
}

export function getSourceVerificationChecklists(): SourceVerificationChecklistsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/source-verification-checklists.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as SourceVerificationChecklistsDoc;
}

export function getSourceVerificationChecklistEntries(): SourceVerificationChecklist[] {
  return getSourceVerificationChecklists()?.checklists ?? [];
}

export function getSourceVerificationChecklist(
  checklistId: string,
): SourceVerificationChecklist | undefined {
  return getSourceVerificationChecklistEntries().find((c) => c.checklist_id === checklistId);
}

export function getSourceVerificationResults(): SourceVerificationResultsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as SourceVerificationResultsDoc;
}

export function getSourceVerificationResultEntries(): SourceVerificationResult[] {
  return getSourceVerificationResults()?.results ?? [];
}

export function getSourceVerificationResult(
  resultId: string,
): SourceVerificationResult | undefined {
  return getSourceVerificationResultEntries().find((r) => r.result_id === resultId);
}

export function getDraftRegulatoryUpdate(relPath: string): DraftRegulatoryUpdate | null {
  return readYamlFile<DraftRegulatoryUpdate>(relPath);
}

export function getSourceVerificationCockpitCase(
  checklistId: string,
): SourceVerificationCockpitCase | null {
  const checklist = getSourceVerificationChecklist(checklistId);
  if (!checklist) return null;

  const result =
    getSourceVerificationResultEntries().find((r) => r.checklist_id === checklistId) ?? null;

  const draft = getDraftRegulatoryUpdate(checklist.draft_update_path);
  const promotion = getManualReviewPromotionEntries().find(
    (p) => p.draft_update_path === checklist.draft_update_path,
  );
  const decision = promotion
    ? getManualReviewDecisionEntries().find((d) => d.promotion_id === promotion.promotion_id)
    : undefined;
  const revision = decision
    ? getDraftRegulatoryUpdateRevisionEntries().find(
        (r) => r.source_decision_id === decision.decision_id,
      )
    : undefined;
  const readinessGate = checklist.source_readiness_gate_id
    ? getInternalDraftReadinessGateEntries().find(
        (g) => g.readiness_id === checklist.source_readiness_gate_id,
      )
    : undefined;
  const execution = draft?.source_execution_id
    ? getSingleNetworkDryRunExecutionEntries().find(
        (e) => e.execution_id === draft.source_execution_id,
      )
    : undefined;
  const approval = draft?.source_approval_id
    ? getNetworkDryRunApprovalEntries().find((a) => a.approval_id === draft.source_approval_id)
    : undefined;

  return {
    checklist,
    result,
    draft,
    promotion: promotion ?? null,
    decision: decision ?? null,
    revision: revision ?? null,
    readinessGate: readinessGate ?? null,
    execution: execution ?? null,
    approval: approval ?? null,
  };
}

export function getFinalLegalReviewPackets(): FinalLegalReviewPacketsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as FinalLegalReviewPacketsDoc;
}

export function getFinalLegalReviewPacketEntries(): FinalLegalReviewPacket[] {
  return getFinalLegalReviewPackets()?.packets ?? [];
}

export function getFinalLegalReviewPacket(
  packetId: string,
): FinalLegalReviewPacket | undefined {
  return getFinalLegalReviewPacketEntries().find((p) => p.packet_id === packetId);
}

export function getFinalLegalReviewDecisions(): FinalLegalReviewDecisionsDoc | null {
  const file = path.join(ROOT, "data/source-adapters/final-legal-review-decisions.yml");
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as FinalLegalReviewDecisionsDoc;
}

export function getFinalLegalReviewDecisionEntries(): FinalLegalReviewDecision[] {
  return getFinalLegalReviewDecisions()?.decisions ?? [];
}

export function getFinalLegalReviewDecision(
  decisionId: string,
): FinalLegalReviewDecision | undefined {
  return getFinalLegalReviewDecisionEntries().find((d) => d.decision_id === decisionId);
}

export function getFinalLegalReviewRevisionResponses(): FinalLegalReviewRevisionResponsesDoc | null {
  const file = path.join(
    ROOT,
    "data/source-adapters/final-legal-review-revision-responses.yml",
  );
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8")) as FinalLegalReviewRevisionResponsesDoc;
}

export function getFinalLegalReviewRevisionResponseEntries(): FinalLegalReviewRevisionResponse[] {
  return getFinalLegalReviewRevisionResponses()?.responses ?? [];
}

export function getFinalLegalReviewRevisionResponse(
  responseId: string,
): FinalLegalReviewRevisionResponse | undefined {
  return getFinalLegalReviewRevisionResponseEntries().find(
    (r) => r.response_id === responseId,
  );
}

export function getFinalLegalReviewCockpitCase(
  packetId: string,
): FinalLegalReviewCockpitCase | null {
  const packet = getFinalLegalReviewPacket(packetId);
  if (!packet) return null;

  const draft = getDraftRegulatoryUpdate(packet.draft_update_path);
  const result = getSourceVerificationResult(packet.source_verification_result_id) ?? null;
  const checklist = getSourceVerificationChecklist(packet.checklist_id) ?? null;
  const promotion = getManualReviewPromotionEntries().find(
    (p) => p.promotion_id === packet.promotion_id,
  );
  const decision = getManualReviewDecisionEntries().find(
    (d) => d.decision_id === packet.decision_id,
  );
  const revision = getDraftRegulatoryUpdateRevisionEntries().find(
    (r) => r.revision_id === packet.revision_id,
  );
  const readinessGate = getInternalDraftReadinessGateEntries().find(
    (g) => g.readiness_id === packet.readiness_id,
  );
  const execution = draft?.source_execution_id
    ? getSingleNetworkDryRunExecutionEntries().find(
        (e) => e.execution_id === draft.source_execution_id,
      )
    : undefined;
  const approval = draft?.source_approval_id
    ? getNetworkDryRunApprovalEntries().find((a) => a.approval_id === draft.source_approval_id)
    : undefined;

  const finalLegalDecision =
    getFinalLegalReviewDecisionEntries().find((d) => d.packet_id === packetId) ??
    (draft?.latest_final_legal_review_decision_id
      ? getFinalLegalReviewDecision(draft.latest_final_legal_review_decision_id)
      : undefined) ??
    null;

  const revisionResponse =
    getFinalLegalReviewRevisionResponseEntries().find((r) => r.packet_id === packetId) ??
    (draft?.latest_final_legal_review_response_id
      ? getFinalLegalReviewRevisionResponse(draft.latest_final_legal_review_response_id)
      : undefined) ??
    null;

  return {
    packet,
    finalLegalDecision,
    revisionResponse,
    draft,
    result,
    checklist: checklist ?? null,
    promotion: promotion ?? null,
    decision: decision ?? null,
    revision: revision ?? null,
    readinessGate: readinessGate ?? null,
    execution: execution ?? null,
    approval: approval ?? null,
  };
}

export function getPilotSummary() {
  return {
    jurisdictionCount: getJurisdictions().length,
    sourceCount: getSources().length,
    recordCount: getRecords().length,
    changeCount: getChanges().length,
    timelineCount: getTimelines().length,
    verificationCount: getVerifications().length,
    exportSampleCount: getExportSamples().length,
    mapMarkerCount: getJurisdictions().filter((j) => j.map).length,
    watcherCount: getWatchers().length,
    snapshotCount: getSnapshots().length,
    detectedChangeCount: getDetectedChanges().length,
  };
}
