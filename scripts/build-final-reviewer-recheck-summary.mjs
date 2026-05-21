#!/usr/bin/env node
/**
 * Build a local summary JSON for a final reviewer re-check record.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RECHECKS_PATH = path.join(ROOT, "data/source-adapters/final-reviewer-rechecks.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/final-reviewer-rechecks");

function parseArgs(argv) {
  let recheckId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--recheck-id" && argv[i + 1]) {
      recheckId = argv[++i];
    }
  }
  return { recheckId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function countByRecheckStatus(items) {
  const counts = {
    accepted_for_internal_recheck: 0,
    still_blocked: 0,
    needs_follow_up: 0,
  };
  for (const item of items ?? []) {
    if (counts[item.recheck_status] !== undefined) counts[item.recheck_status] += 1;
  }
  return counts;
}

function main() {
  const { recheckId } = parseArgs(process.argv);
  if (!recheckId) {
    console.error(
      "Usage: npm run build:final-reviewer-recheck-summary -- --recheck-id T065-001",
    );
    process.exit(1);
  }

  const doc = readYaml(RECHECKS_PATH);
  const recheck = (doc.rechecks ?? []).find((r) => r.recheck_id === recheckId);
  if (!recheck) {
    console.error(`Unknown recheck_id: ${recheckId}`);
    process.exit(1);
  }

  const reviewedItemCounts = countByRecheckStatus(recheck.reviewed_response_items);

  const summary = {
    recheck_id: recheck.recheck_id,
    response_id: recheck.response_id,
    packet_id: recheck.packet_id,
    draft_update_id: recheck.draft_update_id,
    recheck_result: recheck.recheck_result,
    reviewed_item_counts: reviewedItemCounts,
    remaining_blockers: recheck.remaining_blockers ?? [],
    next_required_step: recheck.next_required_step,
    publication_allowed: false,
    public_export_allowed: false,
    final_legal_approval_completed: false,
    final_source_verification_completed: false,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local final reviewer re-check summary. Internal workflow only. Not publication. Not approval.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${recheckId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: final reviewer re-check summary written");
  console.log(`  recheck_id: ${recheckId}`);
  console.log(`  recheck_result: ${recheck.recheck_result}`);
  console.log(`  path: generated/final-reviewer-rechecks/${recheckId}.json`);
}

main();
