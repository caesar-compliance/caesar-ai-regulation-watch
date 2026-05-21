#!/usr/bin/env node
/**
 * Build a local summary JSON for a public update release decision record.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(
  ROOT,
  "data/source-adapters/public-update-release-decisions.yml",
);
const OUTPUT_DIR = path.join(ROOT, "generated/public-update-release-decisions");

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
      "Usage: npm run build:public-update-release-decision-summary -- --decision-id T071-001",
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
    public_export_approval_decision_id: decision.public_export_approval_decision_id,
    draft_update_id: decision.draft_update_id,
    proposed_public_update_id: decision.proposed_public_update_id,
    proposed_route: decision.proposed_route,
    decision: decision.decision,
    decision_status: decision.decision_status,
    hold_reasons_count: (decision.hold_reasons ?? []).length,
    hold_reasons: decision.hold_reasons ?? [],
    release_requirements_remaining_count: (decision.release_requirements_remaining ?? [])
      .length,
    release_requirements_remaining: decision.release_requirements_remaining ?? [],
    publication_allowed: false,
    public_export_allowed: false,
    public_data_inclusion_allowed: false,
    public_update_route_created: false,
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
      "Local public update release decision summary. Publication held — not published.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${decisionId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: public update release decision summary written");
  console.log(`  decision_id: ${decisionId}`);
  console.log(`  decision: ${decision.decision}`);
  console.log(`  path: generated/public-update-release-decisions/${decisionId}.json`);
}

main();
