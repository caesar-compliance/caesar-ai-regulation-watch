#!/usr/bin/env node
/**
 * Build a non-public export preview artifact JSON for an approval decision.
 * Metadata only. No public/data writes. No public update route generation.
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
const GATES_PATH = path.join(ROOT, "data/source-adapters/public-export-release-gates.yml");
const PREVIEWS_PATH = path.join(ROOT, "data/source-adapters/publication-staging-previews.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/public-export-preview");
const SUMMARY_MAX = 1000;

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

function capSummary(text) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  if (trimmed.length <= SUMMARY_MAX) return trimmed;
  return `${trimmed.slice(0, SUMMARY_MAX - 3)}...`;
}

function main() {
  const { decisionId } = parseArgs(process.argv);
  if (!decisionId) {
    console.error(
      "Usage: npm run build:non-public-export-preview -- --decision-id T070-001",
    );
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const decision = (decisionsDoc.decisions ?? []).find((d) => d.decision_id === decisionId);
  if (!decision) {
    console.error(`Unknown decision_id: ${decisionId}`);
    process.exit(1);
  }

  const gatesDoc = readYaml(GATES_PATH);
  const gate = (gatesDoc.gates ?? []).find((g) => g.gate_id === decision.release_gate_id);
  if (!gate) {
    console.error(`Unknown release_gate_id: ${decision.release_gate_id}`);
    process.exit(1);
  }

  const previewsDoc = readYaml(PREVIEWS_PATH);
  const preview = (previewsDoc.previews ?? []).find(
    (p) => p.preview_id === decision.staging_preview_id,
  );
  if (!preview) {
    console.error(`Unknown staging_preview_id: ${decision.staging_preview_id}`);
    process.exit(1);
  }

  const meta = gate.candidate_metadata;
  const artifact = {
    preview_id: decisionId,
    candidate_id: meta.candidate_id,
    proposed_public_update_id: meta.proposed_public_update_id,
    proposed_route: meta.proposed_route,
    title: preview.preview_title,
    summary: capSummary(preview.preview_summary),
    source_url: meta.source_url,
    source_id: meta.source_id,
    source_adapter_id: meta.source_adapter_id,
    jurisdiction_ids: meta.jurisdiction_ids,
    topic_ids: meta.topic_ids,
    status: "non_public_export_preview",
    metadata_only: true,
    publication_allowed: false,
    public_export_allowed: false,
    client_use_allowed: false,
    evidence_export_allowed: false,
    verified_on_source: false,
    legal_change_claimed: false,
    gates: {
      verified_on_source: false,
      client_use_allowed: false,
      client_evidence_allowed: false,
      final_evidence_allowed: false,
      legal_change_claimed: false,
    },
    limitations: decision.preview_limitations ?? [],
    generated_at: new Date().toISOString(),
    legal_safe_note:
      "Non-public export preview artifact. Internal only. Not published. Not in public/data.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${decisionId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log("PASS: non-public export preview artifact written");
  console.log(`  decision_id: ${decisionId}`);
  console.log(`  proposed_public_update_id: ${meta.proposed_public_update_id}`);
  console.log(`  path: generated/public-export-preview/${decisionId}.json`);
}

main();
