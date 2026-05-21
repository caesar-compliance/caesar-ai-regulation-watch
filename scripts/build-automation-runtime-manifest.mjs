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
      "read docs/runtime/EXTERNAL_SERVICE_ONBOARDING_CHECKLIST.md (Account A)",
      "copy .env.runtime.example and .env.cloudflare.example to local ignored files",
      "run npm run runtime:services:check and validate:runtime-services-readiness",
      "run npm run runtime:db:health when Supabase credentials are ready",
      "apply SQL migration manually only when approved: REGWATCH_APPLY_SUPABASE_SCHEMA=true",
      "deploy Worker only after Control Tower approval",
      "connect source pilot to runtime DB (T075B) before network execution (T076+)",
    ],
    runtime_db_health_export: "/data/runtime-db-health.json",
    runtime_health_page: "/runtime-health/",
    runtime_services_readiness_export: "/data/runtime-services-readiness.json",
    runtime_services_page: "/runtime-services/",
    source_pilot_status_export: "/data/source-pilot-status.json",
    source_pilot_review_candidates_export: "/data/source-pilot-review-candidates.json",
    source_pilot_decision_packets_export: "/data/source-pilot-decision-packets.json",
    source_pilot_operator_handoff_export: "/data/source-pilot-operator-handoff.json",
    source_pilot_page: "/source-pilot/",
    source_pilot_review_page: "/source-pilot/review/",
    source_pilot_decision_packets_page: "/source-pilot/decision-packets/",
    source_pilot_operator_handoff_page: "/source-pilot/operator-handoff/",
    source_pilot_operator_handoff_report: "/reports/source-pilot-operator-handoff.md",
    legal_safe_note:
      "Design-time runtime manifest only. Not legal advice. Not live ingestion. Official sources control.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT}`);
}

main();
