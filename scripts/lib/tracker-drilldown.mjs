/**
 * T051 — Region/topic drilldown exports (mirrors src/lib/tracker-drilldown.ts).
 */

export const CLOSED_LEGAL_FLAGS = {
  verified_on_source: false,
  client_use_allowed: false,
  client_evidence_allowed: false,
  final_evidence_allowed: false,
  legal_change_claimed: false,
};

export function regionSlug(region) {
  return region
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function compareRoute(ids) {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 4);
  if (unique.length === 0) return "/compare/";
  return `/compare/?${unique.map((id) => `ids=${encodeURIComponent(id)}`).join("&")}`;
}

export function comparePeersFor(jurisdictionId, region) {
  const peers = [jurisdictionId];
  if (jurisdictionId !== "eu") peers.push("eu");
  if (jurisdictionId !== "uk" && region === "Europe") peers.push("uk");
  if (jurisdictionId !== "us-federal" && region === "North America") peers.push("us-federal");
  return [...new Set(peers)].slice(0, 4);
}

function countBuckets(items) {
  const acc = {};
  for (const item of items) {
    acc[item.status_bucket] = (acc[item.status_bucket] ?? 0) + 1;
  }
  return acc;
}

export function buildRegionDrilldowns(countryStatuses, regulatoryUpdates) {
  const byRegion = new Map();
  for (const cs of countryStatuses) {
    const list = byRegion.get(cs.region) ?? [];
    list.push(cs);
    byRegion.set(cs.region, list);
  }

  return [...byRegion.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, items]) => {
      const jurisdiction_ids = items.map((i) => i.jurisdiction_id);
      const regionUpdates = regulatoryUpdates.filter((u) =>
        jurisdiction_ids.includes(u.jurisdiction_id),
      );
      const topicSet = new Set();
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

export function buildTopicDrilldowns(trackerTopics, countryStatuses, regulatoryUpdates) {
  return trackerTopics.map((topic) => {
    const tagged = countryStatuses.filter((cs) => cs.topic_tags.includes(topic.topic_id));
    const topicUpdates = regulatoryUpdates.filter((u) =>
      u.topic_tags.includes(topic.topic_id),
    );
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

export function buildJurisdictionProfileItems(
  enrichedCountryStatuses,
  regulatoryUpdates,
  sourceCountByJurisdiction,
  recordCountByJurisdiction,
  timelineCountByJurisdiction,
) {
  const updatesByJ = new Map();
  for (const u of regulatoryUpdates) {
    const list = updatesByJ.get(u.jurisdiction_id) ?? [];
    list.push(u);
    updatesByJ.set(u.jurisdiction_id, list);
  }

  return enrichedCountryStatuses.map((cs) => {
    const jurisdictionUpdates = updatesByJ.get(cs.jurisdiction_id) ?? [];
    return {
      jurisdiction_id: cs.jurisdiction_id,
      country_name: cs.country_name,
      region: cs.region,
      region_slug: regionSlug(cs.region),
      status_bucket: cs.status_bucket,
      status_label: cs.status_label,
      status_summary: String(cs.status_summary).trim(),
      confidence_score: cs.confidence_score,
      automation_method: cs.automation_method,
      topic_tags: cs.topic_tags,
      source_ids: cs.source_ids,
      update_ids: jurisdictionUpdates.map((u) => u.update_id),
      latest_update_ids: jurisdictionUpdates.slice(0, 5).map((u) => u.update_id),
      source_count: sourceCountByJurisdiction.get(cs.jurisdiction_id) ?? 0,
      update_count: jurisdictionUpdates.length,
      law_guidance_count: recordCountByJurisdiction.get(cs.jurisdiction_id) ?? 0,
      timeline_count: timelineCountByJurisdiction.get(cs.jurisdiction_id) ?? 0,
      regulation_maturity_score: cs.regulation_maturity_score,
      activity_score: cs.activity_score,
      route: `/jurisdictions/${cs.jurisdiction_id}/`,
      compare_route: compareRoute(comparePeersFor(cs.jurisdiction_id, cs.region)),
      ...CLOSED_LEGAL_FLAGS,
    };
  });
}
