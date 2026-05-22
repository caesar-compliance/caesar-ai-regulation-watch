#!/usr/bin/env node
/**
 * T086 — Idempotent dev alignment: upsert automated pilot sources into regulation_sources.
 * Metadata-only. No destructive changes. Requires SUPABASE_DB_URL (or pooler URL).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntimeEnv, getDbUrl } from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";
import {
  loadMonitoringPilotRegistry,
  filterRegistrySources,
} from "./lib/monitoring-pilot-registry.mjs";
import { ensureRegulationSource } from "./lib/monitoring-persistence.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ALIGNMENT_SNAPSHOT = path.join(
  ROOT,
  "data/runtime/dev-source-registry-alignment.json",
);

function mapSourceType(source) {
  const t = source.source_type ?? "rss";
  if (t === "atom") return "atom";
  if (t === "rss") return "rss";
  return t;
}

async function main() {
  const env = loadRuntimeEnv();
  const safetyErrors = assertRuntimeSafetyDisabled(env, "align-dev-source-registry");
  if (safetyErrors.length > 0) {
    for (const e of safetyErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    console.error("align-dev-source-registry: SUPABASE_DB_URL not configured");
    process.exit(1);
  }

  const registry = loadMonitoringPilotRegistry();
  const automated = filterRegistrySources(registry, {
    fetchMode: "automated_metadata",
  });

  const report = {
    task_id: "T086",
    aligned_at: new Date().toISOString(),
    automated_source_keys: automated.map((s) => s.source_key),
    upserted: [],
    already_present: [],
    errors: [],
  };

  await withPgClient(dbUrl, async (client) => {
    const before = await client.query(
      `SELECT source_key FROM regulation_sources WHERE source_key = ANY($1::text[])`,
      [report.automated_source_keys],
    );
    const beforeSet = new Set(before.rows.map((r) => r.source_key));

    for (const source of automated) {
      try {
        await ensureRegulationSource(client, {
          ...source,
          source_type: mapSourceType(source),
        });
        if (beforeSet.has(source.source_key)) {
          report.already_present.push(source.source_key);
        } else {
          report.upserted.push(source.source_key);
        }
      } catch (err) {
        report.errors.push({
          source_key: source.source_key,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const after = await client.query(
      `SELECT source_key, source_name, status, metadata_only, schedule_enabled
       FROM regulation_sources
       WHERE source_key = ANY($1::text[])
       ORDER BY source_key`,
      [report.automated_source_keys],
    );
    report.regulation_sources_rows = after.rows;
    report.regulation_sources_count = (
      await client.query(`SELECT COUNT(*)::int AS n FROM regulation_sources`)
    ).rows[0]?.n;
  });

  if (report.errors.length > 0) {
    console.error("align-dev-source-registry: errors");
    for (const e of report.errors) console.error(`  ✗ ${e.source_key}: ${e.message}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(ALIGNMENT_SNAPSHOT), { recursive: true });
  fs.writeFileSync(`${ALIGNMENT_SNAPSHOT}`, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `PASS: align-dev-source-registry (${report.upserted.length} upserted, ${report.already_present.length} already present, ${report.regulation_sources_rows.length}/6 automated in DB)`,
  );
}

main().catch((err) => {
  console.error(`align-dev-source-registry: ${err.message}`);
  process.exit(1);
});
