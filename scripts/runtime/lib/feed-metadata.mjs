#!/usr/bin/env node
import crypto from "node:crypto";
import { XMLParser } from "fast-xml-parser";

export const FEED_USER_AGENT =
  "CaesarRegulationWatch/1.0.29 (metadata-pilot; +https://regulation-watch.caesar.no/methodology/)";

export const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: {
    enabled: true,
    maxTotalExpansions: 2048,
    maxExpandedLength: 8192,
  },
};

const FETCH_TIMEOUT_MS = 25_000;
const MAX_FEED_BYTES = 512_000;

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function snippet(text, max = 240) {
  if (!text) return null;
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
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
    const title = item.title ? String(item.title).trim().slice(0, 500) : "(untitled)";
    const link = item.link ? String(item.link).trim().slice(0, 2000) : null;
    const guid = item.guid?.["#text"] ?? item.guid ?? `rss-${idx}`;
    const published_at = pickDate(item, ["pubDate", "dc:date", "updated"]);
    return normalizeFeedEntry({
      external_id: String(guid).slice(0, 200),
      title,
      url: link,
      published_at,
      summary_excerpt: snippet(item.description),
    });
  });
}

function parseAtomEntries(feed) {
  return asArray(feed?.entry).map((entry, idx) => {
    const titleRaw = entry.title?.["#text"] ?? entry.title;
    const title = titleRaw ? String(titleRaw).trim().slice(0, 500) : "(untitled)";
    let link = entry.link;
    if (Array.isArray(link)) {
      link = link.find((l) => l?.["@_rel"] !== "self") ?? link[0];
    }
    if (typeof link === "object") link = link?.["@_href"] ?? link?.href;
    const linkStr = link ? String(link).trim().slice(0, 2000) : null;
    const id = entry.id ? String(entry.id).trim().slice(0, 500) : `atom-${idx}`;
    const published_at = pickDate(entry, ["published", "updated"]);
    const summary = entry.summary?.["#text"] ?? entry.summary;
    return normalizeFeedEntry({
      external_id: id.slice(0, 200),
      title,
      url: linkStr,
      published_at,
      summary_excerpt: snippet(summary),
    });
  });
}

export function parseFeedXml(xml) {
  const parser = new XMLParser(PARSER_OPTIONS);
  const doc = parser.parse(xml);
  if (doc?.rss?.channel ?? doc?.channel) {
    return parseRssItems(doc?.rss?.channel ?? doc?.channel);
  }
  const feed = doc?.feed ?? doc?.["atom:feed"];
  if (feed) return parseAtomEntries(feed);
  throw new Error("Unrecognized RSS/Atom feed format");
}

export function stableItemHash(item) {
  const payload = JSON.stringify({
    external_id: item.external_id,
    title: item.title?.trim() ?? null,
    url: item.url?.trim() ?? null,
    published_at: item.published_at ?? null,
    summary_excerpt: item.summary_excerpt ?? null,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function snapshotHash(items) {
  const sorted = [...items].sort((a, b) =>
    a.external_id.localeCompare(b.external_id),
  );
  const payload = sorted.map((i) => i.content_hash).join("|");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function normalizeFeedEntry(raw) {
  const item = {
    external_id: raw.external_id,
    title: raw.title ?? "(untitled)",
    url: raw.url ?? "",
    published_at: raw.published_at ?? null,
    summary_excerpt: raw.summary_excerpt ?? null,
  };
  item.content_hash = stableItemHash(item);
  return item;
}

export async function fetchFeedMetadata(feedUrl, { maxItems = 20 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(feedUrl, {
      method: "GET",
      headers: {
        "User-Agent": FEED_USER_AGENT,
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Feed HTTP ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_FEED_BYTES) {
      throw new Error(`Feed exceeds ${MAX_FEED_BYTES} bytes`);
    }
    const xml = new TextDecoder("utf-8").decode(buf);
    const items = parseFeedXml(xml).slice(0, maxItems);
    return { items, http_status: res.status, fetched_at: new Date().toISOString() };
  } finally {
    clearTimeout(timer);
  }
}
