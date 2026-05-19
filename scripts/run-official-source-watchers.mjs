#!/usr/bin/env node
/**
 * Manual official-source watchers (v0.7.4).
 * Page, feed, and API adapters with conservative retry. Not in CI.
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
import { runApiMetadataWatcher } from "./lib/source-adapters/api-metadata-adapter.mjs";
import { writeYaml } from "./lib/source-adapters/shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_DATE = process.env.WATCHER_RUN_DATE ?? "2026-05-19";
const RUN_ID = `watcher-run-${RUN_DATE}`;
const DEFAULT_TIMEOUT_MS = Number(process.env.WATCHER_TIMEOUT_MS ?? 20000);
const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_NETWORK = process.argv.includes("--skip-network");
const DEFAULT_USER_AGENT =
  "Caesar-AI-Regulation-Watch/0.7.4 official-source-watcher (governance review support)";

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

function snapshotLabel(snapshot) {
  if (snapshot.adapter_id === "official_rss_or_feed" || snapshot.feed_url) return "feed";
  if (snapshot.adapter_id === "official_api_metadata" || snapshot.api_url) return "api";
  return "page";
}

function writeSnapshot(snapshot) {
  if (snapshot.fetch_error) return null;
  const dir = path.join(SNAPSHOTS_ROOT, snapshot.source_id);
  const file = path.join(dir, `${snapshot.snapshot_id}.yml`);
  const label = snapshotLabel(snapshot);
  const header = `# Metadata-only ${label} snapshot — ${snapshot.checked_at}\n# No document/article/page body stored.\n\n`;
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
  writeYaml(
    file,
    change,
    `# Detected change — pending human review\n# Not a legal conclusion.\n\n`,
  );
  return file;
}

function resolveAdapter(watcher) {
  const id = watcher.adapter_id ?? watcher.watcher_type;
  if (id === "official_api_metadata" || watcher.watcher_type === "official_api_metadata") {
    return "api";
  }
  if (id === "official_rss_or_feed" || watcher.watcher_type === "official_rss_or_feed") {
    return "feed";
  }
  return "page";
}

async function runWatcher(watcher, context) {
  const kind = resolveAdapter(watcher);
  if (kind === "api") return runApiMetadataWatcher(watcher, context);
  if (kind === "feed") return runFeedWatcher(watcher, context);
  return runPageMetadataWatcher(watcher, context);
}

function buildRunResult(watcher, previous, outcome) {
  const {
    status,
    snapshot,
    writtenChangeIds,
    error_message,
    error_category,
    retry_attempts,
    last_successful_snapshot_id,
    feed_diagnostics,
  } = outcome;
  const result = {
    watcher_id: watcher.watcher_id,
    source_id: watcher.source_id,
    adapter_id: watcher.adapter_id ?? watcher.watcher_type,
    status,
    snapshot_id: snapshot?.snapshot_id ?? null,
    previous_snapshot_id: previous?.snapshot_id ?? null,
    last_successful_snapshot_id: last_successful_snapshot_id ?? null,
    detected_change_id: writtenChangeIds[0] ?? null,
    detected_change_ids: writtenChangeIds,
    error_message,
    error_category: error_category ?? null,
    retry_attempts: retry_attempts ?? null,
    soft_fail: watcher.soft_fail ?? true,
  };
  if (feed_diagnostics) {
    result.feed_diagnostics = feed_diagnostics;
  }
  return result;
}

async function main() {
  console.log("\nCaesar AI Regulation Watch — official source watchers (v0.7.4)");
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
    timeoutMs: DEFAULT_TIMEOUT_MS,
    userAgent: DEFAULT_USER_AGENT,
    defaultUserAgent: DEFAULT_USER_AGENT,
    runDate: RUN_DATE,
  };

  const results = [];
  const detectedChangeIds = [];
  const errorSummaries = [];
  const errorsByCategory = {};
  let changedCount = 0;
  let errorCount = 0;
  let checkedCount = 0;
  let pageChecked = 0;
  let feedChecked = 0;
  let apiChecked = 0;

  for (const watcher of config.watchers ?? []) {
    if (!watcher.enabled) {
      results.push(
        buildRunResult(watcher, null, {
          status: "skipped_disabled",
          snapshot: null,
          writtenChangeIds: [],
          error_message: null,
          error_category: null,
          retry_attempts: null,
          last_successful_snapshot_id: null,
        }),
      );
      continue;
    }

    const adapterLabel = resolveAdapter(watcher);
    process.stdout.write(
      `  Checking ${watcher.watcher_id} (${watcher.source_id}, ${adapterLabel})… `,
    );

    const previous = latestSnapshotForSource(watcher.source_id);
    let runOutcome;
    try {
      runOutcome = await runWatcher(watcher, { ...context, previousSnapshot: previous });
    } catch (err) {
      runOutcome = {
        snapshot: null,
        error: String(err?.message ?? err),
        error_category: "unknown_error",
        retry_attempts: 0,
        last_successful_snapshot_id:
          previous && !previous.fetch_error ? previous.snapshot_id : null,
        detectedChanges: [],
      };
    }

    const {
      snapshot,
      error,
      error_category,
      retry_attempts,
      last_successful_snapshot_id,
      detectedChanges: adapterChanges = [],
    } = runOutcome;

    const isSoftSkip =
      error &&
      error !== "dry_run" &&
      error !== "skip_network" &&
      (snapshot?.fetch_error || !snapshot);

    if (!snapshot && error) {
      errorCount += 1;
      const cat = error_category ?? "unknown_error";
      errorsByCategory[cat] = (errorsByCategory[cat] ?? 0) + 1;
      const feedDiagnostics = runOutcome.feed_diagnostics ?? null;
      errorSummaries.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        message: error,
        error_category: cat,
        retry_attempts,
        last_successful_snapshot_id,
        ...(feedDiagnostics ? { feed_diagnostics: feedDiagnostics } : {}),
      });
      results.push(
        buildRunResult(watcher, previous, {
          status: "error",
          snapshot: null,
          writtenChangeIds: [],
          error_message: error,
          error_category: cat,
          retry_attempts,
          last_successful_snapshot_id,
          feed_diagnostics: feedDiagnostics,
        }),
      );
      console.log(`error (${cat})`);
      continue;
    }

    if (isSoftSkip) {
      errorCount += 1;
      const cat = error_category ?? "unknown_error";
      errorsByCategory[cat] = (errorsByCategory[cat] ?? 0) + 1;
      const feedDiagnostics = runOutcome.feed_diagnostics ?? null;
      errorSummaries.push({
        watcher_id: watcher.watcher_id,
        source_id: watcher.source_id,
        message: error,
        error_category: cat,
        retry_attempts,
        last_successful_snapshot_id,
        ...(feedDiagnostics ? { feed_diagnostics: feedDiagnostics } : {}),
      });
      results.push(
        buildRunResult(watcher, previous, {
          status: "error",
          snapshot: null,
          writtenChangeIds: [],
          error_message: error,
          error_category: cat,
          retry_attempts,
          last_successful_snapshot_id,
          feed_diagnostics: feedDiagnostics,
        }),
      );
      console.log(`soft error (${cat}, latest preserved)`);
      continue;
    }

    if (!DRY_RUN && !SKIP_NETWORK && snapshot && !snapshot.fetch_error) {
      writeSnapshot(snapshot);
    }
    checkedCount += 1;
    if (adapterLabel === "feed") feedChecked += 1;
    else if (adapterLabel === "api") apiChecked += 1;
    else pageChecked += 1;

    const writtenChangeIds = [];
    let status = previous ? "unchanged" : "checked";

    if (adapterLabel === "page" && previous && snapshot && !snapshot.fetch_error) {
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
          diff: {
            ...diff,
            adapter_id: "official_page_metadata",
            source_adapter_type: "official_page_metadata",
          },
        });
        if (!DRY_RUN && !SKIP_NETWORK) writeDetectedChange(change);
        writtenChangeIds.push(detectedChangeId);
        changedCount += 1;
        status = "change_detected";
        console.log(`change detected (${diff.significance_level})`);
      } else {
        console.log(`ok (retry ${retry_attempts ?? 1})`);
      }
    } else if (adapterLabel === "feed" || adapterLabel === "api") {
      if (adapterChanges.length > 0) {
        for (const change of adapterChanges) {
          if (!DRY_RUN && !SKIP_NETWORK) writeDetectedChange(change);
          writtenChangeIds.push(change.detected_change_id);
        }
        changedCount += adapterChanges.length;
        status = "change_detected";
        console.log(`${adapterLabel} change(s): ${adapterChanges.length}`);
      } else {
        console.log(
          previous ? `unchanged (retry ${retry_attempts ?? 1})` : `baseline (retry ${retry_attempts ?? 1})`,
        );
      }
    } else {
      console.log(previous ? "baseline refresh" : "baseline");
    }

    detectedChangeIds.push(...writtenChangeIds);
    results.push(
      buildRunResult(watcher, previous, {
        status,
        snapshot,
        writtenChangeIds,
        error_message: snapshot?.fetch_error ?? null,
        error_category: null,
        retry_attempts,
        last_successful_snapshot_id,
      }),
    );
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
    api_checked_count: apiChecked,
    changed_count: changedCount,
    error_count: errorCount,
    errors_by_category: errorsByCategory,
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
    `Summary: watchers=${(config.watchers ?? []).length} checked=${checkedCount} (page=${pageChecked} feed=${feedChecked} api=${apiChecked}) changes=${changedCount} errors=${errorCount}`,
  );
  if (Object.keys(errorsByCategory).length > 0) {
    console.log(`Errors by category: ${JSON.stringify(errorsByCategory)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
