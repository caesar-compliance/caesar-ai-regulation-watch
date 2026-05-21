#!/usr/bin/env node
/**
 * Build a local summary JSON for a final legal review decision.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-decisions.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/final-legal-review-decisions");

function parseArgs(argv) {
  let decisionId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--decision-id" && argv[i + 1]) {
      decisionId = argv[++i];
    }
  }
  return { decisionId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const { decisionId } = parseArgs(process.argv);
  if (!decisionId) {
    console.error(
      "Usage: npm run build:final-legal-review-decision-summary -- --decision-id T063-001",
    );
    process.exit(1);
  }

  const doc = readYaml(DECISIONS_PATH);
  const decision = (doc.decisions ?? []).find((d) => d.decision_id === decisionId);
  if (!decision) {
    console.error(`Unknown decision_id: ${decisionId}`);
    process.exit(1);
  }

  const requiredChanges = decision.required_changes ?? [];
  const approvalLimitations = decision.approval_limitations ?? [];

  const summary = {
    decision_id: decision.decision_id,
    packet_id: decision.packet_id,
    draft_update_id: decision.draft_update_id,
    decision: decision.decision,
    decision_status: decision.decision_status,
    required_changes_count: requiredChanges.length,
    required_changes: requiredChanges,
    approval_limitations_count: approvalLimitations.length,
    approval_limitations: approvalLimitations,
    next_required_step: decision.next_required_step,
    publication_allowed: false,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local final legal review decision summary. Internal workflow only. Not approval. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${decisionId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: final legal review decision summary written");
  console.log(`  decision_id: ${decisionId}`);
  console.log(`  decision: ${decision.decision}`);
  console.log(`  path: generated/final-legal-review-decisions/${decisionId}.json`);
}

main();
