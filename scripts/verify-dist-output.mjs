#!/usr/bin/env node
/**
 * Post-build sanity check for static deploy readiness.
 * Exit 1 if required pages/data are missing or stale version strings appear in HTML.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion, readProjectVersionLabel, readProjectPhaseLabel } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const base = process.env.ASTRO_BASE_PATH || "/";
const PROJECT_VERSION = readProjectVersion();
const PROJECT_VERSION_LABEL = readProjectVersionLabel();
const PROJECT_PHASE_LABEL = readProjectPhaseLabel();

function distPath(rel) {
  return path.join(DIST, rel.replace(/^\//, ""));
}

function readDistText(rel) {
  const abs = distPath(rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function walkHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      walkHtmlFiles(abs, out);
    } else if (name.endsWith(".html")) {
      out.push(abs);
    }
  }
  return out;
}

const required = [
  "index.html",
  "map/index.html",
  "review-queue/index.html",
  "content-review/index.html",
  "source-discovery/index.html",
  "evidence-export-candidates/index.html",
  "exports/index.html",
  "methodology/index.html",
  "disclaimer/index.html",
  "data/regulation-watch-snapshot.json",
  "data/evidence-export-candidates.json",
  "data/evidence-export-candidate-reviews.json",
  "data/review-queue.json",
  "data/content-reviews.json",
  "data/source-discovery-leads.json",
  "data/watcher-eligibility.json",
  "monitoring/index.html",
  "data/live-metadata-runs.json",
  "data/change-review-packs.json",
  "data/metadata-review-triage.json",
  "data/monitoring-source-configs.json",
  "data/monitoring-runs.json",
  "data/jurisdictions.json",
  "feeds/changes.xml",
  "pagefind/pagefind.js",
  "regions/index.html",
  "topics/index.html",
  "data/jurisdiction-profiles.json",
  "data/region-drilldowns.json",
  "data/topic-drilldowns.json",
  "source-adapters/index.html",
  "data/source-adapter-allowlist.json",
  "automation/index.html",
  "data/automation-runtime-manifest.json",
  "data/regulation-review-queue.json",
  "data/source-freshness.json",
  "data/operator-review-summary.json",
  "data/review-packets-index.json",
  "data/signal-quality-summary.json",
  "data/ingress-filter-summary.json",
];

const conditionalRequired = [];
if (fs.existsSync(distPath("data/region-drilldowns.json"))) {
  try {
    const regions = JSON.parse(fs.readFileSync(distPath("data/region-drilldowns.json"), "utf8"))
      .regions ?? [];
    const europe = regions.find((r) => r.slug === "europe");
    if (europe) conditionalRequired.push("regions/europe/index.html");
  } catch {
    /* validated by main JSON checks */
  }
}
if (fs.existsSync(distPath("data/topic-drilldowns.json"))) {
  try {
    const topics = JSON.parse(fs.readFileSync(distPath("data/topic-drilldowns.json"), "utf8"))
      .topics ?? [];
    const euAiAct = topics.find((t) => t.topic_id === "eu_ai_act");
    if (euAiAct) conditionalRequired.push("topics/eu_ai_act/index.html");
  } catch {
    /* validated by main JSON checks */
  }
}

const staleHtmlPatterns = [
  { label: "Product preview (v0.5.1)", re: /Product preview \(v0\.5\.1\)/ },
  { label: "footer v0.8.4", re: /\bv0\.8\.4\b/ },
  { label: "v0.8.3 local pipeline", re: /v0\.8\.3 local pipeline/i },
  { label: "footer v1.0.21", re: /\bv1\.0\.21\b/ },
  { label: "footer v1.0.29", re: /\bv1\.0\.29\b/ },
  { label: "footer v1.0.30", re: /\bv1\.0\.30\b/ },
  { label: "footer v1.0.31", re: /\bv1\.0\.31\b/ },
  { label: "homepage 13 jurisdictions copy", re: /13 jurisdictions grouped by region/ },
  { label: "legacy map page title", re: /<h1>Global coverage map<\/h1>/ },
];

const requiredHtmlChecks = [
  {
    rel: "index.html",
    mustInclude: [
      PROJECT_VERSION_LABEL,
      PROJECT_PHASE_LABEL,
      "T084 Automated Source Expansion and Ingress Filtering",
      "T083 Signal Quality and Review Prioritization",
      "T082 Operator Decision Workflow",
      "ingress-filter-summary.json",
      "signal-quality-summary.json",
      "operator decisions",
      "Regulation records",
      "Jurisdiction profile cards",
      "official sources",
      "automated RSS/Atom",
      "manual-review",
      "operator-visible candidates",
      "suppressed noise",
      "gates closed",
      "cron disabled",
    ],
  },
  {
    rel: "map/index.html",
    mustInclude: [PROJECT_VERSION_LABEL, "Global regulation map", "regulation-map-metrics.json"],
  },
  {
    rel: "tracker/index.html",
    mustInclude: [
      PROJECT_VERSION_LABEL,
      "Ingress filter dashboard (T084)",
      "Signal quality dashboard (T083)",
      "Priority distribution",
      "Recommended operator actions",
      "Operator review pipeline (T082)",
      "not legal verification",
      "Coverage dashboard (T080)",
      "manual-review",
      "gates closed",
      "cron disabled",
      "/sources/",
      "/runtime-health/",
      "Suppressed noise",
    ],
  },
  {
    rel: "review-queue/index.html",
    mustInclude: [
      PROJECT_VERSION_LABEL,
      "Ingress filter (T084)",
      "ingress_decision",
      "Signal quality (T083)",
      "signal_score",
      "ai_regulation_relevance",
      "signal_category",
      "recommended_operator_action",
      "reason_codes",
      "data-signal-score=",
      "Operator decision overrides signal recommendation",
    ],
  },
  {
    rel: "runtime-health/index.html",
    mustInclude: [
      PROJECT_VERSION_LABEL,
      "Ingress filtering (T084)",
      "validate:ingress-filtering",
      "Signal quality (T083)",
      "validate:signal-quality",
      "gates_closed",
    ],
  },
  {
    rel: "evidence-export-candidates/index.html",
    mustInclude: [
      PROJECT_VERSION_LABEL,
      "reviewed_for_internal_governance_only",
      "needs_more_source_review",
      "Candidate-only",
    ],
  },
];

