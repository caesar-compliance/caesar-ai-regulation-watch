#!/usr/bin/env node
/**
 * Build public source-pilot-operator-handoff.json and markdown report (no network).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const STATUS_PATH = path.join(ROOT, "public/data/source-pilot-status.json");
const CANDIDATES_PATH = path.join(ROOT, "public/data/source-pilot-review-candidates.json");
const PACKETS_PATH = path.join(ROOT, "public/data/source-pilot-decision-packets.json");
const HEALTH_PATH = path.join(ROOT, "public/data/runtime-db-health.json");
const REGISTRY_PATH = path.join(ROOT, "data/runtime/source-pilot-registry.yml");
const RUNTIME_PATH = path.join(ROOT, "data/runtime/automation-runtime.yml");
const MANIFEST_PATH = path.join(ROOT, "public/data/automation-runtime-manifest.json");
const OUTPUT_JSON = path.join(ROOT, "public/data/source-pilot-operator-handoff.json");
const OUTPUT_MD = path.join(ROOT, "public/reports/source-pilot-operator-handoff.md");

const GENERATED_AT = "2026-05-21T14:00:00.000Z";
const HANDOFF_ID = "source-pilot-operator-handoff-2026-05-21-v075e";

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

const CANNOT_CLAIM_YET = [
  {
    id: "not_source_verified",
    label: "Source is not verified on official source",
    detail: "verified_on_source remains false; fixture metadata only.",
  },
  {
    id: "not_legal_change_claimed",
    label: "No legal or regulatory change conclusion",
    detail: "legal_change_claimed remains false; metadata diff is not legal verification.",
  },
  {
    id: "not_client_usable",
    label: "Not approved for client use",
    detail: "client_use_allowed remains false.",
  },
  {
    id: "not_evidence",
    label: "Not approved for client or final evidence",
    detail: "client_evidence_allowed and final_evidence_allowed remain false.",
  },
  {
    id: "not_publication_approved",
    label: "Not publication or public export approved",
    detail: "publication_allowed and public_export_allowed remain false.",
  },
  {
    id: "no_live_monitoring",
    label: "No live ingestion or scheduled monitoring",
    detail: "live_ingestion_enabled and scheduled_monitoring_enabled remain false.",
  },
  {
    id: "no_network_execution",
    label: "No network execution against official sources",
    detail: "network_execution_enabled remains false; no live RSS fetch.",
  },
  {
    id: "no_supabase_persistence",
    label: "No Supabase/runtime DB persistence",
    detail: "Runtime DB health is not_configured; packets blocked until credentials and schema.",
  },
];

const OPERATOR_CHECKLIST = [
  {
    id: "review_handoff_summary",
    label: "Review operator handoff summary counts and blocked reasons",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "confirm_fixture_chain",
    label: "Confirm fixture-only pilot chain (status → candidates → packets)",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "inspect_candidate_metadata",
    label: "Inspect candidate metadata hashes and fields changed (not legal text)",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "triage_decision_packet",
    label: "Open decision packet checklist and placeholder triage (offline only)",
    required: true,
    completed_placeholder: false,
  },
  {
    id: "no_gate_approval",
    label: "Do not approve evidence, publication, or verify-on-source in this export",
    required: true,
    completed_placeholder: false,
  },
];

const REQUIRED_NEXT_ACTIONS = [
  {
    id: "supabase_credentials",
    label: "Add Supabase credentials via .env.runtime.local (not committed)",
    blocked_by: "supabase_not_configured",
  },
  {
    id: "apply_schema",
    label: "Apply ops/supabase runtime schema when credentials exist (manual, flag-gated)",
    blocked_by: "supabase_not_configured",
  },
  {
    id: "connect_pilot_db",
    label: "Connect pilot snapshots, review candidates, and packets to runtime DB (T075B)",
    blocked_by: "supabase_not_configured",
  },
  {
    id: "controlled_network_later",
    label: "Only after Control Tower approval: single allowlisted network check (T076+)",
    blocked_by: "network_execution_disabled",
  },
];

/**
 * @param {string} dbStatus
 */
function aggregateBlockedReasons(dbStatus, packets) {
  const set = new Set();
  if (dbStatus === "not_configured") set.add("supabase_not_configured");
  set.add("network_execution_disabled");
  set.add("source_not_verified_on_source");
  set.add("evidence_gates_closed");
  set.add("publication_gates_closed");
  set.add("no_legal_conclusion_allowed");
  set.add("fixture_only_no_live_ingestion");
  for (const p of packets) {
    for (const r of p.blocked_until ?? []) set.add(r);
  }
  return [...set].sort();
}

/**
 * @param {Record<string, unknown>[]} registrySources
 * @param {Record<string, unknown>[]} statusSources
 */
