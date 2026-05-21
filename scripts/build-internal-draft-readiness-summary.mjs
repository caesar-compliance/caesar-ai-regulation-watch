#!/usr/bin/env node
/**
 * Build a local summary JSON for an internal draft readiness gate.
 * Reads gate, promotion, decision, revision, and draft metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GATES_PATH = path.join(ROOT, "data/source-adapters/internal-draft-readiness-gates.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const REVISIONS_PATH = path.join(ROOT, "data/source-adapters/draft-regulatory-update-revisions.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/internal-draft-readiness");

function parseArgs(argv) {
  let readinessId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--readiness-id" && argv[i + 1]) {
      readinessId = argv[++i];
    }
  }
  return { readinessId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const { readinessId } = parseArgs(process.argv);
  if (!readinessId) {
    console.error(
      "Usage: npm run build:internal-draft-readiness-summary -- --readiness-id T059-001",
    );
    process.exit(1);
  }

  const doc = readYaml(GATES_PATH);
  const gate = (doc.gates ?? []).find((g) => g.readiness_id === readinessId);
  if (!gate) {
    console.error(`Unknown readiness_id: ${readinessId}`);
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const decision = (decisionsDoc.decisions ?? []).find(
    (d) => d.decision_id === gate.source_decision_id,
  );
  if (!decision) {
    console.error(`Unknown source_decision_id: ${gate.source_decision_id}`);
    process.exit(1);
  }

  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const promotion = (promotionsDoc.promotions ?? []).find(
    (p) => p.promotion_id === gate.source_promotion_id,
  );
  if (!promotion) {
    console.error(`Unknown source_promotion_id: ${gate.source_promotion_id}`);
    process.exit(1);
  }

  const revisionsDoc = readYaml(REVISIONS_PATH);
  const revision = (revisionsDoc.revisions ?? []).find(
    (r) => r.revision_id === gate.source_revision_id,
  );
  if (!revision) {
    console.error(`Unknown source_revision_id: ${gate.source_revision_id}`);
    process.exit(1);
  }

  const draftPath = path.join(ROOT, gate.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    console.error(`Draft missing: ${gate.draft_update_path}`);
    process.exit(1);
  }
  const draft = readYaml(draftPath);

  const blockers = gate.blockers ?? [];
  const satisfied = gate.satisfied_conditions ?? [];

  const summary = {
    readiness_id: gate.readiness_id,
    draft_update_id: gate.draft_update_id,
    readiness_result: gate.readiness_result,
    gate_scope: gate.gate_scope,
    blockers,
    blockers_count: blockers.length,
    satisfied_conditions: satisfied,
    satisfied_conditions_count: satisfied.length,
    next_required_step: gate.next_required_step,
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
    draft_readiness_result: draft.readiness_result,
    draft_next_required_step: draft.next_required_step,
    revision_id: revision.revision_id,
    decision_id: decision.decision_id,
    promotion_id: promotion.promotion_id,
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local internal draft readiness summary. Metadata only. Not publication. Not source verification.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${readinessId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: internal draft readiness summary written");
  console.log(`  readiness_id: ${readinessId}`);
  console.log(`  readiness_result: ${gate.readiness_result}`);
  console.log(`  path: generated/internal-draft-readiness/${readinessId}.json`);
}

main();
