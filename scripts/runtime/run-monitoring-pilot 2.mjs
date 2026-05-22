#!/usr/bin/env node
/**
 * T078 — Controlled monitoring pilot (metadata-only, allowlisted official sources).
 * Dev/manual run. Requires explicit --allow-network for RSS fetch.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeEnv, getDbUrl, envFlagTrue, RUNTIME_ROOT } from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";
import {
  loadMonitoringPilotRegistry,
  filterRegistrySources,
  hostMatchesAllowed,
} from "./lib/monitoring-pilot-registry.mjs";
import { fetchFeedMetadata } from "./lib/feed-metadata.mjs";
import {
  ensureRegulationSource,
  insertRuntimeEvent,
  persistMonitoringRun,
} from "./lib/monitoring-persistence.mjs";
import { readProjectVersion } from "../lib/read-project-version.mjs";

const ROOT = RUNTIME_ROOT;
const OUTPUT_DIR = path.join(ROOT, "generated/runtime");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "monitoring-pilot-run.latest.json");

function parseArgs(argv) {
  const opts = {
    dryRun: true,
    write: false,
    allowNetwork: false,
    maxSources: null,
    maxItems: 20,
    automatedOnly: false,
  };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--write") {
      opts.write = true;
      opts.dryRun = false;
    } else if (arg === "--allow-network") opts.allowNetwork = true;
    else if (arg.startsWith("--max-sources=")) {
      opts.maxSources = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--max-items=")) {
      opts.maxItems = Number(arg.split("=")[1]);
    } else if (arg === "--automated-only") opts.automatedOnly = true;
  }
  return opts;
}

async function processSource(source, opts) {
  const result = {
    source_key: source.source_key,
    fetch_mode: source.fetch_mode,
    status: "skipped",
    item_count: 0,
    items: [],
    error: null,
  };

  if (source.fetch_mode !== "automated_metadata") {
    result.status = "manual_review_registered";
    result.note = "No automated fetch; registered for manual review only.";
    return result;
  }

  if (!opts.allowNetwork) {
    result.status = "dry_run_no_network";
    result.note = "RSS fetch skipped without --allow-network";
    return result;
  }

  if (!hostMatchesAllowed(source, source.feed_url)) {
    result.status = "error";
    result.error = "feed_url not on allowed_host";
    return result;
  }

  try {
    const { items } = await fetchFeedMetadata(source.feed_url, {
      maxItems: opts.maxItems,
    });
    result.items = items;
    result.item_count = items.length;
    result.status = "fetched";
  } catch (err) {
    result.status = "error";
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

async function main() {
  const opts = parseArgs(process.argv);
  const env = loadRuntimeEnv();
  const safetyErrors = assertRuntimeSafetyDisabled(env, "run-monitoring-pilot");
  if (safetyErrors.length > 0) {
    console.error("run-monitoring-pilot: REFUSED — unsafe runtime flags enabled");
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const registry = loadMonitoringPilotRegistry();
  const maxSources =
    opts.maxSources ??
    (opts.automatedOnly ? 3 : registry.max_sources_default ?? 8);
  const sources = filterRegistrySources(registry, {
    maxSources,
    fetchMode: opts.automatedOnly ? "automated_metadata" : undefined,
  });

  const runId = `monitoring-pilot-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;
  const report = {
    run_id: runId,
    product_version: readProjectVersion(),
    mode: opts.dryRun ? "dry_run" : opts.write ? "write" : "dry_run",
    allow_network: opts.allowNetwork,
    max_sources: maxSources,
    max_items: opts.maxItems,
    sources_processed: [],
    summary: {
      fetched: 0,
      manual: 0,
      errors: 0,
      total_detected_changes: 0,
      total_review_candidates: 0,
    },
    legal_safe_note:
      "Metadata-only pilot run. Detected changes are signals requiring human review — not verified legal changes.",
  };

  const dbUrl = getDbUrl(env);
  const useDb = opts.write && dbUrl;

  async function runAll(client) {
    for (const source of sources) {
      const sourceResult = await processSource(source, opts);
      if (client && sourceResult.items.length > 0) {
        await ensureRegulationSource(client, source);
        const persisted = await persistMonitoringRun(client, {
          source,
          items: sourceResult.items,
          runType: "pilot_manual",
          dryRun: false,
        });
        sourceResult.run_id = persisted.run_id;
        sourceResult.snapshot_hash = persisted.snapshot_hash;
        sourceResult.detected_changes = persisted.detected_changes?.length ?? 0;
        sourceResult.review_candidates = persisted.review_candidates?.length ?? 0;
        report.summary.total_detected_changes += sourceResult.detected_changes;
        report.summary.total_review_candidates += sourceResult.review_candidates;
      } else if (opts.dryRun && sourceResult.items.length > 0) {
        const persisted = await persistMonitoringRun(null, {
          source,
          items: sourceResult.items,
          runType: "pilot_dry_run",
          dryRun: true,
        });
        sourceResult.detected_changes = persisted.detected_changes?.length ?? 0;
      }

      if (sourceResult.status === "fetched") report.summary.fetched += 1;
      else if (sourceResult.status === "manual_review_registered") {
        report.summary.manual += 1;
        if (client) await ensureRegulationSource(client, source);
      } else if (sourceResult.status === "error") report.summary.errors += 1;

      report.sources_processed.push({
        source_key: sourceResult.source_key,
        status: sourceResult.status,
        item_count: sourceResult.item_count,
        error: sourceResult.error,
        note: sourceResult.note,
        run_id: sourceResult.run_id,
        detected_changes: sourceResult.detected_changes,
        review_candidates: sourceResult.review_candidates,
      });
    }

    if (client) {
      await insertRuntimeEvent(client, {
        event_type: "monitoring_pilot_run",
        event_status: opts.write ? "completed" : "dry_run",
        source_key: null,
        message: `T078 monitoring pilot ${runId}`,
        metadata: report.summary,
      });
    }
  }

  if (useDb) {
    await withPgClient(dbUrl, (client) => runAll(client));
  } else {
    if (opts.write && !dbUrl) {
      console.error("run-monitoring-pilot: --write requires SUPABASE_DB_URL");
      process.exit(1);
    }
    await runAll(null);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`PASS: run-monitoring-pilot (${report.mode})`);
  console.log(`  output: ${OUTPUT_FILE}`);
  console.log(
    `  fetched=${report.summary.fetched} manual=${report.summary.manual} errors=${report.summary.errors}`,
  );
  if (report.summary.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`run-monitoring-pilot: ${err.message ?? err}`);
  process.exit(1);
});
