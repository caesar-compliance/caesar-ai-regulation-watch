#!/usr/bin/env node
/**
 * Post-build sanity check for static deploy readiness.
 * Exit 1 if required pages/data are missing or stale version strings appear in HTML.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion, readProjectVersionLabel } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const base = process.env.ASTRO_BASE_PATH || "/";
const PROJECT_VERSION = readProjectVersion();
const PROJECT_VERSION_LABEL = readProjectVersionLabel();

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
  "data/jurisdictions.json",
  "feeds/changes.xml",
  "pagefind/pagefind.js",
];

const staleHtmlPatterns = [
  { label: "Product preview (v0.5.1)", re: /Product preview \(v0\.5\.1\)/ },
  { label: "footer v0.8.4", re: /\bv0\.8\.4\b/ },
  { label: "v0.8.3 local pipeline", re: /v0\.8\.3 local pipeline/i },
];

const requiredHtmlChecks = [
  {
    rel: "index.html",
    mustInclude: [PROJECT_VERSION_LABEL, "Public pilot"],
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

const missing = [];
for (const rel of required) {
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
  for (const needle of mustInclude) {
    if (!html.includes(needle)) {
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
console.log(`  checked paths: ${required.length}`);

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

const failed =
  missing.length > 0 ||
  staleHits.length > 0 ||
  htmlCheckFailures.length > 0 ||
  (snapshotVersion && snapshotVersion !== PROJECT_VERSION);

if (failed) {
  process.exit(1);
}

console.log(`  missing: 0`);
console.log(`  stale HTML: 0`);
console.log(`  HTML version/review checks: passed`);
console.log(`  snapshot.version: ${snapshotVersion}\nAll deploy checks passed.\n`);
process.exit(0);
