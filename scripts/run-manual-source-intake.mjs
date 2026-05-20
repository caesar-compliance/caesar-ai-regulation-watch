#!/usr/bin/env node
/**
 * Fixture-first manual source intake runner — no network fetch by default.
 * Writes metadata-only candidates to path from manual-intake-runs.yml.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNS_PATH = path.join(ROOT, "data/source-adapters/manual-intake-runs.yml");
const ALLOWLIST_PATH = path.join(ROOT, "data/source-adapters/source-adapter-allowlist.yml");

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: { enabled: true, maxTotalExpansions: 2048, maxExpandedLength: 8192 },
};

const ALLOWED_STATUSES = new Set(["draft", "ready_for_manual_review", "completed_fixture_only"]);

function parseArgs(argv) {
  let runId = null;
  let fixture = null;
  let network = false;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--run-id" && argv[i + 1]) {
      runId = argv[++i];
    } else if (arg === "--fixture" && argv[i + 1]) {
      fixture = argv[++i];
    } else if (arg === "--network" || arg === "--allow-network") {
      network = true;
    } else if (arg.startsWith("--run-id=")) {
      runId = arg.slice("--run-id=".length);
    } else if (arg.startsWith("--fixture=")) {
      fixture = arg.slice("--fixture=".length);
    }
  }
  return { runId, fixture, network };
}

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function snippet(text, max = 240) {
  if (!text) return null;
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function detectTopics(item) {
  const cats = asArray(item.category).map((c) => {
    if (typeof c === "string") return c;
    return c?.["#text"] ?? c?.["@_term"] ?? c?.term ?? null;
  });
  return cats.filter(Boolean).map((c) => String(c).toLowerCase().replace(/\s+/g, "_").slice(0, 64));
}

function pickDate(item, fields) {
  for (const field of fields) {
    const parts = field.split(":");
    let cur = item;
    for (const p of parts) cur = cur?.[p];
    if (cur) return String(cur).trim().slice(0, 80);
  }
  return null;
}

function parseRssItems(channel) {
  return asArray(channel?.item).map((item, idx) => {
    const title = item.title ? String(item.title).trim().slice(0, 500) : null;
    const link = item.link ? String(item.link).trim().slice(0, 2000) : null;
    const guid = item.guid?.["#text"] ?? item.guid ?? `rss-fixture-${idx}`;
    const published_at = pickDate(item, ["pubDate", "dc:date", "updated"]);
    return {
      title,
      url: link,
      published_at,
      summary_snippet: snippet(item.description),
      detected_topics: detectTopics(item),
      entry_key: String(guid).slice(0, 200),
    };
  });
}

function parseAtomEntries(feed) {
  return asArray(feed?.entry).map((entry, idx) => {
    const title = entry.title?.["#text"] ?? entry.title;
    const titleStr = title ? String(title).trim().slice(0, 500) : null;
    let link = entry.link;
    if (Array.isArray(link)) link = link.find((l) => l?.["@_rel"] !== "self") ?? link[0];
    if (typeof link === "object") link = link?.["@_href"] ?? link?.href;
    const linkStr = link ? String(link).trim().slice(0, 2000) : null;
    const id = entry.id ? String(entry.id).trim().slice(0, 500) : `atom-fixture-${idx}`;
    const published_at = pickDate(entry, ["published", "updated"]);
    const summary = entry.summary?.["#text"] ?? entry.summary;
    return {
      title: titleStr,
      url: linkStr,
      published_at,
      summary_snippet: snippet(summary),
      detected_topics: detectTopics(entry),
      entry_key: id.slice(0, 200),
    };
  });
}

function parseFixtureFile(fixturePath) {
  const abs = path.isAbsolute(fixturePath)
    ? fixturePath
    : path.join(ROOT, fixturePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing fixture: ${abs}`);
  }
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || !rel.startsWith("fixtures/")) {
    throw new Error(`Fixture must be under fixtures/: ${fixturePath}`);
  }

  const xml = fs.readFileSync(abs, "utf8");
  const parser = new XMLParser(PARSER_OPTIONS);
  const doc = parser.parse(xml);

  if (doc?.rss?.channel ?? doc?.channel) {
    return { format: "rss", entries: parseRssItems(doc?.rss?.channel ?? doc?.channel) };
  }
  const feed = doc?.feed ?? doc?.["atom:feed"];
  if (feed) {
    return { format: "atom", entries: parseAtomEntries(feed) };
  }
  throw new Error(`Unrecognized fixture format: ${abs}`);
}

function normalizeCandidates(run, adapter, entries, fixturePath) {
  return entries.map((entry, idx) => ({
    candidate_id: `${run.run_id}-${adapter.adapter_id}-${idx + 1}`,
    run_id: run.run_id,
    adapter_id: adapter.adapter_id,
    source_id: adapter.source_id,
    source_name: adapter.source_name,
    source_type: adapter.source_type,
    title: entry.title,
    url: entry.url,
    published_at: entry.published_at,
    summary_snippet: entry.summary_snippet,
    detected_topics: entry.detected_topics,
    jurisdiction_ids: adapter.jurisdiction_ids,
    metadata_only: true,
    verified_on_source: false,
    client_use_allowed: false,
    client_evidence_allowed: false,
    final_evidence_allowed: false,
    legal_change_claimed: false,
    source_collection_mode: "fixture_only",
    manual_review_required: true,
    fixture_file: path.relative(ROOT, path.isAbsolute(fixturePath) ? fixturePath : path.join(ROOT, fixturePath)),
    entry_key: entry.entry_key,
  }));
}

function main() {
  const { runId, fixture, network } = parseArgs(process.argv);

  if (!runId) {
    console.error("Usage: npm run run:manual-source-intake -- --run-id T053-001 --fixture fixtures/source-adapters/rss-sample.xml");
    process.exit(1);
  }
  if (!fixture) {
    console.error("--fixture is required (local file under fixtures/)");
    process.exit(1);
  }
  if (network) {
    console.error("Network collection is not enabled. Remove --network/--allow-network.");
    process.exit(1);
  }

  const runsDoc = yaml.load(fs.readFileSync(RUNS_PATH, "utf8"));
  const run = (runsDoc.runs ?? []).find((r) => r.run_id === runId);
  if (!run) {
    console.error(`Unknown run_id: ${runId}`);
    process.exit(1);
  }
  if (!ALLOWED_STATUSES.has(run.status)) {
    console.error(
      `Run status ${run.status} not allowed for fixture runner (allowed: ${[...ALLOWED_STATUSES].join(", ")})`,
    );
    process.exit(1);
  }
  if (run.mode !== "fixture_only") {
    console.error(`Run mode must be fixture_only for this runner (got ${run.mode})`);
    process.exit(1);
  }
  if (run.network_allowed !== false) {
    console.error("network_allowed must be false for fixture-only runs");
    process.exit(1);
  }

  const allowlist = yaml.load(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
  const adapter = (allowlist.adapters ?? []).find((a) => a.adapter_id === run.adapter_id);
  if (!adapter) {
    console.error(`Adapter not found: ${run.adapter_id}`);
    process.exit(1);
  }

  const { entries } = parseFixtureFile(fixture);
  const candidates = normalizeCandidates(run, adapter, entries, fixture);

  const outRel = run.output_path;
  const outAbs = path.join(ROOT, outRel);
  const payload = {
    generated_at: new Date().toISOString().slice(0, 10),
    runner: "run-manual-source-intake",
    run_id: run.run_id,
    adapter_id: run.adapter_id,
    source_id: run.source_id,
    network_fetch: false,
    metadata_only: true,
    legal_safe_note:
      "Fixture-only manual intake candidates. Not live source data. Not legal advice. Gates closed.",
    candidate_count: candidates.length,
    candidates,
  };

  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log("PASS: manual source intake run completed (fixture_only)");
  console.log(`  run_id: ${run.run_id}`);
  console.log(`  adapter_id: ${run.adapter_id}`);
  console.log(`  candidates: ${candidates.length}`);
  console.log(`  output: ${outAbs}`);
}

main();
