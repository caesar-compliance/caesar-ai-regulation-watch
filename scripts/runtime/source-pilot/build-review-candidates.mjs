#!/usr/bin/env node
/**
 * Build public source-pilot-review-candidates.json from fixture diffs (no network).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadFixtureSnapshot, listFixtureVersions } from "./fixture-adapter.mjs";
import { diffSnapshots } from "./diff-source-pilot-snapshots.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const REGISTRY_PATH = path.join(ROOT, "data/runtime/source-pilot-registry.yml");
const OUTPUT = path.join(ROOT, "public/data/source-pilot-review-candidates.json");

const CLOSED_GATES = {
  verified_on_source: false,
  client_use_allowed: false,
  client_evidence_allowed: false,
  final_evidence_allowed: false,
  legal_change_claimed: false,
  publication_allowed: false,
  public_export_allowed: false,
};

const RUNTIME_FLAGS = {
  live_ingestion_enabled: false,
  scheduled_monitoring_enabled: false,
  network_execution_enabled: false,
};

const METADATA_FIELDS = ["title", "url", "published_at", "summary_snippet"];

/**
 * @param {Record<string, unknown>} prevItem
 * @param {Record<string, unknown>} nextItem
 */
function metadataFieldsChanged(prevItem, nextItem) {
  const changed = [];
  for (const field of METADATA_FIELDS) {
    if (prevItem[field] !== nextItem[field]) changed.push(field);
  }
  return changed;
}

/**
 * @param {import('./adapter-contract.mjs').SourcePilotRegistryEntry} entry
 * @param {Record<string, unknown>} item
 * @param {object} ctx
 */
function makeCandidate(entry, item, ctx) {
  const externalId = String(item.external_id ?? "");
  const candidateId = `sp-review-${entry.source_id}-${externalId}-fixture`;
  return {
    candidate_id: candidateId,
    source_id: entry.source_id,
    source_name: entry.source_name,
    source_type: entry.source_type,
    jurisdiction: entry.jurisdiction,
    candidate_status: ctx.candidate_status,
    change_type: ctx.change_type,
    detected_at: ctx.detected_at,
    title: item.title ?? null,
    official_url: item.url ?? entry.official_url,
    previous_metadata_hash: ctx.previous_metadata_hash,
    current_metadata_hash: ctx.current_metadata_hash,
    metadata_fields_changed: ctx.metadata_fields_changed,
    reviewer_status: ctx.reviewer_status,
    reviewer_notes_placeholder:
      "Offline operator notes placeholder — not persisted; no legal conclusions.",
    safety_flags: { ...CLOSED_GATES },
    runtime_flags: { ...RUNTIME_FLAGS },
    public_note:
      "Fixture-only simulated metadata change for operator review. Not verified on source; not legal change; gates closed.",
  };
}

function loadRegistry() {
  return yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function main() {
  const registry = loadRegistry();
  const sources = registry.sources ?? [];
  const candidates = [];
  let detected_metadata_changes_count = 0;
  let checked_at = "2026-05-21T10:00:00.000Z";

  for (const entry of sources) {
    const versions = listFixtureVersions(entry.source_id);
    if (versions.length < 2) continue;

    const prevVersion = versions[versions.length - 2];
    const nextVersion = versions[versions.length - 1];
    const prev = loadFixtureSnapshot(entry, { fixtureVersion: prevVersion });
    const next = loadFixtureSnapshot(entry, { fixtureVersion: nextVersion });
    const diff = diffSnapshots(prev, next);
    detected_metadata_changes_count += diff.total_changes;

    if (next.snapshot_at && next.snapshot_at > checked_at) {
      checked_at = next.snapshot_at;
    }

    const prevById = new Map((prev.items ?? []).map((i) => [i.external_id, i]));
    const nextById = new Map((next.items ?? []).map((i) => [i.external_id, i]));

    for (const externalId of diff.added_ids ?? []) {
      const item = nextById.get(externalId);
      if (!item) continue;
      const reviewerStatus = "pending_review";
      candidates.push(
        makeCandidate(entry, item, {
          candidate_status: "new_metadata_detected",
          change_type: "added",
          detected_at: next.snapshot_at ?? checked_at,
          previous_metadata_hash: prev.metadata_hash,
          current_metadata_hash: next.metadata_hash,
          metadata_fields_changed: ["item_added"],
          reviewer_status: reviewerStatus,
        }),
      );
    }

    for (const externalId of diff.changed_ids ?? []) {
      const item = nextById.get(externalId);
      const oldItem = prevById.get(externalId);
      if (!item || !oldItem) continue;
      candidates.push(
        makeCandidate(entry, item, {
          candidate_status: "metadata_fields_changed",
          change_type: "modified",
          detected_at: next.snapshot_at ?? checked_at,
          previous_metadata_hash: prev.metadata_hash,
          current_metadata_hash: next.metadata_hash,
          metadata_fields_changed: metadataFieldsChanged(oldItem, item),
          reviewer_status: "needs_source_verification",
        }),
      );
    }
  }

  candidates.sort((a, b) =>
    String(a.detected_at).localeCompare(String(b.detected_at)),
  );

  const exportDoc = {
    export_id: "source-pilot-review-candidates-2026-05-21-v075c",
    status: "reviewer_ready",
    mode: "fixture_only",
    checked_at,
    source_count: sources.length,
    candidate_count: candidates.length,
    detected_metadata_changes_count,
    candidates,
    runtime_flags: RUNTIME_FLAGS,
    gates: CLOSED_GATES,
    public_note:
      "T075C offline source pilot reviewer export. Metadata-only fixture diff simulation; no network; no Supabase; no full legal text. Evidence and publication gates remain closed.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(exportDoc, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${OUTPUT} (${candidates.length} candidates, ${detected_metadata_changes_count} simulated changes)`,
  );
}

main();
