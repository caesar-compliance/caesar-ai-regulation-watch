#!/usr/bin/env node
/**
 * Generate static JSON exports and RSS feed from local YAML (no remote fetch).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DATA = path.join(ROOT, "public/data");
const PUBLIC_FEEDS = path.join(ROOT, "public/feeds");

const DISCLAIMER =
  "Pilot data for governance review support only. Not legal advice. Not a compliance guarantee. Not complete global coverage. Sample records require human review before client use. Official sources control.";

function readYamlDir(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
    .map((f) => yaml.load(fs.readFileSync(path.join(abs, f), "utf8")));
}

function readYamlFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toUTCString();
}

function stripMultiline(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

// Load data
const jurisdictions = readYamlDir("data/jurisdictions");
const sources = readYamlDir("data/sources");
const laws = readYamlDir("data/laws");
const guidance = readYamlDir("data/guidance");
const changes = readYamlDir("data/changes").sort((a, b) =>
  b.detected_date.localeCompare(a.detected_date),
);
const exportFile = readYamlFile("exports/samples/regulation-change-export.sample.yml");
const exportSamples = (exportFile?.exports ?? []).map((e) => ({
  ...e,
  sample_only: true,
  not_client_evidence: true,
}));

const records = [
  ...laws.map((r) => ({ ...r, record_type: "law", status: r.legal_status })),
  ...guidance.map((r) => ({
    ...r,
    record_type: "guidance",
    status: r.guidance_status,
  })),
];

const generatedAt = "2026-05-19";

const snapshot = {
  generated_at: generatedAt,
  version: "0.4.1",
  disclaimer: DISCLAIMER,
  pilot_jurisdictions: jurisdictions.map((j) => j.jurisdiction_id),
  counts: {
    jurisdictions: jurisdictions.length,
    sources: sources.length,
    records: records.length,
    laws: laws.length,
    guidance: guidance.length,
    changes: changes.length,
    export_samples: exportSamples.length,
  },
  feeds: {
    changes_rss: "/feeds/changes.xml",
  },
  data_files: {
    jurisdictions: "/data/jurisdictions.json",
    sources: "/data/sources.json",
    records: "/data/records.json",
    changes: "/data/changes.json",
    export_samples: "/data/export-samples.json",
  },
  review_notice:
    "All pilot content is curated manual YAML. Human review required before client use.",
};

// Write JSON files
writeJson(path.join(PUBLIC_DATA, "jurisdictions.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: jurisdictions,
});

writeJson(path.join(PUBLIC_DATA, "sources.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: sources,
});

writeJson(path.join(PUBLIC_DATA, "records.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: records,
});

writeJson(path.join(PUBLIC_DATA, "changes.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  items: changes.map((c) => ({
    ...c,
    sample_only: c.record_origin === "manual_sample",
    human_review_required: c.requires_human_review !== false,
  })),
});

writeJson(path.join(PUBLIC_DATA, "export-samples.json"), {
  generated_at: generatedAt,
  disclaimer: DISCLAIMER,
  sample_only: true,
  not_client_evidence: true,
  items: exportSamples,
});

writeJson(path.join(PUBLIC_DATA, "regulation-watch-snapshot.json"), snapshot);

// RSS feed — sample changes only
const siteBase = "https://regulations.caesar.no";
const channelTitle = "Caesar AI Regulation Watch — Sample changes (pilot)";
const channelDescription = stripMultiline(
  "Manual sample regulatory change records for governance review. Not legal advice. Not automated monitoring. Human review required.",
);

const items = changes
  .map((c) => {
    const title = `Sample change: ${c.change_id} (${c.jurisdiction_id})`;
    const link = `${siteBase}/changes/${c.change_id}/`;
    const description = stripMultiline(
      `${c.change_summary_for_review} Possible impact (for review only): ${stripMultiline(c.possible_impact)} Not legal advice. Human review required.`,
    );
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(c.detected_date)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${siteBase}/changes/</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en</language>
    <lastBuildDate>${toRfc822(generatedAt)}</lastBuildDate>
    <atom:link href="${siteBase}/feeds/changes.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Feed notice: sample data only</title>
      <link>${siteBase}/methodology/</link>
      <guid isPermaLink="true">${siteBase}/feeds/changes.xml#notice</guid>
      <pubDate>${toRfc822(generatedAt)}</pubDate>
      <description>${escapeXml(DISCLAIMER)}</description>
    </item>
${items}
  </channel>
</rss>
`;

fs.mkdirSync(PUBLIC_FEEDS, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_FEEDS, "changes.xml"), rss, "utf8");

console.log("Generated static exports:");
console.log("  public/data/jurisdictions.json");
console.log("  public/data/sources.json");
console.log("  public/data/records.json");
console.log("  public/data/changes.json");
console.log("  public/data/export-samples.json");
console.log("  public/data/regulation-watch-snapshot.json");
console.log("  public/feeds/changes.xml");
console.log(`  ${changes.length} change(s) in RSS feed`);
