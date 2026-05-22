/**
 * T081 — Regulation monitoring review queue (public JSON exports).
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
}

export interface ReviewQueueSummary {
  total: number;
  review_required: number;
  in_review: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
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
  review_state: string;
}

export function getRegulationReviewQueue() {
  return readJson<{
    cards?: ReviewQueueCard[];
    summary?: ReviewQueueSummary;
    jurisdiction_states?: JurisdictionReviewState[];
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
    operator_workflow?: {
      cron_enabled?: boolean;
      scheduled_monitoring_enabled?: boolean;
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

export function sourceFreshnessForJurisdiction(jurisdictionId: string) {
  return getSourceFreshnessRows().filter((s) =>
    s.jurisdiction_ids?.includes(jurisdictionId),
  );
}
