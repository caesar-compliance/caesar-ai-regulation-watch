#!/usr/bin/env node
/**
 * T086 — Ensure automated pilot registry keys exist in dev regulation_sources (or alignment snapshot).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeEnv, getDbUrl } from "./lib/load-runtime-env.mjs";
import { withPgClient } from "./lib/pg-client.mjs";
import {
  loadMonitoringPilotRegistry,
  filterRegistrySources,
} from "./lib/monitoring-pilot-registry.mjs";
import { readProjectVersion } from "../lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ALIGNMENT_SNAPSHOT = path.join(
  ROOT,
  "data/runtime/dev-source-registry-alignment.json",
);

async function main() {
  const registry = loadMonitoringPilotRegistry();
  const automated = filterRegistrySources(registry, {
    fetchMode: "automated_metadata",
  });
  const expectedKeys = automated.map((s) => s.source_key).sort();
  const errors = [];
  const version = readProjectVersion();

  const dbUrl = getDbUrl(loadRuntimeEnv());
  if (dbUrl) {
    await withPgClient(dbUrl, async (client) => {
      const res = await client.query(
        `SELECT source_key FROM regulation_sources WHERE source_key = ANY($1::text[])`,
        [expectedKeys],
      );
      const found = new Set(res.rows.map((r) => r.source_key));
      for (const key of expectedKeys) {
        if (!found.has(key)) {
          errors.push(`missing regulation_sources row for automated key: ${key}`);
        }
      }
    });
  } else if (fs.existsSync(ALIGNMENT_SNAPSHOT)) {
    const snap = JSON.parse(fs.readFileSync(ALIGNMENT_SNAPSHOT, "utf8"));
    const rows = new Set(
      (snap.regulation_sources_rows ?? []).map((r) => r.source_key),
    );
    for (const key of expectedKeys) {
      if (!rows.has(key)) {
        errors.push(`alignment snapshot missing automated key: ${key}`);
      }
    }
  } else {
    errors.push(
      "no SUPABASE_DB_URL and no data/runtime/dev-source-registry-alignment.json",
    );
  }

  const statusPath = path.join(ROOT, "public/data/runtime-monitoring-status.json");
  if (fs.existsSync(statusPath)) {
    const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
    if (
      version.startsWith("1.0.37") &&
      status.product_version &&
      !String(status.product_version).startsWith("1.0.37")
    ) {
      errors.push(
        `runtime-monitoring-status product_version ${status.product_version} stale vs package ${version}`,
      );
    }
    if (status.db_registry_alignment_status === "misaligned") {
      errors.push("runtime export reports db_registry_alignment_status=misaligned");
    }
    for (const gate of [
      "verified_on_source",
      "client_use_allowed",
      "legal_change_claimed",
      "publication_allowed",
      "public_export_allowed",
    ]) {
      if (status[gate] === true) errors.push(`protected gate open in export: ${gate}`);
    }
    if (status.cron_enabled === true || status.scheduled_monitoring_enabled === true) {
      errors.push("cron/scheduled monitoring must not appear enabled in export");
    }
  }

  if (errors.length > 0) {
    console.error("validate-runtime-source-registry-alignment: FAILED");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  console.log(
    `PASS: validate-runtime-source-registry-alignment (${expectedKeys.length} automated keys aligned)`,
  );
}

main().catch((err) => {
  console.error(`validate-runtime-source-registry-alignment: ${err.message}`);
  process.exit(1);
});
