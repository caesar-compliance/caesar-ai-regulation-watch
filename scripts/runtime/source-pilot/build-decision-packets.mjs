#!/usr/bin/env node
/**
 * Build public source-pilot-decision-packets.json from review candidates (no network).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CANDIDATES_PATH = path.join(ROOT, "public/data/source-pilot-review-candidates.json");
const STATUS_PATH = path.join(ROOT, "public/data/source-pilot-status.json");
const REGISTRY_PATH = path.join(ROOT, "data/runtime/source-pilot-registry.yml");
const HEALTH_PATH = path.join(ROOT, "public/data/runtime-db-health.json");
const OUTPUT = path.join(ROOT, "public/data/source-pilot-decision-packets.json");

const PACKET_CREATED_AT = "2026-05-21T12:00:00.000Z";

const CLOSED_GATES = {
  verified_on_source: false,
  client_use_allowed: false,
  client_evidence_allowed: false,
  final_evidence_allowed: false,
  legal_change_claimed: false,
  publication_allowed: false,
  public_export_allowed: false,
};

const RUNTIME_FLAGS = {
  live_ingestion_enabled: false,
  scheduled_monitoring_enabled: false,
  network_execution_enabled: false,
};

const OPERATOR_CHECKLIST = [
  {
    id: "confirm_fixture_context",
    label: "Confirm fixture-only simulated change (not live fetch)",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "review_metadata_fields",
    label: "Review metadata_fields_changed against prior/current hashes",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "confirm_registry_url",
    label: "Confirm official_url matches allowlisted registry entry",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "no_legal_conclusion",
    label: "Do not record legal change conclusion or client/evidence approval",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "triage_label",
    label: "Assign offline triage label (placeholder only — not persisted)",
    required: false,
    completed_placeholder: false,
  },
];

const MANUAL_REVIEW_STEPS = [
  "Open packet summary and confirm candidate_id links to review export.",
  "Compare previous_metadata_hash and current_metadata_hash (fixture simulation only).",
  "Inspect title and official_url metadata — do not treat as verified legal text.",
  "Record operator triage intent using decision placeholders (offline; not persisted).",
  "If Supabase becomes available, defer persistence to T075B runtime queue.",
  "If network check approved later, defer verify-on-source to T076+ controlled check.",
];

/**
 * @param {string} dbStatus
 * @param {Record<string, unknown>} candidate
 */
function resolvePacketStatus(dbStatus, candidate) {
  if (dbStatus === "not_configured") {
    return "blocked_no_supabase";
  }
  if (candidate.reviewer_status === "blocked_no_network") {
    return "blocked_no_network";
  }
  if (
    candidate.reviewer_status === "ready_for_manual_inspection" ||
    candidate.reviewer_status === "pending_review"
  ) {
    return "ready_for_operator_triage";
  }
  return "pending_manual_review";
}

/**
 * @param {string} dbStatus
 */
function blockedUntil(dbStatus) {
  const reasons = [
    "network_execution_disabled",
    "source_not_verified_on_source",
    "evidence_gates_closed",
    "publication_gates_closed",
    "no_legal_conclusion_allowed",
    "fixture_only_no_live_ingestion",
  ];
  if (dbStatus === "not_configured") {
    reasons.unshift("supabase_not_configured");
  }
  return reasons;
}

/**
 * @param {Record<string, unknown>} candidate
 * @param {Record<string, unknown> | undefined} registryEntry
 */
