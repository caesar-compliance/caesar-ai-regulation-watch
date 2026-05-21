#!/usr/bin/env node
/**
 * Validate publication gate decision records.
 * Cross-checks T066 packet, T065 recheck, draft, and safety invariants. No network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-decisions.yml");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-packets.yml");
const RECHECKS_PATH = path.join(ROOT, "data/source-adapters/final-reviewer-rechecks.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/publication-gate-decision.schema.json");
const DRAFT_SCHEMA_PATH = path.join(ROOT, "schemas/draft-regulatory-update.schema.json");
const PUBLIC_UPDATES_JSON = path.join(ROOT, "public/data/regulatory-updates.json");
const PUBLIC_SNAPSHOT_JSON = path.join(ROOT, "public/data/regulation-watch-snapshot.json");

const FORBIDDEN_CLAIM_PHRASES = [
  /\bpublished\b/i,
  /approved\s+for\s+public\s+use/i,
  /\bclient-ready\b/i,
  /\bevidence-ready\b/i,
  /verified\s+legal\s+change/i,
  /ready\s+for\s+publication(?!_staging)/i,
];

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(filePath) {
  const schema = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete schema.$schema;
  return ajv.compile(schema);
}

const validateDecisionsDoc = loadSchema(SCHEMA_PATH);
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

function safetyErrors(prefix, safety, decision) {
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
  if (safety?.requires_staging_preview_before_publication !== true) {
    errors.push(`${prefix}: safety.requires_staging_preview_before_publication must be true`);
  }
  if (safety?.requires_separate_public_export_approval !== true) {
    errors.push(`${prefix}: safety.requires_separate_public_export_approval must be true`);
  }
  if (safety?.requires_separate_client_evidence_approval !== true) {
    errors.push(`${prefix}: safety.requires_separate_client_evidence_approval must be true`);
  }

  if (decision.decision === "approve_for_publication_staging") {
    if (safety?.publication_staging_allowed !== true) {
      errors.push(
        `${prefix}: safety.publication_staging_allowed must be true for approve_for_publication_staging`,
      );
    }
    if (
      safety?.publication_allowed !== false ||
      safety?.public_export_allowed !== false ||
      safety?.client_use_allowed !== false ||
      safety?.evidence_export_allowed !== false
    ) {
      errors.push(
        `${prefix}: staging approval requires publication/export/client/evidence flags false`,
      );
    }
    errors.push(...gateErrors(`${prefix} (staging)`, decision.gates));
  } else if (safety?.publication_staging_allowed === true) {
    errors.push(
      `${prefix}: safety.publication_staging_allowed must be false unless decision is approve_for_publication_staging`,
    );
  }

  return errors;
}

function forbiddenClaimErrors(prefix, decision) {
  const errors = [];
  const texts = [
    decision.decision_summary,
    ...(decision.staging_limitations ?? []),
    ...(decision.blockers_remaining ?? []),
  ];
  for (const text of texts) {
    if (!text || typeof text !== "string") continue;
    for (const re of FORBIDDEN_CLAIM_PHRASES) {
      if (re.test(text)) {
        errors.push(`${prefix}: forbidden publication/approval claim in text`);
        break;
      }
    }
  }
  return errors;
}

function decisionInvariantErrors(decision, index, ctx) {
  const prefix = `decisions[${index}] (${decision?.decision_id ?? "?"})`;
  const errors = [];

  if (decision.decision_scope !== "internal_publication_gate_decision_only") {
    errors.push(`${prefix}: decision_scope must be internal_publication_gate_decision_only`);
  }
  if (decision.decision_status !== "recorded") {
    errors.push(`${prefix}: decision_status must be recorded`);
  }
  if (decision.next_required_step !== "publication_staging_preview") {
    errors.push(`${prefix}: next_required_step must be publication_staging_preview`);
  }
  if (decision.packet_id !== decision.publication_gate_packet_id) {
    errors.push(`${prefix}: packet_id must match publication_gate_packet_id`);
  }

  errors.push(...gateErrors(prefix, decision.gates));
  errors.push(...safetyErrors(prefix, decision.safety, decision));
  errors.push(...forbiddenClaimErrors(prefix, decision));

  const packet = ctx.packetById.get(decision.publication_gate_packet_id);
  if (!packet) {
    errors.push(`${prefix}: unknown publication_gate_packet_id ${decision.publication_gate_packet_id}`);
  } else {
    if (packet.packet_id !== decision.packet_id) {
      errors.push(`${prefix}: packet_id must match publication gate packet`);
    }
    if (packet.draft_update_id !== decision.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match packet`);
    }
    if (packet.draft_update_path !== decision.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match packet`);
    }
    if (packet.final_reviewer_recheck_id !== decision.final_reviewer_recheck_id) {
      errors.push(`${prefix}: final_reviewer_recheck_id must match packet`);
    }
  }

  const recheck = ctx.recheckById.get(decision.final_reviewer_recheck_id);
  if (!recheck) {
    errors.push(`${prefix}: unknown final_reviewer_recheck_id ${decision.final_reviewer_recheck_id}`);
  }

  const draftPath = path.join(ROOT, decision.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${decision.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${decision.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== decision.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_publication_gate_decision_id !== decision.decision_id) {
        errors.push(
          `${prefix}: draft latest_publication_gate_decision_id must be ${decision.decision_id}`,
        );
      }
      if (draft.publication_gate_decision !== decision.decision) {
        errors.push(`${prefix}: draft publication_gate_decision must match decision`);
      }
      if (draft.publication_gate_decision_status !== decision.decision_status) {
        errors.push(`${prefix}: draft publication_gate_decision_status must match decision_status`);
      }
      const allowedDraftNextAfterDecision = [
        "publication_staging_preview",
        "public_export_release_gate",
        "public_export_approval_decision",
        "public_update_release_decision",
        "explicit_publication_release_approval",
        "control_tower_publication_authorization",
      ];
      if (!allowedDraftNextAfterDecision.includes(draft.next_required_step)) {
        errors.push(
          `${prefix}: draft next_required_step must be publication_staging_preview, public_export_release_gate, public_export_approval_decision, public_update_release_decision, explicit_publication_release_approval, or control_tower_publication_authorization`,
        );
      }
      if (
        draft.next_required_step === "public_export_release_gate" &&
        draft.staging_preview_created !== true
      ) {
        errors.push(
          `${prefix}: draft public_export_release_gate requires staging_preview_created true`,
        );
      }
      if (
        draft.next_required_step === "publication_staging_preview" &&
        draft.staging_preview_created === true &&
        !draft.latest_public_export_release_gate_id
      ) {
        errors.push(
          `${prefix}: draft with staging_preview_created must advance to public_export_release_gate or public_export_approval_decision`,
        );
      }
      if (
        draft.next_required_step === "public_export_approval_decision" &&
        !draft.latest_public_export_release_gate_id
      ) {
        errors.push(
          `${prefix}: draft public_export_approval_decision requires latest_public_export_release_gate_id`,
        );
      }
      if (
        decision.decision === "approve_for_publication_staging" &&
        draft.publication_staging_allowed !== true
      ) {
        errors.push(`${prefix}: draft publication_staging_allowed must be true`);
      }
      errors.push(...gateErrors(decision.draft_update_path, draft));
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
  const doc = normalizeDates(readYaml(DECISIONS_PATH));
  if (!validateDecisionsDoc(doc)) {
    console.error("Schema validation failed for publication-gate-decisions.yml");
    for (const err of validateDecisionsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const packetsDoc = readYaml(PACKETS_PATH);
  const rechecksDoc = readYaml(RECHECKS_PATH);

  const ctx = {
    packetById: indexById(packetsDoc.packets, "packet_id"),
    recheckById: indexById(rechecksDoc.rechecks, "recheck_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.decisions ?? []).length; i++) {
    allErrors.push(...decisionInvariantErrors(doc.decisions[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of [
      "T067-001",
      "internal_publication_gate_decision_only",
      "publication-gate-decisions",
      "approve_for_publication_staging",
      "publication_staging_preview",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal publication gate decision identifiers (${needle}) in ${file}`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Publication gate decision validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: publication gate decisions validated");
  console.log(`  decisions: ${doc.decisions.length}`);
  console.log(`  file: ${DECISIONS_PATH}`);
}

main();
