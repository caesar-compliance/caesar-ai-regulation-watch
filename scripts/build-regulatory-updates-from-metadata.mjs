#!/usr/bin/env node
/**
 * T049 — Build regulatory_update candidates from repo-local metadata only.
 * No network requests. offline_metadata_adapter; all evidence gates false.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion } from "./lib/read-project-version.mjs";
import {
  GENERATED_BATCH_FILENAME,
  expandRegulatoryUpdateFile,
  listRegulatoryUpdateFiles,
  loadYamlByPrefix,
  loadYamlDir,
} from "./lib/load-regulatory-updates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = path.join(ROOT, "data/regulatory-updates", GENERATED_BATCH_FILENAME);

const LEGAL_SAFE_NOTE =
  "T049 offline metadata adapter. Generated from repository monitoring/registry metadata only. " +
  "Not verified on official source. Not legal advice. Not a legal change claim. Not client or final evidence.";

const TOPIC_ALIASES = {
  gdpr: "privacy",
  ai_and_privacy: "privacy",
  ai_act: "eu_ai_act",
  eu_ai_act: "eu_ai_act",
  genai: "china_genai",
  high_risk: "risk_management",
  gpai: "gpai",
};

function slugId(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function dateOnly(isoOrDate) {
  if (!isoOrDate) return "2026-05-20";
  const s = String(isoOrDate);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function loadSourcesMap() {
  const map = {};
  for (const s of loadYamlDir(ROOT, "data/sources")) {
    if (s?.source_id) map[s.source_id] = s;
  }
  return map;
}

function loadCountryStatusMap() {
  const map = {};
  for (const cs of loadYamlDir(ROOT, "data/country-status")) {
    if (cs?.jurisdiction_id) map[cs.jurisdiction_id] = cs;
  }
  return map;
}

function loadValidTopicIds() {
  return new Set(
    loadYamlDir(ROOT, "data/topics").map((t) => t.topic_id).filter(Boolean),
  );
}

function mapTopics(rawTopics, validTopicIds) {
  const tags = new Set(["source_monitoring"]);
  for (const raw of rawTopics ?? []) {
    const normalized = TOPIC_ALIASES[raw] ?? String(raw).replace(/-/g, "_");
    if (validTopicIds.has(normalized)) tags.add(normalized);
  }
  if (tags.size === 1 && validTopicIds.has("source_monitoring")) {
    return ["source_monitoring"];
  }
  return [...tags];
}

function mapChangeTypeToUpdateType(changeType) {
  const map = {
    metadata: "source_monitoring",
    status_change: "institutional_update",
    new_document: "guidance",
    guidance_update: "guidance",
    implementation_update: "institutional_update",
    content: "guidance",
    removed: "source_monitoring",
    unknown: "source_monitoring",
  };
  return map[changeType] ?? "source_monitoring";
}

function mapConfidence(level) {
  const m = { high: "high", medium: "medium", low: "low" };
  return m[level] ?? "medium";
}

function mapImportance(significance) {
  const m = { high: "high", medium: "medium", low: "low" };
  return m[significance] ?? "medium";
}

function baseRecord({
  update_id,
  update_date,
  jurisdiction_id,
  title,
  update_type,
  summary,
  source_ids,
  source_urls,
  topic_tags,
  status_bucket,
  importance,
  confidence_score,
  adapter_input_ref,
}) {
  return {
    update_id,
    update_date,
    jurisdiction_id,
    title,
    update_type,
    summary,
    source_ids,
    source_urls,
    topic_tags,
    status_bucket,
    importance,
    confidence_score,
    automation_method: "offline_metadata_adapter",
    requires_human_review: false,
    client_evidence_allowed: false,
    final_evidence_allowed: false,
    legal_change_claimed: false,
    legal_safe_note: `${LEGAL_SAFE_NOTE} Input: ${adapter_input_ref}.`,
  };
}

function resolveSource(sourceId, sourcesMap) {
  const source = sourcesMap[sourceId];
  if (!source?.official_url) return null;
  return {
    source_ids: [sourceId],
    source_urls: [source.official_url],
    jurisdiction_id: source.jurisdiction_id,
    related_topics: source.related_topics ?? source.expected_update_types ?? [],
  };
}

function collectFromDetectedChanges(sourcesMap, countryMap, validTopicIds) {
  const items = [];
  for (const dc of loadYamlDir(ROOT, "data/detected-changes")) {
    if (!dc?.detected_change_id || !dc?.source_id) continue;
    const resolved = resolveSource(dc.source_id, sourcesMap);
    if (!resolved) continue;
    const update_id = `adapter-detected-${slugId(dc.detected_change_id)}`;
    const cs = countryMap[dc.jurisdiction_id ?? resolved.jurisdiction_id];
    const sim = dc.simulation ? "[Repository simulation metadata] " : "";
    items.push(
      baseRecord({
        update_id,
        update_date: dateOnly(dc.detected_at),
        jurisdiction_id: dc.jurisdiction_id ?? resolved.jurisdiction_id,
        title: `Detected change signal — ${dc.source_id}`,
        update_type: "source_monitoring",
        summary: `${sim}${dc.change_summary_for_review ?? "Monitoring pipeline detected change metadata in repository."}`.trim(),
        source_ids: resolved.source_ids,
        source_urls: resolved.source_urls,
        topic_tags: mapTopics(
          [...(resolved.related_topics ?? []), "source_monitoring"],
          validTopicIds,
        ),
        status_bucket: cs?.status_bucket ?? "monitoring",
        importance: mapImportance(dc.significance_level),
        confidence_score: mapConfidence(dc.confidence_level),
        adapter_input_ref: `detected-changes/${dc.detected_change_id}`,
      }),
    );
  }
  return items;
}

function collectFromChanges(sourcesMap, countryMap, validTopicIds) {
  const items = [];
  for (const ch of loadYamlDir(ROOT, "data/changes")) {
    if (!ch?.change_id || !ch?.source_id) continue;
    const resolved = resolveSource(ch.source_id, sourcesMap);
    if (!resolved) continue;
    const update_id = `adapter-change-${slugId(ch.change_id)}`;
    const cs = countryMap[ch.jurisdiction_id ?? resolved.jurisdiction_id];
    items.push(
      baseRecord({
        update_id,
        update_date: dateOnly(ch.detected_date),
        jurisdiction_id: ch.jurisdiction_id ?? resolved.jurisdiction_id,
        title: `Sample change record — ${ch.change_id}`,
        update_type: mapChangeTypeToUpdateType(ch.change_type),
        summary: `[Manual sample change metadata] ${ch.change_summary_for_review ?? ch.change_id}. Not an automated live detection.`,
        source_ids: resolved.source_ids,
        source_urls: resolved.source_urls,
        topic_tags: mapTopics(resolved.related_topics, validTopicIds),
        status_bucket: cs?.status_bucket ?? "monitoring",
        importance: "medium",
        confidence_score: mapConfidence(ch.confidence_level),
        adapter_input_ref: `changes/${ch.change_id}`,
      }),
    );
  }
  return items;
}

function collectFromChangeReviewPacks(sourcesMap, countryMap, validTopicIds) {
  const items = [];
  for (const pack of loadYamlByPrefix(ROOT, "data/monitoring", "change-review-pack")) {
    const packDate = dateOnly(pack.generated_at);
    for (const review of pack.reviews ?? []) {
      if (!review.change_detected || !review.source_id) continue;
      const resolved = resolveSource(review.source_id, sourcesMap);
      if (!resolved) continue;
      const fieldsKey = slugId((review.changed_fields ?? []).join("-") || "metadata");
      const update_id = `adapter-crp-${review.source_id}-${fieldsKey}`;
      const cs = countryMap[resolved.jurisdiction_id];
      items.push(
        baseRecord({
          update_id,
          update_date: packDate,
          jurisdiction_id: resolved.jurisdiction_id,
          title: `Metadata review signal — ${review.source_id}`,
          update_type: "source_monitoring",
          summary: `[Change review pack metadata] ${review.notes ?? "Metadata difference flagged for governance review."} Not a legal change claim.`,
          source_ids: resolved.source_ids,
          source_urls: review.official_url ? [review.official_url] : resolved.source_urls,
          topic_tags: mapTopics(
            [...(resolved.related_topics ?? []), "source_monitoring"],
            validTopicIds,
          ),
          status_bucket: cs?.status_bucket ?? "monitoring",
          importance: "medium",
          confidence_score: "medium",
          adapter_input_ref: `monitoring/${pack.change_review_pack_id}/${review.source_id}`,
        }),
      );
    }
  }
  return items;
}

function collectFromMetadataTriage(sourcesMap, countryMap, validTopicIds) {
  const items = [];
  const actionable = new Set(["metadata_change_needs_review", "check_artifact"]);
  for (const batch of loadYamlByPrefix(ROOT, "data/monitoring", "metadata-review-triage")) {
    const batchDate = dateOnly(batch.generated_at);
    for (const item of batch.items ?? []) {
      if (!actionable.has(item.triage_classification) || !item.source_id) continue;
      const resolved = resolveSource(item.source_id, sourcesMap);
      if (!resolved) continue;
      const update_id = `adapter-triage-${slugId(item.triage_id ?? item.source_id)}`;
      const cs = countryMap[resolved.jurisdiction_id];
      items.push(
        baseRecord({
          update_id,
          update_date: dateOnly(item.access_date) || batchDate,
          jurisdiction_id: resolved.jurisdiction_id,
          title: `Live metadata triage — ${item.source_id}`,
          update_type: "source_monitoring",
          summary: `[Metadata triage] ${item.reviewer_note ?? item.triage_classification}. Not a legal or regulatory change claim.`,
          source_ids: resolved.source_ids,
          source_urls: item.official_url ? [item.official_url] : resolved.source_urls,
          topic_tags: mapTopics(
            [...(resolved.related_topics ?? []), "source_monitoring"],
            validTopicIds,
          ),
          status_bucket: cs?.status_bucket ?? "monitoring",
          importance: item.triage_classification === "check_artifact" ? "high" : "medium",
          confidence_score: "medium",
          adapter_input_ref: `monitoring/${batch.triage_batch_id}/${item.triage_id}`,
        }),
      );
    }
  }
  return items;
}

function collectFromDiscoveryLeads(sourcesMap, countryMap, validTopicIds, existingSourceKeys) {
  const items = [];
  for (const batch of loadYamlByPrefix(ROOT, "data/source-discovery", "source-discovery-leads")) {
    const batchDate = dateOnly(batch.generated_at);
    for (const lead of batch.leads ?? []) {
      if (!lead.official_source_verified || lead.verification_status !== "official_source_confirmed") {
        continue;
      }
      const sourceId = lead.promoted_source_id ?? lead.existing_source_id;
      if (!sourceId) continue;
      const key = `${lead.jurisdiction_id}:${sourceId}`;
      if (existingSourceKeys.has(key)) continue;
      const resolved = resolveSource(sourceId, sourcesMap);
      const url = lead.candidate_official_url ?? resolved?.source_urls?.[0];
      if (!url || !lead.jurisdiction_id) continue;
      const update_id = `adapter-lead-${slugId(lead.lead_id)}`;
      const cs = countryMap[lead.jurisdiction_id];
      items.push(
        baseRecord({
          update_id,
          update_date: dateOnly(lead.access_date) || batchDate,
          jurisdiction_id: lead.jurisdiction_id,
          title: lead.verified_title
            ? `Source registry signal — ${lead.verified_title}`
            : `Source registry signal — ${sourceId}`,
          update_type: "institutional_update",
          summary: `[Source discovery lead metadata] Official source confirmed in repository registry expansion batch. Competitor URLs used as discovery leads only; no competitor text copied.`,
          source_ids: [sourceId],
          source_urls: [url],
          topic_tags: mapTopics(
            resolved?.related_topics ?? ["source_monitoring"],
            validTopicIds,
          ),
          status_bucket: cs?.status_bucket ?? "monitoring",
          importance: "low",
          confidence_score: "medium",
          adapter_input_ref: `source-discovery/${lead.lead_id}`,
        }),
      );
    }
  }
  return items;
}

function loadExistingManualRecords() {
  const manual = [];
  for (const file of listRegulatoryUpdateFiles(ROOT)) {
    if (path.basename(file) === GENERATED_BATCH_FILENAME) continue;
    const data = yaml.load(fs.readFileSync(file, "utf8"));
    for (const item of expandRegulatoryUpdateFile(data)) {
      if (item.automation_method === "manual_seed") manual.push(item);
    }
  }
  return manual;
}

function dedupeCandidates(candidates, manualRecords) {
  const seenIds = new Set(manualRecords.map((m) => m.update_id));
  const seenSourceDay = new Set(
    manualRecords.map((m) => `${m.jurisdiction_id}:${(m.source_ids ?? []).join(",")}:${m.update_date}`),
  );
  const out = [];
  for (const c of candidates) {
    if (seenIds.has(c.update_id)) continue;
    const sdKey = `${c.jurisdiction_id}:${c.source_ids.join(",")}:${c.update_date}`;
    if (seenSourceDay.has(sdKey)) continue;
    if (seenIds.has(c.update_id)) continue;
    seenIds.add(c.update_id);
    seenSourceDay.add(sdKey);
    out.push(c);
  }
  return out.sort((a, b) => b.update_date.localeCompare(a.update_date));
}

function main() {
  const sourcesMap = loadSourcesMap();
  const countryMap = loadCountryStatusMap();
  const validTopicIds = loadValidTopicIds();
  const manualRecords = loadExistingManualRecords();
  const existingSourceKeys = new Set(
    manualRecords.map((m) => `${m.jurisdiction_id}:${(m.source_ids ?? [])[0] ?? ""}`),
  );

  const candidates = [
    ...collectFromDetectedChanges(sourcesMap, countryMap, validTopicIds),
    ...collectFromChanges(sourcesMap, countryMap, validTopicIds),
    ...collectFromChangeReviewPacks(sourcesMap, countryMap, validTopicIds),
    ...collectFromMetadataTriage(sourcesMap, countryMap, validTopicIds),
    ...collectFromDiscoveryLeads(
      sourcesMap,
      countryMap,
      validTopicIds,
      existingSourceKeys,
    ),
  ];

  const items = dedupeCandidates(candidates, manualRecords);

  const batch = {
    generated_batch_id: "regulatory-updates-generated-from-metadata",
    generated_at: dateOnly(new Date().toISOString()),
    product_version: readProjectVersion(),
    automation_method: "offline_metadata_adapter",
    legal_safe_note: LEGAL_SAFE_NOTE,
    adapter_input_sources: [
      "data/detected-changes/",
      "data/changes/",
      "data/monitoring/change-review-pack-*.yml",
      "data/monitoring/metadata-review-triage-*.yml",
      "data/source-discovery/source-discovery-leads-*.yml",
      "data/sources/ (official_url resolution)",
      "data/country-status/ (status_bucket)",
    ],
    item_count: items.length,
    items,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, yaml.dump(batch, { lineWidth: 120, noRefs: true }), "utf8");

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  adapter candidates: ${items.length}`);
  console.log(`  manual_seed (unchanged): ${manualRecords.length}`);
}

main();
