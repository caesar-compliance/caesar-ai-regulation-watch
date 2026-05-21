#!/usr/bin/env node
/**
 * Validate explicit publication release approval packet records.
 * Cross-checks T071–T068 chain, draft, and safety invariants. No network. No publication.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKETS_PATH = path.join(
  ROOT,
  "data/source-adapters/explicit-publication-release-approval-packets.yml",
);
const RELEASE_DECISIONS_PATH = path.join(
  ROOT,
  "data/source-adapters/public-update-release-decisions.yml",
);
const EXPORT_APPROVAL_PATH = path.join(
  ROOT,
  "data/source-adapters/public-export-approval-decisions.yml",
);
const GATES_PATH = path.join(ROOT, "data/source-adapters/public-export-release-gates.yml");
const PREVIEWS_PATH = path.join(ROOT, "data/source-adapters/publication-staging-previews.yml");
const SCHEMA_PATH = path.join(
  ROOT,
  "schemas/explicit-publication-release-approval-packet.schema.json",
);
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const PUBLIC_SNAPSHOT_JSON = path.join(ROOT, "public/data/regulation-watch-snapshot.json");

const FORBIDDEN_ROUTE_PATHS = [
  path.join(ROOT, "src/pages/updates/update-edpb-t056-001.astro"),
  path.join(ROOT, "src/pages/updates/update-edpb-t056-001/index.astro"),
  path.join(ROOT, "public/updates/update-edpb-t056-001/index.html"),
];

const PUBLIC_LEAK_NEEDLES = [
  "T056-001",
  "T057-001",
  "T058-001",
  "T059-001",
  "T060-001",
  "T061-001",
  "T062-001",
  "T063-001",
  "T064-001",
  "T065-001",
  "T066-001",
  "T067-001",
  "T068-001",
  "T069-001",
  "T070-001",
  "T071-001",
  "T072-001",
  "t056-001-draft-edpb-network-dry-run",
  "update-edpb-t056-001",
  "explicit_publication_release_approval_packet",
  "awaiting_control_tower_authorization",
];

const FORBIDDEN_CLAIM_PHRASES = [
  /\bpublished\b/i,
  /exported\s+to\s+public/i,
  /added\s+to\s+public\/data/i,
  /\bclient-ready\b/i,
  /\bevidence-ready\b/i,
  /verified\s+legal\s+change/i,
  /public\s+regulatory\s+update\s+published/i,
  /publication\s+released/i,
  /public\s+route\s+created/i,
  /publication_release_authorized:\s*true/i,
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validatePacketsDoc = loadSchema(SCHEMA_PATH);
const validateDraft = loadSchema(DRAFT_SCHEMA_PATH);

function normalizeDates(value, key) {
  if (value instanceof Date) {
    if (key === "decided_at") return value.toISOString();
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) return value.map((item) => normalizeDates(item, key));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeDates(v, k);
    return out;
  }
  return value;
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function indexById(items, key) {
  const map = new Map();
  for (const item of items ?? []) {
    if (item?.[key]) map.set(item[key], item);
  }
  return map;
}

function gateErrors(prefix, gates) {
  const errors = [];
  for (const key of [
    "verified_on_source",
    "client_use_allowed",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ]) {
    if (gates?.[key] !== false) {
      errors.push(`${prefix}: gates.${key} must be false`);
    }
  }
  return errors;
}

function safetyErrors(prefix, safety, packet) {
  const errors = [];
  const alwaysFalse = [
    "publication_release_authorized",
    "publication_allowed",
    "public_export_allowed",
    "public_data_inclusion_allowed",
    "public_update_route_created",
    "evidence_export_allowed",
    "client_use_allowed",
  ];
  for (const key of alwaysFalse) {
    if (safety?.[key] !== false) {
      errors.push(`${prefix}: safety.${key} must be false`);
    }
  }
  if (safety?.metadata_only !== true) {
    errors.push(`${prefix}: safety.metadata_only must be true`);
  }
  if (safety?.stores_full_text !== false) {
    errors.push(`${prefix}: safety.stores_full_text must be false`);
  }
  if (safety?.control_tower_authorization_required !== true) {
    errors.push(`${prefix}: safety.control_tower_authorization_required must be true`);
  }
  if (safety?.operator_confirmation_required !== true) {
    errors.push(`${prefix}: safety.operator_confirmation_required must be true`);
  }
  if (safety?.requires_separate_client_evidence_approval !== true) {
    errors.push(
      `${prefix}: safety.requires_separate_client_evidence_approval must be true`,
    );
  }

  if (packet.packet_status === "awaiting_control_tower_authorization") {
    if (safety?.explicit_publication_approval_packet_created !== true) {
      errors.push(
        `${prefix}: safety.explicit_publication_approval_packet_created must be true for awaiting packet`,
      );
    }
    errors.push(...gateErrors(`${prefix} (awaiting packet)`, packet.gates));
  } else if (safety?.explicit_publication_approval_packet_created === true) {
    errors.push(
      `${prefix}: safety.explicit_publication_approval_packet_created must be false unless packet_status is awaiting_control_tower_authorization`,
    );
  }

  return errors;
}

function forbiddenClaimErrors(prefix, packet) {
  const errors = [];
  const texts = [
    packet.approval_summary,
    ...(packet.authorization_requirements ?? []),
    ...(packet.blockers_remaining ?? []),
    ...(packet.pre_release_checks ?? []).map((c) => c.note),
  ];
  for (const text of texts) {
    if (!text || typeof text !== "string") continue;
    for (const re of FORBIDDEN_CLAIM_PHRASES) {
      if (re.test(text)) {
        errors.push(`${prefix}: forbidden publication/export claim in text`);
        break;
      }
    }
  }
  if (/^(published|exported|authorized)$/i.test(packet.packet_status)) {
    errors.push(`${prefix}: packet_status must not indicate publication or export`);
  }
  return errors;
}

function packetInvariantErrors(packet, index, ctx) {
  const prefix = `packets[${index}] (${packet?.packet_id ?? "?"})`;
  const errors = [];

  if (packet.packet_scope !== "explicit_publication_release_approval_packet") {
    errors.push(`${prefix}: packet_scope must be explicit_publication_release_approval_packet`);
  }
  if (packet.packet_status !== "awaiting_control_tower_authorization") {
    errors.push(`${prefix}: packet_status must be awaiting_control_tower_authorization`);
  }
  if (packet.operator_confirmation_status !== "pending") {
    errors.push(`${prefix}: operator_confirmation_status must be pending`);
  }
  if (packet.next_required_step !== "control_tower_publication_authorization") {
    errors.push(`${prefix}: next_required_step must be control_tower_publication_authorization`);
  }

  errors.push(...gateErrors(prefix, packet.gates));
  errors.push(...safetyErrors(prefix, packet.safety, packet));
  errors.push(...forbiddenClaimErrors(prefix, packet));

  const releaseDecision = ctx.releaseDecisionById.get(packet.public_update_release_decision_id);
  if (!releaseDecision) {
    errors.push(
      `${prefix}: unknown public_update_release_decision_id ${packet.public_update_release_decision_id}`,
    );
  } else {
    if (releaseDecision.public_export_approval_decision_id !== packet.public_export_approval_decision_id) {
      errors.push(`${prefix}: public_export_approval_decision_id must match release decision`);
    }
    if (releaseDecision.release_gate_id !== packet.release_gate_id) {
      errors.push(`${prefix}: release_gate_id must match release decision`);
    }
    if (releaseDecision.staging_preview_id !== packet.staging_preview_id) {
      errors.push(`${prefix}: staging_preview_id must match release decision`);
    }
    if (releaseDecision.draft_update_id !== packet.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match release decision`);
    }
    if (releaseDecision.draft_update_path !== packet.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match release decision`);
    }
    if (releaseDecision.proposed_public_update_id !== packet.proposed_public_update_id) {
      errors.push(`${prefix}: proposed_public_update_id must match release decision`);
    }
    if (releaseDecision.proposed_route !== packet.proposed_route) {
      errors.push(`${prefix}: proposed_route must match release decision`);
    }
  }

  const exportApproval = ctx.exportApprovalById.get(packet.public_export_approval_decision_id);
  if (!exportApproval) {
    errors.push(
      `${prefix}: unknown public_export_approval_decision_id ${packet.public_export_approval_decision_id}`,
    );
  }

  const gate = ctx.gateById.get(packet.release_gate_id);
  if (!gate) {
    errors.push(`${prefix}: unknown release_gate_id ${packet.release_gate_id}`);
  } else {
    if (gate.staging_preview_id !== packet.staging_preview_id) {
      errors.push(`${prefix}: staging_preview_id must match release gate`);
    }
  }

  const preview = ctx.previewById.get(packet.staging_preview_id);
  if (!preview) {
    errors.push(`${prefix}: unknown staging_preview_id ${packet.staging_preview_id}`);
  }

  const draftPath = path.join(ROOT, packet.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${packet.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${packet.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== packet.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_explicit_publication_approval_packet_id !== packet.packet_id) {
        errors.push(
          `${prefix}: draft latest_explicit_publication_approval_packet_id must be ${packet.packet_id}`,
        );
      }
      if (draft.explicit_publication_approval_packet_status !== packet.packet_status) {
        errors.push(
          `${prefix}: draft explicit_publication_approval_packet_status must match packet_status`,
        );
      }
      if (draft.operator_confirmation_status !== packet.operator_confirmation_status) {
        errors.push(
          `${prefix}: draft operator_confirmation_status must match packet`,
        );
      }
      if (draft.control_tower_authorization_required !== true) {
        errors.push(`${prefix}: draft control_tower_authorization_required must be true`);
      }
      if (draft.operator_confirmation_required !== true) {
        errors.push(`${prefix}: draft operator_confirmation_required must be true`);
      }
      if (draft.next_required_step !== packet.next_required_step) {
        errors.push(`${prefix}: draft next_required_step must match packet`);
      }
      if (draft.publication_release_authorized !== false) {
        errors.push(`${prefix}: draft publication_release_authorized must be false`);
      }
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.public_data_inclusion_allowed !== false) {
        errors.push(`${prefix}: draft public_data_inclusion_allowed must be false`);
      }
      if (draft.public_update_route_created !== false) {
        errors.push(`${prefix}: draft public_update_route_created must be false`);
      }
      if (draft.evidence_export_allowed !== false) {
        errors.push(`${prefix}: draft evidence_export_allowed must be false`);
      }
      if (draft.client_use_allowed !== false) {
        errors.push(`${prefix}: draft client_use_allowed must be false`);
      }
      errors.push(...gateErrors(packet.draft_update_path, draft));
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(PACKETS_PATH));
  if (!validatePacketsDoc(doc)) {
    console.error("Schema validation failed for explicit-publication-release-approval-packets.yml");
    for (const err of validatePacketsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const releaseDoc = readYaml(RELEASE_DECISIONS_PATH);
  const exportApprovalDoc = readYaml(EXPORT_APPROVAL_PATH);
  const gatesDoc = readYaml(GATES_PATH);
  const previewsDoc = readYaml(PREVIEWS_PATH);

  const ctx = {
    releaseDecisionById: indexById(releaseDoc.decisions, "decision_id"),
    exportApprovalById: indexById(exportApprovalDoc.decisions, "decision_id"),
    gateById: indexById(gatesDoc.gates, "gate_id"),
    previewById: indexById(previewsDoc.previews, "preview_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.packets ?? []).length; i++) {
    allErrors.push(...packetInvariantErrors(doc.packets[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of PUBLIC_LEAK_NEEDLES) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal approval identifiers (${needle}) in ${file}`,
        );
      }
    }
  }

  for (const routePath of FORBIDDEN_ROUTE_PATHS) {
    if (fs.existsSync(routePath)) {
      allErrors.push(`Forbidden public update route exists: ${routePath}`);
    }
  }

  if (allErrors.length > 0) {
    console.error("Explicit publication release approval packet validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: explicit publication release approval packets validated");
  console.log(`  packets: ${doc.packets.length}`);
  console.log(`  file: ${PACKETS_PATH}`);
}

main();
