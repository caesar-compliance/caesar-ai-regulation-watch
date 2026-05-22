/**
 * T081 / T082 — Regulation monitoring review queue (public JSON exports).
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

export interface OperatorDecisionSummary {
  decision_id: string;
  candidate_id: string;
  decision: string;
  reviewer_label: string;
  decided_at: string;
  rationale: string | null;
  public_note: string | null;
  public_visibility: string;
  source_checked_url?: string | null;
  safety_notes?: string | null;
  tracking_only?: string | null;
}

export interface ReviewQueueCard {
  candidate_id: string;
  source_key: string;
  source_title: string;
  source_url: string | null;
  jurisdiction_id: string;
  topic_tags: string[];
  detected_at: string | null;
  change_type: string;
  title: string;
  metadata_summary: string | null;
  review_status: string;
  priority: string;
  safety_notes: string;
  review_required: boolean;
  operator_decision?: OperatorDecisionSummary | null;
}

export interface ReviewQueueSummary {
  total: number;
  review_required: number;
  in_review: number;
  dismissed: number;
  accepted_for_tracking: number;
  needs_source_check: number;
  needs_legal_review: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  with_operator_decision?: number;
}

export interface SourceFreshnessRow {
  source_key: string;
  source_title: string;
  source_url: string;
  jurisdiction_ids: string[];
  latest_run_at: string | null;
  freshness_status: string;
  automated: boolean;
  review_required_count: number;
  last_error: string | null;
}

export interface JurisdictionReviewState {
  jurisdiction_id: string;
  pending_review_count: number;
  high_priority_count: number;
  stale_source_count: number;
  fresh_automated_count: number;
  manual_review_only_count: number;
  accepted_for_tracking_count?: number;
  dismissed_count?: number;
  needs_source_check_count?: number;
  needs_legal_review_count?: number;
  in_review_count?: number;
  review_state: string;
}

export function getRegulationReviewQueue() {
  return readJson<{
    cards?: ReviewQueueCard[];
    summary?: ReviewQueueSummary;
    jurisdiction_states?: JurisdictionReviewState[];
    decision_counts?: Record<string, number>;
  }>("regulation-review-queue.json", { cards: [], summary: undefined });
}

export function getReviewQueueCards(): ReviewQueueCard[] {
  return getRegulationReviewQueue().cards ?? [];
}

export function getReviewQueueSummary(): ReviewQueueSummary {
  const data = getRegulationReviewQueue();
  return (
    data.summary ?? {
      total: data.cards?.length ?? 0,
      review_required: 0,
      in_review: 0,
      dismissed: 0,
      accepted_for_tracking: 0,
      needs_source_check: 0,
      needs_legal_review: 0,
      high_priority: 0,
      medium_priority: 0,
      low_priority: 0,
    }
  );
}

export function getSourceFreshness() {
  return readJson<{
    sources?: SourceFreshnessRow[];
    summary?: Record<string, number>;
  }>("source-freshness.json", { sources: [], summary: {} });
}

export function getSourceFreshnessRows(): SourceFreshnessRow[] {
  return getSourceFreshness().sources ?? [];
}

export function getSourceFreshnessSummary() {
  return getSourceFreshness().summary ?? {};
}

export function getOperatorReviewSummary() {
  return readJson<{
    decision_count?: number;
    decision_counts?: Record<string, number>;
    queue_summary?: ReviewQueueSummary;
    decisions?: OperatorDecisionSummary[];
    operator_workflow?: {
      cron_enabled?: boolean;
      scheduled_monitoring_enabled?: boolean;
      local_decisions_file?: string;
      decisions_doc_id?: string | null;
    };
  }>("operator-review-summary.json", {});
}

export function jurisdictionReviewState(jurisdictionId: string) {
  const states = getRegulationReviewQueue().jurisdiction_states ?? [];
  return states.find((s) => s.jurisdiction_id === jurisdictionId) ?? null;
}

export function reviewCardsForJurisdiction(jurisdictionId: string) {
  return getReviewQueueCards().filter((c) => c.jurisdiction_id === jurisdictionId);
}

export function acceptedTrackingCardsForJurisdiction(jurisdictionId: string) {
  return reviewCardsForJurisdiction(jurisdictionId).filter(
    (c) => c.review_status === "accepted_for_tracking",
  );
}

export function sourceFreshnessForJurisdiction(jurisdictionId: string) {
  return getSourceFreshnessRows().filter((s) =>
    s.jurisdiction_ids?.includes(jurisdictionId),
  );
}

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  review_required: "Review required",
  in_review: "In review",
  dismissed: "Dismissed (noise)",
  accepted_for_tracking: "Accepted for tracking",
  needs_source_check: "Needs source check",
  needs_legal_review: "Needs legal review",
};
