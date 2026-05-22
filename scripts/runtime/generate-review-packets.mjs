#!/usr/bin/env node
/**
 * T081 — Generate markdown review packets for operators (metadata only, no legal text).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readProjectVersion } from "../lib/read-project-version.mjs";
import { buildReviewQueueCards } from "./lib/review-queue-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PACKET_DIR = path.join(ROOT, "data/runtime/review-packets");
const WORK_ITEM_DIR = path.join(
  ROOT,
  "work_items/T081-review-queue-source-freshness-operator-workflow/review-packets",
);

function packetMarkdown(card, index) {
  const lines = [
    `# Review packet ${index + 1}: ${card.title}`,
    "",
    "> **Not legal advice.** Metadata-only monitoring signal. Human review required before any legal or client use.",
    "",
    "> **This is a metadata signal, not legal verification.** Signal score and recommendations are deterministic rules only.",
    "",
    "## Signal quality (T083)",
    "",
    `- **Signal score:** ${card.signal_score ?? "—"} / 100`,
    `- **AI regulation relevance:** ${card.ai_regulation_relevance ?? "—"}`,
    `- **Signal category:** ${card.signal_category ?? "—"}`,
    `- **Recommended operator action:** ${card.recommended_operator_action ?? "—"}`,
    `- **Reason codes:** ${(card.reason_codes ?? []).join(", ") || "—"}`,
    card.signal_priority_source === "operator_decision"
      ? "- **Priority source:** operator decision overrides signal recommendation"
      : "- **Priority source:** signal score (no operator decision)",
    "",
    "## Review required",
    "",
    `- **Candidate ID:** \`${card.candidate_id}\``,
    `- **Priority:** ${card.priority}`,
    `- **Review status:** ${card.review_status}`,
    card.operator_decision
      ? `- **Operator decision:** ${card.operator_decision.decision} (${card.operator_decision.decision_id})`
      : "- **Operator decision:** none",
    `- **Jurisdiction:** ${card.jurisdiction_id}`,
    `- **Source:** ${card.source_title} (\`${card.source_key}\`)`,
    `- **Change type:** ${card.change_type}`,
    `- **Detected at:** ${card.detected_at ?? "unknown"}`,
    "",
    "## Source",
    "",
    card.source_url
      ? `- Official URL: ${card.source_url}`
      : "- Official URL: not available in export",
    "",
    "## Metadata summary",
    "",
    card.metadata_summary ?? "_No summary in export._",
    "",
    "## Reason for review",
    "",
    card.safety_notes,
    "",
    "## Suggested next action",
    "",
    "1. Open the official source URL and confirm the item is relevant to tracked topics.",
    "2. Record an operator decision in `data/runtime/operator-review-decisions.yml` (local only).",
    "3. Do not set legal/evidence/client gates true without separate approved workflow.",
    "4. Rebuild public exports after decisions change.",
    "",
    "## Safety gates (all closed)",
    "",
    "```json",
    JSON.stringify(card.gates, null, 2),
    "```",
    "",
  ];
  return lines.join("\n");
}

function main() {
  const cards = buildReviewQueueCards(ROOT);
  const sorted = [...cards].sort((a, b) => {
    const scoreDiff = (b.signal_score ?? 0) - (a.signal_score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const pri = { high: 3, medium: 2, low: 1 };
    return (pri[b.priority] ?? 0) - (pri[a.priority] ?? 0);
  });
  const reviewNow = sorted.filter((c) => c.recommended_operator_action === "review_now");
  const toWrite = (reviewNow.length > 0 ? reviewNow : sorted.filter((c) => c.ai_regulation_relevance === "high"))
    .slice(0, 20);
  const finalPackets = toWrite.length > 0 ? toWrite : sorted.slice(0, 10);

  for (const dir of [PACKET_DIR, WORK_ITEM_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const index = [];
  finalPackets.forEach((card, i) => {
    const slug = `${String(i + 1).padStart(2, "0")}-${card.candidate_id.slice(0, 8)}`;
    const filename = `review-packet-${slug}.md`;
    const body = packetMarkdown(card, i);

    for (const dir of [PACKET_DIR, WORK_ITEM_DIR]) {
      fs.writeFileSync(path.join(dir, filename), body, "utf8");
    }

    index.push({
      packet_id: `packet-${slug}`,
      candidate_id: card.candidate_id,
      filename,
      jurisdiction_id: card.jurisdiction_id,
      source_key: card.source_key,
      priority: card.priority,
      signal_score: card.signal_score ?? null,
      ai_regulation_relevance: card.ai_regulation_relevance ?? null,
      signal_category: card.signal_category ?? null,
      recommended_operator_action: card.recommended_operator_action ?? null,
      reason_codes: card.reason_codes ?? [],
      review_status: card.review_status,
      operator_decision: card.operator_decision?.decision ?? null,
      operator_decision_id: card.operator_decision?.decision_id ?? null,
      paths: {
        runtime: `data/runtime/review-packets/${filename}`,
        work_item: `work_items/T081-review-queue-source-freshness-operator-workflow/review-packets/${filename}`,
      },
    });
  });

  const indexPayload = {
    generated_at: new Date().toISOString(),
    packet_count: index.length,
    packets: index,
    public_note:
      "Operator review packets — metadata only. Not legal advice. Review required.",
  };

  fs.writeFileSync(
    path.join(ROOT, "public/data/review-packets-index.json"),
    `${JSON.stringify(
      {
        ...indexPayload,
        product_version: readProjectVersion(),
        review_required: true,
        legal_change_claimed: false,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`PASS: generate-review-packets (${index.length} packets)`);
}

main();
