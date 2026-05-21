#!/usr/bin/env node
/**
 * Validate public export approval decision records.
 * Cross-checks T069 gate, T068 preview, T067 decision, draft, and safety invariants. No network.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECISIONS_PATH = path.join(
  ROOT,
  "data/source-adapters/public-export-approval-decisions.yml",
);
const GATES_PATH = path.join(ROOT, "data/source-adapters/public-export-release-gates.yml");
const PREVIEWS_PATH = path.join(ROOT, "data/source-adapters/publication-staging-previews.yml");
const PUB_DECISIONS_PATH = path.join(ROOT, "data/source-adapters/publication-gate-decisions.yml");
const SCHEMA_PATH = path.join(ROOT, "schemas/public-export-approval-decision.schema.json");
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
  "t056-001-draft-edpb-network-dry-run",
  "update-edpb-t056-001",
  "internal_public_export_approval_decision_only",
  "approve_non_public_export_preview",
];

const FORBIDDEN_CLAIM_PHRASES = [
  /\bpublished\b/i,
  /exported\s+to\s+public/i,
  /added\s+to\s+public\/data/i,
  /\bclient-ready\b/i,
  /\bevidence-ready\b/i,
  /verified\s+legal\s+change/i,
  /public\s+regulatory\s+update\s+published/i,
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
  if (safety?.requires_public_update_release_decision !== true) {
    errors.push(
      `${prefix}: safety.requires_public_update_release_decision must be true`,
    );
  }
  if (safety?.requires_separate_client_evidence_approval !== true) {
    errors.push(
      `${prefix}: safety.requires_separate_client_evidence_approval must be true`,
    );
  }

  if (decision.decision === "approve_non_public_export_preview") {
    if (safety?.non_public_export_preview_allowed !== true) {
      errors.push(
        `${prefix}: safety.non_public_export_preview_allowed must be true for approve_non_public_export_preview`,
      );
    }
    errors.push(...gateErrors(`${prefix} (preview approval)`, decision.gates));
  } else if (safety?.non_public_export_preview_allowed === true) {
    errors.push(
      `${prefix}: safety.non_public_export_preview_allowed must be false unless decision is approve_non_public_export_preview`,
    );
  }

  return errors;
}

function forbiddenClaimErrors(prefix, decision) {
  const errors = [];
  const texts = [
    decision.decision_summary,
    ...(decision.preview_limitations ?? []),
    ...(decision.blockers_remaining ?? []),
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
  if (/^(published|exported)$/i.test(decision.decision_status)) {
    errors.push(`${prefix}: decision_status must not indicate publication or export`);
  }
  return errors;
}

function decisionInvariantErrors(decision, index, ctx) {
  const prefix = `decisions[${index}] (${decision?.decision_id ?? "?"})`;
  const errors = [];

  if (decision.decision_scope !== "internal_public_export_approval_decision_only") {
    errors.push(
      `${prefix}: decision_scope must be internal_public_export_approval_decision_only`,
    );
  }
  if (decision.decision_status !== "recorded") {
    errors.push(`${prefix}: decision_status must be recorded`);
  }
  if (decision.decision !== "approve_non_public_export_preview") {
    errors.push(`${prefix}: decision must be approve_non_public_export_preview`);
  }
  if (decision.next_required_step !== "public_update_release_decision") {
    errors.push(`${prefix}: next_required_step must be public_update_release_decision`);
  }

  errors.push(...gateErrors(prefix, decision.gates));
  errors.push(...safetyErrors(prefix, decision.safety, decision));
  errors.push(...forbiddenClaimErrors(prefix, decision));

  const gate = ctx.gateById.get(decision.release_gate_id);
  if (!gate) {
    errors.push(`${prefix}: unknown release_gate_id ${decision.release_gate_id}`);
  } else {
    if (gate.staging_preview_id !== decision.staging_preview_id) {
      errors.push(`${prefix}: staging_preview_id must match release gate`);
    }
    if (gate.publication_gate_decision_id !== decision.publication_gate_decision_id) {
      errors.push(`${prefix}: publication_gate_decision_id must match release gate`);
    }
    if (gate.draft_update_id !== decision.draft_update_id) {
      errors.push(`${prefix}: draft_update_id must match release gate`);
    }
    if (gate.draft_update_path !== decision.draft_update_path) {
      errors.push(`${prefix}: draft_update_path must match release gate`);
    }
  }

  const preview = ctx.previewById.get(decision.staging_preview_id);
  if (!preview) {
    errors.push(`${prefix}: unknown staging_preview_id ${decision.staging_preview_id}`);
  } else if (preview.publication_gate_decision_id !== decision.publication_gate_decision_id) {
    errors.push(`${prefix}: publication_gate_decision_id must match staging preview`);
  }

  const pubDecision = ctx.pubDecisionById.get(decision.publication_gate_decision_id);
  if (!pubDecision) {
    errors.push(
      `${prefix}: unknown publication_gate_decision_id ${decision.publication_gate_decision_id}`,
    );
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
      if (draft.latest_public_export_approval_decision_id !== decision.decision_id) {
        errors.push(
          `${prefix}: draft latest_public_export_approval_decision_id must be ${decision.decision_id}`,
        );
      }
      if (draft.public_export_approval_decision !== decision.decision) {
        errors.push(`${prefix}: draft public_export_approval_decision must match decision`);
      }
      if (draft.public_export_approval_status !== decision.decision_status) {
        errors.push(`${prefix}: draft public_export_approval_status must match decision_status`);
      }
      if (draft.non_public_export_preview_allowed !== true) {
        errors.push(`${prefix}: draft non_public_export_preview_allowed must be true`);
      }
      if (
        draft.non_public_export_preview_artifact_path !==
        decision.non_public_preview_artifact_path
      ) {
        errors.push(`${prefix}: draft preview artifact path must match decision`);
      }
      if (draft.next_required_step !== decision.next_required_step) {
        errors.push(`${prefix}: draft next_required_step must match decision`);
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
    console.error("Schema validation failed for public-export-approval-decisions.yml");
    for (const err of validateDecisionsDoc.errors ?? []) {
      console.error(`  ${err.instancePath}: ${err.message}`);
    }
    process.exit(1);
  }

  const gatesDoc = readYaml(GATES_PATH);
  const previewsDoc = readYaml(PREVIEWS_PATH);
  const pubDecisionsDoc = readYaml(PUB_DECISIONS_PATH);

  const ctx = {
    gateById: indexById(gatesDoc.gates, "gate_id"),
    previewById: indexById(previewsDoc.previews, "preview_id"),
    pubDecisionById: indexById(pubDecisionsDoc.decisions, "decision_id"),
  };

  const allErrors = [];
  for (let i = 0; i < (doc.decisions ?? []).length; i++) {
    allErrors.push(...decisionInvariantErrors(doc.decisions[i], i, ctx));
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
    console.error("Public export approval decision validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${err}`);
    }
    process.exit(1);
  }

  console.log("PASS: public export approval decisions validated");
  console.log(`  decisions: ${doc.decisions.length}`);
  console.log(`  file: ${DECISIONS_PATH}`);
}

main();
