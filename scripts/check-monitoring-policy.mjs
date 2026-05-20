#!/usr/bin/env node
/**
 * Monitoring policy gate (v0.9.8) — fails on unsafe flags, full-text fields, allowlist violations.
 * Scans artifact pack JSON/YAML and optionally validates manual workflow file shape.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const BLOCKED_SOURCE_IDS = new Set(["eu-ai-act", "edpb-ai-topic", "australia-industry-ai"]);
const FORBIDDEN_TEXT_FIELDS = new Set([
  "full_html",
  "page_text",
  "legal_text",
  "body_text",
  "raw_body",
]);
const COMPETITOR_HOST_PATTERNS = [
  /techieray\.com/i,
  /verifywise\.ai/i,
  /dlapiper\.com/i,
  /iapp\.org/i,
  /artificialintelligenceact\.eu/i,
  /github\.com\/delschlangen\/ai-legislation-tracker/i,
  /fairlyai/i,
];

function parseArgs() {
  const args = process.argv.slice(2);
  let artifactDir = path.join(ROOT, "tmp/live-metadata-review-pack");
  let workflowFile = path.join(ROOT, ".github/workflows/manual-live-metadata-review.yml");
  let jsonOut = process.env.MONITORING_POLICY_OUTPUT ?? null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--artifact-dir" && args[i + 1]) artifactDir = path.resolve(args[++i]);
    else if (args[i] === "--workflow" && args[i + 1]) workflowFile = path.resolve(args[++i]);
    else if (args[i] === "--json-out" && args[i + 1]) jsonOut = path.resolve(args[++i]);
  }
  return { artifactDir, workflowFile, jsonOut };
}

function isCompetitorUrl(url) {
  if (!url || typeof url !== "string") return false;
  return COMPETITOR_HOST_PATTERNS.some((re) => re.test(url));
}

function loadJsonOrYaml(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  if (filePath.endsWith(".json")) return JSON.parse(raw);
  return yaml.load(raw);
}

function walkObjects(obj, visit, pathParts = []) {
  if (obj == null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => walkObjects(item, visit, [...pathParts, String(i)]));
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    visit(key, value, [...pathParts, key]);
    walkObjects(value, visit, [...pathParts, key]);
  }
}

function collectViolations(data, label) {
  const violations = [];

  walkObjects(data, (key, value) => {
    if (FORBIDDEN_TEXT_FIELDS.has(key)) {
      violations.push({ label, rule: "forbidden_text_field", detail: `field ${key} must not appear` });
    }
    if (
      (key === "client_use_allowed" || key === "final_evidence_allowed" || key === "verified_on_source") &&
      value === true
    ) {
      violations.push({ label, rule: "unsafe_flag", detail: `${key}: true` });
    }
    if (key === "legal_change_claimed" && value === true) {
      violations.push({ label, rule: "legal_change_claimed", detail: "legal_change_claimed: true" });
    }
    if (key === "official_url" && typeof value === "string" && isCompetitorUrl(value)) {
      violations.push({ label, rule: "competitor_url", detail: value });
    }
    if (key === "source_id" && BLOCKED_SOURCE_IDS.has(value)) {
      violations.push({ label, rule: "blocked_source", detail: String(value) });
    }
  });

  if (data?.sources?.length > 5) {
    violations.push({ label, rule: "allowlist_size", detail: `sources: ${data.sources.length} (max 5)` });
  }
  if (data?.checks?.length > 5) {
    violations.push({ label, rule: "run_check_count", detail: `checks: ${data.checks.length} (max 5)` });
  }

  return violations;
}

function checkWorkflowFile(workflowFile) {
  const violations = [];
  if (!fs.existsSync(workflowFile)) {
    violations.push({ label: workflowFile, rule: "workflow_missing", detail: "manual workflow file not found" });
    return violations;
  }
  const text = fs.readFileSync(workflowFile, "utf8");
  if (/^\s*schedule\s*:/m.test(text)) {
    violations.push({ label: workflowFile, rule: "workflow_schedule", detail: "schedule trigger not allowed" });
  }
  if (/^\s*push\s*:/m.test(text)) {
    violations.push({ label: workflowFile, rule: "workflow_push", detail: "push trigger not allowed" });
  }
  if (/^\s*pull_request\s*:/m.test(text)) {
    violations.push({
      label: workflowFile,
      rule: "workflow_pull_request",
      detail: "pull_request trigger not allowed",
    });
  }
  if (/contents:\s*write/m.test(text)) {
    violations.push({
      label: workflowFile,
      rule: "workflow_contents_write",
      detail: "contents: write not allowed",
    });
  }
  if (!/workflow_dispatch\s*:/m.test(text)) {
    violations.push({
      label: workflowFile,
      rule: "workflow_dispatch_required",
      detail: "workflow_dispatch trigger required",
    });
  }
  return violations;
}

function scanArtifactDir(artifactDir) {
  const violations = [];
  if (!fs.existsSync(artifactDir)) {
    violations.push({ label: artifactDir, rule: "artifact_dir_missing", detail: "artifact directory not found" });
    return violations;
  }

  const files = fs.readdirSync(artifactDir).filter((f) => f.endsWith(".json") || f.endsWith(".yml"));
  for (const file of files) {
    const abs = path.join(artifactDir, file);
    let data;
    try {
      data = loadJsonOrYaml(abs);
    } catch (err) {
      violations.push({ label: file, rule: "parse_error", detail: String(err.message ?? err) });
      continue;
    }
    violations.push(...collectViolations(data, file));
  }
  return violations;
}

function main() {
  const { artifactDir, workflowFile, jsonOut } = parseArgs();
  const violations = [...scanArtifactDir(artifactDir), ...checkWorkflowFile(workflowFile)];
  const passed = violations.length === 0;
  const report = {
    checked_at: new Date().toISOString(),
    artifact_dir: artifactDir,
    workflow_file: workflowFile,
    passed,
    violation_count: violations.length,
    violations,
  };

  if (jsonOut) {
    fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
    fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  if (!passed) {
    console.error("Monitoring policy check failed:");
    for (const v of violations) {
      console.error(`  [${v.rule}] ${v.label}: ${v.detail}`);
    }
    process.exit(1);
  }

  console.log(`Monitoring policy check passed (${artifactDir})`);
}

main();
