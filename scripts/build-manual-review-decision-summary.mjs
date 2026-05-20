#!/usr/bin/env node
/**
 * Build a local summary JSON for a manual review decision record.
 * Reads decision, promotion, and draft metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/manual-review-decisions");

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
    console.error("Usage: npm run build:manual-review-decision-summary -- --decision-id T057-001");
    process.exit(1);
  }

  const doc = readYaml(DECISIONS_PATH);
  const decision = (doc.decisions ?? []).find((d) => d.decision_id === decisionId);
  if (!decision) {
    console.error(`Unknown decision_id: ${decisionId}`);
    process.exit(1);
  }

  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const promotion = (promotionsDoc.promotions ?? []).find(
    (p) => p.promotion_id === decision.promotion_id,
  );
  if (!promotion) {
    console.error(`Unknown promotion_id: ${decision.promotion_id}`);
    process.exit(1);
  }

  const draftPath = path.join(ROOT, decision.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    console.error(`Draft missing: ${decision.draft_update_path}`);
    process.exit(1);
  }
  const draft = readYaml(draftPath);

  const summary = {
    decision_id: decision.decision_id,
    promotion_id: decision.promotion_id,
    draft_update_id: decision.draft_update_id,
    draft_update_path: decision.draft_update_path,
    decision: decision.decision,
    decision_scope: decision.decision_scope,
    decision_status: decision.decision_status,
    requested_changes: decision.requested_changes ?? [],
    requested_changes_count: (decision.requested_changes ?? []).length,
    publication_allowed: false,
    public_export_allowed: false,
    evidence_export_allowed: false,
    source_verification_completed: false,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    promotion_status: promotion.status,
    draft_status: draft.status,
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local manual review decision summary. Metadata only. Not publication. Not source verification.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${decisionId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: manual review decision summary written");
  console.log(`  decision_id: ${decisionId}`);
  console.log(`  decision: ${decision.decision}`);
  console.log(`  path: generated/manual-review-decisions/${decisionId}.json`);
}

main();
