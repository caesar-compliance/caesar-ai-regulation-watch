#!/usr/bin/env node
/**
 * Post-build sanity check for static deploy readiness (v0.8.4).
 * Exit 1 if required pages or public data files are missing from dist/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const base = process.env.ASTRO_BASE_PATH || "/";

function distPath(rel) {
  // Astro writes to dist/ root; base path affects HTML asset URLs, not on-disk nesting.
  // GitHub Pages project sites add /repo-name/ at serve time.
  return path.join(DIST, rel.replace(/^\//, ""));
}

const required = [
  "index.html",
  "map/index.html",
  "review-queue/index.html",
  "content-review/index.html",
  "evidence-export-candidates/index.html",
  "exports/index.html",
  "methodology/index.html",
  "disclaimer/index.html",
  "data/regulation-watch-snapshot.json",
  "data/evidence-export-candidates.json",
  "data/review-queue.json",
  "data/content-reviews.json",
  "data/jurisdictions.json",
  "feeds/changes.xml",
  "pagefind/pagefind.js",
];

const missing = [];
for (const rel of required) {
  const abs = distPath(rel);
  if (!fs.existsSync(abs)) {
    missing.push({ rel, abs });
  }
}

console.log("Dist output verification");
console.log(`  dist: ${DIST}`);
console.log(`  astro base (URL prefix): ${base}`);
console.log(`  checked: ${required.length}`);

if (missing.length > 0) {
  console.error(`  missing: ${missing.length}`);
  for (const m of missing) {
    console.error(`    ✗ ${m.rel} (expected at ${m.abs})`);
  }
  process.exit(1);
}

console.log(`  missing: 0\nAll required deploy paths present.\n`);
process.exit(0);
