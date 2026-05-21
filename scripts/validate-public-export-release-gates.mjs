#!/usr/bin/env node
/**
 * Validate public export release gate records.
 * Cross-checks T068 preview, T067 decision, T066 packet, draft, and safety invariants. No network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GATES_PATH = path.join(ROOT, "data/source-adapters/public-export-release-gates.yml");
const PREVIEWS_PATH = path.join(ROOT, "data/source-adapters/publication-staging-previews.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-decisions.yml");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-packets.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/public-export-release-gate.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const PUBLIC_SNAPSHOT_JSON = path.join(ROOT, "public/data/regulation-watch-snapshot.json");

const FORBIDDEN_ROUTE_PATHS = [
  path.join(ROOT, "src/pages/updates/update-edpb-t056-001.astro"),
  path.join(ROOT, "src/pages/updates/update-edpb-t056-001/index.astro"),
  path.join(ROOT, "public/updates/update-edpb-t056-001/index.html"),
];

const PUBLIC_EXPORT_LEAK_NEEDLES = [
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
  "t056-001-draft-edpb-network-dry-run",
  "update-edpb-t056-001",
  "internal_public_export_release_gate",
  "ready_for_public_export_approval",
];

const FORBIDDEN_CLAIM_PHRASES = [
  /\bpublished\b/i,
  /exported\s+to\s+public/i,
  /added\s+to\s+public\/data/i,
  /\bclient-ready\b/i,
  /\bevidence-ready\b/i,
  /verified\s+legal\s+change/i,
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateGatesDoc = loadSchema(SCHEMA_PATH);
const validateDraft = loadSchema(DRAFT_SCHEMA_PATH);

function normalizeDates(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeDates);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeDates(v);
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

function safetyErrors(prefix, safety) {
  const errors = [];
  const alwaysFalse = [
    "publication_allowed",
    "public_export_allowed",
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
  if (safety?.requires_public_export_approval_decision !== true) {
    errors.push(`${prefix}: safety.requires_public_export_approval_decision must be true`);
  }
  if (safety?.requires_publication_release_approval !== true) {
    errors.push(`${prefix}: safety.requires_publication_release_approval must be true`);
  }
  if (safety?.requires_client_evidence_approval !== true) {
    errors.push(`${prefix}: safety.requires_client_evidence_approval must be true`);
  }

  if (safety?.public_export_gate_ready === true) {
    for (const key of alwaysFalse) {
      if (safety[key] !== false) {
        errors.push(
          `${prefix}: public_export_gate_ready requires safety.${key} false`,
        );
      }
    }
  } else if (safety?.public_export_gate_ready !== false) {
    errors.push(`${prefix}: safety.public_export_gate_ready must be true for T069 gate`);
  }

  if (safety?.ready_for_public_export_approval === true) {
    if (safety.public_export_allowed !== false || safety.publication_allowed !== false) {
      errors.push(
        `${prefix}: ready_for_public_export_approval requires publication and public export false`,
      );
    }
  }

  return errors;
}

function forbiddenClaimErrors(prefix, gate) {
  const errors = [];
  const texts = [
    gate.gate_summary,
    ...(gate.blockers_remaining ?? []),
    ...(gate.release_gate_items ?? []).map((i) => i.note),
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
  if (/^(published|exported)$/i.test(gate.gate_status)) {
    errors.push(`${prefix}: gate_status must not indicate publication or export`);
  }
  return errors;
}

function gateInvariantErrors(gate, index, ctx) {
  const prefix = `gates[${index}] (${gate?.gate_id ?? "?"})`;
  const errors = [];

  if (gate.gate_scope !== "internal_public_export_release_gate") {
    errors.push(`${prefix}: gate_scope must be internal_public_export_release_gate`);
  }
  if (gate.gate_status !== "pending_public_export_approval") {
    errors.push(`${prefix}: gate_status must be pending_public_export_approval`);
  }
  if (gate.gate_result !== "ready_for_public_export_approval") {
    errors.push(`${prefix}: gate_result must be ready_for_public_export_approval`);
  }
  if (gate.next_required_step !== "public_export_approval_decision") {
    errors.push(`${prefix}: next_required_step must be public_export_approval_decision`);
  }

  errors.push(...gateErrors(prefix, gate.gates));
  errors.push(...safetyErrors(prefix, gate.safety));
  errors.push(...forbiddenClaimErrors(prefix, gate));

  const preview = ctx.previewById.get(gate.staging_preview_id);
  if (!preview) {
    errors.push(`${prefix}: unknown staging_preview_id ${gate.staging_preview_id}`);
  } else {
    if (preview.draft_update_id !== gate.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match staging preview`);
    }
    if (preview.publication_gate_decision_id !== gate.publication_gate_decision_id) {
      errors.push(`${prefix}: publication_gate_decision_id must match staging preview`);
    }
    if (preview.publication_gate_packet_id !== gate.publication_gate_packet_id) {
      errors.push(`${prefix}: publication_gate_packet_id must match staging preview`);
    }
  }

  const decision = ctx.decisionById.get(gate.publication_gate_decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown publication_gate_decision_id ${gate.publication_gate_decision_id}`);
  } else if (decision.decision !== "approve_for_publication_staging") {
    errors.push(`${prefix}: publication gate decision must be approve_for_publication_staging`);
  }

  const packet = ctx.packetById.get(gate.publication_gate_packet_id);
  if (!packet) {
    errors.push(`${prefix}: unknown publication_gate_packet_id ${gate.publication_gate_packet_id}`);
  } else {
    if (packet.draft_update_id !== gate.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match packet`);
    }
    if (packet.draft_update_path !== gate.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match packet`);
    }
  }

  const draftPath = path.join(ROOT, gate.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${gate.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${gate.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== gate.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_public_export_release_gate_id !== gate.gate_id) {
        errors.push(
          `${prefix}: draft latest_public_export_release_gate_id must be ${gate.gate_id}`,
        );
      }
      if (draft.public_export_release_gate_status !== gate.gate_status) {
        errors.push(`${prefix}: draft public_export_release_gate_status must match gate_status`);
      }
      if (draft.public_export_release_gate_result !== gate.gate_result) {
        errors.push(`${prefix}: draft public_export_release_gate_result must match gate_result`);
      }
      if (draft.public_export_gate_ready !== true) {
        errors.push(`${prefix}: draft public_export_gate_ready must be true`);
      }
      if (draft.ready_for_public_export_approval !== true) {
        errors.push(`${prefix}: draft ready_for_public_export_approval must be true`);
      }
      const allowedDraftNextSteps = [gate.next_required_step];
      if (draft.latest_public_export_approval_decision_id) {
        allowedDraftNextSteps.push("public_update_release_decision");
      }
      if (!allowedDraftNextSteps.includes(draft.next_required_step)) {
        errors.push(
          `${prefix}: draft next_required_step must match gate or public_update_release_decision after approval`,
        );
      }
      if (
        draft.proposed_public_update_id !== gate.candidate_metadata.proposed_public_update_id
      ) {
        errors.push(`${prefix}: draft proposed_public_update_id must match candidate_metadata`);
      }
      errors.push(...gateErrors(gate.draft_update_path, draft));
      if (draft.publication_allowed !== false || draft.public_export_allowed !== false) {
        errors.push(`${prefix}: draft must not allow publication or public export`);
      }
      if (draft.evidence_export_allowed !== false) {
        errors.push(`${prefix}: draft evidence_export_allowed must be false`);
      }
      if (draft.client_use_allowed !== false) {
        errors.push(`${prefix}: draft client_use_allowed must be false`);
      }
      if (draft.verified_on_source !== false) {
        errors.push(`${prefix}: draft verified_on_source must remain false`);
      }
    }
  }

  return errors;
}

function main() {
  const doc = normalizeDates(readYaml(GATES_PATH));
  if (!validateGatesDoc(doc)) {
    console.error("Schema validation failed for public-export-release-gates.yml");
    for (const err of validateGatesDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const previewsDoc = readYaml(PREVIEWS_PATH);
  const decisionsDoc = readYaml(DECISIONS_PATH);
  const packetsDoc = readYaml(PACKETS_PATH);

  const ctx = {
    previewById: indexById(previewsDoc.previews, "preview_id"),
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    packetById: indexById(packetsDoc.packets, "packet_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.gates ?? []).length; i++) {
    allErrors.push(...gateInvariantErrors(doc.gates[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of PUBLIC_EXPORT_LEAK_NEEDLES) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal public export release gate identifiers (${needle}) in ${file}`,
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
    console.error("Public export release gate validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: public export release gates validated");
  console.log(`  gates: ${doc.gates.length}`);
  console.log(`  file: ${GATES_PATH}`);
}

main();
