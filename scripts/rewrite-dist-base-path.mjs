#!/usr/bin/env node
/**
 * Prefix absolute root paths in built HTML for GitHub Pages project sites.
 * Run after `build:site` when ASTRO_BASE_PATH is set (e.g. /caesar-ai-regulation-watch/).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
let base = process.env.ASTRO_BASE_PATH || "";

if (!base || base === "/") {
  console.log("rewrite-dist-base-path: skipped (no ASTRO_BASE_PATH)\n");
  process.exit(0);
}

if (!base.startsWith("/")) base = `/${base}`;
if (!base.endsWith("/")) base = `${base}/`;

const ATTRS = ["href", "src", "action"];
let filesChanged = 0;
let replacements = 0;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs);
      continue;
    }
    if (!name.endsWith(".html")) continue;
    let html = fs.readFileSync(abs, "utf8");
    let changed = false;
    for (const attr of ATTRS) {
      const re = new RegExp(`(${attr}=")\\/(?!${base.slice(1)})`, "g");
      const next = html.replace(re, `$1${base}`);
      if (next !== html) {
        const count = (html.match(re) || []).length;
        replacements += count;
        html = next;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(abs, html, "utf8");
      filesChanged += 1;
    }
  }
}

if (!fs.existsSync(DIST)) {
  console.error(`rewrite-dist-base-path: dist not found at ${DIST}`);
  process.exit(1);
}

walk(DIST);
console.log(`rewrite-dist-base-path: base=${base} files=${filesChanged} replacements≈${replacements}\n`);
