#!/usr/bin/env node
/**
 * Validate YAML data files against JSON Schemas in schemas/
 * Exit 1 on any validation failure.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  expandRegulatoryUpdateFile,
  listRegulatoryUpdateFiles,
} from "./lib/load-regulatory-updates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMAS_DIR = path.join(ROOT, "schemas");

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);

function loadSchema(name) {
  const file = path.join(SCHEMAS_DIR, name);
  const schema = JSON.parse(fs.readFileSync(file, "utf8"));
  delete schema.$schema;
  return schema;
}

const schemas = {
  jurisdiction: loadSchema("jurisdiction.schema.json"),
  source: loadSchema("source.schema.json"),
  law: loadSchema("law.schema.json"),
  guidance: loadSchema("guidance.schema.json"),
  change: loadSchema("change.schema.json"),
  taxonomy: loadSchema("taxonomy.schema.json"),
  exportRecord: loadSchema("evidence-export-record.schema.json"),
  controlMapping: loadSchema("change-control-mapping.schema.json"),
  evidenceMapping: loadSchema("change-evidence-mapping.schema.json"),
  timeline: loadSchema("timeline.schema.json"),
  sourceVerification: loadSchema("source-verification.schema.json"),
  urlVerification: loadSchema("url-verification.schema.json"),
  watcherConfig: loadSchema("watcher-config.schema.json"),
  sourceSnapshot: loadSchema("source-snapshot.schema.json"),
  feedSnapshot: loadSchema("feed-snapshot.schema.json"),
  apiSnapshot: loadSchema("api-snapshot.schema.json"),
  watcherRun: loadSchema("watcher-run.schema.json"),
  detectedChange: loadSchema("detected-change.schema.json"),
  monitoringRun: loadSchema("monitoring-run.schema.json"),
  contentReview: loadSchema("content-review.schema.json"),
  evidenceExportCandidate: loadSchema("evidence-export-candidate.schema.json"),
  evidenceExportCandidateReview: loadSchema("evidence-export-candidate-review.schema.json"),
  sourceDiscoveryLead: loadSchema("source-discovery-lead.schema.json"),
  watcherEligibility: loadSchema("watcher-eligibility.schema.json"),
  watcherMonitoringRun: loadSchema("watcher-monitoring-run.schema.json"),
  monitoringSourceConfig: loadSchema("monitoring-source-config.schema.json"),
  liveMetadataPilot: loadSchema("live-metadata-pilot.schema.json"),
  liveMetadataRun: loadSchema("live-metadata-run.schema.json"),
  changeReviewPack: loadSchema("change-review-pack.schema.json"),
  metadataReviewTriage: loadSchema("metadata-review-triage.schema.json"),
  manualSourceVerificationIntake: loadSchema("manual-source-verification-intake.schema.json"),
  autonomousSourceVerification: loadSchema("autonomous-source-verification.schema.json"),
  countryStatus: loadSchema("country-status.schema.json"),
  regulatoryUpdate: loadSchema("regulatory-update.schema.json"),
  topic: loadSchema("topic.schema.json"),
};

const LONG_COPIED_TEXT_PATTERNS = [
  /\bArticle\s+\d+/i,
  /\bshall\s+be\b/i,
  /\bWhereas\b/,
  /(?:\. ){8,}/,
];

function reviewerNoteLooksLikeCopiedLegalText(note) {
  if (!note || typeof note !== "string") return false;
  if (note.length > 500) return true;
  const hits = LONG_COPIED_TEXT_PATTERNS.filter((re) => re.test(note)).length;
  return note.length > 280 && hits >= 2;
}

const LIVE_METADATA_BLOCKED_SOURCES = new Set([
  "eu-ai-act",
  "edpb-ai-topic",
  "australia-industry-ai",
]);

const COMPETITOR_DISCOVERY_HOST_PATTERNS = [
  /techieray\.com/i,
  /verifywise\.ai/i,
  /dlapiper\.com/i,
  /iapp\.org/i,
  /artificialintelligenceact\.eu/i,
  /github\.com\/delschlangen\/ai-legislation-tracker/i,
  /fairlyai/i,
];

function isCompetitorDiscoveryUrl(url) {
  if (!url || typeof url !== "string") return false;
  return COMPETITOR_DISCOVERY_HOST_PATTERNS.some((re) => re.test(url));
}

const COMPLIANCE_GUARANTEE_LANGUAGE =
  /\b(compliant|non-compliant|guarantees?|complete coverage|definitive legal interpretation)\b/i;

function hasComplianceGuaranteeLanguage(text) {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  const disclaimers = [
    "no compliance guarantee",
    "not a compliance guarantee",
    "does not guarantee compliance",
    "no complete coverage claim",
    "not complete coverage",
    "no complete regulatory coverage",
  ];
  if (disclaimers.some((d) => lower.includes(d))) {
    return false;
  }
  return COMPLIANCE_GUARANTEE_LANGUAGE.test(text);
}

function readYaml(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return yaml.load(raw);
}

function listYamlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => path.join(dir, f));
}

function validate(label, data, schema) {
  const validateFn = ajv.compile(schema);
  const ok = validateFn(data);
  if (!ok) {
    return { label, errors: validateFn.errors ?? [] };
  }
  return null;
}

const failures = [];
let passed = 0;

function check(result) {
  if (result) {
    failures.push(result);
  } else {
    passed += 1;
  }
}

// Jurisdictions
for (const file of listYamlFiles(path.join(ROOT, "data/jurisdictions"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.jurisdiction));
}

// Sources
for (const file of listYamlFiles(path.join(ROOT, "data/sources"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.source));
}

// Laws
for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.law));
}

// Guidance
for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.guidance));
}

// Changes
for (const file of listYamlFiles(path.join(ROOT, "data/changes"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.change));
}

// Country status (T048 automation-first seed)
for (const file of listYamlFiles(path.join(ROOT, "data/country-status"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.countryStatus));
}

// Regulatory updates (manual_seed + offline_metadata_adapter batch)
for (const file of listRegulatoryUpdateFiles(ROOT)) {
  const data = readYaml(file);
  const items = expandRegulatoryUpdateFile(data);
  for (const u of items) {
    check(validate(`${file}#${u.update_id}`, u, schemas.regulatoryUpdate));
  }
}

// Tracker topics (T048)
for (const file of listYamlFiles(path.join(ROOT, "data/topics"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.topic));
}

// Taxonomies
for (const file of listYamlFiles(path.join(ROOT, "data/taxonomies"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.taxonomy));
}

// Mappings
for (const file of listYamlFiles(path.join(ROOT, "mappings"))) {
  const data = readYaml(file);
  const items = data?.mappings ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    failures.push({ label: file, errors: [{ message: "expected non-empty mappings array" }] });
    continue;
  }
  const schema = file.includes("evidence")
    ? schemas.evidenceMapping
    : schemas.controlMapping;
  for (const item of items) {
    check(validate(`${file} → ${item.mapping_id ?? "?"}`, item, schema));
  }
}

// Timelines
const timelineDir = path.join(ROOT, "data/timelines");
for (const file of listYamlFiles(timelineDir)) {
  const data = readYaml(file);
  check(validate(file, data, schemas.timeline));
}

// Source verifications
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  const data = readYaml(file);
  if (base.startsWith("url-check")) {
    check(validate(file, data, schemas.urlVerification));
  } else if (base.startsWith("content-review")) {
    check(validate(file, data, schemas.contentReview));
    for (const cr of data.content_reviews ?? []) {
      if (cr.client_use_allowed !== false) {
        failures.push({
          label: `${file} → ${cr.content_review_id} (policy)`,
          errors: [{ message: "content review must have client_use_allowed: false" }],
        });
      }
      if (cr.review_result === "not_checked" && cr.verified_on_source_after_check === true) {
        failures.push({
          label: `${file} → ${cr.content_review_id} (policy)`,
          errors: [
            { message: "verified_on_source_after_check cannot be true when review_result is not_checked" },
          ],
        });
      }
      if (
        cr.review_result !== "matches_source_at_high_level" &&
        cr.verified_on_source_after_check === true
      ) {
        failures.push({
          label: `${file} → ${cr.content_review_id} (policy)`,
          errors: [
            {
              message:
                "verified_on_source_after_check true requires review_result matches_source_at_high_level",
            },
          ],
        });
      }
    }
  } else if (base.startsWith("source-verification") || base.startsWith("source-identity-review")) {
    check(validate(file, data, schemas.sourceVerification));
  } else if (base.startsWith("evidence-export-candidate-review")) {
    check(validate(file, data, schemas.evidenceExportCandidateReview));
  } else if (base.startsWith("autonomous-source-verification-allowlist")) {
    continue;
  } else if (base.startsWith("autonomous-source-verification-")) {
    check(validate(file, data, schemas.autonomousSourceVerification));
    for (const v of data.verifications ?? []) {
      const label = `${file} → ${v.verification_id ?? "?"} (policy)`;
      if (v.client_use_allowed !== false) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have client_use_allowed: false" }],
        });
      }
      if (v.final_evidence_allowed !== false) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have final_evidence_allowed: false" }],
        });
      }
      if (v.verified_on_source !== false) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have verified_on_source: false" }],
        });
      }
      if (v.legal_change_claimed !== false) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have legal_change_claimed: false" }],
        });
      }
      if (v.content_not_copied !== true) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have content_not_copied: true" }],
        });
      }
      if (v.no_full_text_storage !== true) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have no_full_text_storage: true" }],
        });
      }
      if (v.no_bypass_attempted !== true) {
        failures.push({
          label,
          errors: [{ message: "autonomous verification must have no_bypass_attempted: true" }],
        });
      }
      if (
        v.full_instrument_identity_confirmed &&
        !v.source_identity_confirmed
      ) {
        failures.push({
          label,
          errors: [
            {
              message:
                "full_instrument_identity_confirmed requires source_identity_confirmed: true",
            },
          ],
        });
      }
    }
  } else if (base.startsWith("manual-source-verification-intake")) {
    check(validate(file, data, schemas.manualSourceVerificationIntake));
    for (const intake of data.intakes ?? []) {
      const label = `${file} → ${intake.intake_id ?? "?"} (policy)`;
      if (intake.client_use_allowed !== false) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have client_use_allowed: false" }],
        });
      }
      if (intake.final_evidence_allowed !== false) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have final_evidence_allowed: false" }],
        });
      }
      if (intake.verified_on_source_approved !== false) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have verified_on_source_approved: false" }],
        });
      }
      if (intake.verified_on_source_requested === true) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have verified_on_source_requested: false in v1.0.3" }],
        });
      }
      if (intake.content_not_copied !== true) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have content_not_copied: true" }],
        });
      }
      if (intake.no_full_text_storage !== true) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have no_full_text_storage: true" }],
        });
      }
      if (intake.no_legal_advice !== true) {
        failures.push({
          label,
          errors: [{ message: "manual intake must have no_legal_advice: true" }],
        });
      }
      if (reviewerNoteLooksLikeCopiedLegalText(intake.reviewer_note)) {
        failures.push({
          label,
          errors: [
            {
              message:
                "reviewer_note appears to contain long copied legal text; use short workflow notes only",
            },
          ],
        });
      }
      if (
        intake.intake_status === "identity_confirmed_pending_control_tower" &&
        !intake.source_identity_confirmed
      ) {
        failures.push({
          label,
          errors: [
            {
              message:
                "identity_confirmed_pending_control_tower requires source_identity_confirmed: true",
            },
          ],
        });
      }
      if (
        intake.verification_target === "legal_instrument_identity" &&
        intake.full_instrument_identity_confirmed &&
        !intake.source_identity_confirmed
      ) {
        failures.push({
          label,
          errors: [
            {
              message:
                "full_instrument_identity_confirmed requires source_identity_confirmed: true",
            },
          ],
        });
      }
    }
  } else {
    failures.push({
      label: file,
      errors: [
        {
          message:
            "unknown verification file prefix; use source-verification-*, source-identity-review-*, content-review-*, evidence-export-candidate-review-*, autonomous-source-verification-*, manual-source-verification-intake-*, or url-check-*",
        },
      ],
    });
  }
}

// Watcher configuration
const watcherConfigPath = path.join(ROOT, "data/watchers/official-source-watchers.yml");
if (fs.existsSync(watcherConfigPath)) {
  const watcherConfig = readYaml(watcherConfigPath);
  check(validate(watcherConfigPath, watcherConfig, schemas.watcherConfig));
}

// Source snapshots (per-source dirs; exclude latest.yml pointer)
const snapshotsRoot = path.join(ROOT, "data/snapshots");
if (fs.existsSync(snapshotsRoot)) {
  for (const sourceDir of fs.readdirSync(snapshotsRoot)) {
    const dir = path.join(snapshotsRoot, sourceDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of listYamlFiles(dir)) {
      if (path.basename(file) === "latest.yml") continue;
      const data = readYaml(file);
      let schema = schemas.sourceSnapshot;
      if (data.snapshot_kind === "api_metadata" || data.api_url) {
        schema = schemas.apiSnapshot;
      } else if (data.snapshot_kind === "feed_metadata" || data.feed_url) {
        schema = schemas.feedSnapshot;
      }
      check(validate(file, data, schema));
    }
    const latestPath = path.join(dir, "latest.yml");
    if (fs.existsSync(latestPath)) {
      const pointer = readYaml(latestPath);
      if (!pointer?.snapshot_id) {
        failures.push({
          label: latestPath,
          errors: [{ message: "latest.yml must include snapshot_id" }],
        });
      } else {
        const snapPath = path.join(dir, `${pointer.snapshot_id}.yml`);
        if (!fs.existsSync(snapPath)) {
          failures.push({
            label: latestPath,
            errors: [{ message: `snapshot file missing: ${pointer.snapshot_id}.yml` }],
          });
        }
      }
    }
  }
}

// Watcher runs
for (const file of listYamlFiles(path.join(ROOT, "data/watcher-runs"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.watcherRun));
}

// Monitoring runs (cycle reports)
const monitoringDir = path.join(ROOT, "data/monitoring-runs");
if (fs.existsSync(monitoringDir)) {
  for (const file of listYamlFiles(monitoringDir)) {
    if (path.basename(file).startsWith(".")) continue;
    const data = readYaml(file);
    check(validate(file, data, schemas.monitoringRun));
  }
}

// Watcher eligibility + deterministic monitoring runs (v0.9.4)
const watcherMonitoringDir = path.join(ROOT, "data/monitoring");
if (fs.existsSync(watcherMonitoringDir)) {
  for (const file of listYamlFiles(watcherMonitoringDir)) {
    const base = path.basename(file);
    const data = readYaml(file);
    if (base.startsWith("watcher-eligibility-")) {
      check(validate(file, data, schemas.watcherEligibility));
      if (data.no_broad_scraping !== true) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "watcher eligibility batch must have no_broad_scraping: true" }],
        });
      }
      if (data.no_competitor_source !== true) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "watcher eligibility batch must have no_competitor_source: true" }],
        });
      }
      for (const entry of data.entries ?? []) {
        const label = `${file} → ${entry.source_id ?? "?"}`;
        if (entry.client_use_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "watcher eligibility entry must have client_use_allowed: false" }],
          });
        }
        if (entry.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "watcher eligibility entry must have final_evidence_allowed: false" }],
          });
        }
        if (entry.no_broad_scraping !== true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "watcher eligibility entry must have no_broad_scraping: true" }],
          });
        }
        if (entry.no_competitor_source !== true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "watcher eligibility entry must have no_competitor_source: true" }],
          });
        }
        const we = entry.watcher_eligibility ?? {};
        if (we.excluded_not_official === true && we.eligible_basic_url_check === true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "excluded_not_official cannot be watcher eligible for url check" }],
          });
        }
        if (
          entry.source_discovery_status === "rejected_not_official" &&
          (we.eligible_basic_url_check || we.eligible_feed_check || we.eligible_api_check)
        ) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "rejected_not_official lead cannot be watcher eligible" }],
          });
        }
        if (
          (we.blocked_by_waf_or_bot_protection === true || entry.monitoring_method === "manual_only") &&
          entry.allowed_to_fetch === true &&
          entry.monitoring_method !== "none"
        ) {
          failures.push({
            label: `${label} (policy)`,
            errors: [
              {
                message:
                  "blocked/manual_only sources must have allowed_to_fetch false unless monitoring_method is none with documented safe method",
              },
            ],
          });
        }
        if (
          entry.source_discovery_status !== "official_source_confirmed" &&
          entry.source_discovery_status !== "pending_official_review" &&
          we.eligible_basic_url_check === true &&
          entry.allowed_to_fetch === true
        ) {
          failures.push({
            label: `${label} (policy)`,
            errors: [
              {
                message:
                  "only confirmed or pending official sources may be fetch-eligible for url checks",
              },
            ],
          });
        }
      }
    } else if (base.startsWith("source-configs-")) {
      check(validate(file, data, schemas.monitoringSourceConfig));
      if (data.client_use_allowed !== false || data.final_evidence_allowed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [
            {
              message:
                "monitoring source config batch must have client_use_allowed and final_evidence_allowed false",
            },
          ],
        });
      }
      for (const cfg of data.configs ?? []) {
        const label = `${file} → ${cfg.source_id ?? "?"}`;
        if (cfg.client_use_allowed !== false || cfg.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [
              {
                message:
                  "monitoring source config must have client_use_allowed and final_evidence_allowed false",
              },
            ],
          });
        }
        if (cfg.verified_on_source === true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "monitoring source config must have verified_on_source: false" }],
          });
        }
        if (cfg.no_broad_scraping !== true || cfg.no_competitor_source !== true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [
              { message: "monitoring source config must have no_broad_scraping and no_competitor_source true" },
            ],
          });
        }
        if (isCompetitorDiscoveryUrl(cfg.official_url)) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "competitor URL cannot be a monitored official source" }],
          });
        }
        if (
          cfg.adapter_type === "manual_only" &&
          cfg.allowed_to_fetch === true &&
          cfg.fetch_scope !== "not_fetched"
        ) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "manual_only adapter must have allowed_to_fetch false" }],
          });
        }
        if (
          (cfg.source_id === "eu-ai-act" ||
            cfg.source_id === "edpb-ai-topic" ||
            cfg.source_id === "australia-industry-ai") &&
          cfg.allowed_to_fetch === true
        ) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "blocked/manual-only sources must not have allowed_to_fetch true" }],
          });
        }
      }
    } else if (base.startsWith("monitoring-run-")) {
      check(validate(file, data, schemas.watcherMonitoringRun));
      if (data.client_use_allowed !== false || data.final_evidence_allowed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [
            {
              message:
                "watcher monitoring run must have client_use_allowed and final_evidence_allowed false",
            },
          ],
        });
      }
      for (const chk of data.checks ?? []) {
        const label = `${file} → ${chk.source_id ?? "?"}`;
        if (chk.client_use_allowed !== false || chk.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "monitoring check must have client_use_allowed/final_evidence_allowed false" }],
          });
        }
        if (
          chk.check_result === "status_check_ok" &&
          (chk.check_result === "blocked_not_checked" || chk.check_result === "manual_only_not_checked") &&
          chk.http_status == null
        ) {
          /* unreachable */
        }
        if (
          (chk.check_result === "blocked_not_checked" || chk.check_result === "manual_only_not_checked") &&
          chk.change_detected === true
        ) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "blocked/manual_only checks cannot report change_detected true" }],
          });
        }
      }
    } else if (base.startsWith("live-metadata-pilot-allowlist-")) {
      check(validate(file, data, schemas.liveMetadataPilot));
      const sources = data.sources ?? [];
      if (sources.length > 5) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "live metadata pilot allowlist must have at most 5 sources" }],
        });
      }
      if (data.client_use_allowed !== false || data.final_evidence_allowed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "live metadata pilot allowlist batch must have client/final evidence false" }],
        });
      }
      if (data.no_crawl !== true || data.no_full_text_storage !== true) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "live metadata pilot allowlist must have no_crawl and no_full_text_storage true" }],
        });
      }
      for (const s of sources) {
        const label = `${file} → ${s.source_id ?? "?"}`;
        if (LIVE_METADATA_BLOCKED_SOURCES.has(s.source_id)) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "blocked/manual source cannot be in live metadata pilot allowlist" }],
          });
        }
        if (s.client_use_allowed !== false || s.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "live metadata pilot source must have client_use_allowed/final_evidence_allowed false" }],
          });
        }
        if (s.verified_on_source === true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "live metadata pilot source must have verified_on_source: false" }],
          });
        }
        if (s.no_crawl !== true || s.no_full_text_storage !== true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "live metadata pilot source must have no_crawl and no_full_text_storage true" }],
          });
        }
        if (s.max_requests_per_run !== 1) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "live metadata pilot source must have max_requests_per_run: 1" }],
          });
        }
        if (isCompetitorDiscoveryUrl(s.official_url)) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "competitor URL cannot be in live metadata pilot allowlist" }],
          });
        }
      }
    } else if (base.startsWith("live-metadata-run-")) {
      check(validate(file, data, schemas.liveMetadataRun));
      if (data.client_use_allowed !== false || data.final_evidence_allowed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "live metadata run must have client_use_allowed and final_evidence_allowed false" }],
        });
      }
      if ((data.checks ?? []).length > 5) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "live metadata run must have at most 5 checks" }],
        });
      }
      for (const chk of data.checks ?? []) {
        const label = `${file} → ${chk.source_id ?? "?"}`;
        if (chk.client_use_allowed !== false || chk.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "live metadata check must have client_use_allowed/final_evidence_allowed false" }],
          });
        }
        if (chk.verified_on_source === true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "live metadata check must have verified_on_source: false" }],
          });
        }
        if (LIVE_METADATA_BLOCKED_SOURCES.has(chk.source_id)) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "blocked source cannot appear in live metadata run" }],
          });
        }
      }
    } else if (base.startsWith("metadata-review-triage-")) {
      check(validate(file, data, schemas.metadataReviewTriage));
      if (data.legal_change_claimed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "metadata review triage batch must have legal_change_claimed: false" }],
        });
      }
      if (data.client_use_allowed !== false || data.final_evidence_allowed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "metadata review triage batch must have client_use_allowed/final_evidence_allowed false" }],
        });
      }
      for (const item of data.items ?? []) {
        const label = `${file} → ${item.source_id ?? item.triage_id ?? "?"}`;
        if (item.legal_change_claimed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "metadata triage item must have legal_change_claimed: false" }],
          });
        }
        if (item.client_use_allowed !== false || item.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "metadata triage item must have client_use_allowed/final_evidence_allowed false" }],
          });
        }
        if (item.verified_on_source === true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "metadata triage item must have verified_on_source: false" }],
          });
        }
        const needsHuman = [
          "source_update_needs_human_review",
          "check_artifact",
          "unresolved_needs_review",
        ].includes(item.triage_classification);
        const benign = ["benign_metadata_change", "no_change_after_recheck"].includes(
          item.triage_classification,
        );
        if (needsHuman && item.human_review_required !== true) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "non-benign triage classification requires human_review_required: true" }],
          });
        }
        if (benign && item.human_review_required !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "benign triage classification requires human_review_required: false" }],
          });
        }
      }
    } else if (base.startsWith("change-review-pack-")) {
      check(validate(file, data, schemas.changeReviewPack));
      if (data.client_use_allowed !== false || data.final_evidence_allowed !== false) {
        failures.push({
          label: `${file} (policy)`,
          errors: [{ message: "change review pack must have client_use_allowed and final_evidence_allowed false" }],
        });
      }
      for (const r of data.reviews ?? []) {
        const label = `${file} → ${r.source_id ?? "?"}`;
        if (r.client_use_allowed !== false || r.final_evidence_allowed !== false) {
          failures.push({
            label: `${label} (policy)`,
            errors: [{ message: "change review pack entry must have client_use_allowed/final_evidence_allowed false" }],
          });
        }
      }
    }
  }
}

