#!/usr/bin/env node
/**
 * Validate publication staging preview records.
 * Cross-checks T067 decision, T066 packet, draft, and safety invariants. No network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEWS_PATH = path.join(ROOT, "data/source-adapters/publication-staging-previews.yml");
const DECISIONS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-decisions.yml");
const PACKETS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-packets.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/publication-staging-preview.schema.json");
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

const validatePreviewsDoc = loadSchema(SCHEMA_PATH);
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
  if (safety?.noindex_requested !== true) {
    errors.push(`${prefix}: safety.noindex_requested must be true`);
  }
  if (safety?.requires_public_export_approval !== true) {
    errors.push(`${prefix}: safety.requires_public_export_approval must be true`);
  }
  if (safety?.requires_publication_release_approval !== true) {
    errors.push(`${prefix}: safety.requires_publication_release_approval must be true`);
  }
  if (safety?.requires_client_evidence_approval !== true) {
    errors.push(`${prefix}: safety.requires_client_evidence_approval must be true`);
  }

  if (safety?.staging_preview_created === true) {
    for (const key of alwaysFalse) {
      if (safety[key] !== false) {
        errors.push(
          `${prefix}: staging_preview_created requires safety.${key} false`,
        );
      }
    }
  } else if (safety?.staging_preview_created !== false) {
    errors.push(`${prefix}: safety.staging_preview_created must be true for T068 preview`);
  }

  return errors;
}

function forbiddenClaimErrors(prefix, preview) {
  const errors = [];
  const texts = [
    preview.preview_title,
    preview.preview_summary,
    ...(preview.staging_limitations ?? []),
    ...(preview.blockers_remaining ?? []),
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
  if (/^published$/i.test(preview.preview_status)) {
    errors.push(`${prefix}: preview_status must not indicate publication`);
  }
  if (/^approved$/i.test(preview.preview_status)) {
    errors.push(`${prefix}: preview_status must not be approved`);
  }
  return errors;
}

function previewInvariantErrors(preview, index, ctx) {
  const prefix = `previews[${index}] (${preview?.preview_id ?? "?"})`;
  const errors = [];

  if (preview.preview_scope !== "internal_publication_staging_preview") {
    errors.push(`${prefix}: preview_scope must be internal_publication_staging_preview`);
  }
  if (preview.preview_status !== "generated_internal_preview") {
    errors.push(`${prefix}: preview_status must be generated_internal_preview`);
  }
  if (preview.next_required_step !== "public_export_release_gate") {
    errors.push(`${prefix}: next_required_step must be public_export_release_gate`);
  }
  if (preview.preview_route !== "/publication-staging/") {
    errors.push(`${prefix}: preview_route must be /publication-staging/`);
  }
  if ((preview.preview_summary?.length ?? 0) > 1000) {
    errors.push(`${prefix}: preview_summary must not exceed 1000 characters`);
  }

  errors.push(...gateErrors(prefix, preview.gates));
  errors.push(...safetyErrors(prefix, preview.safety));
  errors.push(...forbiddenClaimErrors(prefix, preview));

  const decision = ctx.decisionById.get(preview.publication_gate_decision_id);
  if (!decision) {
    errors.push(`${prefix}: unknown publication_gate_decision_id ${preview.publication_gate_decision_id}`);
  } else if (decision.decision !== "approve_for_publication_staging") {
    errors.push(`${prefix}: publication gate decision must be approve_for_publication_staging`);
  }

  const packet = ctx.packetById.get(preview.publication_gate_packet_id);
  if (!packet) {
    errors.push(`${prefix}: unknown publication_gate_packet_id ${preview.publication_gate_packet_id}`);
  } else {
    if (packet.draft_update_id !== preview.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match packet`);
    }
    if (packet.draft_update_path !== preview.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match packet`);
    }
  }

  const draftPath = path.join(ROOT, preview.draft_update_path);
  if (!fs.existsSync(draftPath)) {
    errors.push(`${prefix}: draft_update_path missing: ${preview.draft_update_path}`);
  } else {
    const draft = normalizeDates(readYaml(draftPath));
    if (!validateDraft(draft)) {
      errors.push(`${preview.draft_update_path}: draft schema validation failed`);
    } else {
      if (draft.update_id !== preview.draft_update_id) {
        errors.push(`${prefix}: draft_update_id must match draft update_id`);
      }
      if (draft.latest_publication_staging_preview_id !== preview.preview_id) {
        errors.push(
          `${prefix}: draft latest_publication_staging_preview_id must be ${preview.preview_id}`,
        );
      }
      if (draft.publication_staging_preview_status !== preview.preview_status) {
        errors.push(`${prefix}: draft publication_staging_preview_status must match preview_status`);
      }
      if (draft.publication_staging_preview_route !== preview.preview_route) {
        errors.push(`${prefix}: draft publication_staging_preview_route must match preview_route`);
      }
      if (draft.staging_preview_created !== true) {
        errors.push(`${prefix}: draft staging_preview_created must be true`);
      }
      if (draft.noindex_requested !== true) {
        errors.push(`${prefix}: draft noindex_requested must be true`);
      }
      if (draft.next_required_step !== "public_export_release_gate") {
        errors.push(`${prefix}: draft next_required_step must be public_export_release_gate`);
      }
      errors.push(...gateErrors(preview.draft_update_path, draft));
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
  const doc = normalizeDates(readYaml(PREVIEWS_PATH));
  if (!validatePreviewsDoc(doc)) {
    console.error("Schema validation failed for publication-staging-previews.yml");
    for (const err of validatePreviewsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const decisionsDoc = readYaml(DECISIONS_PATH);
  const packetsDoc = readYaml(PACKETS_PATH);

  const ctx = {
    decisionById: indexById(decisionsDoc.decisions, "decision_id"),
    packetById: indexById(packetsDoc.packets, "packet_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.previews ?? []).length; i++) {
    allErrors.push(...previewInvariantErrors(doc.previews[i], i, ctx));
  }

  for (const file of [PUBLIC_UPDATES_JSON, PUBLIC_SNAPSHOT_JSON]) {
    if (!fs.existsSync(file)) continue;
    const exported = fs.readFileSync(file, "utf8");
    for (const needle of [
      "T068-001",
      "internal_publication_staging_preview",
      "publication-staging-previews",
      "generated_internal_preview",
      "public_export_release_gate",
    ]) {
      if (exported.includes(needle)) {
        allErrors.push(
          `public export must not contain internal publication staging preview identifiers (${needle}) in ${file}`,
        );
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Publication staging preview validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: publication staging previews validated");
  console.log(`  previews: ${doc.previews.length}`);
  console.log(`  file: ${PREVIEWS_PATH}`);
}

main();
