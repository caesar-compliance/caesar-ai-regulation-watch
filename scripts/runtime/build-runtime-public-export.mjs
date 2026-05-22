#!/usr/bin/env node
/**
 * T078 / T078A — Build public runtime monitoring JSON exports from Supabase or committed snapshot.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeEnv, getDbUrl } from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";
import { readProjectVersion } from "../lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");
const SNAPSHOT_DIR = path.join(ROOT, "data/runtime/public-export-snapshot");
const GENERATED = path.join(ROOT, "generated/runtime/monitoring-pilot-run.latest.json");
const DB_HEALTH_PATH = path.join(PUBLIC_DATA, "runtime-db-health.json");

const DISCLAIMER =
  "Backend-derived metadata only. Review required before any legal or client use. Not legal advice.";
const PENDING_NOTE =
  "Backend smoke passed in T078 final report; public export pending refresh from dev Supabase or snapshot update.";

function writeExport(name, payload) {
  const out = {
    generated_at: new Date().toISOString(),
    product_version: readProjectVersion(),
    review_required: true,
    legal_change_claimed: false,
    public_note: DISCLAIMER,
    ...payload,
  };
  fs.writeFileSync(
    path.join(PUBLIC_DATA, name),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );
}

function registryCounts(registry) {
  const automated = registry.sources.filter(
    (s) => s.fetch_mode === "automated_metadata",
  ).length;
  const manual = registry.sources.filter(
    (s) => s.fetch_mode === "manual_review",
  ).length;
  return {
    monitored_source_count: registry.sources.length,
    automated_source_count: automated,
    automated_rss_source_count: automated,
    manual_source_count: manual,
    manual_review_source_count: manual,
  };
}

function readDbHealthStatus() {
  if (!fs.existsSync(DB_HEALTH_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(DB_HEALTH_PATH, "utf8")).status ?? null;
  } catch {
    return null;
  }
}

function loadSnapshotPayload(basename) {
  const file = path.join(SNAPSHOT_DIR, `${basename}.payload.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function snapshotAvailable() {
  return fs.existsSync(
    path.join(SNAPSHOT_DIR, "runtime-monitoring-status.payload.json"),
  );
}

function enrichMonitoringStatus(payload, registry, status) {
  const counts = registryCounts(registry);
  const changesFile = path.join(PUBLIC_DATA, "regulation-detected-changes.json");
  const candidatesFile = path.join(
    PUBLIC_DATA,
    "regulation-review-candidates.json",
  );
  let detected_changes_count =
    payload.detected_changes_count ??
    payload.latest_pilot_report?.summary?.total_detected_changes ??
    null;
  let review_candidates_count =
    payload.review_candidates_count ??
    payload.latest_pilot_report?.summary?.total_review_candidates ??
    null;

  if (detected_changes_count == null && fs.existsSync(changesFile)) {
    try {
      detected_changes_count =
        JSON.parse(fs.readFileSync(changesFile, "utf8")).changes?.length ?? 0;
    } catch {
      detected_changes_count = 0;
    }
  }
  if (review_candidates_count == null && fs.existsSync(candidatesFile)) {
    try {
      review_candidates_count =
        JSON.parse(fs.readFileSync(candidatesFile, "utf8")).candidates?.length ??
        0;
    } catch {
      review_candidates_count = 0;
    }
  }

  return {
    ...payload,
    ...counts,
    status,
    backend_mvp: "T078",
    live_ingestion_enabled: false,
    scheduled_monitoring_enabled: false,
    detected_changes_count: detected_changes_count ?? 0,
    review_candidates_count: review_candidates_count ?? 0,
    export_source:
      status === "backend_monitoring_mvp"
        ? "supabase_dev"
        : "t078_smoke_snapshot",
  };
}

async function queryAll(client, sql, params = []) {
  const res = await client.query(sql, params);
  return res.rows;
}

async function buildFromDb(client, registry) {
  const runs = await queryAll(
    client,
    `SELECT id, source_key, run_type, status, started_at, completed_at, item_count, created_at
     FROM source_runs ORDER BY created_at DESC LIMIT 50`,
  );
  const changes = await queryAll(
    client,
    `SELECT id, source_key, change_type, change_summary, review_status, detected_at, old_hash, new_hash
     FROM detected_changes ORDER BY detected_at DESC LIMIT 100`,
  );
  const candidates = await queryAll(
    client,
    `SELECT id, detected_change_id, candidate_status, jurisdiction_ids, topic_ids,
            proposed_title, proposed_summary, source_url, created_at
     FROM review_candidates ORDER BY created_at DESC LIMIT 100`,
  );
  const events = await queryAll(
    client,
    `SELECT event_type, event_status, source_key, message, created_at
     FROM runtime_events ORDER BY created_at DESC LIMIT 20`,
  );

  const latestRun = runs[0] ?? null;
  const pilotReport = fs.existsSync(GENERATED)
    ? JSON.parse(fs.readFileSync(GENERATED, "utf8"))
    : null;

  writeExport(
    "runtime-monitoring-status.json",
    enrichMonitoringStatus(
      {
        latest_run: latestRun
          ? {
              run_id: latestRun.id,
              source_key: latestRun.source_key,
              status: latestRun.status,
              item_count: latestRun.item_count,
              completed_at: latestRun.completed_at,
            }
          : null,
        latest_pilot_report: pilotReport
          ? { run_id: pilotReport.run_id, summary: pilotReport.summary }
          : null,
        runtime_events_recent: events.map((e) => ({
          event_type: e.event_type,
          event_status: e.event_status,
          source_key: e.source_key,
          message: e.message,
          created_at: e.created_at,
        })),
      },
      registry,
      latestRun ? "backend_monitoring_mvp" : "backend_smoke_passed_public_export_pending",
    ),
  );

  writeExport("regulation-source-runs.json", {
    runs: runs.map((r) => ({
      run_id: r.id,
      source_key: r.source_key,
      run_type: r.run_type,
      status: r.status,
      item_count: r.item_count,
      started_at: r.started_at,
      completed_at: r.completed_at,
      review_required: true,
    })),
  });

  writeExport("regulation-detected-changes.json", {
    changes: changes.map((c) => ({
      change_id: c.id,
      source_key: c.source_key,
      change_type: c.change_type,
      change_summary: c.change_summary,
      review_status: c.review_status,
      detected_at: c.detected_at,
      confidence: "metadata_signal",
      review_required: true,
      legal_change_claimed: false,
    })),
  });

  writeExport("regulation-review-candidates.json", {
    candidates: candidates.map((c) => ({
      candidate_id: c.id,
      detected_change_id: c.detected_change_id,
      candidate_status: c.candidate_status,
      jurisdiction_ids: c.jurisdiction_ids,
      topic_ids: c.topic_ids,
      proposed_title: c.proposed_title,
      proposed_summary: c.proposed_summary,
      source_url: c.source_url,
      review_required: true,
      publication_allowed: false,
    })),
  });
}

function buildFromSnapshot(registry) {
  const statusPayload = loadSnapshotPayload("runtime-monitoring-status");
  const runsPayload = loadSnapshotPayload("regulation-source-runs");
  const changesPayload = loadSnapshotPayload("regulation-detected-changes");
  const candidatesPayload = loadSnapshotPayload("regulation-review-candidates");

  if (runsPayload) writeExport("regulation-source-runs.json", runsPayload);
  if (changesPayload) writeExport("regulation-detected-changes.json", changesPayload);
  if (candidatesPayload) {
    writeExport("regulation-review-candidates.json", candidatesPayload);
  }

  const exportStatus = "backend_smoke_passed_public_export_ready";

  writeExport(
    "runtime-monitoring-status.json",
    enrichMonitoringStatus(
      {
        ...(statusPayload ?? {}),
        public_note: statusPayload?.public_note ?? DISCLAIMER,
      },
      registry,
      exportStatus,
    ),
  );
}

function buildRegistryOnlyPending(registry) {
  const counts = registryCounts(registry);
  writeExport("runtime-monitoring-status.json", {
    ...counts,
    status: "backend_smoke_passed_public_export_pending",
    backend_mvp: "T078",
    live_ingestion_enabled: false,
    scheduled_monitoring_enabled: false,
    detected_changes_count: 0,
    review_candidates_count: 0,
    public_note: PENDING_NOTE,
    export_source: "registry_only",
  });
  writeExport("regulation-source-runs.json", { runs: [] });
  writeExport("regulation-detected-changes.json", { changes: [] });
  writeExport("regulation-review-candidates.json", { candidates: [] });
}

function buildCountryCoverage(registry) {
  const countryPath = path.join(ROOT, "public/data/country-status.json");
  const statuses = fs.existsSync(countryPath)
    ? JSON.parse(fs.readFileSync(countryPath, "utf8"))
    : { jurisdictions: [] };
  const jurisdictions = statuses.jurisdictions ?? statuses.items ?? [];

  const byJurisdiction = new Map();
  for (const source of registry.sources) {
    for (const jid of source.jurisdiction_ids ?? []) {
      if (!byJurisdiction.has(jid)) {
        byJurisdiction.set(jid, {
          jurisdiction_id: jid,
          monitored_sources: [],
          automated_sources: 0,
          manual_sources: 0,
        });
      }
      const row = byJurisdiction.get(jid);
      row.monitored_sources.push({
        source_key: source.source_key,
        source_name: source.source_name,
        official_url: source.official_url,
        fetch_mode: source.fetch_mode,
        review_required: true,
      });
      if (source.fetch_mode === "automated_metadata") row.automated_sources += 1;
      else row.manual_sources += 1;
    }
  }

  writeExport("regulation-country-coverage.json", {
    jurisdictions: [...byJurisdiction.values()].map((j) => {
      const status = jurisdictions.find(
        (x) => x.jurisdiction_id === j.jurisdiction_id,
      );
      return {
        ...j,
        status_bucket: status?.status_bucket ?? "unknown",
        maturity_index: status?.maturity_index ?? null,
        activity_index: status?.activity_index ?? null,
        review_required: true,
      };
    }),
  });
}

function buildMapMetrics(registry) {
  const enriched = path.join(ROOT, "public/data/country-status.json");
  let items = [];
  if (fs.existsSync(enriched)) {
    const data = JSON.parse(fs.readFileSync(enriched, "utf8"));
    items = data.jurisdictions ?? data.items ?? [];
  }

  writeExport("regulation-map-metrics.json", {
    map_version: "T078",
    markers: items.map((j) => ({
      jurisdiction_id: j.jurisdiction_id,
      label: j.label ?? j.jurisdiction_id,
      region: j.region,
      status_bucket: j.status_bucket,
      maturity_index: j.maturity_index ?? 0,
      activity_index: j.activity_index ?? 0,
      freshness_days: j.freshness_days ?? null,
      monitored_source_count: registry.sources.filter((s) =>
        (s.jurisdiction_ids ?? []).includes(j.jurisdiction_id),
      ).length,
      review_required: true,
    })),
    legend: {
      enacted: "Enacted / in force (curated metadata)",
      proposed: "Proposed / draft",
      guidance: "Guidance / framework",
      monitoring: "Monitoring registered",
      unknown: "Limited coverage",
    },
  });
}

async function main() {
  const env = loadRuntimeEnv();
  const safetyErrors = assertRuntimeSafetyDisabled(env, "build-runtime-public-export");
  if (safetyErrors.length > 0) {
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const registry = loadMonitoringPilotRegistry();
  const dbUrl = getDbUrl(env);

  fs.mkdirSync(PUBLIC_DATA, { recursive: true });

  if (dbUrl) {
    try {
      await withPgClient(dbUrl, async (client) => buildFromDb(client, registry));
    } catch (err) {
      console.warn(
        `build-runtime-public-export: DB unavailable (${err.message}), falling back to snapshot`,
      );
      if (snapshotAvailable()) buildFromSnapshot(registry);
      else buildRegistryOnlyPending(registry);
    }
  } else if (snapshotAvailable()) {
    console.log(
      "build-runtime-public-export: no DB URL; using T078 public export snapshot",
    );
    buildFromSnapshot(registry);
  } else {
    console.log(
      "build-runtime-public-export: no DB URL or snapshot; registry-only pending export",
    );
    buildRegistryOnlyPending(registry);
  }

  buildCountryCoverage(registry);
  buildMapMetrics(registry);

  console.log("PASS: build-runtime-public-export (6 public JSON files)");
}

main().catch((err) => {
  console.error(`build-runtime-public-export: ${err.message ?? err}`);
  process.exit(1);
});
