/**
 * T051 — Region/topic drilldowns and jurisdiction profile aggregates (build-time only).
 */
import {
  getCountryStatuses,
  getEnrichedCountryStatuses,
  getRegulatoryUpdates,
  getTrackerTopics,
  filterRegulatoryUpdates,
  type CountryStatus,
  type RegulatoryUpdate,
  type StatusBucket,
  type TrackerTopic,
} from "./tracker-data";
import {
  sourcesForJurisdiction,
  recordsForJurisdiction,
  timelinesForJurisdiction,
  getSources,
} from "./data";
import type { EnrichedCountryStatus } from "./tracker-scoring";

export const CLOSED_LEGAL_FLAGS = {
  verified_on_source: false,
  client_use_allowed: false,
  client_evidence_allowed: false,
  final_evidence_allowed: false,
  legal_change_claimed: false,
} as const;

/** Stable URL slug from a region display name (e.g. "North America" → "north-america"). */
export function regionSlug(region: string): string {
  return region
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function regionFromSlug(slug: string): string | undefined {
  const regions = [...new Set(getCountryStatuses().map((c) => c.region))];
  return regions.find((r) => regionSlug(r) === slug);
}

export function compareRoute(ids: string[]): string {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 4);
  if (unique.length === 0) return "/compare/";
  return `/compare/?${unique.map((id) => `ids=${encodeURIComponent(id)}`).join("&")}`;
}

export function comparePeersFor(jurisdictionId: string, region: string): string[] {
  const peers = [jurisdictionId];
  if (jurisdictionId !== "eu") peers.push("eu");
  if (jurisdictionId !== "uk" && region === "Europe") peers.push("uk");
  if (jurisdictionId !== "us-federal" && region === "North America") peers.push("us-federal");
  return [...new Set(peers)].slice(0, 4);
}

function countBuckets(items: { status_bucket: StatusBucket }[]): Record<string, number> {
  const acc: Record<string, number> = {};
  for (const item of items) {
    acc[item.status_bucket] = (acc[item.status_bucket] ?? 0) + 1;
  }
  return acc;
}

export interface RegionSummary {
  region: string;
  slug: string;
  jurisdiction_count: number;
  update_count: number;
  status_bucket_counts: Record<string, number>;
  topic_tags: string[];
  jurisdiction_ids: string[];
  latest_update_ids: string[];
  route: string;
}

export function buildRegionSummaries(): RegionSummary[] {
  const statuses = getCountryStatuses();
  const updates = getRegulatoryUpdates();
  const byRegion = new Map<string, CountryStatus[]>();
  for (const cs of statuses) {
    const list = byRegion.get(cs.region) ?? [];
    list.push(cs);
    byRegion.set(cs.region, list);
  }

  return [...byRegion.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, items]) => {
      const jurisdiction_ids = items.map((i) => i.jurisdiction_id);
      const regionUpdates = updates.filter((u) => jurisdiction_ids.includes(u.jurisdiction_id));
      const topicSet = new Set<string>();
      for (const cs of items) {
        for (const t of cs.topic_tags) topicSet.add(t);
      }
      return {
        region,
        slug: regionSlug(region),
        jurisdiction_count: items.length,
        update_count: regionUpdates.length,
        status_bucket_counts: countBuckets(items),
        topic_tags: [...topicSet].sort(),
        jurisdiction_ids,
        latest_update_ids: regionUpdates.slice(0, 8).map((u) => u.update_id),
        route: `/regions/${regionSlug(region)}/`,
      };
    });
}

export function getRegionSummary(slug: string): RegionSummary | undefined {
  return buildRegionSummaries().find((r) => r.slug === slug);
}

export interface TopicSummary {
  topic_id: string;
  label: string;
  description: string;
  jurisdiction_count: number;
  update_count: number;
  regions: string[];
  status_bucket_counts: Record<string, number>;
  jurisdiction_ids: string[];
  latest_update_ids: string[];
  route: string;
}

