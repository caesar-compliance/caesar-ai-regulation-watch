#!/usr/bin/env node
/**
 * Fixture-only RSS/Atom metadata parser — no network fetch.
 * Output: generated/source-adapter-fixture-candidates.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES_DIR = path.join(ROOT, "fixtures/source-adapters");
const OUT_DIR = path.join(ROOT, "generated");
const OUT_FILE = path.join(OUT_DIR, "source-adapter-fixture-candidates.json");

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: { enabled: true, maxTotalExpansions: 2048, maxExpandedLength: 8192 },
};

const FIXTURE_MAP = [
  {
    fixture: "rss-sample.xml",
    adapter_id: "edpb-publications-rss",
    source_id: "edpb",
    jurisdiction_ids: ["eu"],
    format: "rss",
  },
  {
    fixture: "atom-sample.xml",
    adapter_id: "edps-news-rss",
    source_id: "edps",
    jurisdiction_ids: ["eu"],
    format: "atom",
  },
];

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
    const guid =
      item.guid?.["#text"] ?? item.guid ?? `rss-fixture-${idx}`;
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

function normalizeCandidates(meta, entries) {
  return entries.map((entry, idx) => ({
    candidate_id: `${meta.adapter_id}-fixture-${idx + 1}`,
    adapter_id: meta.adapter_id,
    source_id: meta.source_id,
    title: entry.title,
    url: entry.url,
    published_at: entry.published_at,
    summary_snippet: entry.summary_snippet,
    detected_topics: entry.detected_topics,
    jurisdiction_ids: meta.jurisdiction_ids,
    metadata_only: true,
    verified_on_source: false,
    legal_change_claimed: false,
    client_use_allowed: false,
    final_evidence_allowed: false,
    source_collection_mode: "fixture_only",
    fixture_file: meta.fixture,
    entry_key: entry.entry_key,
  }));
}

function parseFixtureFile(meta) {
  const abs = path.join(FIXTURES_DIR, meta.fixture);
  if (!fs.existsSync(abs)) throw new Error(`Missing fixture: ${abs}`);
  const xml = fs.readFileSync(abs, "utf8");
  const parser = new XMLParser(PARSER_OPTIONS);
  const doc = parser.parse(xml);

  if (meta.format === "rss") {
    const channel = doc?.rss?.channel ?? doc?.channel;
    return parseRssItems(channel);
  }
  const feed = doc?.feed ?? doc?.["atom:feed"];
  return parseAtomEntries(feed);
}

function main() {
  const allCandidates = [];
  for (const meta of FIXTURE_MAP) {
    const entries = parseFixtureFile(meta);
    allCandidates.push(...normalizeCandidates(meta, entries));
  }

  const payload = {
    generated_at: new Date().toISOString().slice(0, 10),
    parser: "parse-source-adapter-fixture",
    network_fetch: false,
    metadata_only: true,
    legal_safe_note:
      "Fixture-only RSS/Atom metadata candidates. Not live source data. Not legal advice. Gates closed.",
    candidate_count: allCandidates.length,
    candidates: allCandidates,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log("PASS: source adapter fixture candidates generated");
  console.log(`  candidates: ${allCandidates.length}`);
  console.log(`  output: ${OUT_FILE}`);
}

main();
