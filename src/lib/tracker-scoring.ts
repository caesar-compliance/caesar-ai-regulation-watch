/**
 * T050 — Tracker metadata scoring (not legal certainty).
 * Computed from country_status + regulatory_update seeds at build time.
 */
import type { CountryStatus, RegulatoryUpdate, StatusBucket } from "./tracker-data";

export const STATUS_BUCKET_WEIGHT: Record<StatusBucket, number> = {
  adopted: 88,
  enforcement: 82,
  guidance: 68,
  proposed: 52,
  consultation: 48,
  monitoring: 42,
  no_clear_framework: 18,
};

export interface CountryStatusScores {
  regulation_maturity_score: number;
  activity_score: number;
  automation_signal_count: number;
  latest_update_count: number;
  status_weight: number;
  comparison_summary: string;
}

export type EnrichedCountryStatus = CountryStatus &
  CountryStatusScores & {
    manual_seed_update_count: number;
    offline_metadata_adapter_update_count: number;
  };

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function computeActivityScore(updateCount: number, lastUpdateDate: string): number {
  let score = Math.min(updateCount * 10, 55);
  const days = daysSince(lastUpdateDate);
  if (days <= 30) score += 35;
  else if (days <= 90) score += 18;
  else score += 6;
  return Math.min(100, Math.round(score));
}

function buildComparisonSummary(
  cs: CountryStatus,
  updateCount: number,
  maturity: number,
): string {
  return (
    `${cs.country_name}: ${cs.status_label} (${cs.status_bucket}); ` +
    `${updateCount} tracker update(s); maturity index ${maturity}/100 from pilot metadata — not legal advice.`
  );
}

export function updatesByJurisdiction(
  updates: RegulatoryUpdate[],
): Map<string, RegulatoryUpdate[]> {
  const map = new Map<string, RegulatoryUpdate[]>();
  for (const u of updates) {
    const list = map.get(u.jurisdiction_id) ?? [];
    list.push(u);
    map.set(u.jurisdiction_id, list);
  }
  return map;
}

export function enrichCountryStatus(
  cs: CountryStatus,
  jurisdictionUpdates: RegulatoryUpdate[],
): EnrichedCountryStatus {
  const latest_update_count = jurisdictionUpdates.length;
  const automation_signal_count = latest_update_count;
  const status_weight = STATUS_BUCKET_WEIGHT[cs.status_bucket];
  const regulation_maturity_score = Math.min(
    100,
    Math.round(status_weight * 0.75 + Math.min(latest_update_count * 3, 15)),
  );
  const activity_score = computeActivityScore(latest_update_count, cs.last_update_date);
  const manual_seed_update_count = jurisdictionUpdates.filter(
    (u) => u.automation_method === "manual_seed",
  ).length;
  const offline_metadata_adapter_update_count = jurisdictionUpdates.filter(
    (u) => u.automation_method === "offline_metadata_adapter",
  ).length;

  return {
    ...cs,
    regulation_maturity_score,
    activity_score,
    automation_signal_count,
    latest_update_count,
    status_weight,
    comparison_summary: buildComparisonSummary(cs, latest_update_count, regulation_maturity_score),
    manual_seed_update_count,
    offline_metadata_adapter_update_count,
  };
}

export function enrichCountryStatuses(
  statuses: CountryStatus[],
  updates: RegulatoryUpdate[],
): EnrichedCountryStatus[] {
  const byJurisdiction = updatesByJurisdiction(updates);
  return statuses.map((cs) =>
    enrichCountryStatus(cs, byJurisdiction.get(cs.jurisdiction_id) ?? []),
  );
}

export interface JurisdictionComparisonRow {
  jurisdiction_id: string;
  country_name: string;
  region: string;
  status_bucket: StatusBucket;
  status_label: string;
  last_update_date: string;
  regulation_maturity_score: number;
  activity_score: number;
  latest_update_count: number;
  manual_seed_update_count: number;
  offline_metadata_adapter_update_count: number;
  source_count: number;
  topic_tags: string[];
  comparison_summary: string;
}

export function buildComparisonRows(
  enriched: EnrichedCountryStatus[],
  sourceCountByJurisdiction: Map<string, number>,
): JurisdictionComparisonRow[] {
  return enriched.map((cs) => ({
    jurisdiction_id: cs.jurisdiction_id,
    country_name: cs.country_name,
    region: cs.region,
    status_bucket: cs.status_bucket,
    status_label: cs.status_label,
    last_update_date: cs.last_update_date,
    regulation_maturity_score: cs.regulation_maturity_score,
    activity_score: cs.activity_score,
    latest_update_count: cs.latest_update_count,
    manual_seed_update_count: cs.manual_seed_update_count,
    offline_metadata_adapter_update_count: cs.offline_metadata_adapter_update_count,
    source_count: sourceCountByJurisdiction.get(cs.jurisdiction_id) ?? cs.source_ids.length,
    topic_tags: cs.topic_tags,
    comparison_summary: cs.comparison_summary,
  }));
}
