#!/usr/bin/env node
/**
 * Build a local summary JSON for a final legal review packet.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/final-legal-review-packets.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/final-legal-review");

function parseArgs(argv) {
  let packetId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--packet-id" && argv[i + 1]) {
      packetId = argv[++i];
    }
  }
  return { packetId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function countByStatus(items) {
  const counts = {
    pending: 0,
    needs_follow_up: 0,
    blocked: 0,
    local_metadata_available: 0,
  };
  for (const item of items ?? []) {
    if (counts[item.status] !== undefined) counts[item.status] += 1;
  }
  return counts;
}

function main() {
  const { packetId } = parseArgs(process.argv);
  if (!packetId) {
    console.error(
      "Usage: npm run build:final-legal-review-packet-summary -- --packet-id T062-001",
    );
    process.exit(1);
  }

  const doc = readYaml(PACKETS_PATH);
  const packet = (doc.packets ?? []).find((p) => p.packet_id === packetId);
  if (!packet) {
    console.error(`Unknown packet_id: ${packetId}`);
    process.exit(1);
  }

  const itemCounts = countByStatus(packet.legal_review_items);
  const blockers = packet.blockers_remaining ?? [];

  const summary = {
    packet_id: packet.packet_id,
    draft_update_id: packet.draft_update_id,
    packet_status: packet.packet_status,
    review_stage: packet.review_stage,
    item_counts: itemCounts,
    blockers_remaining: blockers,
    blockers_count: blockers.length,
    next_required_step: packet.next_required_step,
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
      "Local final legal review packet summary. Pending internal review only. Not approval. Not publication.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${packetId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: final legal review packet summary written");
  console.log(`  packet_id: ${packetId}`);
  console.log(`  packet_status: ${packet.packet_status}`);
  console.log(`  path: generated/final-legal-review/${packetId}.json`);
}

main();
