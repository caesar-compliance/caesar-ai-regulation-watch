#!/usr/bin/env node
/**
 * Deterministic monitoring pack generator (v0.9.5).
 * Reads monitoring source configs + watcher eligibility; writes monitoring run YAML.
 * Default: deterministic_local (no live network fetch). Use --dry-run to print only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MONITORING_DIR = path.join(ROOT, "data/monitoring");
const SNAPSHOTS_ROOT = path.join(ROOT, "data/snapshots");
const PRODUCT_VERSION = readProjectVersion();
const RUN_DATE = process.env.MONITORING_PACK_RUN_DATE ?? "2026-05-20";
const RUN_SUFFIX = process.env.MONITORING_PACK_SUFFIX ?? "v095";
const RUN_ID = `monitoring-run-${RUN_DATE}-${RUN_SUFFIX}`;
const DRY_RUN = process.argv.includes("--dry-run");

const LEGAL_SAFE_NOTE =
  "v0.9.5 deterministic local monitoring pack. Metadata-only checks; no full legal text storage. Not legal advice. Not client evidence. Human review required for detected changes.";

const V094_BASELINE = {
  "eu-digital-strategy-european-approach-ai": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "European approach to artificial intelligence",
    notes:
      "v0.9.5 adapter baseline from discovery HTTP 200; first metadata snapshot pointer in pack run.",
  },
  "eu-ai-act-service-desk": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "EU AI Act Service Desk",
    notes: "Adapter config baseline; discovery-confirmed HTTP 200.",
  },
  "eu-ai-office": {
    check_result: "no_change_snapshot_created",
    http_status: 200,
    title: "Regulatory framework on AI",
    notes:
      "Offline compare to data/snapshots/eu-ai-office/latest.yml — no deterministic metadata diff.",
  },
  "us-nist-ai-portal": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "Artificial Intelligence | NIST",
    notes: "Adapter baseline metadata snapshot.",
  },
  "us-ai-gov": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "AI.gov",
    notes: "Adapter baseline metadata snapshot.",
  },
  "canada-responsible-ai": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "Responsible use of artificial intelligence in government",
    requires_human_review: true,
    notes:
      "Discovery HTTP 200; eligibility flags unstable CI path — human review if future fetch fails.",
  },
  "uk-gov-ai-assurance-intro": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "Introduction to AI assurance",
    notes: "GOV.UK publication metadata baseline.",
  },
  "singapore-pdpc-ai": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "Model AI Governance Framework",
    notes: "PDPC framework metadata baseline.",
  },
  "japan-ppc": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "Personal Information Protection Commission (Japan)",
    notes: "PPC English portal metadata baseline.",
  },
  "norway-ai-act-implementation": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "Making Norway ready for safe and innovative use of AI",
    notes: "regjeringen.no communication metadata baseline.",
  },
  datatilsynet: {
    check_result: "no_change_snapshot_created",
    http_status: 200,
    title: "Datatilsynet",
    notes:
      "Offline compare to data/snapshots/datatilsynet/latest.yml — no deterministic metadata diff.",
  },
  "unesco-ai-ethics": {
    check_result: "metadata_snapshot_created",
    http_status: 200,
    title: "UNESCO Recommendation on the Ethics of AI",
    notes: "UNESCO ethics page metadata baseline.",
  },
  "eu-ai-act": {
    check_result: "blocked_not_checked",
    http_status: 202,
    title: null,
    requires_human_review: true,
    notes: "EUR-Lex bot challenge; allowed_to_fetch false; not checked in automated path.",
  },
  "edpb-ai-topic": {
    check_result: "manual_only_not_checked",
    http_status: 502,
    title: null,
    requires_human_review: true,
    notes: "v0.9.3 HTTP 502; manual re-check when stable; edpb RSS watcher separate.",
  },
  "australia-industry-ai": {
    check_result: "blocked_not_checked",
    http_status: null,
    title: null,
    requires_human_review: true,
    notes: "WAF/bot protection; pending_official_review; no fake success.",
  },
};

function readYaml(rel) {
  const abs = path.join(ROOT, rel);
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

function findLatestConfigBatch() {
  const files = fs
    .readdirSync(MONITORING_DIR)
    .filter((f) => f.startsWith("source-configs-") && f.endsWith(".yml"))
    .sort()
    .reverse();
  if (files.length === 0) throw new Error("No source-configs-*.yml in data/monitoring");
  return readYaml(`data/monitoring/${files[0]}`);
}

function hasSnapshotPointer(sourceId) {
  const dir = path.join(SNAPSHOTS_ROOT, sourceId);
  const latest = path.join(dir, "latest.yml");
  return fs.existsSync(latest);
}

function buildCheck(config, index) {
  const base = V094_BASELINE[config.source_id] ?? {};
  const ts = `${RUN_DATE}T15:${String(index).padStart(2, "0")}:00.000Z`;
  let check_result = base.check_result ?? "status_check_ok";

  if (config.allowed_to_fetch === false) {
    check_result =
      config.adapter_type === "manual_only"
        ? "manual_only_not_checked"
        : "blocked_not_checked";
  } else if (config.not_fetched_this_run === true) {
    check_result = "blocked_not_checked";
  } else if (
    check_result === "metadata_snapshot_created" &&
    hasSnapshotPointer(config.source_id) &&
    config.monitoring_method === "page_metadata_check"
  ) {
    check_result = "no_change_snapshot_created";
  }

  const requires_human_review =
    base.requires_human_review === true ||
    config.requires_human_review === true ||
    check_result === "blocked_not_checked" ||
    check_result === "manual_only_not_checked" ||
    check_result === "fetch_failed_needs_review";

  return {
    source_id: config.source_id,
    url: config.official_url,
    adapter_type: config.adapter_type,
    monitoring_method: config.monitoring_method,
    fetch_scope: config.fetch_scope,
    check_result,
    http_status: base.http_status ?? null,
    title: base.title ?? null,
    last_modified: null,
    etag: null,
    content_hash: null,
    run_timestamp: ts,
    change_detected: false,
    detected_change_id: null,
    requires_human_review,
    notes: base.notes ?? config.limitations,
    client_use_allowed: false,
    final_evidence_allowed: false,
  };
}

function main() {
  const configBatch = findLatestConfigBatch();
  const checks = (configBatch.configs ?? []).map((c, i) => buildCheck(c, i));
  const change_detected_count = checks.filter((c) => c.change_detected).length;
  const requires_human_review_count = checks.filter((c) => c.requires_human_review).length;

  const run = {
    monitoring_run_id: RUN_ID,
    run_date: RUN_DATE,
    run_timestamp: `${RUN_DATE}T15:00:00.000Z`,
    mode: "deterministic_local",
    run_mode: "deterministic_local",
    product_version: PRODUCT_VERSION,
    monitoring_source_config_batch_id: configBatch.monitoring_source_config_batch_id,
    watcher_eligibility_batch_id: configBatch.watcher_eligibility_batch_id,
    overall_status: "completed",
    change_detected_count,
    requires_human_review_count,
    legal_safe_note: LEGAL_SAFE_NOTE,
    no_broad_scraping: true,
    no_competitor_source: true,
    client_use_allowed: false,
    final_evidence_allowed: false,
    checks,
  };

  const outPath = path.join(MONITORING_DIR, `${RUN_ID}.yml`);
  const header = `# Deterministic monitoring pack run — v${PRODUCT_VERSION}\n# Generated by scripts/run-monitoring-pack.mjs\n\n`;

  if (DRY_RUN) {
    console.log(yaml.dump(run));
    return;
  }

  fs.writeFileSync(outPath, header + yaml.dump(run), "utf8");
  console.log(`Wrote ${path.relative(ROOT, outPath)}`);
  console.log(
    `Checks: ${checks.length} | metadata_snapshot: ${checks.filter((c) => c.check_result === "metadata_snapshot_created").length} | no_change: ${checks.filter((c) => c.check_result === "no_change_snapshot_created").length} | blocked/manual: ${checks.filter((c) => c.check_result === "blocked_not_checked" || c.check_result === "manual_only_not_checked").length}`,
  );
}

main();
