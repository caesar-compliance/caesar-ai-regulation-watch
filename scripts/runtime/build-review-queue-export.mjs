#!/usr/bin/env node
/**
 * T081 — Build public/data/regulation-review-queue.json and operator-review-summary.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import {
  buildReviewQueueCards,
  loadOperatorDecisions,
  jurisdictionReviewState,
  CLOSED_GATES,
} from "./lib/review-queue-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DATA = path.join(ROOT, "public/data");

const DISCLAIMER =
  "Backend-derived metadata only. Review required before any legal or client use. Not legal advice.";

function writeExport(name, payload) {
  fs.mkdirSync(PUBLIC_DATA, { recursive: true });
  const out = {
    generated_at: new Date().toISOString(),
    product_version: readProjectVersion(),
    review_required: true,
    legal_change_claimed: false,
    public_note: DISCLAIMER,
    ...payload,
  };
  fs.writeFileSync(
    path.join(PUBLIC_DATA, name),
    `${JSON.stringify(out, null, 2)}\n`,
    "utf8",
  );
}

function main() {
  const cards = buildReviewQueueCards(ROOT);
  const decisions = loadOperatorDecisions(ROOT);
  const jurisdictionStates = jurisdictionReviewState(ROOT);

  const byStatus = {};
  const byPriority = {};
  for (const card of cards) {
    byStatus[card.review_status] = (byStatus[card.review_status] ?? 0) + 1;
    byPriority[card.priority] = (byPriority[card.priority] ?? 0) + 1;
  }

  writeExport("regulation-review-queue.json", {
    cards,
    card_count: cards.length,
    summary: {
      total: cards.length,
      review_required: byStatus.review_required ?? 0,
      in_review: byStatus.in_review ?? 0,
      dismissed: byStatus.dismissed ?? 0,
      accepted_for_tracking: byStatus.accepted_for_tracking ?? 0,
      needs_source_check: byStatus.needs_source_check ?? 0,
      high_priority: byPriority.high ?? 0,
      medium_priority: byPriority.medium ?? 0,
      low_priority: byPriority.low ?? 0,
    },
    jurisdiction_states: jurisdictionStates,
    gates: { ...CLOSED_GATES },
    scheduled_monitoring_enabled: false,
    live_ingestion_enabled: false,
  });

  const publicDecisions = decisions.filter(
    (d) => d.public_visibility === "public_summary_candidate",
  );

  writeExport("operator-review-summary.json", {
    decision_count: decisions.length,
    public_summary_decision_count: publicDecisions.length,
    decisions: decisions.map((d) => ({
      decision_id: d.decision_id,
      candidate_id: d.candidate_id,
      decision: d.decision,
      reviewer_label: d.reviewer_label,
      decided_at: d.decided_at,
      rationale: d.rationale,
      public_visibility: d.public_visibility ?? "internal_summary_only",
      gates: { ...CLOSED_GATES, ...(d.gates ?? {}) },
    })),
    operator_workflow: {
      cron_enabled: false,
      scheduled_monitoring_enabled: false,
      local_decisions_file: "data/runtime/operator-review-decisions.yml",
      note: "Edit YAML locally; rebuild exports. Public site is read-only.",
    },
    gates: { ...CLOSED_GATES },
  });

  console.log(
    `PASS: build-review-queue-export (${cards.length} cards, ${decisions.length} decisions)`,
  );
}

main();