function buildSourcesSummary(registrySources, statusSources) {
  const statusById = new Map(statusSources.map((s) => [s.source_id, s]));
  return registrySources.map((entry) => {
    const st = statusById.get(entry.source_id);
    return {
      source_id: entry.source_id,
      source_name: entry.source_name,
      jurisdiction: entry.jurisdiction,
      source_type: entry.source_type,
      monitoring_status: entry.monitoring_status,
      official_url: entry.official_url,
      fixture_snapshot_version: st?.fixture_snapshot_version ?? null,
      item_count: st?.item_count ?? null,
      metadata_hash: st?.metadata_hash ?? null,
      allowed_for_network_check: false,
      has_fixture_candidate: false,
    };
  });
}

function main() {
  for (const p of [STATUS_PATH, CANDIDATES_PATH, PACKETS_PATH, REGISTRY_PATH]) {
    if (!fs.existsSync(p)) {
      console.error(`Missing ${p} — run upstream source-pilot build scripts`);
      process.exit(1);
    }
  }

  const statusDoc = JSON.parse(fs.readFileSync(STATUS_PATH, "utf8"));
  const candidatesDoc = JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf8"));
  const packetsDoc = JSON.parse(fs.readFileSync(PACKETS_PATH, "utf8"));
  const registry = yaml.load(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const runtime = fs.existsSync(RUNTIME_PATH)
    ? yaml.load(fs.readFileSync(RUNTIME_PATH, "utf8"))
    : { status: "source_pilot_decision_packets_ready" };
  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : null;

  const dbHealth = fs.existsSync(HEALTH_PATH)
    ? JSON.parse(fs.readFileSync(HEALTH_PATH, "utf8"))
    : { status: "not_configured" };
  const dbStatus = dbHealth.status ?? "not_configured";

  const registrySources = registry.sources ?? [];
  const statusSources = statusDoc.sources ?? [];
  const candidates = candidatesDoc.candidates ?? [];
  const packets = packetsDoc.packets ?? [];

  const sourcesSummary = buildSourcesSummary(registrySources, statusSources);
  const candidateSourceIds = new Set(candidates.map((c) => c.source_id));
  for (const s of sourcesSummary) {
    if (candidateSourceIds.has(s.source_id)) s.has_fixture_candidate = true;
  }

  const candidatesSummary = candidates.map((c) => ({
    candidate_id: c.candidate_id,
    source_id: c.source_id,
    source_name: c.source_name,
    change_type: c.change_type,
    candidate_status: c.candidate_status,
    reviewer_status: c.reviewer_status,
    detected_at: c.detected_at,
    title: c.title ?? null,
    official_url: c.official_url,
    metadata_fields_changed: c.metadata_fields_changed ?? [],
    packet_id: `sp-packet-${c.candidate_id}`,
  }));

  const decisionPacketsSummary = packets.map((p) => ({
    packet_id: p.packet_id,
    candidate_id: p.candidate_id,
    source_id: p.source_id,
    packet_status: p.packet_status,
    reviewer_status: p.reviewer_status,
    change_type: p.change_type,
    blocked_until: p.blocked_until ?? [],
    checklist_item_count: (p.operator_checklist ?? []).length,
  }));

  const blockedReasons = aggregateBlockedReasons(dbStatus, packets);

  const handoff = {
    handoff_id: HANDOFF_ID,
    generated_at: GENERATED_AT,
    status: "operator_handoff_ready",
    mode: "fixture_only",
    runtime_status: runtime.status ?? "source_pilot_operator_handoff_ready",
    runtime_flags: { ...RUNTIME_FLAGS },
    gates: { ...CLOSED_GATES },
    db_health_status: dbStatus,
    source_count: statusDoc.source_count ?? registrySources.length,
    candidate_count: candidates.length,
    packet_count: packets.length,
    sources_summary: sourcesSummary,
    candidates_summary: candidatesSummary,
    decision_packets_summary: decisionPacketsSummary,
    blocked_reasons: blockedReasons,
    required_next_actions: REQUIRED_NEXT_ACTIONS.map((a) => ({ ...a })),
    operator_checklist: OPERATOR_CHECKLIST.map((i) => ({ ...i })),
    safety_summary: {
      metadata_only: true,
      fixture_only: true,
      no_full_legal_text: true,
      no_raw_page_body: true,
      runtime_flags_disabled: true,
      all_gates_closed: true,
      db_persistence: dbStatus === "not_configured" ? "not_available" : "unknown",
      public_note:
        "T075E offline operator handoff. Summarizes fixture-only source pilot chain for internal review. Not legal verification; not publication approval.",
    },
    cannot_claim_yet: CANNOT_CLAIM_YET.map((c) => ({ ...c })),
    links: {
      source_pilot_page: "/source-pilot/",
      source_pilot_review_page: "/source-pilot/review/",
      source_pilot_decision_packets_page: "/source-pilot/decision-packets/",
      operator_handoff_page: "/source-pilot/operator-handoff/",
      automation_page: "/automation/",
      runtime_health_page: "/runtime-health/",
      handoff_json: "/data/source-pilot-operator-handoff.json",
      status_json: "/data/source-pilot-status.json",
      review_candidates_json: "/data/source-pilot-review-candidates.json",
      decision_packets_json: "/data/source-pilot-decision-packets.json",
      runtime_db_health_json: "/data/runtime-db-health.json",
      automation_runtime_manifest_json: "/data/automation-runtime-manifest.json",
      handoff_markdown_report: "/reports/source-pilot-operator-handoff.md",
      manifest_version: manifest?.version ?? null,
    },
    public_note:
      "T075E offline operator handoff export. Metadata-only summary of fixture source pilot (2 sources, review candidates, decision packets). Supabase not configured; network and ingestion disabled; all evidence and publication gates closed.",
  };

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(handoff, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUTPUT_JSON}`);

  const md = buildMarkdownReport(handoff);
  fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true });
  fs.writeFileSync(OUTPUT_MD, md, "utf8");
  console.log(`Wrote ${OUTPUT_MD}`);
}

/**
 * @param {Record<string, unknown>} handoff
 */
function buildMarkdownReport(handoff) {
  const lines = [
    "# Source pilot operator handoff",
    "",
    `**Handoff ID:** \`${handoff.handoff_id}\``,
    `**Generated at:** ${handoff.generated_at}`,
    `**Mode:** ${handoff.mode} (fixture only — not live monitoring)`,
    "",
    "## Summary",
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| runtime_status | ${handoff.runtime_status} |`,
    `| db_health_status | ${handoff.db_health_status} |`,
    `| source_count | ${handoff.source_count} |`,
    `| candidate_count | ${handoff.candidate_count} |`,
    `| packet_count | ${handoff.packet_count} |`,
    "",
    "## Runtime safety",
    "",
    "- `live_ingestion_enabled`: false",
    "- `scheduled_monitoring_enabled`: false",
    "- `network_execution_enabled`: false",
    "- All evidence/publication gates: false",
    "",
    "## Blocked reasons",
    "",
    ...(handoff.blocked_reasons ?? []).map((r) => `- \`${r}\``),
    "",
    "## Sources (metadata summary)",
    "",
  ];

  for (const s of handoff.sources_summary ?? []) {
    lines.push(
      `### ${s.source_name}`,
      "",
      `- **source_id:** \`${s.source_id}\``,
      `- **jurisdiction:** ${s.jurisdiction}`,
      `- **monitoring:** ${s.monitoring_status}`,
      `- **fixture:** ${s.fixture_snapshot_version ?? "—"}`,
      `- **items:** ${s.item_count ?? "—"}`,
      `- **has_fixture_candidate:** ${s.has_fixture_candidate}`,
      `- **official_url:** ${s.official_url}`,
      "",
    );
  }

  lines.push("## Review candidates", "");
  if ((handoff.candidates_summary ?? []).length === 0) {
    lines.push("_No candidates._", "");
  } else {
    for (const c of handoff.candidates_summary) {
      lines.push(
        `- **${c.candidate_id}** — ${c.change_type} / ${c.reviewer_status} — ${c.title ?? "(no title)"}`,
      );
    }
    lines.push("");
  }

  lines.push("## Decision packets", "");
  for (const p of handoff.decision_packets_summary ?? []) {
    lines.push(
      `- **${p.packet_id}** — status \`${p.packet_status}\` — blocked: ${(p.blocked_until ?? []).join(", ")}`,
    );
  }
  lines.push("");

  lines.push("## Cannot claim yet", "");
  for (const c of handoff.cannot_claim_yet ?? []) {
    lines.push(`- **${c.label}** — ${c.detail}`);
  }
  lines.push("");

  lines.push("## Required next setup", "");
  for (const a of handoff.required_next_actions ?? []) {
    lines.push(`- ${a.label} _(blocked_by: ${a.blocked_by})_`);
  }
  lines.push("");

  lines.push("## Operator checklist", "");
  for (const item of handoff.operator_checklist ?? []) {
    lines.push(`- [ ] ${item.label}${item.required ? " *(required)*" : ""}`);
  }
  lines.push("");

  lines.push("## Links", "");
  const links = handoff.links ?? {};
  for (const [key, href] of Object.entries(links)) {
    if (href && typeof href === "string" && href.startsWith("/")) {
      lines.push(`- ${key}: [${href}](${href})`);
    }
  }
  lines.push("");
  lines.push("---", "");
  lines.push(`_${handoff.public_note}_`, "");
  return `${lines.join("\n")}`;
}

main();
