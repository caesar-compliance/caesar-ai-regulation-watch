#!/usr/bin/env node
/**
 * Build a local summary JSON for a draft revision packet.
 * Reads revision, decision, promotion, and draft metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REVISIONS_PATH = path.join(ROOT, "data/source-adapters/draft-regulatory-update-revisions.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-decisions.yml");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/draft-revisions");

function parseArgs(argv) {
  let revisionId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--revision-id" && argv[i + 1]) {
      revisionId = argv[++i];
    }
  }
  return { revisionId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const { revisionId } = parseArgs(process.argv);
  if (!revisionId) {
    console.error("Usage: npm run build:draft-revision-summary -- --revision-id T058-001");
    process.exit(1);
  }

  const doc = readYaml(REVISIONS_PATH);
  const revision = (doc.revisions ?? []).find((r) => r.revision_id === revisionId);
  if (!revision) {
    console.error(`Unknown revision_id: ${revisionId}`);
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const decision = (decisionsDoc.decisions ?? []).find(
    (d) => d.decision_id === revision.source_decision_id,
  );
  if (!decision) {
    console.error(`Unknown source_decision_id: ${revision.source_decision_id}`);
    process.exit(1);
  }

  const promotionsDoc = readYaml(PROMOTIONS_PATH);
  const promotion = (promotionsDoc.promotions ?? []).find(
    (p) => p.promotion_id === revision.source_promotion_id,
  );
  if (!promotion) {
    console.error(`Unknown source_promotion_id: ${revision.source_promotion_id}`);
    process.exit(1);
  }

  const draftPath = path.join(ROOT, revision.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    console.error(`Draft missing: ${revision.draft_update_path}`);
    process.exit(1);
  }
  const draft = readYaml(draftPath);

  const addressed = revision.requested_changes_addressed ?? [];
  const remaining = revision.requested_changes_remaining ?? [];

  const summary = {
    revision_id: revision.revision_id,
    draft_update_id: revision.draft_update_id,
    source_decision_id: revision.source_decision_id,
    revision_status: revision.revision_status,
    revision_scope: revision.revision_scope,
    requested_changes_addressed: addressed,
    requested_changes_addressed_count: addressed.length,
    requested_changes_remaining: remaining,
    requested_changes_remaining_count: remaining.length,
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
    draft_review_status: draft.review_status,
    promotion_status: promotion.status,
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local draft revision summary. Metadata only. Not publication. Not source verification.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${revisionId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: draft revision summary written");
  console.log(`  revision_id: ${revisionId}`);
  console.log(`  revision_status: ${revision.revision_status}`);
  console.log(`  path: generated/draft-revisions/${revisionId}.json`);
}

main();
