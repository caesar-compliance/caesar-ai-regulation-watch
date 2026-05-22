#!/usr/bin/env node
/**
 * T081 — Build public/data/source-freshness.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import { buildSourceFreshnessRows, CLOSED_GATES } from "./lib/review-queue-lib.mjs";
import { loadMonitoringPilotRegistry } from "./lib/monitoring-pilot-registry.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

const DISCLAIMER =
  "Source freshness is operational metadata from pilot runs — not legal verification.";

function main() {
  const registry = loadMonitoringPilotRegistry();
  const sources = buildSourceFreshnessRows(ROOT);
  const byStatus = {};
  for (const s of sources) {
    byStatus[s.freshness_status] = (byStatus[s.freshness_status] ?? 0) + 1;
  }

  const out = {
    generated_at: new Date().toISOString(),
    product_version: readProjectVersion(),
    review_required: true,
    legal_change_claimed: false,
    public_note: DISCLAIMER,
    sources,
    source_count: sources.length,
    registry_source_count: registry.sources.length,
    summary: {
      fresh: byStatus.fresh ?? 0,
      aging: byStatus.aging ?? 0,
      stale: byStatus.stale ?? 0,
      manual_review_needed: byStatus.manual_review_needed ?? 0,
      not_automated: byStatus.not_automated ?? 0,
      automated_total: sources.filter((s) => s.automated).length,
      manual_total: sources.filter((s) => !s.automated).length,
      total_review_required_count: sources.reduce(
        (n, s) => n + (s.review_required_count ?? 0),
        0,
      ),
    },
    scheduled_monitoring_enabled: false,
    gates: { ...CLOSED_GATES },
  };

  fs.mkdirSync(PUBLIC_DATA, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC_DATA, "source-freshness.json"),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `PASS: build-source-freshness-export (${sources.length} sources, fresh=${byStatus.fresh ?? 0})`,
  );
}

main();
