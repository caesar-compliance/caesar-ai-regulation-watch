#!/usr/bin/env node
/**
 * Manual official-source watchers (v0.7.2).
 * Page metadata + RSS/Atom feed adapters. Not in CI.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  classifySnapshotDiff,
  buildDetectedChangeRecord,
  LEGAL_SAFE_NOTE,
} from "./lib/watcher-diff.mjs";
import { runPageMetadataWatcher } from "./lib/source-adapters/page-metadata-adapter.mjs";
import { runFeedWatcher } from "./lib/source-adapters/feed-adapter.mjs";
import { writeYaml } from "./lib/source-adapters/shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.WATCHER_RUN_DATE ?? "2026-05-19";
const RUN_ID = `watcher-run-${RUN_DATE}`;
const TIMEOUT_MS = Number(process.env.WATCHER_TIMEOUT_MS ?? 20000);
const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_NETWORK = process.argv.includes("--skip-network");
const USER_AGENT =
  "Caesar-AI-Regulation-Watch/0.7.2 official-source-watcher (governance review support)";

const WATCHER_CONFIG = path.join(ROOT, "data/watchers/official-source-watchers.yml");
const SNAPSHOTS_ROOT = path.join(ROOT, "data/snapshots");
const DETECTED_ROOT = path.join(ROOT, "data/detected-changes");
const RUNS_ROOT = path.join(ROOT, "data/watcher-runs");

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function listYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") && f !== "latest.yml")
    .map((f) => path.join(dir, f));
}

function loadSources() {
  const dir = path.join(ROOT, "data/sources");
  const map = {};
  for (const file of listYamlFiles(dir)) {
    const s = readYaml(file);
    if (s?.source_id) map[s.source_id] = s;
  }
  return map;
}

function latestSnapshotForSource(sourceId) {
  const latestPath = path.join(SNAPSHOTS_ROOT, sourceId, "latest.yml");
  if (!fs.existsSync(latestPath)) return null;
  const pointer = readYaml(latestPath);
  if (!pointer?.snapshot_id) return null;
  const snapPath = path.join(SNAPSHOTS_ROOT, sourceId, `${pointer.snapshot_id}.yml`);
  if (!fs.existsSync(snapPath)) return null;
  return readYaml(snapPath);
}

function writeSnapshot(snapshot) {
  const dir = path.join(SNAPSHOTS_ROOT, snapshot.source_id);
  const file = path.join(dir, `${snapshot.snapshot_id}.yml`);
  const label = snapshot.adapter_id === "official_rss_or_feed" ? "feed" : "page";
  const header = `# Metadata-only ${label} snapshot — ${snapshot.checked_at}\n# No article/page body stored.\n\n`;
  writeYaml(file, snapshot, header);
  const pointer = {
    snapshot_id: snapshot.snapshot_id,
    checked_at: snapshot.checked_at,
    watcher_id: snapshot.watcher_id,
    adapter_id: snapshot.adapter_id,
    storage_policy: snapshot.storage_policy,
  };
  writeYaml(
    path.join(dir, "latest.yml"),
    pointer,
    `# Latest snapshot pointer for ${snapshot.source_id}\n\n`,
  );
  return file;
}

function writeDetectedChange(change) {
  const file = path.join(DETECTED_ROOT, `${change.detected_change_id}.yml`);
  const header = `# Detected change — pending human review\n# Not a legal conclusion.\n\n`;
  writeYaml(file, change, header);
  return file;
}

function resolveAdapter(watcher) {
  const id = watcher.adapter_id ?? watcher.watcher_type;
  if (id === "official_rss_or_feed" || watcher.watcher_type === "official_rss_or_feed") {
    return "feed";
  }
  return "page";
}

async function runWatcher(watcher, context) {
  const kind = resolveAdapter(watcher);
  if (kind === "feed") {
    return runFeedWatcher(watcher, context);
  }
  return runPageMetadataWatcher(watcher, context);
}

async function main() {
  console.log("\nCaesar AI Regulation Watch — official source watchers (v0.7.2)");
  console.log(`Run date: ${RUN_DATE}`);
  console.log(`Run ID: ${RUN_ID}`);
  if (DRY_RUN) console.log("Mode: dry-run");
  if (SKIP_NETWORK) console.log("Mode: skip-network");

  const config = readYaml(WATCHER_CONFIG);
  const sources = loadSources();
  const context = {
    sources,
    dryRun: DRY_RUN,
    skipNetwork: SKIP_NETWORK,
    timeoutMs: TIMEOUT_MS,
    userAgent: USER_AGENT,
    runDate: RUN_DATE,
  };

  const results = [];
  const detectedChangeIds = [];
  const errorSummaries = [];
  let changedCount = 0;
  let errorCount = 0;
  let checkedCount = 0;
  let pageChecked = 0;
  let feedChecked = 0;

  for (const watcher of config.watchers ?? []) {
    if (!watcher.enabled) {
      results.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        status: "skipped_disabled",
        snapshot_id: null,
        previous_snapshot_id: null,
        detected_change_id: null,
        error_message: null,
      });
      continue;
    }

    const adapterLabel = resolveAdapter(watcher);
    process.stdout.write(
      `  Checking ${watcher.watcher_id} (${watcher.source_id}, ${adapterLabel})… `,
    );

    const previous = latestSnapshotForSource(watcher.source_id);
    const { snapshot, error, detectedChanges: feedChanges = [] } = await runWatcher(watcher, {
      ...context,
      previousSnapshot: previous,
    });

    if (!snapshot) {
      errorCount += 1;
      errorSummaries.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        message: error,
      });
      results.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        status: "error",
        snapshot_id: null,
        previous_snapshot_id: previous?.snapshot_id ?? null,
        detected_change_id: null,
        error_message: error,
      });
      console.log("error");
      continue;
    }

    if (error && error !== "dry_run" && error !== "skip_network") {
      errorCount += 1;
      errorSummaries.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        message: error,
      });
      results.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        status: "error",
        snapshot_id: null,
        previous_snapshot_id: previous?.snapshot_id ?? null,
        detected_change_id: null,
        error_message: error,
      });
      console.log("fetch error (previous snapshot preserved)");
      continue;
    }

    if (!DRY_RUN && !SKIP_NETWORK) {
      writeSnapshot(snapshot);
    }
    checkedCount += 1;
    if (adapterLabel === "feed") feedChecked += 1;
    else pageChecked += 1;

    const writtenChangeIds = [];
    let status = previous ? "unchanged" : "checked";

    if (adapterLabel === "page" && previous && !snapshot.fetch_error) {
      const diff = classifySnapshotDiff(previous, snapshot, { simulation: false });
      if (diff) {
        const detectedChangeId = `detected-${watcher.source_id}-${RUN_DATE.replace(/-/g, "")}`;
        const change = buildDetectedChangeRecord({
          detectedChangeId,
          watcherId: watcher.watcher_id,
          sourceId: watcher.source_id,
          jurisdictionId: watcher.jurisdiction_id,
          detectedAt: snapshot.checked_at,
          previousSnapshotId: previous.snapshot_id,
          currentSnapshotId: snapshot.snapshot_id,
          diff: { ...diff, adapter_id: "official_page_metadata" },
        });
        if (!DRY_RUN && !SKIP_NETWORK) writeDetectedChange(change);
        writtenChangeIds.push(detectedChangeId);
        changedCount += 1;
        status = "change_detected";
        console.log(`change detected (${diff.significance_level})`);
      } else {
        console.log("unchanged");
      }
    } else if (adapterLabel === "feed") {
      if (feedChanges.length > 0) {
        for (const change of feedChanges) {
          if (!DRY_RUN && !SKIP_NETWORK) writeDetectedChange(change);
          writtenChangeIds.push(change.detected_change_id);
        }
        changedCount += feedChanges.length;
        status = "change_detected";
        console.log(`feed change(s): ${feedChanges.length}`);
      } else {
        console.log(previous ? "unchanged" : "baseline");
      }
    } else {
      console.log(previous ? "baseline refresh" : "baseline");
    }

    detectedChangeIds.push(...writtenChangeIds);
    results.push({
      watcher_id: watcher.watcher_id,
      source_id: watcher.source_id,
      status,
      snapshot_id: snapshot.snapshot_id,
      previous_snapshot_id: previous?.snapshot_id ?? null,
      detected_change_id: writtenChangeIds[0] ?? null,
      detected_change_ids: writtenChangeIds,
      error_message: snapshot.fetch_error ?? null,
    });
  }

  const runMode = DRY_RUN ? "dry_run" : "live_manual";
  const runLog = {
    run_id: RUN_ID,
    run_date: RUN_DATE,
    run_mode: runMode,
    mode: runMode,
    safe_mode: true,
    fixture_only: false,
    network_disabled: SKIP_NETWORK,
    preserves_latest_snapshots: true,
    watcher_count: (config.watchers ?? []).length,
    checked_count: checkedCount,
    page_checked_count: pageChecked,
    feed_checked_count: feedChecked,
    changed_count: changedCount,
    error_count: errorCount,
    detected_change_ids: detectedChangeIds,
    error_summaries: errorSummaries,
    results,
    legal_safe_note: LEGAL_SAFE_NOTE,
  };

  if (!DRY_RUN) {
    fs.mkdirSync(RUNS_ROOT, { recursive: true });
    const runPath = path.join(RUNS_ROOT, `${RUN_ID}.yml`);
    writeYaml(
      runPath,
      runLog,
      `# Watcher run log — ${RUN_DATE}\n# Manual CLI only; not CI.\n\n`,
    );
    console.log(`\nWrote ${path.relative(ROOT, runPath)}`);
  }

  console.log(
    `Summary: watchers=${(config.watchers ?? []).length} checked=${checkedCount} (page=${pageChecked} feed=${feedChecked}) changes=${changedCount} errors=${errorCount}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
