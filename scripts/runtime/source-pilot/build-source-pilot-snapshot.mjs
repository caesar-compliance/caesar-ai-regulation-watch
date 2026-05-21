#!/usr/bin/env node
/**
 * Build public source-pilot-status.json from registry + fixture snapshots (no network).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadFixtureSnapshot, listFixtureVersions } from "./fixture-adapter.mjs";
import { diffSnapshots } from "./diff-source-pilot-snapshots.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const REGISTRY_PATH = path.join(ROOT, "data/runtime/source-pilot-registry.yml");
const OUTPUT = path.join(ROOT, "public/data/source-pilot-status.json");
const GENERATED_DIR = path.join(ROOT, "generated/source-pilot");

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

function loadRegistry() {
  return yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
}

function main() {
  const registry = loadRegistry();
  const sources = registry.sources ?? [];
  let detected_metadata_changes_count = 0;
  let latest_fixture_snapshot_at = null;

  const sourceStatuses = sources.map((entry) => {
    const versions = listFixtureVersions(entry.source_id);
    const latestVersion = versions[versions.length - 1] ?? "v1";
    const snapshot = loadFixtureSnapshot(entry, { fixtureVersion: latestVersion });

    if (versions.length >= 2) {
      const prev = loadFixtureSnapshot(entry, { fixtureVersion: versions[versions.length - 2] });
      const diff = diffSnapshots(prev, snapshot);
      detected_metadata_changes_count += diff.total_changes;
    }

    if (snapshot.snapshot_at) {
      if (!latest_fixture_snapshot_at || snapshot.snapshot_at > latest_fixture_snapshot_at) {
        latest_fixture_snapshot_at = snapshot.snapshot_at;
      }
    }

    return {
      source_id: entry.source_id,
      source_name: entry.source_name,
      monitoring_status: entry.monitoring_status,
      adapter_type: entry.adapter_type,
      official_url: entry.official_url,
      fixture_snapshot_version: snapshot.fixture_version,
      item_count: snapshot.item_count,
      metadata_hash: snapshot.metadata_hash,
      allowed_for_network_check: false,
      stores_metadata_only: true,
    };
  });

  const status = {
    status: "framework_ready",
    checked_at: new Date().toISOString(),
    source_count: sourceStatuses.length,
    sources: sourceStatuses,
    latest_fixture_snapshot_at,
    detected_metadata_changes_count,
    runtime_flags: RUNTIME_FLAGS,
    gates: CLOSED_GATES,
    public_note:
      "T075A controlled source pilot framework. Fixture-only metadata snapshots; no live network execution, no scheduled monitoring, no full legal text. Supabase runtime connection and explicit network approval required for next phases.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(status, null, 2)}\n`, "utf8");

  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(GENERATED_DIR, "latest-snapshot-summary.json"),
    `${JSON.stringify({ generated_at: status.checked_at, sources: sourceStatuses }, null, 2)}\n`,
    "utf8",
  );

  console.log(`Wrote ${OUTPUT} (${sourceStatuses.length} sources)`);
}

main();
