#!/usr/bin/env node
/**
 * Build a local summary JSON for a publication gate packet record.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-packets.yml");
const OUTPUT_DIR = path.join(ROOT, "generated/publication-gate");

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

function countByItemStatus(items) {
  const counts = {
    ready_for_gate_review: 0,
    blocked: 0,
    needs_follow_up: 0,
    not_applicable: 0,
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
      "Usage: npm run build:publication-gate-packet-summary -- --packet-id T066-001",
    );
    process.exit(1);
  }

  const doc = readYaml(PACKETS_PATH);
  const packet = (doc.packets ?? []).find((p) => p.packet_id === packetId);
  if (!packet) {
    console.error(`Unknown packet_id: ${packetId}`);
    process.exit(1);
  }

  const itemCounts = countByItemStatus(packet.publication_gate_items);

  const summary = {
    packet_id: packet.packet_id,
    draft_update_id: packet.draft_update_id,
    packet_status: packet.packet_status,
    gate_result: packet.gate_result,
    item_counts: itemCounts,
    blockers_remaining: packet.blockers_remaining ?? [],
    next_required_step: packet.next_required_step,
    publication_allowed: false,
    public_export_allowed: false,
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
      "Local publication gate packet summary. Internal workflow only. Not publication. Not approval.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${packetId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: publication gate packet summary written");
  console.log(`  packet_id: ${packetId}`);
  console.log(`  gate_result: ${packet.gate_result}`);
  console.log(`  path: generated/publication-gate/${packetId}.json`);
}

main();
