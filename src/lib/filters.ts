/** Build filter option lists for client-side filter bars. */
import {
  getJurisdictions,
  getRecords,
  getSources,
  getChanges,
  getTaxonomies,
  taxonomyLabel,
} from "./data";

export interface FilterOption {
  value: string;
  label: string;
}

export function uniqueOptions(values: string[], labelFn?: (v: string) => string): FilterOption[] {
  const seen = new Set<string>();
  const out: FilterOption[] = [];
  for (const v of values) {
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push({ value: v, label: labelFn ? labelFn(v) : v });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function recordFilterOptions() {
  const taxonomies = getTaxonomies();
  const records = getRecords();
  const jurisdictions = getJurisdictions();
  const jMap = Object.fromEntries(jurisdictions.map((j) => [j.jurisdiction_id, j.name]));

  return {
    type: [
      { value: "law", label: "Law" },
      { value: "guidance", label: "Guidance" },
      { value: "policy_framework", label: "Policy framework" },
      { value: "implementation_update", label: "Implementation update" },
    ],
    jurisdiction: jurisdictions.map((j) => ({
      value: j.jurisdiction_id,
      label: j.name,
    })),
    status: uniqueOptions(
      records.map((r) => r.status),
      (v) => taxonomyLabel(taxonomies, "regulatory-statuses", v),
    ),
    review: uniqueOptions(
      records.map((r) => r.review_status),
      (v) => taxonomyLabel(taxonomies, "review-statuses", v),
    ),
    jMap,
  };
}

export function sourceFilterOptions() {
  const taxonomies = getTaxonomies();
  const sources = getSources();
  const jurisdictions = getJurisdictions();

  return {
    jurisdiction: jurisdictions.map((j) => ({
      value: j.jurisdiction_id,
      label: j.name,
    })),
    credibility: uniqueOptions(
      sources.map((s) => s.credibility_level),
      (v) => taxonomyLabel(taxonomies, "source-credibility-levels", v),
    ),
    review: uniqueOptions(
      sources.map((s) => s.review_status),
      (v) => taxonomyLabel(taxonomies, "review-statuses", v),
    ),
  };
}

export function changeFilterOptions() {
  const taxonomies = getTaxonomies();
  const changes = getChanges();
  const jurisdictions = getJurisdictions();

  return {
    jurisdiction: jurisdictions.map((j) => ({
      value: j.jurisdiction_id,
      label: j.name,
    })),
    changeType: uniqueOptions(
      changes.map((c) => c.change_type),
      (v) => taxonomyLabel(taxonomies, "change-types", v),
    ),
    confidence: uniqueOptions(changes.map((c) => c.confidence_level)),
    review: uniqueOptions(
      changes.map((c) => c.review_status),
      (v) => taxonomyLabel(taxonomies, "review-statuses", v),
    ),
    humanReview: [
      { value: "true", label: "Required" },
      { value: "false", label: "Not flagged" },
    ],
  };
}

export function groupJurisdictionsByRegion() {
  const jurisdictions = getJurisdictions();
  const groups = new Map<string, typeof jurisdictions>();

  for (const j of jurisdictions) {
    const region = j.region;
    if (!groups.has(region)) groups.set(region, []);
    groups.get(region)!.push(j);
  }

  return [...groups.entries()]
    .map(([region, items]) => ({
      region,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

export function groupSourcesByRegion<T extends { jurisdiction_id: string }>(
  items: T[],
): { region: string; jurisdictions: { id: string; name: string; items: T[] }[] }[] {
  const jurisdictions = getJurisdictions();
  const jMap = Object.fromEntries(
    jurisdictions.map((j) => [j.jurisdiction_id, { name: j.name, region: j.region }]),
  );
  const byRegion = new Map<string, Map<string, T[]>>();

  for (const item of items) {
    const meta = jMap[item.jurisdiction_id];
    const region = meta?.region ?? "Other";
    const jid = item.jurisdiction_id;
    if (!byRegion.has(region)) byRegion.set(region, new Map());
    const regionMap = byRegion.get(region)!;
    if (!regionMap.has(jid)) regionMap.set(jid, []);
    regionMap.get(jid)!.push(item);
  }

  return [...byRegion.entries()]
    .map(([region, jGroups]) => ({
      region,
      jurisdictions: [...jGroups.entries()]
        .map(([id, groupItems]) => ({
          id,
          name: jMap[id]?.name ?? id,
          items: groupItems,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

export function groupByJurisdiction<T extends { jurisdiction_id: string }>(
  items: T[],
): { id: string; name: string; items: T[] }[] {
  const jurisdictions = getJurisdictions();
  const jMap = Object.fromEntries(jurisdictions.map((j) => [j.jurisdiction_id, j.name]));
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const id = item.jurisdiction_id;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(item);
  }

  return [...groups.entries()]
    .map(([id, groupItems]) => ({
      id,
      name: jMap[id] ?? id,
      items: groupItems,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
