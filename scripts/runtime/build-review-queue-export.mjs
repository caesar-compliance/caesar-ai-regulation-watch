#!/usr/bin/env node
/**
 * T081 / T082 — Build public/data/regulation-review-queue.json and operator-review-summary.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import {
  buildReviewQueueCards,
  buildDecisionIndex,
  loadOperatorDecisions,
  loadOperatorDecisionsDoc,
  jurisdictionReviewState,
  summarizeReviewStatuses,
  operatorDecisionExportFields,
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

function summarizeDecisions(decisions) {
  const counts = {
    total: decisions.length,
    keep_review_required: 0,
    mark_in_review: 0,
    dismiss_noise: 0,
    accept_for_tracking: 0,
    needs_source_check: 0,
    needs_legal_review: 0,
  };
  for (const d of decisions) {
    if (counts[d.decision] != null) counts[d.decision] += 1;
  }
  return counts;
}

function main() {
  const cards = buildReviewQueueCards(ROOT);
  const decisions = loadOperatorDecisions(ROOT);
  const { byCandidate } = buildDecisionIndex(decisions);
  const jurisdictionStates = jurisdictionReviewState(ROOT);
  const summary = summarizeReviewStatuses(cards);
  const decisionCounts = summarizeDecisions(decisions);

  writeExport("regulation-review-queue.json", {
    cards,
    card_count: cards.length,
    summary,
    decision_counts: decisionCounts,
    jurisdiction_states: jurisdictionStates,
    gates: { ...CLOSED_GATES },
    scheduled_monitoring_enabled: false,
    live_ingestion_enabled: false,
    operator_workflow: {
      decisions_file: "data/runtime/operator-review-decisions.yml",
      local_decision_count: decisions.length,
      applied_to_candidates: byCandidate.size,
      cron_enabled: false,
      scheduled_monitoring_enabled: false,
    },
  });

  const publicDecisions = decisions
    .filter((d) => d.public_visibility === "public_summary_candidate")
    .map((d) => operatorDecisionExportFields(d));

  const trackerPath = path.join(PUBLIC_DATA, "tracker-summary.json");
  if (fs.existsSync(trackerPath)) {
    const tracker = JSON.parse(fs.readFileSync(trackerPath, "utf8"));
    tracker.operator_review = {
      decision_count: decisions.length,
      queue_summary: summary,
      decision_counts: decisionCounts,
    };
    tracker.generated_at = new Date().toISOString();
    tracker.product_version = readProjectVersion();
    fs.writeFileSync(trackerPath, `${JSON.stringify(tracker, null, 2)}\n`, "utf8");
  }

  writeExport("operator-review-summary.json", {
    decision_count: decisions.length,
    public_summary_decision_count: publicDecisions.length,
    decision_counts: decisionCounts,
    queue_summary: summary,
    decisions: decisions.map((d) => operatorDecisionExportFields(d)),
    public_decisions: publicDecisions,
    operator_workflow: {
      cron_enabled: false,
      scheduled_monitoring_enabled: false,
      local_decisions_file: "data/runtime/operator-review-decisions.yml",
      decisions_doc_id:
        loadOperatorDecisionsDoc(ROOT).operator_review_decisions_id ?? null,
      note: "Edit YAML locally; rebuild exports. Public site is read-only.",
    },
    gates: { ...CLOSED_GATES },
  });

  console.log(
    `PASS: build-review-queue-export (${cards.length} cards, ${decisions.length} decisions, applied ${byCandidate.size})`,
  );
}

main();
