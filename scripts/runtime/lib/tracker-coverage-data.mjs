/**
 * T080 — Load tracker YAML (regulation records, jurisdiction profile cards).
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const LEVEL_SCORES = {
  high: 85,
  medium: 55,
  low: 30,
  unknown: 15,
};

export function trackerDataRoot(root) {
  return path.join(root, "data/tracker");
}

export function loadRegulationRecords(root) {
  const file = path.join(trackerDataRoot(root), "regulation-records.yml");
  if (!fs.existsSync(file)) return { records: [] };
  const doc = yaml.load(fs.readFileSync(file, "utf8"));
  return { records: doc?.records ?? [] };
}

export function loadJurisdictionProfileCards(root) {
  const file = path.join(trackerDataRoot(root), "jurisdiction-profile-cards.yml");
  if (!fs.existsSync(file)) return { profiles: [] };
  const doc = yaml.load(fs.readFileSync(file, "utf8"));
  return { profiles: doc?.profiles ?? [] };
}

export function levelToScore(level) {
  return LEVEL_SCORES[level] ?? LEVEL_SCORES.unknown;
}

export function countRecordsByJurisdiction(records) {
  const map = new Map();
  for (const r of records) {
    const id = r.jurisdiction_id;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

export function countSourcesByJurisdiction(registry) {
  const map = new Map();
  for (const source of registry.sources ?? []) {
    for (const jid of source.jurisdiction_ids ?? []) {
      if (!map.has(jid)) map.set(jid, { total: 0, automated: 0, manual: 0 });
      const row = map.get(jid);
      row.total += 1;
      if (source.fetch_mode === "automated_metadata") row.automated += 1;
      else row.manual += 1;
    }
  }
  return map;
}

export function enrichProfiles(profiles, recordCounts, sourceCounts) {
  return profiles.map((p) => {
    const src = sourceCounts.get(p.jurisdiction_id) ?? {
      total: 0,
      automated: 0,
      manual: 0,
    };
    const regCount = recordCounts.get(p.jurisdiction_id) ?? 0;
    return {
      ...p,
      monitored_sources_count: src.total,
      automated_sources_count: src.automated,
      manual_sources_count: src.manual,
      regulation_records_count: regCount,
      maturity_score: levelToScore(p.maturity_level),
      activity_score: levelToScore(p.activity_level),
      freshness_score: levelToScore(p.source_freshness),
      confidence_score: levelToScore(p.coverage_confidence),
      review_required: true,
      gates: {
        verified_on_source: false,
        client_use_allowed: false,
        final_evidence_allowed: false,
        legal_change_claimed: false,
      },
    };
  });
}

export function buildMapMetricsFromProfiles(profiles) {
  return profiles.map((p) => ({
    jurisdiction_id: p.jurisdiction_id,
    label: p.display_name,
    region: p.region,
    maturity_score: p.maturity_score,
    activity_score: p.activity_score,
    freshness_score: p.freshness_score,
    confidence_score: p.confidence_score,
    maturity_level: p.maturity_level,
    activity_level: p.activity_level,
    source_freshness: p.source_freshness,
    coverage_confidence: p.coverage_confidence,
    status_headline: p.status_headline,
    latest_change_at: null,
    source_count: p.monitored_sources_count,
    regulation_count: p.regulation_records_count,
    review_required: true,
    review_status: p.review_status,
  }));
}
