#!/usr/bin/env node
/**
 * Source pilot dry-run — fixture diff simulation, rebuild status export, no network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";
import { loadFixtureSnapshot, listFixtureVersions } from "./fixture-adapter.mjs";
import { diffSnapshots } from "./diff-source-pilot-snapshots.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const REGISTRY_PATH = path.join(ROOT, "data/runtime/source-pilot-registry.yml");
const REPORT_DIR = path.join(ROOT, "generated/source-pilot");

function main() {
  const registry = yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const report = {
    mode: "fixture_dry_run",
    network_used: false,
    checked_at: new Date().toISOString(),
    sources: [],
  };

  for (const entry of registry.sources ?? []) {
    const versions = listFixtureVersions(entry.source_id);
    let diff = { total_changes: 0 };
    if (versions.length >= 2) {
      const prev = loadFixtureSnapshot(entry, { fixtureVersion: versions[versions.length - 2] });
      const next = loadFixtureSnapshot(entry, { fixtureVersion: versions[versions.length - 1] });
      diff = diffSnapshots(prev, next);
    } else {
      const snap = loadFixtureSnapshot(entry);
      diff = { total_changes: 0, item_count: snap.item_count };
    }
    report.sources.push({
      source_id: entry.source_id,
      fixture_versions: versions,
      metadata_changes: diff.total_changes,
      monitoring_status: entry.monitoring_status,
    });
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORT_DIR, "dry-run-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  const build = spawnSync("node", ["scripts/runtime/source-pilot/build-source-pilot-snapshot.mjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (build.status !== 0) process.exit(build.status ?? 1);

  console.log("PASS: runtime:source-pilot:dry-run (fixture-only, no network)");
}

main();
