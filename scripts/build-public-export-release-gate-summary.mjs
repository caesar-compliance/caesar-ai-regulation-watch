#!/usr/bin/env node
/**
 * Build a local summary JSON for a public export release gate record.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GATES_PATH = path.join(ROOT, "data/source-adapters/public-export-release-gates.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/public-export-release-gates");

function parseArgs(argv) {
  let gateId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--gate-id" && argv[i + 1]) {
      gateId = argv[++i];
    }
  }
  return { gateId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function countByStatus(items) {
  const counts = {};
  for (const item of items ?? []) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}

function main() {
  const { gateId } = parseArgs(process.argv);
  if (!gateId) {
    console.error(
      "Usage: npm run build:public-export-release-gate-summary -- --gate-id T069-001",
    );
    process.exit(1);
  }

  const doc = readYaml(GATES_PATH);
  const gate = (doc.gates ?? []).find((g) => g.gate_id === gateId);
  if (!gate) {
    console.error(`Unknown gate_id: ${gateId}`);
    process.exit(1);
  }

  const summary = {
    gate_id: gate.gate_id,
    staging_preview_id: gate.staging_preview_id,
    draft_update_id: gate.draft_update_id,
    gate_status: gate.gate_status,
    gate_result: gate.gate_result,
    candidate_metadata: gate.candidate_metadata,
    release_gate_item_counts_by_status: countByStatus(gate.release_gate_items),
    blockers_remaining: gate.blockers_remaining ?? [],
    next_required_step: gate.next_required_step,
    public_export_gate_ready: true,
    ready_for_public_export_approval: true,
    publication_allowed: false,
    public_export_allowed: false,
    client_use_allowed: false,
    evidence_export_allowed: false,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local public export release gate summary. Internal gate only. Not publication. Not public export.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${gateId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: public export release gate summary written");
  console.log(`  gate_id: ${gateId}`);
  console.log(`  gate_status: ${gate.gate_status}`);
  console.log(`  path: generated/public-export-release-gates/${gateId}.json`);
}

main();