// Detected changes
for (const file of listYamlFiles(path.join(ROOT, "data/detected-changes"))) {
  const data = readYaml(file);
  check(validate(file, data, schemas.detectedChange));
}

// Evidence export candidates (v0.8.3)
const candidateDir = path.join(ROOT, "data/evidence-export-candidates");
for (const file of listYamlFiles(candidateDir)) {
  const data = readYaml(file);
  check(validate(file, data, schemas.evidenceExportCandidate));
  for (const c of data.candidates ?? []) {
    const label = `${file} → ${c.candidate_id ?? "?"}`;
    if (c.client_use_allowed !== false) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "evidence export candidate must have client_use_allowed: false" }],
      });
    }
    if (c.human_review_required !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "evidence export candidate must have human_review_required: true" }],
      });
    }
    if (c.verified_on_source_required !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "evidence export candidate must have verified_on_source_required: true" }],
      });
    }
    if (
      c.created_from === "simulated_detected_change" &&
      c.candidate_status === "ready_for_human_review"
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "simulated detected change candidate cannot be ready_for_human_review (client-ready implication)",
          },
        ],
      });
    }
    if (
      c.candidate_status === "ready_for_human_review" &&
      Array.isArray(c.blocking_reasons) &&
      c.blocking_reasons.length > 0
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "ready_for_human_review cannot be set while blocking_reasons is non-empty",
          },
        ],
      });
    }
    if (!c.legal_safe_note || hasComplianceGuaranteeLanguage(c.legal_safe_note)) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "legal_safe_note missing or contains compliance-guarantee language",
          },
        ],
      });
    }
    if (data.legal_safe_note && hasComplianceGuaranteeLanguage(data.legal_safe_note)) {
      failures.push({
        label: `${file} (policy)`,
        errors: [
          {
            message: "batch legal_safe_note contains compliance-guarantee language",
          },
        ],
      });
    }
  }
}

