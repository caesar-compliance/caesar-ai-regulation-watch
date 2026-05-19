#!/usr/bin/env node
/**
 * Safe local watcher change simulation (v0.7.1).
 * Uses test-fixtures only; no network; does not update latest.yml pointers.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  classifySnapshotDiff,
  buildDetectedChangeRecord,
  SIMULATION_LEGAL_SAFE_NOTE,
} from "./lib/watcher-diff.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.WATCHER_RUN_DATE ?? "2026-05-19";
const RUN_ID = `watcher-run-simulation-${RUN_DATE}`;
const FIXTURES = path.join(ROOT, "test-fixtures/watcher-snapshots");
const SNAPSHOTS_ROOT = path.join(ROOT, "data/snapshots");
const DETECTED_ROOT = path.join(ROOT, "data/detected-changes");
const RUNS_ROOT = path.join(ROOT, "data/watcher-runs");

const SOURCE_ID = "eu-ai-office";
const WATCHER_ID = "watcher-eu-ai-office";
const BEFORE_FIXTURE = "eu-ai-office-before.yml";
const AFTER_FIXTURE = "eu-ai-office-after.yml";
const DETECTED_ID = `simulated-eu-ai-office-change-${RUN_DATE}`;

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function writeYaml(filePath, data, header = "") {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    header + yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false }),
    "utf8",
  );
}

function copyFixtureSnapshot(fixture, label) {
  const dest = path.join(SNAPSHOTS_ROOT, SOURCE_ID, `${fixture.snapshot_id}.yml`);
  const header = `# Simulation fixture snapshot (${label}) — does not replace latest.yml\n# No full page body stored.\n\n`;
  writeYaml(dest, fixture, header);
  return dest;
}

function main() {
  console.log("\nCaesar AI Regulation Watch — watcher change simulation (v0.7.1)");
  console.log("Mode: simulation (fixtures only, no network)");

  const beforePath = path.join(FIXTURES, BEFORE_FIXTURE);
  const afterPath = path.join(FIXTURES, AFTER_FIXTURE);
  if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) {
    console.error("Missing fixture snapshots in test-fixtures/watcher-snapshots/");
    process.exit(1);
  }

  const before = readYaml(beforePath);
  const after = readYaml(afterPath);

  const latestPath = path.join(SNAPSHOTS_ROOT, SOURCE_ID, "latest.yml");
  if (fs.existsSync(latestPath)) {
    const latest = readYaml(latestPath);
    console.log(
      `Preserving latest.yml pointer: ${latest.snapshot_id} (simulation snapshots written separately)`,
    );
  }

  copyFixtureSnapshot(before, "before");
  copyFixtureSnapshot(after, "after");

  const diff = classifySnapshotDiff(before, after, { simulation: true });
  if (!diff) {
    console.error("Fixture pair produced no diff — check test fixtures.");
    process.exit(1);
  }

  const detectedAt = after.checked_at;
  const change = buildDetectedChangeRecord({
    detectedChangeId: DETECTED_ID,
    watcherId: WATCHER_ID,
    sourceId: SOURCE_ID,
    jurisdictionId: before.jurisdiction_id,
    detectedAt,
    previousSnapshotId: before.snapshot_id,
    currentSnapshotId: after.snapshot_id,
    diff,
  });

  const detectedPath = path.join(DETECTED_ROOT, `${DETECTED_ID}.yml`);
  writeYaml(
    detectedPath,
    change,
    "# Simulated detected change — pipeline validation only\n# Not an official source update.\n\n",
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
    legal_safe_note: SIMULATION_LEGAL_SAFE_NOTE,
  };

  fs.mkdirSync(RUNS_ROOT, { recursive: true });
  const runPath = path.join(RUNS_ROOT, `${RUN_ID}.yml`);
  writeYaml(
    runPath,
    runLog,
    `# Watcher simulation run — ${RUN_DATE}\n# Fixtures only; not CI; not live monitoring.\n\n`,
  );

  console.log(`Wrote ${path.relative(ROOT, detectedPath)}`);
  console.log(`Wrote ${path.relative(ROOT, runPath)}`);
  console.log(`Change type: ${diff.change_type}`);
  console.log(`Significance: ${diff.significance_level}`);
  console.log(`Changed fields: ${diff.changed_fields.join(", ")}`);
  console.log("Simulation complete — review queue export will include this item after generate:exports.");
}

main();
