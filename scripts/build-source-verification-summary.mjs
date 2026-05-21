#!/usr/bin/env node
/**
 * Build a local summary JSON for a source verification checklist.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECKLISTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-checklists.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/source-verification");

function parseArgs(argv) {
  let checklistId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--checklist-id" && argv[i + 1]) {
      checklistId = argv[++i];
    }
  }
  return { checklistId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function countByStatus(items) {
  const counts = { pending: 0, local_data_present: 0, blocked: 0 };
  for (const item of items ?? []) {
    if (counts[item.status] !== undefined) counts[item.status] += 1;
  }
  return counts;
}

function main() {
  const { checklistId } = parseArgs(process.argv);
  if (!checklistId) {
    console.error("Usage: npm run build:source-verification-summary -- --checklist-id T060-001");
    process.exit(1);
  }

  const doc = readYaml(CHECKLISTS_PATH);
  const checklist = (doc.checklists ?? []).find((c) => c.checklist_id === checklistId);
  if (!checklist) {
    console.error(`Unknown checklist_id: ${checklistId}`);
    process.exit(1);
  }

  const itemCounts = countByStatus(checklist.checklist_items);
  const blockers = checklist.blockers ?? [];

  const summary = {
    checklist_id: checklist.checklist_id,
    draft_update_id: checklist.draft_update_id,
    status: checklist.status,
    item_counts: itemCounts,
    blockers,
    blockers_count: blockers.length,
    next_required_step: checklist.next_required_step,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    publication_allowed: false,
    public_export_allowed: false,
    source_verification_completed: false,
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local source verification checklist summary. Metadata only. Not verified on source. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${checklistId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: source verification summary written");
  console.log(`  checklist_id: ${checklistId}`);
  console.log(`  status: ${checklist.status}`);
  console.log(`  path: generated/source-verification/${checklistId}.json`);
}

main();
