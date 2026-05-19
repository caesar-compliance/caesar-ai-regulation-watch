#!/usr/bin/env node
/**
 * Safe local API watcher simulation (v0.7.3).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { classifyApiSnapshotDiff, API_SIMULATION_LEGAL_NOTE } from "./lib/api-diff.mjs";
import { writeYaml } from "./lib/source-adapters/shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.WATCHER_RUN_DATE ?? "2026-05-19";
const RUN_ID = `watcher-run-api-simulation-${RUN_DATE}`;
const FIXTURES = path.join(ROOT, "test-fixtures/api-snapshots");
const SNAPSHOTS_ROOT = path.join(ROOT, "data/snapshots");
const DETECTED_ROOT = path.join(ROOT, "data/detected-changes");
const RUNS_ROOT = path.join(ROOT, "data/watcher-runs");
const WATCHER_CONFIG = path.join(ROOT, "data/watchers/official-source-watchers.yml");

const SOURCE_ID = "us-federal-register";
const WATCHER_ID = "watcher-us-federal-register-api";
const DETECTED_ID = `simulated-us-federal-register-api-change-${RUN_DATE}`;

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function main() {
  console.log("\nCaesar AI Regulation Watch — API watcher simulation (v0.7.3)");
  const before = readYaml(path.join(FIXTURES, "federal-register-before.yml"));
  const after = readYaml(path.join(FIXTURES, "federal-register-after.yml"));
  const config = readYaml(WATCHER_CONFIG);
  const watcher = (config.watchers ?? []).find((w) => w.watcher_id === WATCHER_ID);
  if (!watcher) {
    console.error(`Watcher ${WATCHER_ID} not found`);
    process.exit(1);
  }

  const latestPath = path.join(SNAPSHOTS_ROOT, SOURCE_ID, "latest.yml");
  if (fs.existsSync(latestPath)) {
    console.log(`Preserving latest.yml: ${readYaml(latestPath).snapshot_id}`);
  }

  for (const fixture of [before, after]) {
    writeYaml(
      path.join(SNAPSHOTS_ROOT, SOURCE_ID, `${fixture.snapshot_id}.yml`),
      fixture,
      `# Simulation fixture API snapshot\n\n`,
    );
  }

  const changes = classifyApiSnapshotDiff(before, after, watcher, {
    runDate: RUN_DATE,
    simulation: true,
  });
  const change = changes.find((c) => c.change_type === "new_api_result");
  if (!change) {
    console.error("No new_api_result diff from fixtures");
    process.exit(1);
  }

  writeYaml(
    path.join(DETECTED_ROOT, `${DETECTED_ID}.yml`),
    { ...change, detected_change_id: DETECTED_ID },
    "# Simulated API detected change\n\n",
  );

  writeYaml(
    path.join(RUNS_ROOT, `${RUN_ID}.yml`),
    {
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
      api_checked_count: 1,
      changed_count: 1,
      error_count: 0,
      detected_change_ids: [DETECTED_ID],
      error_summaries: [],
      results: [
        {
          watcher_id: WATCHER_ID,
          source_id: SOURCE_ID,
          adapter_id: "official_api_metadata",
          status: "change_detected",
          snapshot_id: after.snapshot_id,
          previous_snapshot_id: before.snapshot_id,
          detected_change_id: DETECTED_ID,
          error_message: null,
          error_category: null,
        },
      ],
      legal_safe_note: API_SIMULATION_LEGAL_NOTE,
    },
    `# API simulation run — ${RUN_DATE}\n\n`,
  );

  console.log(`Wrote ${DETECTED_ID}`);
}

main();
