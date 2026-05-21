#!/usr/bin/env node
/**
 * Build a local summary JSON for a public export approval decision record.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(
  ROOT,
  "data/source-adapters/public-export-approval-decisions.yml",
);
const OUTPUT_DIR = path.join(ROOT, "generated/public-export-approval-decisions");

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
      "Usage: npm run build:public-export-approval-decision-summary -- --decision-id T070-001",
    );
    process.exit(1);
  }

  const doc = readYaml(DECISIONS_PATH);
  const decision = (doc.decisions ?? []).find((d) => d.decision_id === decisionId);
  if (!decision) {
    console.error(`Unknown decision_id: ${decisionId}`);
    process.exit(1);
  }

  const summary = {
    decision_id: decision.decision_id,
    release_gate_id: decision.release_gate_id,
    draft_update_id: decision.draft_update_id,
    decision: decision.decision,
    decision_status: decision.decision_status,
    non_public_export_preview_allowed: decision.safety.non_public_export_preview_allowed,
    non_public_preview_artifact_path: decision.non_public_preview_artifact_path,
    publication_allowed: false,
    public_export_allowed: false,
    client_use_allowed: false,
    evidence_export_allowed: false,
    blockers_remaining: decision.blockers_remaining ?? [],
    next_required_step: decision.next_required_step,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local public export approval decision summary. Non-public preview only. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${decisionId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: public export approval decision summary written");
  console.log(`  decision_id: ${decisionId}`);
  console.log(`  decision: ${decision.decision}`);
  console.log(`  path: generated/public-export-approval-decisions/${decisionId}.json`);
}

main();