export function buildTopicSummaries(): TopicSummary[] {
  const topics = getTrackerTopics();
  const statuses = getCountryStatuses();
  const updates = getRegulatoryUpdates();

  return topics.map((topic: TrackerTopic) => {
    const tagged = statuses.filter((cs) => cs.topic_tags.includes(topic.topic_id));
    const topicUpdates = updates.filter((u) => u.topic_tags.includes(topic.topic_id));
    const regionSet = new Set(tagged.map((cs) => cs.region));
    return {
      topic_id: topic.topic_id,
      label: topic.label,
      description: topic.description ?? "",
      jurisdiction_count: tagged.length,
      update_count: topicUpdates.length,
      regions: [...regionSet].sort(),
      status_bucket_counts: countBuckets(tagged),
      jurisdiction_ids: tagged.map((cs) => cs.jurisdiction_id),
      latest_update_ids: topicUpdates.slice(0, 8).map((u) => u.update_id),
      route: `/topics/${topic.topic_id}/`,
    };
  });
}

export function getTopicSummary(topicId: string): TopicSummary | undefined {
  return buildTopicSummaries().find((t) => t.topic_id === topicId);
}

export interface JurisdictionProfileExport {
  jurisdiction_id: string;
  country_name: string;
  region: string;
  region_slug: string;
  status_bucket: StatusBucket;
  status_label: string;
  status_summary: string;
  confidence_score: string;
  automation_method: string;
  topic_tags: string[];
  source_ids: string[];
  update_ids: string[];
  latest_update_ids: string[];
  source_count: number;
  update_count: number;
  law_guidance_count: number;
  timeline_count: number;
  regulation_maturity_score: number;
  activity_score: number;
  route: string;
  compare_route: string;
  verified_on_source: false;
  client_use_allowed: false;
  client_evidence_allowed: false;
  final_evidence_allowed: false;
  legal_change_claimed: false;
}

export function buildJurisdictionProfileExports(): JurisdictionProfileExport[] {
  const enriched = getEnrichedCountryStatuses();
  const updates = getRegulatoryUpdates();

  return enriched.map((cs: EnrichedCountryStatus) => {
    const jurisdictionUpdates = updates.filter((u) => u.jurisdiction_id === cs.jurisdiction_id);
    const sources = sourcesForJurisdiction(cs.jurisdiction_id);
    const records = recordsForJurisdiction(cs.jurisdiction_id);
    const timelines = timelinesForJurisdiction(cs.jurisdiction_id);
    return {
      jurisdiction_id: cs.jurisdiction_id,
      country_name: cs.country_name,
      region: cs.region,
      region_slug: regionSlug(cs.region),
      status_bucket: cs.status_bucket,
      status_label: cs.status_label,
      status_summary: cs.status_summary.trim(),
      confidence_score: cs.confidence_score,
      automation_method: cs.automation_method,
      topic_tags: cs.topic_tags,
      source_ids: cs.source_ids,
      update_ids: jurisdictionUpdates.map((u) => u.update_id),
      latest_update_ids: jurisdictionUpdates.slice(0, 5).map((u) => u.update_id),
      source_count: sources.length,
      update_count: jurisdictionUpdates.length,
      law_guidance_count: records.length,
      timeline_count: timelines.length,
      regulation_maturity_score: cs.regulation_maturity_score,
      activity_score: cs.activity_score,
      route: `/jurisdictions/${cs.jurisdiction_id}/`,
      compare_route: compareRoute(comparePeersFor(cs.jurisdiction_id, cs.region)),
      ...CLOSED_LEGAL_FLAGS,
    };
  });
}

export function relatedJurisdictionsInRegion(
  jurisdictionId: string,
  region: string,
  limit = 6,
): CountryStatus[] {
  return getCountryStatuses()
    .filter((cs) => cs.region === region && cs.jurisdiction_id !== jurisdictionId)
    .slice(0, limit);
}

export function sourcesForTopicTags(topicTags: string[]) {
  const tagSet = new Set(topicTags);
  return getSources().filter((s) => s.related_topics.some((t) => tagSet.has(t)));
}

export function updatesForRegion(region: string, limit = 8): RegulatoryUpdate[] {
  return filterRegulatoryUpdates({ region }).slice(0, limit);
}

export function updatesForTopic(topicId: string, limit = 8): RegulatoryUpdate[] {
  return filterRegulatoryUpdates({ topic: topicId }).slice(0, limit);
}
