#!/usr/bin/env node
/**
 * Safe local feed watcher simulation (v0.7.2).
 * Fixtures only; no network; does not update latest.yml.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { classifyFeedSnapshotDiff, FEED_SIMULATION_LEGAL_NOTE } from "./lib/feed-diff.mjs";
import { writeYaml } from "./lib/source-adapters/shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.WATCHER_RUN_DATE ?? "2026-05-19";
const RUN_ID = `watcher-run-feed-simulation-${RUN_DATE}`;
const FIXTURES = path.join(ROOT, "test-fixtures/feed-snapshots");
const SNAPSHOTS_ROOT = path.join(ROOT, "data/snapshots");
const DETECTED_ROOT = path.join(ROOT, "data/detected-changes");
const RUNS_ROOT = path.join(ROOT, "data/watcher-runs");
const WATCHER_CONFIG = path.join(ROOT, "data/watchers/official-source-watchers.yml");

const SOURCE_ID = "edpb";
const WATCHER_ID = "watcher-edpb-feed";
const DETECTED_ID = `simulated-edpb-feed-change-${RUN_DATE}`;

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function copyFixtureSnapshot(fixture, label) {
  const dest = path.join(SNAPSHOTS_ROOT, SOURCE_ID, `${fixture.snapshot_id}.yml`);
  writeYaml(
    dest,
    fixture,
    `# Simulation fixture feed snapshot (${label}) — does not replace latest.yml\n\n`,
  );
}

function main() {
  console.log("\nCaesar AI Regulation Watch — feed watcher simulation (v0.7.2)");
  console.log("Mode: simulation (fixtures only, no network)");

  const before = readYaml(path.join(FIXTURES, "feed-before.yml"));
  const after = readYaml(path.join(FIXTURES, "feed-after.yml"));
  const config = readYaml(WATCHER_CONFIG);
  const watcher = (config.watchers ?? []).find((w) => w.watcher_id === WATCHER_ID);
  if (!watcher) {
    console.error(`Watcher ${WATCHER_ID} not found in config`);
    process.exit(1);
  }

  const latestPath = path.join(SNAPSHOTS_ROOT, SOURCE_ID, "latest.yml");
  if (fs.existsSync(latestPath)) {
    const latest = readYaml(latestPath);
    console.log(`Preserving latest.yml pointer: ${latest.snapshot_id}`);
  }

  copyFixtureSnapshot(before, "before");
  copyFixtureSnapshot(after, "after");

  const changes = classifyFeedSnapshotDiff(before, after, watcher, {
    runDate: RUN_DATE,
    simulation: true,
  });
  const newEntryChange = changes.find((c) => c.change_type === "new_feed_entry");
  if (!newEntryChange) {
    console.error("Fixture pair produced no new_feed_entry diff");
    process.exit(1);
  }

  const change = { ...newEntryChange, detected_change_id: DETECTED_ID };
  const detectedPath = path.join(DETECTED_ROOT, `${DETECTED_ID}.yml`);
  writeYaml(
    detectedPath,
    change,
    "# Simulated feed detected change — pipeline validation only\n\n",
  );

  const runLog = {
    run_id: RUN_ID,
    run_date: RUN_DATE,
    run_mode: "simulation",
    mode: "simulation",
    safe_mode: true,
    fixture_only: true,
    network_disabled: true,
    preserves_latest_snapshots: true,
    watcher_count: 1,
    checked_count: 1,
    feed_checked_count: 1,
    page_checked_count: 0,
    changed_count: 1,
    error_count: 0,
    detected_change_ids: [DETECTED_ID],
    error_summaries: [],
    results: [
      {
        watcher_id: WATCHER_ID,
        source_id: SOURCE_ID,
        status: "change_detected",
        snapshot_id: after.snapshot_id,
        previous_snapshot_id: before.snapshot_id,
        detected_change_id: DETECTED_ID,
        error_message: null,
      },
    ],
    legal_safe_note: FEED_SIMULATION_LEGAL_NOTE,
  };

  fs.mkdirSync(RUNS_ROOT, { recursive: true });
  writeYaml(
    path.join(RUNS_ROOT, `${RUN_ID}.yml`),
    runLog,
    `# Feed watcher simulation run — ${RUN_DATE}\n\n`,
  );

  console.log(`Wrote ${path.relative(ROOT, detectedPath)}`);
  console.log(`Change type: ${change.change_type}`);
  console.log(`Significance: ${change.significance_level}`);
}

main();
