#!/usr/bin/env node
/**
 * Build public automation runtime manifest from local YAML (no network).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "data/runtime/automation-runtime.yml");
const OUTPUT = path.join(ROOT, "public/data/automation-runtime-manifest.json");

function main() {
  const config = yaml.load(fs.readFileSync(CONFIG_PATH, "utf8"));
  const version = readProjectVersion();
  const generatedAt = new Date().toISOString().slice(0, 10);

  const manifest = {
    version,
    generated_at: generatedAt,
    runtime_id: config.runtime_id,
    status: config.status,
    backend_target: config.backend_target,
    worker_target: config.worker_target,
    public_site_target: config.public_site_target,
    live_ingestion_enabled: false,
    scheduled_monitoring_enabled: false,
    network_execution_enabled: false,
    planned_tables: config.planned_tables ?? [],
    first_source_candidates: config.first_source_candidates ?? [],
    safety_policy_summary: {
      allowlisted_sources_only: true,
      no_broad_crawl: true,
      metadata_only: true,
      full_text_storage_allowed: false,
      gates_closed: true,
    },
    next_setup_steps: [
      "create Supabase project",
      "apply SQL migration ops/supabase/001_regulation_watch_runtime_schema.sql",
      "configure Cloudflare Worker secrets (RUN_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
      "deploy Worker after approval",
      "run manual source check via POST /run/:sourceKey",
      "connect detected changes to review queue",
    ],
    legal_safe_note:
      "Design-time runtime manifest only. Not legal advice. Not live ingestion. Official sources control.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT}`);
}

main();