function makePacket(candidate, registryEntry) {
  const packetId = `sp-packet-${candidate.candidate_id}`;
  const dbStatus = fs.existsSync(HEALTH_PATH)
    ? (JSON.parse(fs.readFileSync(HEALTH_PATH, "utf8")).status ?? "not_configured")
    : "not_configured";

  const packetStatus = resolvePacketStatus(dbStatus, candidate);

  return {
    packet_id: packetId,
    candidate_id: candidate.candidate_id,
    source_id: candidate.source_id,
    source_name: candidate.source_name ?? registryEntry?.source_name,
    jurisdiction: candidate.jurisdiction ?? registryEntry?.jurisdiction,
    source_type: candidate.source_type ?? registryEntry?.source_type,
    official_url: candidate.official_url ?? registryEntry?.official_url,
    candidate_status: candidate.candidate_status,
    reviewer_status: candidate.reviewer_status,
    packet_status: packetStatus,
    packet_created_at: PACKET_CREATED_AT,
    change_type: candidate.change_type,
    detected_at: candidate.detected_at,
    title: candidate.title ?? null,
    metadata_fields_changed: candidate.metadata_fields_changed ?? [],
    previous_metadata_hash: candidate.previous_metadata_hash,
    current_metadata_hash: candidate.current_metadata_hash,
    operator_checklist: OPERATOR_CHECKLIST.map((item) => ({ ...item })),
    manual_review_steps: [...MANUAL_REVIEW_STEPS],
    blocked_until: blockedUntil(dbStatus),
    safety_flags: { ...CLOSED_GATES },
    runtime_flags: { ...RUNTIME_FLAGS },
    decision_placeholders: {
      mark_for_manual_inspection: {
        label: "Mark for manual inspection (offline triage)",
        selected_placeholder: false,
        note_placeholder:
          "Operator intent only — not persisted; does not approve evidence or publication.",
      },
      request_source_verification_later: {
        label: "Request source verification later (when network approved)",
        selected_placeholder: false,
        note_placeholder:
          "Defer verify-on-source until Control Tower approves controlled network check.",
      },
      keep_blocked: {
        label: "Keep blocked (gates remain closed)",
        selected_placeholder: false,
        note_placeholder:
          "Retain blocked state; no client/evidence/publication use until explicit later gates.",
      },
      discard_fixture_candidate: {
        label: "Discard fixture candidate (simulation only)",
        selected_placeholder: false,
        note_placeholder:
          "Mark fixture diff as non-actionable for pilot — does not delete registry fixtures.",
      },
    },
    public_note:
      "T075D offline decision packet. Metadata-only fixture context for operator triage. Not verified on source; not legal change; not evidence; not publication-approved.",
  };
}

function main() {
  if (!fs.existsSync(CANDIDATES_PATH)) {
    console.error(
      `Missing ${CANDIDATES_PATH} — run npm run build:source-pilot-review-candidates`,
    );
    process.exit(1);
  }

  const candidatesDoc = JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf8"));
  const statusDoc = fs.existsSync(STATUS_PATH)
    ? JSON.parse(fs.readFileSync(STATUS_PATH, "utf8"))
    : { source_count: 0 };
  const registry = yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const registryById = new Map(
    (registry.sources ?? []).map((s) => [s.source_id, s]),
  );

  const candidates = candidatesDoc.candidates ?? [];
  const packets = candidates.map((c) => makePacket(c, registryById.get(c.source_id)));
  packets.sort((a, b) =>
    String(a.packet_created_at).localeCompare(String(b.packet_created_at)),
  );

  const exportDoc = {
    export_id: "source-pilot-decision-packets-2026-05-21-v075d",
    status: "decision_packets_ready",
    mode: "fixture_only",
    checked_at: candidatesDoc.checked_at ?? PACKET_CREATED_AT,
    source_count: statusDoc.source_count ?? registry.sources?.length ?? 0,
    candidate_count: candidates.length,
    packet_count: packets.length,
    packets,
    runtime_flags: RUNTIME_FLAGS,
    gates: CLOSED_GATES,
    public_note:
      "T075D offline source pilot decision packet export. Metadata-only fixture context for manual operator triage; no network; no Supabase persistence; no full legal text. Evidence and publication gates remain closed.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(exportDoc, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT} (${packets.length} packets from ${candidates.length} candidates)`);
}

main();
