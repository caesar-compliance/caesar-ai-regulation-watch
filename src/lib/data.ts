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

export function getEvidenceExportCandidateBatches(): EvidenceExportCandidateBatch[] {
  return readYamlDir<EvidenceExportCandidateBatch>("data/evidence-export-candidates").sort(
    (a, b) => b.generated_at.localeCompare(a.generated_at),
  );
}

export function getEvidenceExportCandidates(): EvidenceExportCandidateWithBatch[] {
  return getEvidenceExportCandidateBatches().flatMap((b) =>
    b.candidates.map((c) => ({
      ...c,
      evidence_export_candidate_batch_id: b.evidence_export_candidate_batch_id,
    })),
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
