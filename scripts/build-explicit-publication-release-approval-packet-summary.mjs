#!/usr/bin/env node
/**
 * Build a local summary JSON for an explicit publication release approval packet.
 * Metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKETS_PATH = path.join(
  ROOT,
  "data/source-adapters/explicit-publication-release-approval-packets.yml",
);
const OUTPUT_DIR = path.join(ROOT, "generated/explicit-publication-release-approval");

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

function main() {
  const { packetId } = parseArgs(process.argv);
  if (!packetId) {
    console.error(
      "Usage: npm run build:explicit-publication-release-approval-packet-summary -- --packet-id T072-001",
    );
    process.exit(1);
  }

  const doc = readYaml(PACKETS_PATH);
  const packet = (doc.packets ?? []).find((p) => p.packet_id === packetId);
  if (!packet) {
    console.error(`Unknown packet_id: ${packetId}`);
    process.exit(1);
  }

  const readyChecks = (packet.pre_release_checks ?? []).filter(
    (c) => c.status === "ready_for_authorization_review",
  );
  const blockedChecks = (packet.pre_release_checks ?? []).filter((c) => c.status === "blocked");

  const summary = {
    packet_id: packet.packet_id,
    public_update_release_decision_id: packet.public_update_release_decision_id,
    draft_update_id: packet.draft_update_id,
    proposed_public_update_id: packet.proposed_public_update_id,
    proposed_route: packet.proposed_route,
    packet_status: packet.packet_status,
    operator_confirmation_status: packet.operator_confirmation_status,
    pre_release_checks_total: (packet.pre_release_checks ?? []).length,
    pre_release_checks_ready_count: readyChecks.length,
    pre_release_checks_blocked_count: blockedChecks.length,
    authorization_requirements_count: (packet.authorization_requirements ?? []).length,
    authorization_requirements: packet.authorization_requirements ?? [],
    blockers_remaining: packet.blockers_remaining ?? [],
    next_required_step: packet.next_required_step,
    publication_release_authorized: false,
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
      "Local explicit publication release approval packet summary. Not published — authorization pending.",
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `${packetId}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("PASS: explicit publication release approval packet summary written");
  console.log(`  packet_id: ${packetId}`);
  console.log(`  packet_status: ${packet.packet_status}`);
  console.log(`  path: generated/explicit-publication-release-approval/${packetId}.json`);
}

main();
