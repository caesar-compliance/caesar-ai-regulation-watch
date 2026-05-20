#!/usr/bin/env node
/**
 * Build or refresh a draft regulatory update from a manual review promotion packet.
 * Reads local generated or fixture candidate metadata only. No network. No public/data writes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMOTIONS_PATH = path.join(ROOT, "data/source-adapters/manual-review-promotions.yml");
const SUMMARY_CAP = 1000;
const TITLE_CAP = 500;
const SNIPPET_CAP = 500;

function capText(value, max) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (s.length <= max) return s;
  return `${s.slice(0, max - 3)}...`;
}

function parseArgs(argv) {
  let promotionId = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--promotion-id" && argv[i + 1]) {
      promotionId = argv[++i];
    }
  }
  return { promotionId };
}

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function parsePublishedDate(raw) {
  if (!raw) return "2026-05-21";
  const s = String(raw);
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const rss = s.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (rss) {
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const day = rss[1].padStart(2, "0");
    const mon = months[rss[2]] ?? "05";
    return `${rss[3]}-${mon}-${day}`;
  }
  return "2026-05-21";
}

function mapTopicIds(detectedTopics) {
  const tags = new Set(["source_monitoring"]);
  for (const t of detectedTopics ?? []) {
    const normalized = String(t).replace(/-/g, "_").toLowerCase();
    if (normalized) tags.add(normalized);
  }
  return [...tags];
}

function selectCandidate(payload, candidateId) {
  const candidates = payload.candidates ?? [];
  if (candidateId) {
    return candidates.find((c) => c.candidate_id === candidateId) ?? null;
  }
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) =>
    String(a.candidate_id).localeCompare(String(b.candidate_id)),
  );
  return sorted[0];
}

function buildDraftFromCandidate(promotion, candidate) {
  const title = capText(candidate?.title ?? promotion.fields?.title, TITLE_CAP);
  const summaryBase =
    candidate?.summary_snippet ??
    promotion.fields?.summary_snippet ??
    `T056 draft from network dry-run candidate ${candidate?.candidate_id ?? promotion.candidate_id}. Metadata-only; manual review required. Not verified on source. Not legal advice.`;
  const summary = capText(summaryBase, SUMMARY_CAP);

  return {
    draft_id: promotion.promotion_id,
    update_id: `t056-001-draft-edpb-network-dry-run`,
    title,
    source_url: candidate?.url ?? promotion.fields?.url,
    source_id: candidate?.source_id ?? promotion.source_id,
    jurisdiction_ids: candidate?.jurisdiction_ids ?? promotion.fields?.jurisdiction_ids ?? ["eu"],
    topic_ids: mapTopicIds(candidate?.detected_topics ?? promotion.fields?.detected_topics),
    published_at: parsePublishedDate(candidate?.published_at ?? promotion.fields?.published_at),
    source_published_at: String(candidate?.published_at ?? promotion.fields?.published_at ?? ""),
    summary,
    status: "draft_manual_review",
    intake_method: "single_source_network_dry_run",
    source_execution_id: promotion.source_execution_id,
    source_approval_id: promotion.source_approval_id,
    source_adapter_id: promotion.source_adapter_id,
    promotion_id: promotion.promotion_id,
    candidate_id: candidate?.candidate_id ?? promotion.candidate_id,
    review_required: true,
    verified_on_source: false,
    client_use_allowed: false,
    client_evidence_allowed: false,
    final_evidence_allowed: false,
    legal_change_claimed: false,
    publication_allowed: false,
    public_export_allowed: false,
    evidence_export_allowed: false,
    notes:
      "Manual review required before any publication, source verification, client/evidence use, or legal-change claim. Draft excluded from public regulatory-updates export.",
  };
}

function main() {
  const { promotionId } = parseArgs(process.argv);
  if (!promotionId) {
    console.error("Usage: npm run build:manual-review-promotion -- --promotion-id T056-001");
    process.exit(1);
  }

  const doc = readYaml(PROMOTIONS_PATH);
  const promotion = (doc.promotions ?? []).find((p) => p.promotion_id === promotionId);
  if (!promotion) {
    console.error(`Unknown promotion_id: ${promotionId}`);
    process.exit(1);
  }

  const candidatePath = path.join(ROOT, promotion.source_candidate_path);
  let candidate = null;
  if (fs.existsSync(candidatePath)) {
    const payload = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
    candidate = selectCandidate(payload, promotion.candidate_id);
    if (!candidate) {
      console.error(
        `Candidate ${promotion.candidate_id} not found in ${promotion.source_candidate_path}`,
      );
      process.exit(1);
    }
  } else if (promotion.promotion_mode === "fixture_candidate") {
    const fixturePath = path.join(ROOT, "fixtures/promotion/T054-001-candidate.json");
    if (!fs.existsSync(fixturePath)) {
      console.error("Fixture candidate missing and generated output absent");
      process.exit(1);
    }
    const payload = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    candidate = selectCandidate(payload, promotion.candidate_id);
  } else {
    console.error(`Missing candidate file: ${promotion.source_candidate_path}`);
    process.exit(1);
  }

  const draft = buildDraftFromCandidate(promotion, candidate);
  const outPath = path.join(ROOT, promotion.draft_update_path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const header =
    "# Draft regulatory update — manual review only (T056). NOT published to public/data.\n";
  fs.writeFileSync(outPath, header + yaml.dump(draft, { lineWidth: 100 }), "utf8");

  console.log("PASS: manual review promotion draft written");
  console.log(`  promotion_id: ${promotionId}`);
  console.log(`  candidate_id: ${draft.candidate_id}`);
  console.log(`  path: ${promotion.draft_update_path}`);
  console.log(`  mode: ${promotion.promotion_mode}`);
}

main();
