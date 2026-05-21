#!/usr/bin/env node
/**
 * Build a local summary JSON for a final legal review revision response.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESPONSES_PATH = path.join(
  ROOT,
  "data/source-adapters/final-legal-review-revision-responses.yml",
);
const OUTPUT_DIR = path.join(ROOT, "generated/final-legal-review-responses");

function parseArgs(argv) {
  let responseId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--response-id" && argv[i + 1]) {
      responseId = argv[++i];
    }
  }
  return { responseId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function countByStatus(changes) {
  const counts = {
    addressed_metadata_only: 0,
    partially_addressed: 0,
    still_blocked: 0,
  };
  for (const c of changes ?? []) {
    if (counts[c.status] !== undefined) counts[c.status] += 1;
  }
  return counts;
}

function main() {
  const { responseId } = parseArgs(process.argv);
  if (!responseId) {
    console.error(
      "Usage: npm run build:final-legal-review-revision-response-summary -- --response-id T064-001",
    );
    process.exit(1);
  }

  const doc = readYaml(RESPONSES_PATH);
  const response = (doc.responses ?? []).find((r) => r.response_id === responseId);
  if (!response) {
    console.error(`Unknown response_id: ${responseId}`);
    process.exit(1);
  }

  const addressedChangeCounts = countByStatus(response.addressed_changes);

  const summary = {
    response_id: response.response_id,
    decision_id: response.decision_id,
    packet_id: response.packet_id,
    draft_update_id: response.draft_update_id,
    response_status: response.response_status,
    addressed_change_counts: addressedChangeCounts,
    remaining_blockers: response.remaining_blockers ?? [],
    next_required_step: response.next_required_step,
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
      "Local final legal review revision response summary. Internal workflow only. Not approval. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${responseId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: final legal review revision response summary written");
  console.log(`  response_id: ${responseId}`);
  console.log(`  response_status: ${response.response_status}`);
  console.log(`  path: generated/final-legal-review-responses/${responseId}.json`);
}

main();
