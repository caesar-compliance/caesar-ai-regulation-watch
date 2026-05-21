#!/usr/bin/env node
/**
 * Build a local summary JSON for a publication staging preview record.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEWS_PATH = path.join(ROOT, "data/source-adapters/publication-staging-previews.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/publication-staging");

function parseArgs(argv) {
  let previewId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--preview-id" && argv[i + 1]) {
      previewId = argv[++i];
    }
  }
  return { previewId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const { previewId } = parseArgs(process.argv);
  if (!previewId) {
    console.error(
      "Usage: npm run build:publication-staging-preview-summary -- --preview-id T068-001",
    );
    process.exit(1);
  }

  const doc = readYaml(PREVIEWS_PATH);
  const preview = (doc.previews ?? []).find((p) => p.preview_id === previewId);
  if (!preview) {
    console.error(`Unknown preview_id: ${previewId}`);
    process.exit(1);
  }

  const summary = {
    preview_id: preview.preview_id,
    publication_gate_decision_id: preview.publication_gate_decision_id,
    draft_update_id: preview.draft_update_id,
    preview_status: preview.preview_status,
    preview_route: preview.preview_route,
    staging_preview_created: true,
    publication_allowed: false,
    public_export_allowed: false,
    client_use_allowed: false,
    evidence_export_allowed: false,
    blockers_remaining: preview.blockers_remaining ?? [],
    next_required_step: preview.next_required_step,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Local publication staging preview summary. Internal preview only. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${previewId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: publication staging preview summary written");
  console.log(`  preview_id: ${previewId}`);
  console.log(`  preview_status: ${preview.preview_status}`);
  console.log(`  path: generated/publication-staging/${previewId}.json`);
}

main();
