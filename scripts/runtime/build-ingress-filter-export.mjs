#!/usr/bin/env node
/**
 * T084 — Build public/data/ingress-filter-summary.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import { buildReviewQueueCards } from "./lib/review-queue-lib.mjs";
import { buildIngressFilterSummaryExport } from "./lib/ingress-filter.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

function main() {
  const cards = buildReviewQueueCards(ROOT);
  const summary = buildIngressFilterSummaryExport(ROOT, cards);
  const out = {
    generated_at: new Date().toISOString(),
    product_version: readProjectVersion(),
    review_required: true,
    legal_change_claimed: false,
    scheduled_monitoring_enabled: false,
    cron_enabled: false,
    ...summary,
  };
  fs.mkdirSync(PUBLIC_DATA, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC_DATA, "ingress-filter-summary.json"),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `PASS: build-ingress-filter-export (visible=${summary.operator_visible_count}, suppressed=${summary.suppressed_count})`,
  );
}

main();
