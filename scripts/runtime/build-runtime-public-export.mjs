#!/usr/bin/env node
/**
 * T078 / T078A — Build public runtime monitoring JSON exports from Supabase or committed snapshot.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadRuntimeEnv, getDbUrl } from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";
import {
  loadRegulationRecords,
  loadJurisdictionProfileCards,
  countRecordsByJurisdiction,
  countSourcesByJurisdiction,
  enrichProfiles,
  buildMapMetricsFromProfiles,
} from "./lib/tracker-coverage-data.mjs";
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

  if (fs.existsSync(changesFile)) {
    try {
      const fromFile =
        JSON.parse(fs.readFileSync(changesFile, "utf8")).changes?.length ?? 0;
      if (detected_changes_count == null || fromFile > detected_changes_count) {
        detected_changes_count = fromFile;
      }
    } catch {
      if (detected_changes_count == null) detected_changes_count = 0;
    }
  }
  if (fs.existsSync(candidatesFile)) {
    try {
      const fromFile =
        JSON.parse(fs.readFileSync(candidatesFile, "utf8")).candidates?.length ?? 0;
      if (review_candidates_count == null || fromFile > review_candidates_count) {
        review_candidates_count = fromFile;
      }
    } catch {
      if (review_candidates_count == null) review_candidates_count = 0;
    }
  }

  return {
    ...payload,
    ...counts,
    status,
    backend_mvp: "T080",
    live_ingestion_enabled: false,
    scheduled_monitoring_enabled: false,
    detected_changes_count: detected_changes_count ?? 0,
    review_candidates_count: review_candidates_count ?? 0,
    export_source:
      status === "backend_monitoring_mvp_worker_run" ||
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
  const workerRuns = runs.filter((r) =>
    String(r.run_type ?? "").startsWith("worker"),
  );
  const latestWorkerRun = workerRuns[0] ?? null;
  const pilotReport = fs.existsSync(GENERATED)
    ? JSON.parse(fs.readFileSync(GENERATED, "utf8"))
    : null;

  const monitoringStatus = latestWorkerRun
    ? "backend_monitoring_mvp_worker_run"
    : latestRun
      ? "backend_monitoring_mvp"
      : "backend_smoke_passed_public_export_pending";

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
        latest_worker_run: latestWorkerRun
          ? {
              run_id: latestWorkerRun.id,
              source_key: latestWorkerRun.source_key,
              run_type: latestWorkerRun.run_type,
              status: latestWorkerRun.status,
              item_count: latestWorkerRun.item_count,
              completed_at: latestWorkerRun.completed_at,
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
        source_runs_count: runs.length,
        latest_run_id: latestRun?.id ?? null,
        latest_run_at: latestRun?.completed_at ?? latestRun?.started_at ?? null,
        worker_deployed: true,
        worker_name: "regulation-watch-monitor-dev",
        worker_url:
          "https://regulation-watch-monitor-dev.nazzarkoartem.workers.dev",
      },
      registry,
      monitoringStatus,
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

  const exportStatus =
    statusPayload?.status === "backend_monitoring_mvp_worker_run" ||
    statusPayload?.worker_deployed === true
      ? "backend_monitoring_mvp_worker_run"
      : "backend_smoke_passed_public_export_ready";

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
    backend_mvp: "T080",
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

function loadTrackerContext(registry) {
  const { records } = loadRegulationRecords(ROOT);
  const { profiles } = loadJurisdictionProfileCards(ROOT);
  const recordCounts = countRecordsByJurisdiction(records);
  const sourceCounts = countSourcesByJurisdiction(registry);
  const enrichedProfiles = enrichProfiles(profiles, recordCounts, sourceCounts);
  return { records, enrichedProfiles, recordCounts, sourceCounts };
}

function buildCountryCoverage(registry) {
  const countryPath = path.join(ROOT, "public/data/country-status.json");
  const statuses = fs.existsSync(countryPath)
    ? JSON.parse(fs.readFileSync(countryPath, "utf8"))
    : { jurisdictions: [] };
  const jurisdictions = statuses.jurisdictions ?? statuses.items ?? [];
  const { enrichedProfiles } = loadTrackerContext(registry);
  const profileById = new Map(
    enrichedProfiles.map((p) => [p.jurisdiction_id, p]),
  );

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
      const profile = profileById.get(j.jurisdiction_id);
      return {
        ...j,
        display_name: profile?.display_name ?? status?.country_name ?? j.jurisdiction_id,
        status_bucket: status?.status_bucket ?? "unknown",
        status_headline: profile?.status_headline ?? status?.status_summary ?? null,
        maturity_index: profile?.maturity_score ?? status?.maturity_index ?? null,
        activity_index: profile?.activity_score ?? status?.activity_index ?? null,
        freshness_score: profile?.freshness_score ?? null,
        confidence_score: profile?.confidence_score ?? null,
        regulation_records_count: profile?.regulation_records_count ?? 0,
        monitored_sources_count: j.monitored_sources.length,
        review_required: true,
      };
    }),
  });
}

function buildMapMetrics(registry) {
  const { enrichedProfiles } = loadTrackerContext(registry);
  const markers = buildMapMetricsFromProfiles(enrichedProfiles);

  writeExport("regulation-map-metrics.json", {
    map_version: "T080",
    markers,
    legend: {
      enacted: "Enacted / in force (curated metadata)",
      proposed: "Proposed / draft",
      guidance: "Guidance / framework",
      monitoring: "Monitoring registered",
      unknown: "Limited coverage",
    },
  });
}

function buildRegulationRecordsExport() {
  const { records } = loadRegulationRecords(ROOT);
  writeExport("regulation-records.json", {
    records: records.map((r) => ({
      ...r,
      review_required: true,
      legal_change_claimed: false,
      gates: {
        verified_on_source: false,
        client_use_allowed: false,
        final_evidence_allowed: false,
        legal_change_claimed: false,
        ...(r.gates ?? {}),
      },
    })),
    record_count: records.length,
  });
}

function buildJurisdictionProfileCardsExport(registry) {
  const { enrichedProfiles } = loadTrackerContext(registry);
  writeExport("jurisdiction-profile-cards.json", {
    cards: enrichedProfiles,
    card_count: enrichedProfiles.length,
  });
}

function buildTrackerSummaryExport(registry, monitoringPayload) {
  const { records, enrichedProfiles } = loadTrackerContext(registry);
  const counts = registryCounts(registry);
  writeExport("tracker-summary.json", {
    countries_covered: enrichedProfiles.length,
    regulations_tracked: records.length,
    ...counts,
    detected_changes_count: monitoringPayload?.detected_changes_count ?? 0,
    review_candidates_count: monitoringPayload?.review_candidates_count ?? 0,
    latest_worker_run: monitoringPayload?.latest_worker_run ?? null,
    scheduled_monitoring_enabled: false,
    live_ingestion_enabled: false,
    backend_mvp: "T080",
    status: monitoringPayload?.status ?? "registry_only",
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

  const monitoringPayload = JSON.parse(
    fs.readFileSync(
      path.join(PUBLIC_DATA, "runtime-monitoring-status.json"),
      "utf8",
    ),
  );
  buildCountryCoverage(registry);
  buildMapMetrics(registry);
  buildRegulationRecordsExport();
  buildJurisdictionProfileCardsExport(registry);
  const scripts = [
    "build-review-queue-export.mjs",
    "build-source-freshness-export.mjs",
    "generate-review-packets.mjs",
  ];
  for (const script of scripts) {
    const res = spawnSync(
      process.execPath,
      [path.join(ROOT, "scripts/runtime", script)],
      { cwd: ROOT, stdio: "inherit" },
    );
    if (res.status !== 0) {
      throw new Error(`${script} failed with status ${res.status}`);
    }
  }

  const monitoringRefreshed = JSON.parse(
    fs.readFileSync(
      path.join(PUBLIC_DATA, "runtime-monitoring-status.json"),
      "utf8",
    ),
  );
  buildTrackerSummaryExport(registry, monitoringRefreshed);

  console.log("PASS: build-runtime-public-export (T080 + T081 public JSON files)");
}

main().catch((err) => {
  console.error(`build-runtime-public-export: ${err.message ?? err}`);
  process.exit(1);
});