// Export samples
for (const file of listYamlFiles(path.join(ROOT, "exports/samples"))) {
  const data = readYaml(file);
  const items = data?.exports ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    failures.push({ label: file, errors: [{ message: "expected non-empty exports array" }] });
    continue;
  }
  for (const item of items) {
    check(validate(`${file} → ${item.export_record_id ?? "?"}`, item, schemas.exportRecord));
  }
}

// Referential integrity (timelines)
const jurisdictionIds = new Set(
  listYamlFiles(path.join(ROOT, "data/jurisdictions")).map((f) => readYaml(f).jurisdiction_id),
);
const sourceIds = new Set(
  listYamlFiles(path.join(ROOT, "data/sources")).map((f) => readYaml(f).source_id),
);
const recordIds = new Set([
  ...listYamlFiles(path.join(ROOT, "data/laws")).map((f) => readYaml(f).record_id),
  ...listYamlFiles(path.join(ROOT, "data/guidance")).map((f) => readYaml(f).record_id),
]);

// Source discovery leads (v0.9.1) — after jurisdiction/source sets
const sourceDiscoveryDir = path.join(ROOT, "data/source-discovery");
for (const file of listYamlFiles(sourceDiscoveryDir)) {
  const batch = readYaml(file);
  check(validate(file, batch, schemas.sourceDiscoveryLead));
  if (batch.no_competitor_text_copied !== true) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "source discovery batch must have no_competitor_text_copied: true" }],
    });
  }
  if (batch.no_bulk_extraction !== true) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "source discovery batch must have no_bulk_extraction: true" }],
    });
  }
  for (const lead of batch.leads ?? []) {
    const label = `${file} → ${lead.lead_id ?? "?"}`;
    if (lead.no_competitor_text_copied !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "lead must have no_competitor_text_copied: true" }],
      });
    }
    if (lead.no_bulk_extraction !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "lead must have no_bulk_extraction: true" }],
      });
    }
    if (
      lead.official_source_verified === true &&
      (!lead.verified_title || lead.http_status == null)
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "official_source_verified true requires verified_title and http_status",
          },
        ],
      });
    }
    if (
      lead.verification_status === "official_source_confirmed" &&
      isCompetitorDiscoveryUrl(lead.candidate_official_url)
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "competitor or third-party URL cannot be confirmed official source (candidate_official_url)",
          },
        ],
      });
    }
    if (
      lead.verification_status === "rejected_not_official" &&
      lead.promoted_source_id
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "rejected_not_official lead cannot have promoted_source_id" }],
      });
    }
    if (lead.jurisdiction_id && !jurisdictionIds.has(lead.jurisdiction_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${lead.jurisdiction_id}` }],
      });
    }
    if (lead.promoted_source_id && !sourceIds.has(lead.promoted_source_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [
          {
            message: `promoted_source_id not in registry: ${lead.promoted_source_id}`,
          },
        ],
      });
    }
    if (lead.existing_source_id && !sourceIds.has(lead.existing_source_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [
          {
            message: `existing_source_id not in registry: ${lead.existing_source_id}`,
          },
        ],
      });
    }
  }
}

for (const file of listYamlFiles(timelineDir)) {
  const t = readYaml(file);
  const label = path.basename(file);
  if (!jurisdictionIds.has(t.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${t.jurisdiction_id}` }],
    });
  }
  if (t.related_record_id && !recordIds.has(t.related_record_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown related_record_id: ${t.related_record_id}` }],
    });
  }
  for (const sid of t.source_ids ?? []) {
    if (!sourceIds.has(sid)) {
      failures.push({
        label: `${file} (referential)`,
        errors: [{ message: `unknown source_id in source_ids: ${sid}` }],
      });
    }
  }
  for (const ev of t.events ?? []) {
    if (!sourceIds.has(ev.source_id)) {
      failures.push({
        label: `${file} → ${ev.event_id} (referential)`,
        errors: [{ message: `unknown source_id on event: ${ev.source_id}` }],
      });
    }
  }
}

// Referential integrity (records → jurisdiction, source)
for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
  const r = readYaml(file);
  if (!jurisdictionIds.has(r.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${r.jurisdiction_id}` }],
    });
  }
  if (!sourceIds.has(r.source_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown source_id: ${r.source_id}` }],
    });
  }
}
for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
  const r = readYaml(file);
  if (!jurisdictionIds.has(r.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${r.jurisdiction_id}` }],
    });
  }
  if (!sourceIds.has(r.source_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown source_id: ${r.source_id}` }],
    });
  }
}

// Referential integrity (verifications)
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  const batch = readYaml(file);
  if (base.startsWith("source-verification") || base.startsWith("source-identity-review")) {
    for (const v of batch.verifications ?? []) {
      if (!sourceIds.has(v.source_id)) {
        failures.push({
          label: `${file} → ${v.verification_id} (referential)`,
          errors: [{ message: `unknown source_id: ${v.source_id}` }],
        });
      }
      if (v.item_type === "record" && !recordIds.has(v.item_id)) {
        failures.push({
          label: `${file} → ${v.verification_id} (referential)`,
          errors: [{ message: `unknown item_id (record): ${v.item_id}` }],
        });
      }
      if (v.item_type === "source" && !sourceIds.has(v.item_id)) {
        failures.push({
          label: `${file} → ${v.verification_id} (referential)`,
          errors: [{ message: `unknown item_id (source): ${v.item_id}` }],
        });
      }
    }
  }
  if (base.startsWith("url-check")) {
    for (const c of batch.url_checks ?? []) {
      if (c.source_id && !sourceIds.has(c.source_id)) {
        failures.push({
          label: `${file} → ${c.url_check_id} (referential)`,
          errors: [{ message: `unknown source_id: ${c.source_id}` }],
        });
      }
      if (
        (c.item_type === "law" || c.item_type === "guidance" || c.item_type === "record") &&
        !recordIds.has(c.item_id)
      ) {
        failures.push({
          label: `${file} → ${c.url_check_id} (referential)`,
          errors: [{ message: `unknown item_id (record): ${c.item_id}` }],
        });
      }
      if (c.item_type === "source" && !sourceIds.has(c.item_id)) {
        failures.push({
          label: `${file} → ${c.url_check_id} (referential)`,
          errors: [{ message: `unknown source item_id: ${c.item_id}` }],
        });
      }
    }
  }
}

// Referential integrity (watchers)
if (fs.existsSync(watcherConfigPath)) {
  const watcherConfig = readYaml(watcherConfigPath);
  const watcherIds = new Set();
  for (const w of watcherConfig.watchers ?? []) {
    if (watcherIds.has(w.watcher_id)) {
      failures.push({
        label: watcherConfigPath,
        errors: [{ message: `duplicate watcher_id: ${w.watcher_id}` }],
      });
    }
    watcherIds.add(w.watcher_id);
    if (!sourceIds.has(w.source_id)) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (referential)`,
        errors: [{ message: `unknown source_id: ${w.source_id}` }],
      });
    }
    if (!jurisdictionIds.has(w.jurisdiction_id)) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${w.jurisdiction_id}` }],
      });
    }
    if (w.adapter_id === "official_rss_or_feed" && !w.feed_url) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (policy)`,
        errors: [{ message: "feed watcher requires feed_url" }],
      });
    }
    if (w.adapter_id === "official_api_metadata" && !w.api_url) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (policy)`,
        errors: [{ message: "API watcher requires api_url" }],
      });
    }
    if (w.adapter_id === "official_page_metadata" && !w.official_url) {
      failures.push({
        label: `${watcherConfigPath} → ${w.watcher_id} (policy)`,
        errors: [{ message: "page metadata watcher requires official_url" }],
      });
    }
  }
}

const snapshotIds = new Set();
if (fs.existsSync(snapshotsRoot)) {
  for (const sourceDir of fs.readdirSync(snapshotsRoot)) {
    const dir = path.join(snapshotsRoot, sourceDir);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of listYamlFiles(dir)) {
      if (path.basename(file) === "latest.yml") continue;
      const snap = readYaml(file);
      snapshotIds.add(snap.snapshot_id);
      if (!sourceIds.has(snap.source_id)) {
        failures.push({
          label: `${file} (referential)`,
          errors: [{ message: `unknown source_id: ${snap.source_id}` }],
        });
      }
      if (!jurisdictionIds.has(snap.jurisdiction_id)) {
        failures.push({
          label: `${file} (referential)`,
          errors: [{ message: `unknown jurisdiction_id: ${snap.jurisdiction_id}` }],
        });
      }
    }
  }
}

for (const file of listYamlFiles(path.join(ROOT, "data/detected-changes"))) {
  const dc = readYaml(file);
  if (!sourceIds.has(dc.source_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown source_id: ${dc.source_id}` }],
    });
  }
  if (!jurisdictionIds.has(dc.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${dc.jurisdiction_id}` }],
    });
  }
  if (!snapshotIds.has(dc.previous_snapshot_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown previous_snapshot_id: ${dc.previous_snapshot_id}` }],
    });
  }
  if (!snapshotIds.has(dc.current_snapshot_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown current_snapshot_id: ${dc.current_snapshot_id}` }],
    });
  }
  if (dc.simulation === true && dc.client_use_allowed !== false) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "simulated detected change must have client_use_allowed: false" }],
    });
  }
  if (dc.human_review_required !== true) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "detected change must have human_review_required: true" }],
    });
  }
  if (dc.content_review_status && dc.client_use_allowed !== false) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "detected change with content_review_status must have client_use_allowed: false" }],
    });
  }
}

// Referential integrity (content reviews)
const detectedChangeIds = new Set(
  listYamlFiles(path.join(ROOT, "data/detected-changes")).map((f) => readYaml(f).detected_change_id),
);
const timelineEventIds = new Set();
for (const file of listYamlFiles(timelineDir)) {
  const t = readYaml(file);
  for (const ev of t.events ?? []) {
    timelineEventIds.add(ev.event_id);
  }
}

for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  if (!base.startsWith("content-review")) continue;
  const batch = readYaml(file);
  for (const cr of batch.content_reviews ?? []) {
    if (!jurisdictionIds.has(cr.jurisdiction_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${cr.jurisdiction_id}` }],
      });
    }
    if (!sourceIds.has(cr.source_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown source_id: ${cr.source_id}` }],
      });
    }
    const recordTypes = ["law", "guidance", "policy_framework", "implementation_update"];
    if (recordTypes.includes(cr.item_type) && !recordIds.has(cr.item_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown item_id (record): ${cr.item_id}` }],
      });
    }
    if (cr.item_type === "detected_change" && !detectedChangeIds.has(cr.item_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown item_id (detected_change): ${cr.item_id}` }],
      });
    }
    if (cr.item_type === "timeline_event" && !timelineEventIds.has(cr.item_id)) {
      failures.push({
        label: `${file} → ${cr.content_review_id} (referential)`,
        errors: [{ message: `unknown item_id (timeline_event): ${cr.item_id}` }],
      });
    }
  }
}

const changeIds = new Set(
  listYamlFiles(path.join(ROOT, "data/changes")).map((f) => readYaml(f).change_id),
);

const candidateIds = new Set();
const candidateStatusById = new Map();
for (const file of listYamlFiles(candidateDir)) {
  const batch = readYaml(file);
  for (const c of batch.candidates ?? []) {
    if (c.candidate_id) {
      candidateIds.add(c.candidate_id);
      candidateStatusById.set(c.candidate_id, c.candidate_status);
    }
    if (!jurisdictionIds.has(c.jurisdiction_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${c.jurisdiction_id}` }],
      });
    }
    if (!sourceIds.has(c.source_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown source_id: ${c.source_id}` }],
      });
    }
    if (c.related_record_id && !recordIds.has(c.related_record_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown related_record_id: ${c.related_record_id}` }],
      });
    }
    if (c.source_item_type === "change_record" && !changeIds.has(c.source_item_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown source_item_id (change): ${c.source_item_id}` }],
      });
    }
    if (c.source_item_type === "detected_change" && !detectedChangeIds.has(c.source_item_id)) {
      failures.push({
        label: `${file} → ${c.candidate_id} (referential)`,
        errors: [{ message: `unknown source_item_id (detected_change): ${c.source_item_id}` }],
      });
    }
  }
}

// Referential integrity (autonomous source verification)
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  if (!base.startsWith("autonomous-source-verification-") || base.includes("allowlist")) continue;
  const batch = readYaml(file);
  for (const v of batch.verifications ?? []) {
    const label = `${file} → ${v.verification_id ?? "?"} (referential)`;
    if (!sourceIds.has(v.related_source_id)) {
      failures.push({
        label,
        errors: [{ message: `unknown related_source_id: ${v.related_source_id}` }],
      });
    }
    if (v.related_record_id && !recordIds.has(v.related_record_id)) {
      failures.push({
        label,
        errors: [{ message: `unknown related_record_id: ${v.related_record_id}` }],
      });
    }
    if (v.related_candidate_id && !candidateIds.has(v.related_candidate_id)) {
      failures.push({
        label,
        errors: [{ message: `unknown related_candidate_id: ${v.related_candidate_id}` }],
      });
    }
  }
}

// Referential integrity (manual source verification intake)
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  if (!base.startsWith("manual-source-verification-intake")) continue;
  const batch = readYaml(file);
  for (const intake of batch.intakes ?? []) {
    const label = `${file} → ${intake.intake_id ?? "?"} (referential)`;
    if (!sourceIds.has(intake.related_source_id)) {
      failures.push({
        label,
        errors: [{ message: `unknown related_source_id: ${intake.related_source_id}` }],
      });
    }
    if (intake.related_record_id && !recordIds.has(intake.related_record_id)) {
      failures.push({
        label,
        errors: [{ message: `unknown related_record_id: ${intake.related_record_id}` }],
      });
    }
    if (intake.related_candidate_id && !candidateIds.has(intake.related_candidate_id)) {
      failures.push({
        label,
        errors: [{ message: `unknown related_candidate_id: ${intake.related_candidate_id}` }],
      });
    }
  }
}

// Evidence export candidate reviews (v0.8.7)
for (const file of listYamlFiles(path.join(ROOT, "data/verifications"))) {
  const base = path.basename(file);
  if (!base.startsWith("evidence-export-candidate-review")) continue;
  const batch = readYaml(file);
  if (batch.legal_safe_note && hasComplianceGuaranteeLanguage(batch.legal_safe_note)) {
    failures.push({
      label: `${file} (policy)`,
      errors: [{ message: "batch legal_safe_note contains compliance-guarantee language" }],
    });
  }
  for (const r of batch.candidate_reviews ?? []) {
    const label = `${file} → ${r.candidate_review_id ?? "?"}`;
    if (!candidateIds.has(r.candidate_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [{ message: `unknown candidate_id: ${r.candidate_id}` }],
      });
    }
    if (r.client_use_allowed !== false) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "candidate review must have client_use_allowed: false" }],
      });
    }
    if (r.final_evidence_allowed !== false) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "candidate review must have final_evidence_allowed: false" }],
      });
    }
    if (r.human_review_required !== true) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "candidate review must have human_review_required: true" }],
      });
    }
    const pipelineStatus = candidateStatusById.get(r.candidate_id);
    if (
      pipelineStatus === "blocked_simulation_only" &&
      r.candidate_review_status === "reviewed_for_internal_governance_only"
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "simulated/blocked_simulation_only candidate cannot be reviewed_for_internal_governance_only",
          },
        ],
      });
    }
    if (
      pipelineStatus === "blocked_simulation_only" &&
      r.candidate_review_status !== "review_not_applicable"
    ) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "simulated/blocked_simulation_only candidate review must use review_not_applicable or be omitted",
          },
        ],
      });
    }
    if (!r.legal_safe_note || hasComplianceGuaranteeLanguage(r.legal_safe_note)) {
      failures.push({
        label: `${label} (policy)`,
        errors: [
          {
            message:
              "legal_safe_note missing or contains compliance-guarantee language",
          },
        ],
      });
    }
  }
}

// Policy: records must not claim verified_on_source without evidence
for (const file of listYamlFiles(path.join(ROOT, "data/laws"))) {
  const r = readYaml(file);
  if (r.verified_on_source === true && r.content_review_status !== "reviewed_content_summary") {
    failures.push({
      label: `${file} (policy)`,
      errors: [
        {
          message:
            "verified_on_source true requires content_review_status reviewed_content_summary with documented batch",
        },
      ],
    });
  }
}
for (const file of listYamlFiles(path.join(ROOT, "data/guidance"))) {
  const r = readYaml(file);
  if (r.verified_on_source === true && r.content_review_status !== "reviewed_content_summary") {
    failures.push({
      label: `${file} (policy)`,
      errors: [
        {
          message:
            "verified_on_source true requires content_review_status reviewed_content_summary with documented batch",
        },
      ],
    });
  }
}

// T048 — tracker referential integrity and policy gates
const topicIds = new Set(
  listYamlFiles(path.join(ROOT, "data/topics")).map((f) => readYaml(f).topic_id),
);
const updateIds = new Set();
for (const file of listRegulatoryUpdateFiles(ROOT)) {
  for (const u of expandRegulatoryUpdateFile(readYaml(file))) {
    if (u?.update_id) updateIds.add(u.update_id);
  }
}
const countryStatusJurisdictionIds = new Set();

for (const file of listYamlFiles(path.join(ROOT, "data/country-status"))) {
  const cs = readYaml(file);
  const label = path.basename(file);
  if (countryStatusJurisdictionIds.has(cs.jurisdiction_id)) {
    failures.push({
      label: `${file} (duplicate)`,
      errors: [{ message: `duplicate jurisdiction_id in country-status: ${cs.jurisdiction_id}` }],
    });
  } else {
    countryStatusJurisdictionIds.add(cs.jurisdiction_id);
  }
  if (!jurisdictionIds.has(cs.jurisdiction_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown jurisdiction_id: ${cs.jurisdiction_id}` }],
    });
  }
  for (const sid of cs.source_ids ?? []) {
    if (!sourceIds.has(sid)) {
      failures.push({
        label: `${file} (referential)`,
        errors: [{ message: `unknown source_id: ${sid}` }],
      });
    }
  }
  for (const tag of cs.topic_tags ?? []) {
    if (!topicIds.has(tag)) {
      failures.push({
        label: `${file} (referential)`,
        errors: [{ message: `unknown topic_tag: ${tag}` }],
      });
    }
  }
  if (cs.latest_update_id && !updateIds.has(cs.latest_update_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown latest_update_id: ${cs.latest_update_id}` }],
    });
  }
  for (const gate of [
    "requires_human_review",
    "client_evidence_allowed",
    "final_evidence_allowed",
    "legal_change_claimed",
  ]) {
    if (cs[gate] !== false) {
      failures.push({
        label: `${file} (policy)`,
        errors: [{ message: `country-status ${gate} must be false for T048 seed` }],
      });
    }
  }
}

const seenUpdateIds = new Set();
for (const file of listRegulatoryUpdateFiles(ROOT)) {
  for (const u of expandRegulatoryUpdateFile(readYaml(file))) {
    const label = `${file}#${u.update_id}`;
    if (seenUpdateIds.has(u.update_id)) {
      failures.push({
        label: `${label} (duplicate)`,
        errors: [{ message: `duplicate update_id: ${u.update_id}` }],
      });
      continue;
    }
    seenUpdateIds.add(u.update_id);
    if (!jurisdictionIds.has(u.jurisdiction_id)) {
      failures.push({
        label: `${label} (referential)`,
        errors: [{ message: `unknown jurisdiction_id: ${u.jurisdiction_id}` }],
      });
    }
    for (const sid of u.source_ids ?? []) {
      if (!sourceIds.has(sid)) {
        failures.push({
          label: `${label} (referential)`,
          errors: [{ message: `unknown source_id: ${sid}` }],
        });
      }
    }
    for (const tag of u.topic_tags ?? []) {
      if (!topicIds.has(tag)) {
        failures.push({
          label: `${label} (referential)`,
          errors: [{ message: `unknown topic_tag: ${tag}` }],
        });
      }
    }
    if (!u.source_urls?.length) {
      failures.push({
        label: `${label} (policy)`,
        errors: [{ message: "regulatory update requires at least one source_url" }],
      });
    }
    if (u.automation_method === "offline_metadata_adapter") {
      if (!u.legal_safe_note?.includes("offline metadata adapter")) {
        failures.push({
          label: `${label} (policy)`,
          errors: [{ message: "offline_metadata_adapter update must document adapter in legal_safe_note" }],
        });
      }
    }
    for (const gate of [
      "requires_human_review",
      "client_evidence_allowed",
      "final_evidence_allowed",
      "legal_change_claimed",
    ]) {
      if (u[gate] !== false) {
        failures.push({
          label: `${label} (policy)`,
          errors: [{ message: `regulatory update ${gate} must remain false` }],
        });
      }
    }
  }
}

