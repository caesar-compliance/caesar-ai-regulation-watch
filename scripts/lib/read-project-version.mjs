#!/usr/bin/env node
/**
 * Read project version from package.json (must match src/lib/project-version.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function readProjectVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  if (!pkg.version || typeof pkg.version !== "string") {
    throw new Error("package.json missing version field");
  }
  return pkg.version;
}

export function readProjectVersionLabel() {
  return `v${readProjectVersion()}`;
}
