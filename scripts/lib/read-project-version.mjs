#!/usr/bin/env node
/**
 * Read public product version from src/lib/project-version.ts (canonical for site + snapshot).
 * package.json semver may differ in formatting; public display version is canonical in project-version.ts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const VERSION_TS = path.join(ROOT, "src/lib/project-version.ts");

function parseProjectVersionTs() {
  const src = fs.readFileSync(VERSION_TS, "utf8");
  const versionMatch = src.match(/export const PROJECT_VERSION = "([^"]+)"/);
  const labelMatch = src.match(/export const PROJECT_VERSION_LABEL = "([^"]+)"/);
  if (!versionMatch) {
    throw new Error("Could not parse PROJECT_VERSION from src/lib/project-version.ts");
  }
  return {
    version: versionMatch[1],
    label: labelMatch?.[1] ?? `v${versionMatch[1]}`,
  };
}

export function readProjectVersion() {
  return parseProjectVersionTs().version;
}

export function readProjectVersionLabel() {
  return parseProjectVersionTs().label;
}

export function readProjectPhaseLabel() {
  const src = fs.readFileSync(VERSION_TS, "utf8");
  const phaseMatch = src.match(/export const PROJECT_PHASE_LABEL = "([^"]+)"/);
  if (!phaseMatch) {
    throw new Error("Could not parse PROJECT_PHASE_LABEL from src/lib/project-version.ts");
  }
  return phaseMatch[1];
}
