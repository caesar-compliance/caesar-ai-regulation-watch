#!/usr/bin/env node
/**
 * Guarded future single-source network dry-run runner — T054 stub only.
 * Does not perform network requests. Execution enabled only in future T055 after Control Tower approval.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPROVALS_PATH = path.join(ROOT, "data/source-adapters/network-dry-run-approvals.yml");

const T054_REFUSAL =
  "Network dry-run execution is not enabled in T054; use T055 after Control Tower approval.";

function parseArgs(argv) {
  let approvalId = null;
  let understandNetwork = false;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--approval-id" && argv[i + 1]) {
      approvalId = argv[++i];
    } else if (arg.startsWith("--approval-id=")) {
      approvalId = arg.slice("--approval-id=".length);
    } else if (arg === "--i-understand-this-runs-network") {
      understandNetwork = true;
    }
  }
  return { approvalId, understandNetwork };
}

function main() {
  const { approvalId, understandNetwork } = parseArgs(process.argv);

  if (!approvalId) {
    console.error("Refused: missing required --approval-id.");
    console.error(
      "This CLI is a guarded future runner for a single approved network dry-run. T054 does not execute network requests.",
    );
    console.error(
      "When enabled in T055, required flags will include --approval-id, --i-understand-this-runs-network, and env CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(APPROVALS_PATH)) {
    console.error(`Missing approvals file: ${APPROVALS_PATH}`);
    process.exit(1);
  }

  const doc = yaml.load(fs.readFileSync(APPROVALS_PATH, "utf8"));
  const approval = (doc.approvals ?? []).find((a) => a.approval_id === approvalId);
  if (!approval) {
    console.error(`Approval not found: ${approvalId}`);
    process.exit(1);
  }

  const envOk = process.env.CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN === "YES";
  const futureReady =
    understandNetwork && envOk && approval.network_execution_allowed === true;

  if (!futureReady) {
    if (!understandNetwork) {
      console.error("Note: future T055 run will also require --i-understand-this-runs-network");
    }
    if (!envOk) {
      console.error(
        "Note: future T055 run will also require CAESAR_ALLOW_SINGLE_NETWORK_DRY_RUN=YES",
      );
    }
    if (approval.network_execution_allowed !== true) {
      console.error(
        `Note: approval ${approvalId} has network_execution_allowed=false (status=${approval.status}).`,
      );
    }
  }

  console.error(T054_REFUSAL);
  process.exit(1);
}

main();
