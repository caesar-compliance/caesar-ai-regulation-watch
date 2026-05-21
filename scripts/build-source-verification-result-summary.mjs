#!/usr/bin/env node
/**
 * Build a local summary JSON for a source verification result.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESULTS_PATH = path.join(ROOT, "data/source-adapters/source-verification-results.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/source-verification-results");

function parseArgs(argv) {
  let resultId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--result-id" && argv[i + 1]) {
      resultId = argv[++i];
    }
  }
  return { resultId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function countByResult(items) {
  const counts = {
    manual_pass: 0,
    manual_fail: 0,
    needs_follow_up: 0,
    not_checked: 0,
  };
  for (const item of items ?? []) {
    if (counts[item.result] !== undefined) counts[item.result] += 1;
  }
  return counts;
}

function main() {
  const { resultId } = parseArgs(process.argv);
  if (!resultId) {
    console.error(
      "Usage: npm run build:source-verification-result-summary -- --result-id T061-001",
    );
    process.exit(1);
  }

  const doc = readYaml(RESULTS_PATH);
  const result = (doc.results ?? []).find((r) => r.result_id === resultId);
  if (!result) {
    console.error(`Unknown result_id: ${resultId}`);
    process.exit(1);
  }

  const itemCounts = countByResult(result.item_results);
  const blockers = result.blockers_remaining ?? [];

  const summary = {
    result_id: result.result_id,
    checklist_id: result.checklist_id,
    draft_update_id: result.draft_update_id,
    overall_result: result.overall_result,
    item_counts: itemCounts,
    blockers_remaining: blockers,
    blockers_count: blockers.length,
    next_required_step: result.next_required_step,
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
      "Local source verification result summary. Item-level manual checks only. Not final source verification. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${resultId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: source verification result summary written");
  console.log(`  result_id: ${resultId}`);
  console.log(`  overall_result: ${result.overall_result}`);
  console.log(`  path: generated/source-verification-results/${resultId}.json`);
}

main();
