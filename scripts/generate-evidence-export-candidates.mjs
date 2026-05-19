#!/usr/bin/env node
/**
 * Deterministic local generator for evidence export candidates (v0.8.3).
 * No remote fetch. No writes outside this repository.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion, readProjectVersionLabel } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PIPELINE_VERSION = readProjectVersion();
const VERSION_LABEL = readProjectVersionLabel();
const GENERATED_AT = "2026-05-20";
const BATCH_ID = `evidence-export-candidates-${GENERATED_AT}`;
const OUT_DIR = path.join(ROOT, "data/evidence-export-candidates");
const OUT_FILE = path.join(OUT_DIR, `${BATCH_ID}.yml`);

const BATCH_LEGAL_SAFE_NOTE =
  `${VERSION_LABEL} evidence export candidate batch. Candidates are not final evidence exports. ` +
  "Does not write to caesar-ai-evidence. Not legal advice. No compliance guarantee. " +
  "No complete regulatory coverage claim. Human review required before any client use. " +
  "client_use_allowed remains false for every candidate.";

const CANDIDATE_LEGAL_SAFE_NOTE =
  "Evidence export candidate for governance review only — not final evidence, not client-ready. " +
  "Draft regulation_watch control/evidence refs pending caesar-ai-evidence alignment. " +
  "Requires human review on official sources before any client use. Not legal advice.";

function readYamlDir(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => ({
      rel: path.join(dir, f),
      data: yaml.load(fs.readFileSync(path.join(abs, f), "utf8")),
    }));
}

function readYamlFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

function loadMappings(kind) {
  const file =
    kind === "controls"
      ? "mappings/change-to-controls.sample.yml"
      : "mappings/change-to-evidence.sample.yml";
  const data = readYamlFile(file);
  const byChangeId = new Map();
  for (const m of data?.mappings ?? []) {
    byChangeId.set(m.change_id, m);
  }
  return byChangeId;
}

function loadContentReviewsByItemId() {
  const abs = path.join(ROOT, "data/verifications");
  const map = new Map();
  if (!fs.existsSync(abs)) return map;
  const files = fs
    .readdirSync(abs)
    .filter((f) => f.startsWith("content-review") && f.endsWith(".yml"))
    .sort();
  for (const f of files) {
    const batch = yaml.load(fs.readFileSync(path.join(abs, f), "utf8"));
    for (const cr of batch.content_reviews ?? []) {
      const existing = map.get(cr.item_id);
      if (!existing || cr.review_date >= existing.review_date) {
        map.set(cr.item_id, cr);
      }
    }
  }
  return map;
}

function loadExportSamplesByChangeId() {
  const file = readYamlFile("exports/samples/regulation-change-export.sample.yml");
  const map = new Map();
  for (const e of file?.exports ?? []) {
    map.set(e.source_change_id, e);
  }
  return map;
}

function controlsFromMapping(mapping) {
  if (!mapping) return [];
  const refs = mapping.may_affect_controls ?? [];
  return refs.map((c) => ({
    control_ref: c.control_ref,
    rationale: c.rationale?.trim() ?? "Draft mapping rationale.",
    reference_alignment: c.reference_alignment ?? "draft_pending_caesar_ai_evidence",
  }));
}

function evidenceFromMapping(mapping) {
  if (!mapping) return [];
  const refs = mapping.may_affect_evidence ?? [];
  return refs.map((e) => ({
    evidence_ref: e.evidence_ref,
    rationale: e.rationale?.trim() ?? "Draft mapping rationale.",
    reference_alignment: e.reference_alignment ?? "draft_pending_caesar_ai_evidence",
  }));
}

function defaultReviewActions({ simulation, contentNotChecked, hasRelatedRecord }) {
  const actions = [
    {
      action_type: "verify_on_official_source",
      rationale: simulation
        ? "Confirm whether any real change exists on the official source; simulation is not evidence."
        : "Confirm change relevance on the official source before export review.",
    },
  ];
  if (contentNotChecked) {
    actions.push({
      action_type: "complete_content_review",
      rationale: "Content review is not_checked or not_reviewed; complete browser review before export consideration.",
    });
  }
  if (!hasRelatedRecord) {
    actions.push({
      action_type: "update_internal_register",
      rationale: "Link or create a related regulation record before final export mapping.",
    });
  }
  actions.push({
    action_type: "review_evidence",
    rationale: "Suggested evidence review if change is confirmed material (human decision).",
  });
  return actions;
}

function contentReviewBlocks(cr) {
  if (!cr) return true;
  if (cr.review_result === "not_checked") return true;
  if (cr.content_review_status_after_check === "not_reviewed") return true;
  return false;
}

function determineStatus({ simulation, contentBlocked }) {
  if (simulation) return "blocked_simulation_only";
  if (contentBlocked) return "blocked_pending_content_review";
  return "ready_for_human_review";
}

function buildCandidateFromChange(change, ctx) {
  const {
    contentByItem,
    controlMappings,
    evidenceMappings,
    exportByChangeId,
  } = ctx;
  const relatedRecordId = change.related_record_id ?? null;
  const recordContentReview = relatedRecordId ? contentByItem.get(relatedRecordId) : null;
  const contentBlocked = contentReviewBlocks(recordContentReview);
  const ctrlMap = controlMappings.get(change.change_id);
  const evMap = evidenceMappings.get(change.change_id);
  const exportSample = exportByChangeId.get(change.change_id);

  const blocking_reasons = [
    "human_review_required_before_export",
    "verified_on_source_not_confirmed",
    "client_use_not_allowed_v083",
  ];
  if (change.record_origin === "manual_sample") {
    blocking_reasons.push("manual_sample_not_production_data");
  }
  if (contentBlocked) {
    blocking_reasons.push("content_review_not_checked");
  }

  const eligibility_reasons = ["change_record_in_repository"];
  if (ctrlMap || evMap) eligibility_reasons.push("draft_mapping_available");
  if (exportSample) eligibility_reasons.push("export_contract_sample_available");
  if (relatedRecordId) eligibility_reasons.push("related_record_id_present");

  const candidate_status = determineStatus({ simulation: false, contentBlocked });
  if (candidate_status === "ready_for_human_review") {
    blocking_reasons.length = 0;
  }

  const provenance = {
    generated_by: "scripts/generate-evidence-export-candidates.mjs",
    generated_at: GENERATED_AT,
    source_data_paths: [
      `data/changes/${change.change_id}.yml`,
      relatedRecordId ? `data/laws or data/guidance (${relatedRecordId})` : null,
      recordContentReview
        ? `data/verifications/content-review (item ${relatedRecordId})`
        : null,
      "mappings/change-to-controls.sample.yml",
      "mappings/change-to-evidence.sample.yml",
    ].filter(Boolean),
    mapping_ids: [ctrlMap?.mapping_id, evMap?.mapping_id].filter(Boolean),
  };
  if (exportSample) provenance.export_sample_record_id = exportSample.export_record_id;

  const candidate = {
    candidate_id: `candidate-change-${change.change_id}`,
    source_item_type: "change_record",
    source_item_id: change.change_id,
    jurisdiction_id: change.jurisdiction_id,
    source_id: change.source_id,
    export_type: "regulation_change_candidate",
    candidate_status,
    eligibility_reasons,
    blocking_reasons,
    summary_for_review:
      exportSample?.summary_for_review?.trim() ??
      change.change_summary_for_review?.trim() ??
      `Candidate from manual change ${change.change_id}. Human review required.`,
    may_affect_controls:
      exportSample?.may_affect_controls ?? controlsFromMapping(ctrlMap),
    may_affect_evidence:
      exportSample?.may_affect_evidence ?? evidenceFromMapping(evMap),
    suggested_review_actions:
      exportSample?.suggested_review_actions ??
      defaultReviewActions({
        simulation: false,
        contentNotChecked: contentBlocked,
        hasRelatedRecord: Boolean(relatedRecordId),
      }),
    human_review_required: true,
    client_use_allowed: false,
    verified_on_source_required: true,
    created_from: "manual_sample",
    provenance,
    legal_safe_note: `${CANDIDATE_LEGAL_SAFE_NOTE} Manual sample change — not watcher output.`,
  };

  if (relatedRecordId) candidate.related_record_id = relatedRecordId;
  if (recordContentReview?.content_review_id) {
    candidate.content_review_id = recordContentReview.content_review_id;
  }

  return candidate;
}

function buildCandidateFromDetectedChange(dc, ctx) {
  const { contentByItem } = ctx;
  const contentReview = contentByItem.get(dc.detected_change_id);
  const contentBlocked = contentReviewBlocks(contentReview);
  const simulation = dc.simulation === true;
  const relatedRecordId = dc.related_record_id ?? null;

  const blocking_reasons = [
    "human_review_required_before_export",
    "verified_on_source_not_confirmed",
    "client_use_not_allowed_v083",
  ];
  if (simulation) {
    blocking_reasons.push("simulation_only_not_official_update");
  }
  if (contentBlocked) {
    blocking_reasons.push("content_review_not_checked");
  }
  if (!relatedRecordId) {
    blocking_reasons.push("related_record_id_missing");
  }

  const eligibility_reasons = ["detected_change_in_repository"];
  if (contentReview) eligibility_reasons.push("content_review_batch_entry_exists");

  const candidate_status = determineStatus({ simulation, contentBlocked });

  const candidate = {
    candidate_id: `candidate-detected-${dc.detected_change_id}`,
    source_item_type: "detected_change",
    source_item_id: dc.detected_change_id,
    jurisdiction_id: dc.jurisdiction_id,
    source_id: dc.source_id,
    export_type: "regulation_change_candidate",
    candidate_status,
    eligibility_reasons,
    blocking_reasons,
    summary_for_review: dc.change_summary_for_review?.trim() ?? `Detected change ${dc.detected_change_id}.`,
    may_affect_controls: [],
    may_affect_evidence: [],
    suggested_review_actions: defaultReviewActions({
      simulation,
      contentNotChecked: contentBlocked,
      hasRelatedRecord: Boolean(relatedRecordId),
    }),
    human_review_required: true,
    client_use_allowed: false,
    verified_on_source_required: true,
    created_from: simulation ? "simulated_detected_change" : "watcher_detected_change",
    provenance: {
      generated_by: "scripts/generate-evidence-export-candidates.mjs",
      generated_at: GENERATED_AT,
      source_data_paths: [
        `data/detected-changes/${dc.detected_change_id}.yml`,
        contentReview
          ? `data/verifications/content-review (${contentReview.content_review_id})`
          : null,
      ].filter(Boolean),
    },
    legal_safe_note: simulation
      ? `${CANDIDATE_LEGAL_SAFE_NOTE} Simulated watcher diff — not an official source update.`
      : `${CANDIDATE_LEGAL_SAFE_NOTE} Watcher-detected metadata diff — confirm on official source.`,
  };

  if (relatedRecordId) candidate.related_record_id = relatedRecordId;
  if (contentReview?.content_review_id) {
    candidate.content_review_id = contentReview.content_review_id;
  }

  return candidate;
}

const ctx = {
  contentByItem: loadContentReviewsByItemId(),
  controlMappings: loadMappings("controls"),
  evidenceMappings: loadMappings("evidence"),
  exportByChangeId: loadExportSamplesByChangeId(),
};

const changes = readYamlDir("data/changes").map((f) => f.data);
const detected = readYamlDir("data/detected-changes").map((f) => f.data);

const candidates = [
  ...changes
    .sort((a, b) => a.change_id.localeCompare(b.change_id))
    .map((c) => buildCandidateFromChange(c, ctx)),
  ...detected
    .sort((a, b) => a.detected_change_id.localeCompare(b.detected_change_id))
    .map((d) => buildCandidateFromDetectedChange(d, ctx)),
];

const batch = {
  evidence_export_candidate_batch_id: BATCH_ID,
  generated_at: GENERATED_AT,
  pipeline_version: PIPELINE_VERSION,
  legal_safe_note: BATCH_LEGAL_SAFE_NOTE,
  candidates,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
const header = `# Evidence export candidates — ${VERSION_LABEL} (generated)
# Not final evidence. Do not write to caesar-ai-evidence. Regenerate: npm run generate:evidence-candidates

`;
fs.writeFileSync(OUT_FILE, header + yaml.dump(batch, { lineWidth: 100, noRefs: true }), "utf8");

const byStatus = Object.fromEntries(
  [
    "blocked_pending_content_review",
    "blocked_simulation_only",
    "ready_for_human_review",
    "rejected_for_client_use",
  ].map((s) => [s, candidates.filter((c) => c.candidate_status === s).length]),
);

console.log(`Generated ${OUT_FILE}`);
console.log(`  candidates: ${candidates.length}`);
for (const [status, count] of Object.entries(byStatus)) {
  console.log(`  ${status}: ${count}`);
}
console.log(`  client_use_allowed: ${candidates.filter((c) => c.client_use_allowed).length}`);