const seenTopicIds = new Set();
for (const file of listYamlFiles(path.join(ROOT, "data/topics"))) {
  const t = readYaml(file);
  if (seenTopicIds.has(t.topic_id)) {
    failures.push({
      label: `${file} (duplicate)`,
      errors: [{ message: `duplicate topic_id: ${t.topic_id}` }],
    });
  } else {
    seenTopicIds.add(t.topic_id);
  }
  if (t.parent_topic_id && !topicIds.has(t.parent_topic_id)) {
    failures.push({
      label: `${file} (referential)`,
      errors: [{ message: `unknown parent_topic_id: ${t.parent_topic_id}` }],
    });
  }
}

console.log(`\nCaesar AI Regulation Watch — data validation`);
console.log(`Root: ${ROOT}`);
console.log(`Passed: ${passed}`);

if (failures.length > 0) {
  console.log(`Failed: ${failures.length}\n`);
  for (const f of failures) {
    console.log(`✗ ${f.label}`);
    for (const err of f.errors) {
      const loc = err.instancePath || err.schemaPath || "";
      console.log(`  ${loc}: ${err.message}`);
    }
  }
  process.exit(1);
}

console.log(`Failed: 0\nAll YAML files validated successfully.\n`);

const adapterCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-source-adapter-allowlist.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (adapterCheck.status !== 0) {
  process.exit(adapterCheck.status ?? 1);
}

const intakeCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-manual-source-intake-runs.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (intakeCheck.status !== 0) {
  process.exit(intakeCheck.status ?? 1);
}

const networkApprovalCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-network-dry-run-approvals.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (networkApprovalCheck.status !== 0) {
  process.exit(networkApprovalCheck.status ?? 1);
}

const networkExecutionCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-single-network-dry-run-executions.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (networkExecutionCheck.status !== 0) {
  process.exit(networkExecutionCheck.status ?? 1);
}

const promotionCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-manual-review-promotions.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (promotionCheck.status !== 0) {
  process.exit(promotionCheck.status ?? 1);
}

const decisionCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-manual-review-decisions.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (decisionCheck.status !== 0) {
  process.exit(decisionCheck.status ?? 1);
}

const revisionCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-draft-regulatory-update-revisions.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (revisionCheck.status !== 0) {
  process.exit(revisionCheck.status ?? 1);
}

const readinessCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-internal-draft-readiness-gates.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (readinessCheck.status !== 0) {
  process.exit(readinessCheck.status ?? 1);
}

const checklistCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-source-verification-checklists.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (checklistCheck.status !== 0) {
  process.exit(checklistCheck.status ?? 1);
}

const resultCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-source-verification-results.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (resultCheck.status !== 0) {
  process.exit(resultCheck.status ?? 1);
}

const legalPacketCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-final-legal-review-packets.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (legalPacketCheck.status !== 0) {
  process.exit(legalPacketCheck.status ?? 1);
}

const legalDecisionCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-final-legal-review-decisions.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (legalDecisionCheck.status !== 0) {
  process.exit(legalDecisionCheck.status ?? 1);
}

const legalRevisionResponseCheck = spawnSync(
  process.execPath,
  [path.join(ROOT, "scripts/validate-final-legal-review-revision-responses.mjs")],
  { cwd: ROOT, stdio: "inherit" },
);
if (legalRevisionResponseCheck.status !== 0) {
  process.exit(legalRevisionResponseCheck.status ?? 1);
}

process.exit(0);