const allRequired = [...required, ...conditionalRequired];

const missing = [];
for (const rel of allRequired) {
  const abs = distPath(rel);
  if (!fs.existsSync(abs)) {
    missing.push({ rel, abs });
  }
}

const staleHits = [];
for (const abs of walkHtmlFiles(DIST)) {
  const rel = path.relative(DIST, abs);
  const html = fs.readFileSync(abs, "utf8");
  for (const { label, re } of staleHtmlPatterns) {
    if (re.test(html)) {
      staleHits.push({ rel, label });
    }
  }
}

const htmlCheckFailures = [];
for (const { rel, mustInclude } of requiredHtmlChecks) {
  const html = readDistText(rel);
  if (!html) {
    htmlCheckFailures.push({ rel, reason: "missing file" });
    continue;
  }
  const htmlForNeedles =
    rel === "index.html" || rel === "tracker/index.html"
      ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
      : html;
  for (const needle of mustInclude) {
    if (!htmlForNeedles.includes(needle)) {
      htmlCheckFailures.push({ rel, reason: `missing required string: ${needle}` });
    }
  }
}

let snapshotVersion = null;
const snapshotPath = distPath("data/regulation-watch-snapshot.json");
if (fs.existsSync(snapshotPath)) {
  try {
    snapshotVersion = JSON.parse(fs.readFileSync(snapshotPath, "utf8")).version;
  } catch {
    htmlCheckFailures.push({
      rel: "data/regulation-watch-snapshot.json",
      reason: "invalid JSON",
    });
  }
}

console.log("Dist output verification");
console.log(`  dist: ${DIST}`);
console.log(`  astro base (URL prefix): ${base}`);
console.log(`  project version: ${PROJECT_VERSION} (${PROJECT_VERSION_LABEL})`);
console.log(`  checked paths: ${allRequired.length} (${conditionalRequired.length} conditional)`);

if (missing.length > 0) {
  console.error(`  missing: ${missing.length}`);
  for (const m of missing) {
    console.error(`    ✗ ${m.rel}`);
  }
}

if (staleHits.length > 0) {
  console.error(`  stale HTML: ${staleHits.length}`);
  for (const h of staleHits) {
    console.error(`    ✗ ${h.rel}: ${h.label}`);
  }
}

if (htmlCheckFailures.length > 0) {
  console.error(`  HTML consistency: ${htmlCheckFailures.length} failure(s)`);
  for (const f of htmlCheckFailures) {
    console.error(`    ✗ ${f.rel}: ${f.reason}`);
  }
}

if (snapshotVersion && snapshotVersion !== PROJECT_VERSION) {
  console.error(
    `  snapshot version mismatch: JSON has ${snapshotVersion}, expected ${PROJECT_VERSION}`,
  );
}

const monitoringPath = distPath("data/runtime-monitoring-status.json");
let monitoringFailures = 0;
if (fs.existsSync(monitoringPath)) {
  try {
    const monitoring = JSON.parse(fs.readFileSync(monitoringPath, "utf8"));
    if (monitoring.status === "not_configured") {
      console.error(
        "  runtime-monitoring-status.json in dist must not be not_configured after T078",
      );
      monitoringFailures += 1;
    }
    if (monitoring.product_version && monitoring.product_version !== PROJECT_VERSION) {
      console.error(
        `  monitoring product_version ${monitoring.product_version} != ${PROJECT_VERSION}`,
      );
      monitoringFailures += 1;
    }
  } catch {
    console.error("  invalid runtime-monitoring-status.json in dist");
    monitoringFailures += 1;
  }
}

const failed =
  missing.length > 0 ||
  staleHits.length > 0 ||
  htmlCheckFailures.length > 0 ||
  monitoringFailures > 0 ||
  (snapshotVersion && snapshotVersion !== PROJECT_VERSION);

if (failed) {
  process.exit(1);
}

console.log(`  missing: 0`);
console.log(`  stale HTML: 0`);
console.log(`  HTML version/review checks: passed`);
console.log(`  snapshot.version: ${snapshotVersion}\nAll deploy checks passed.\n`);
process.exit(0);
