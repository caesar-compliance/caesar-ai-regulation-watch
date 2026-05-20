/**
 * Automation-first tracker data (T048) — YAML at build time.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  enrichCountryStatuses,
  type EnrichedCountryStatus,
} from "./tracker-scoring";

export type { EnrichedCountryStatus, CountryStatusScores } from "./tracker-scoring";
export { STATUS_BUCKET_WEIGHT } from "./tracker-scoring";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export type StatusBucket =
  | "adopted"
  | "proposed"
  | "consultation"
  | "guidance"
  | "enforcement"
  | "monitoring"
  | "no_clear_framework";

export type UpdateType =
  | "law"
  | "proposal"
  | "consultation"
  | "guidance"
  | "enforcement"
  | "institutional_update"
  | "source_monitoring";

export interface CountryStatus {
  jurisdiction_id: string;
  country_name: string;
  region: string;
  status_bucket: StatusBucket;
  status_label: string;
  status_summary: string;
  last_update_date: string;
  latest_update_id?: string;
  source_ids: string[];
  topic_tags: string[];
  confidence_score: "high" | "medium" | "low" | "blocked";
  automation_method: string;
  requires_human_review: boolean;
  client_evidence_allowed: boolean;
  final_evidence_allowed: boolean;
  legal_change_claimed: boolean;
  legal_safe_note: string;
}

export interface RegulatoryUpdate {
  update_id: string;
  update_date: string;
  jurisdiction_id: string;
  title: string;
  update_type: UpdateType;
  summary: string;
  source_ids: string[];
  source_urls: string[];
  topic_tags: string[];
  status_bucket: StatusBucket;
  importance: "high" | "medium" | "low";
  confidence_score: "high" | "medium" | "low" | "blocked";
  automation_method: string;
  requires_human_review: boolean;
  client_evidence_allowed: boolean;
  final_evidence_allowed: boolean;
  legal_change_claimed: boolean;
  legal_safe_note: string;
}

export interface TrackerTopic {
  topic_id: string;
  label: string;
  parent_topic_id?: string | null;
  description?: string;
}

export interface AutomationFirstMetrics {
  jurisdiction_count: number;
  regulatory_update_count: number;
  manual_seed_update_count?: number;
  offline_metadata_adapter_update_count?: number;
  updates_last_30_days: number;
  status_bucket_counts: Record<string, number>;
  update_type_counts: Record<string, number>;
  region_counts: Record<string, number>;
  adopted_or_enforced_count: number;
  proposed_or_consultation_count: number;
  choropleth_map_available?: boolean;
  compare_route?: string;
  average_regulation_maturity_score?: number;
}

export const AUTOMATION_METHOD_LABELS: Record<string, string> = {
  manual_seed: "Manual seed",
  offline_metadata_adapter: "Metadata adapter",
  api: "API",
  rss: "RSS",
  official_feed: "Official feed",
  official_page: "Official page",
  public_page: "Public page",
};

function readYamlDir<T>(dir: string): T[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")) as T);
}

function expandRegulatoryUpdateFile(data: unknown): RegulatoryUpdate[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items as RegulatoryUpdate[];
  if (typeof record.update_id === "string") return [data as RegulatoryUpdate];
  return [];
}

function readRegulatoryUpdatesDir(): RegulatoryUpdate[] {
  const abs = path.join(ROOT, "data/regulatory-updates");
  if (!fs.existsSync(abs)) return [];
  const records: RegulatoryUpdate[] = [];
  for (const f of fs.readdirSync(abs)) {
    if (!f.endsWith(".yml") && !f.endsWith(".yaml")) continue;
    const data = yaml.load(fs.readFileSync(path.join(abs, f), "utf8"));
    records.push(...expandRegulatoryUpdateFile(data));
  }
  return records;
}

export function getCountryStatuses(): CountryStatus[] {
  return readYamlDir<CountryStatus>("data/country-status").sort((a, b) =>
    a.country_name.localeCompare(b.country_name),
  );
}

export function getEnrichedCountryStatuses(): EnrichedCountryStatus[] {
  return enrichCountryStatuses(getCountryStatuses(), getRegulatoryUpdates());
}

export function getCountryStatus(jurisdictionId: string): CountryStatus | undefined {
  return getCountryStatuses().find((c) => c.jurisdiction_id === jurisdictionId);
}

export function getRegulatoryUpdates(): RegulatoryUpdate[] {
  return readRegulatoryUpdatesDir().sort((a, b) =>
    b.update_date.localeCompare(a.update_date),
  );
}

export function getRegulatoryUpdate(updateId: string): RegulatoryUpdate | undefined {
  return getRegulatoryUpdates().find((u) => u.update_id === updateId);
}

export function updatesForJurisdiction(jurisdictionId: string): RegulatoryUpdate[] {
  return getRegulatoryUpdates().filter((u) => u.jurisdiction_id === jurisdictionId);
}

export function getTrackerTopics(): TrackerTopic[] {
  return readYamlDir<TrackerTopic>("data/topics").sort((a, b) => a.label.localeCompare(b.label));
}

export function getAutomationFirstMetrics(): AutomationFirstMetrics {
  const statuses = getCountryStatuses();
  const updates = getRegulatoryUpdates();
  const status_bucket_counts: Record<string, number> = {};
  const update_type_counts: Record<string, number> = {};
  const region_counts: Record<string, number> = {};
  for (const cs of statuses) {
    status_bucket_counts[cs.status_bucket] = (status_bucket_counts[cs.status_bucket] ?? 0) + 1;
    region_counts[cs.region] = (region_counts[cs.region] ?? 0) + 1;
  }
  for (const u of updates) {
    update_type_counts[u.update_type] = (update_type_counts[u.update_type] ?? 0) + 1;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const updates_last_30_days = updates.filter(
    (u) => new Date(u.update_date) >= cutoff,
  ).length;
  const manual_seed_update_count = updates.filter(
    (u) => u.automation_method === "manual_seed",
  ).length;
  const offline_metadata_adapter_update_count = updates.filter(
    (u) => u.automation_method === "offline_metadata_adapter",
  ).length;
  const enriched = enrichCountryStatuses(statuses, updates);
  const average_regulation_maturity_score =
    enriched.length > 0
      ? Math.round(
          enriched.reduce((s, c) => s + c.regulation_maturity_score, 0) / enriched.length,
        )
      : 0;

  return {
    jurisdiction_count: statuses.length,
    regulatory_update_count: updates.length,
    manual_seed_update_count,
    offline_metadata_adapter_update_count,
    updates_last_30_days,
    status_bucket_counts,
    update_type_counts,
    region_counts,
    adopted_or_enforced_count:
      (status_bucket_counts.adopted ?? 0) + (status_bucket_counts.enforcement ?? 0),
    proposed_or_consultation_count:
      (status_bucket_counts.proposed ?? 0) + (status_bucket_counts.consultation ?? 0),
    choropleth_map_available: true,
    compare_route: "/compare/",
    average_regulation_maturity_score,
  };
}

export function groupCountryStatusesByRegion(): { region: string; items: CountryStatus[] }[] {
  const map = new Map<string, CountryStatus[]>();
  for (const cs of getCountryStatuses()) {
    const list = map.get(cs.region) ?? [];
    list.push(cs);
    map.set(cs.region, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, items]) => ({
      region,
      items: items.sort((x, y) => x.country_name.localeCompare(y.country_name)),
    }));
}

export const STATUS_BUCKET_LABELS: Record<StatusBucket, string> = {
  adopted: "Adopted",
  proposed: "Proposed",
  consultation: "Consultation",
  guidance: "Guidance",
  enforcement: "Enforcement",
  monitoring: "Monitoring",
  no_clear_framework: "No clear framework",
};

export function filterCountryStatuses(opts: {
  region?: string | null;
  status?: string | null;
  topic?: string | null;
}): CountryStatus[] {
  return getCountryStatuses().filter((cs) => {
    if (opts.region && cs.region !== opts.region) return false;
    if (opts.status && cs.status_bucket !== opts.status) return false;
    if (opts.topic && !cs.topic_tags.includes(opts.topic)) return false;
    return true;
  });
}

export function filterRegulatoryUpdates(opts: {
  region?: string | null;
  status?: string | null;
  topic?: string | null;
  updateType?: string | null;
  jurisdictionId?: string | null;
  automationMethod?: string | null;
}): RegulatoryUpdate[] {
  const statusByJurisdiction = new Map(
    getCountryStatuses().map((cs) => [cs.jurisdiction_id, cs]),
  );
  return getRegulatoryUpdates().filter((u) => {
    if (opts.jurisdictionId && u.jurisdiction_id !== opts.jurisdictionId) return false;
    if (opts.updateType && u.update_type !== opts.updateType) return false;
    if (opts.automationMethod && u.automation_method !== opts.automationMethod) return false;
    if (opts.topic && !u.topic_tags.includes(opts.topic)) return false;
    if (opts.status && u.status_bucket !== opts.status) return false;
    if (opts.region) {
      const cs = statusByJurisdiction.get(u.jurisdiction_id);
      if (!cs || cs.region !== opts.region) return false;
    }
    return true;
  });
}
