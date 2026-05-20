#!/usr/bin/env node
/**
 * Planning-only network dry-run plan generator — no network fetch.
 * Reads approval packet + allowlist + manual intake runs; writes JSON plan locally.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPROVALS_PATH = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");

const ALLOWED_STATUSES = new Set(["draft", "ready_for_control_tower_review"]);

const ALLOWED_METADATA_FIELDS = [
  "title",
  "link",
  "guid",
  "published_at",
  "updated_at",
  "summary_snippet",
  "categories",
  "source_id",
  "adapter_id",
  "jurisdiction_ids",
];

function parseArgs(argv) {
  let approvalId = null;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--approval-id" && argv[i + 1]) {
      approvalId = argv[++i];
    } else if (arg.startsWith("--approval-id=")) {
      approvalId = arg.slice("--approval-id=".length);
    }
  }
  return { approvalId };
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function assertSafety(approval, prefix) {
  const errors = [];
  if (approval.network_execution_allowed !== false) {
    errors.push(`${prefix}: network_execution_allowed must be false for T054 plan generation`);
  }
  if (approval.schedule_enabled !== false) {
    errors.push(`${prefix}: schedule_enabled must be false`);
  }
  if (approval.broad_crawl_allowed !== false) {
    errors.push(`${prefix}: broad_crawl_allowed must be false`);
  }
  if (approval.stores_full_text !== false) {
    errors.push(`${prefix}: stores_full_text must be false`);
  }
  if (approval.stores_metadata_only !== true) {
    errors.push(`${prefix}: stores_metadata_only must be true`);
  }
  if (approval.legal_text_publication_allowed !== false) {
    errors.push(`${prefix}: legal_text_publication_allowed must be false`);
  }
  for (const key of [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ]) {
    if (approval.gates?.[key] !== false) {
      errors.push(`${prefix}: gates.${key} must be false`);
    }
  }
  const host = hostFromUrl(approval.endpoint_url);
  if (!host || host !== approval.allowed_host) {
    errors.push(`${prefix}: endpoint_url host must match allowed_host`);
  }
  return errors;
}

function plannedParser(adapter) {
  if (adapter.source_type === "rss" || adapter.adapter_kind === "rss_metadata") {
    return "rss_metadata_fixture_compatible";
  }
  if (adapter.source_type === "atom" || adapter.adapter_kind === "atom_metadata") {
    return "atom_metadata_fixture_compatible";
  }
  if (adapter.source_type === "api" || adapter.adapter_kind === "api_metadata") {
    return "api_metadata_manual";
  }
  return "webpage_metadata_manual";
}

function main() {
  const { approvalId } = parseArgs(process.argv);
  if (!approvalId) {
    console.error("Usage: node scripts/build-network-dry-run-plan.mjs --approval-id T054-001");
    process.exit(1);
  }

  const doc = yaml.load(fs.readFileSync(APPROVALS_PATH, "utf8"));
  const approval = (doc.approvals ?? []).find((a) => a.approval_id === approvalId);
  if (!approval) {
    console.error(`Approval not found: ${approvalId}`);
    process.exit(1);
  }

  if (!ALLOWED_STATUSES.has(approval.status)) {
    console.error(
      `Status ${approval.status} not allowed for plan generation (need draft or ready_for_control_tower_review)`,
    );
    process.exit(1);
  }

  const prefix = `approval ${approvalId}`;
  const safetyErrors = assertSafety(approval, prefix);
  if (safetyErrors.length > 0) {
    console.error("Safety check failed:");
    for (const msg of safetyErrors) console.error(`  ${msg}`);
    process.exit(1);
  }

  const allowlist = yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
  const runsDoc = yaml.load(fs.readFileSync(RUNS_PATH, "utf8"));
  const adapter = (allowlist.adapters ?? []).find((a) => a.adapter_id === approval.adapter_id);
  const run = (runsDoc.runs ?? []).find((r) => r.run_id === approval.run_id);
  if (!adapter) {
    console.error(`Adapter not found: ${approval.adapter_id}`);
    process.exit(1);
  }
  if (!run) {
    console.error(`Manual intake run not found: ${approval.run_id}`);
    process.exit(1);
  }

  const plan = {
    approval_id: approval.approval_id,
    run_id: approval.run_id,
    adapter_id: approval.adapter_id,
    source_id: approval.source_id,
    endpoint_url: approval.endpoint_url,
    allowed_host: approval.allowed_host,
    mode: "planning_only",
    network_execution_allowed: false,
    schedule_enabled: false,
    broad_crawl_allowed: false,
    max_items: approval.max_items,
    max_bytes: approval.max_bytes,
    timeout_seconds: approval.timeout_seconds,
    expected_output_path: approval.output_path,
    planned_parser: plannedParser(adapter),
    allowed_metadata_fields: ALLOWED_METADATA_FIELDS,
    forbidden_outputs: [
      "full legal text",
      "evidence export",
      "client-use output",
      "verified legal change claim",
    ],
    gate_state: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    required_future_approval: {
      control_tower_approval_required: true,
      one_off_command_only: true,
      no_scheduling: true,
      no_publication: true,
      notes:
        "Future T055 may execute one approved dry-run only after explicit Control Tower approval; env CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES and CLI flags required.",
    },
    generated_at: new Date().toISOString(),
  };

  const outPath = path.join(ROOT, approval.dry_run_plan_path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");

  console.log("PASS: network dry-run plan written");
  console.log(`  approval_id: ${approvalId}`);
  console.log(`  path: ${approval.dry_run_plan_path}`);
  console.log(`  mode: planning_only (no network)`);
}

main();
