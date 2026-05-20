#!/usr/bin/env node
/**
 * Build live metadata review artifact pack (v0.9.8).
 * Runs cautious live metadata pilot to tmp/ — does not write public/data or commit repo outputs.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { readProjectVersion } from "./lib/read-project-version.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACK_DIR = path.resolve(
  process.env.LIVE_METADATA_ARTIFACT_DIR ?? path.join(ROOT, "tmp/live-metadata-review-pack"),
);
const RAW_DIR = path.join(PACK_DIR, "raw");
const OFFLINE = process.argv.includes("--offline");
const PRODUCT_VERSION = readProjectVersion();
const RUN_DATE = process.env.LIVE_METADATA_RUN_DATE ?? new Date().toISOString().slice(0, 10);
const RUN_SUFFIX =
  process.env.LIVE_METADATA_SUFFIX ?? `v098-${process.env.GITHUB_RUN_ID ?? Date.now()}`;

function readYamlFile(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function findLatestAllowlist() {
  const dir = path.join(ROOT, "data/monitoring");
  const file = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("live-metadata-pilot-allowlist-") && f.endsWith(".yml"))
    .sort()
    .reverse()[0];
  if (!file) throw new Error("No live-metadata-pilot-allowlist-*.yml in data/monitoring");
  return readYamlFile(path.join(dir, file));
}

function runPilot() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const env = {
    ...process.env,
    LIVE_METADATA_OUTPUT_DIR: RAW_DIR,
    LIVE_METADATA_RUN_DATE: RUN_DATE,
    LIVE_METADATA_SUFFIX: RUN_SUFFIX,
  };
  const args = ["scripts/run-live-metadata-pilot.mjs"];
  if (OFFLINE) args.push("--offline");
  const result = spawnSync(process.execPath, args, { cwd: ROOT, env, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`run-live-metadata-pilot exited with ${result.status}`);
  }
}

function findRawOutputs() {
  const runFile = fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.startsWith("live-metadata-run-") && f.endsWith(".yml"))
    .sort()
    .reverse()[0];
  const packFile = fs
    .readdirSync(RAW_DIR)
    .filter((f) => f.startsWith("change-review-pack-") && f.endsWith(".yml"))
    .sort()
    .reverse()[0];
  if (!runFile || !packFile) throw new Error("Pilot did not produce run/pack YAML in raw output dir");
  return {
    run: readYamlFile(path.join(RAW_DIR, runFile)),
    pack: readYamlFile(path.join(RAW_DIR, packFile)),
  };
}

function countTruthyFlags(checks, field) {
  return (checks ?? []).filter((c) => c[field] === true).length;
}

function buildSummaryMd(run, pack, allowlist) {
  const checks = run.checks ?? [];
  const lines = [
    "# Live metadata review summary",
    "",
    `**Product version:** v${PRODUCT_VERSION}`,
    `**Run ID:** ${run.run_id}`,
    `**Generated:** ${run.run_timestamp ?? new Date().toISOString()}`,
    `**Pilot ID:** ${allowlist.pilot_id ?? run.pilot_id ?? "—"}`,
    "",
    "## Scope",
    "",
    "- Manual-gated artifact review only (not scheduled monitoring)",
    "- Metadata headers and page title only — no full legal/source text",
    "- One request per allowlisted official source (max 5)",
    "- Not legal advice · not client evidence · not final evidence",
    "",
    "## Counts",
    "",
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Sources checked | ${checks.length} |`,
    `| metadata_check_ok | ${checks.filter((c) => c.check_result === "metadata_check_ok").length} |`,
    `| metadata_changed_needs_review | ${checks.filter((c) => c.check_result === "metadata_changed_needs_review").length} |`,
    `| metadata_check_failed | ${checks.filter((c) => c.check_result === "metadata_check_failed").length} |`,
    `| change_detected_count | ${run.change_detected_count ?? checks.filter((c) => c.change_detected).length} |`,
    `| legal_change_claimed (true) | ${countTruthyFlags(checks, "legal_change_claimed")} |`,
    `| client_use_allowed (true) | ${countTruthyFlags(checks, "client_use_allowed")} |`,
    `| final_evidence_allowed (true) | ${countTruthyFlags(checks, "final_evidence_allowed")} |`,
    `| verified_on_source (true) | ${countTruthyFlags(checks, "verified_on_source")} |`,
    "",
    "## Per-source results",
    "",
  ];

  for (const c of checks) {
    lines.push(
      `- **${c.source_id}** — ${c.check_result} (HTTP ${c.http_status ?? "—"})${c.requires_human_review ? " · needs review" : ""}`,
    );
  }

  lines.push(
    "",
    "## Change review pack",
    "",
    `Pack ID: \`${pack.change_review_pack_id}\``,
    "",
    run.legal_safe_note ? `> ${String(run.legal_safe_note).replace(/\n/g, " ")}` : "",
    "",
  );

  return `${lines.join("\n")}\n`;
}

function buildReadme() {
  return `# Live metadata review artifact pack (v${PRODUCT_VERSION})

Manual-gated monitoring workflow output. **Not** committed to the repository by default.

## Contents

| File | Description |
| --- | --- |
| \`live-metadata-run.json\` | Cautious live metadata pilot run (metadata only) |
| \`change-review-pack.json\` | Human review pack — not a legal/regulatory change claim |
| \`metadata-review-summary.md\` | Human-readable summary for Control Tower triage |
| \`policy-checks.json\` | Policy gate results from \`check-monitoring-policy.mjs\` |
| \`source-allowlist.json\` | Allowlisted sources (max 5; no blocked/manual sources) |
| \`raw/\` | Intermediate YAML from pilot (optional; included in CI artifact upload) |

## Review steps

1. Read \`metadata-review-summary.md\` and \`policy-checks.json\` (must pass).
2. For each \`metadata_changed_needs_review\` item, open the official URL and corroborate manually.
3. Do **not** set \`verified_on_source: true\`, \`client_use_allowed: true\`, or \`final_evidence_allowed: true\` from this pack.
4. Do **not** treat metadata deltas as legal/regulatory change claims.
5. Curated record updates require a separate human-authored PR — never auto-merge from monitoring.

See \`docs/MONITORING_RUNBOOK.md\` in the repository.
`;
}

function runPolicyCheck() {
  const policyOut = path.join(PACK_DIR, "policy-checks.json");
  const result = spawnSync(
    process.execPath,
    [
      "scripts/check-monitoring-policy.mjs",
      "--artifact-dir",
      PACK_DIR,
      "--json-out",
      policyOut,
    ],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error("Policy check failed");
  return JSON.parse(fs.readFileSync(policyOut, "utf8"));
}

try {
  const allowlist = findLatestAllowlist();
  runPilot();
  const { run, pack } = findRawOutputs();

  fs.mkdirSync(PACK_DIR, { recursive: true });
  fs.writeFileSync(path.join(PACK_DIR, "live-metadata-run.json"), `${JSON.stringify(run, null, 2)}\n`);
  fs.writeFileSync(path.join(PACK_DIR, "change-review-pack.json"), `${JSON.stringify(pack, null, 2)}\n`);
  fs.writeFileSync(path.join(PACK_DIR, "source-allowlist.json"), `${JSON.stringify(allowlist, null, 2)}\n`);
  fs.writeFileSync(path.join(PACK_DIR, "metadata-review-summary.md"), buildSummaryMd(run, pack, allowlist));
  fs.writeFileSync(path.join(PACK_DIR, "README.md"), buildReadme());

  const policy = runPolicyCheck();

  console.log(`Wrote artifact pack: ${path.relative(ROOT, PACK_DIR)}`);
  console.log(
    `Checks: ${(run.checks ?? []).length} | ok: ${(run.checks ?? []).filter((c) => c.check_result === "metadata_check_ok").length} | policy: ${policy.passed ? "passed" : "FAILED"}`,
  );
} catch (err) {
  console.error(err);
  process.exit(1);
}
