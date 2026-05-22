/**
 * T078 — Metadata-only RSS fetch and Supabase persistence helpers.
 */

export type RssItemStub = {
  external_id: string;
  title: string;
  url: string;
  published_at: string | null;
  summary_excerpt: string | null;
  content_hash: string;
};

const FEED_USER_AGENT =
  "CaesarRegulationWatch/1.0.29 (worker-pilot; +https://regulation-watch.caesar.no/methodology/)";

export const PILOT_ALLOWLIST: Record<
  string,
  { feed_url: string; allowed_host: string }
> = {
  "edpb-publications-rss": {
    feed_url: "https://www.edpb.europa.eu/feed/publications_en",
    allowed_host: "www.edpb.europa.eu",
  },
  "edps-news-rss": {
    feed_url: "https://www.edps.europa.eu/feed/news_en",
    allowed_host: "www.edps.europa.eu",
  },
};

async function stableHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function snippet(text: string | null, max = 240): string | null {
  if (!text) return null;
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Minimal RSS item extraction (metadata only). */
function parseRssXml(xml: string, maxItems: number): RssItemStub[] {
  const items: RssItemStub[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (let i = 0; i < Math.min(itemBlocks.length, maxItems); i += 1) {
    const block = itemBlocks[i];
    const title =
      block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() ??
      "(untitled)";
    const link =
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? "";
    const guid =
      block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ??
      `rss-${i}`;
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? null;
    const desc =
      block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] ??
      null;
    const item = {
      external_id: guid.slice(0, 200),
      title: title.slice(0, 500),
      url: link.slice(0, 2000),
      published_at: pubDate,
      summary_excerpt: snippet(desc),
      content_hash: "",
    };
    items.push(item);
  }
  return items;
}

export async function itemHashes(items: RssItemStub[]): Promise<RssItemStub[]> {
  const out: RssItemStub[] = [];
  for (const item of items) {
    const payload = JSON.stringify({
      external_id: item.external_id,
      title: item.title,
      url: item.url,
      published_at: item.published_at,
      summary_excerpt: item.summary_excerpt,
    });
    out.push({ ...item, content_hash: await stableHash(payload) });
  }
  return out;
}

export async function fetchAllowlistedRssMetadata(
  sourceKey: string,
  maxItems = 20,
): Promise<RssItemStub[]> {
  const entry = PILOT_ALLOWLIST[sourceKey];
  if (!entry) return [];
  const res = await fetch(entry.feed_url, {
    headers: {
      "User-Agent": FEED_USER_AGENT,
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
  const xml = await res.text();
  if (xml.length > 512_000) throw new Error("Feed too large");
  const parsed = parseRssXml(xml, maxItems);
  return itemHashes(parsed);
}

export interface Env {
  RUN_TOKEN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  REGWATCH_ENABLE_SCHEDULED_MONITORING?: string;
  RUNTIME_ID?: string;
  WORKER_NAME?: string;
  RUNTIME_ENV?: string;
  GIT_SHA?: string;
  BUILD_TIME?: string;
}

export async function insertMonitoringRun(
  env: Env,
  payload: {
    source_key: string;
    run_type: string;
    items: RssItemStub[];
    dry_run: boolean;
  },
): Promise<{ run_id: string; item_count: number; persisted: boolean }> {
  if (payload.dry_run || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      run_id: "dry-run-not-persisted",
      item_count: payload.items.length,
      persisted: false,
    };
  }

  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const runRes = await fetch(`${base}/rest/v1/source_runs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_key: payload.source_key,
      run_type: payload.run_type,
      status: "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      item_count: payload.items.length,
    }),
  });
  if (!runRes.ok) {
    throw new Error(`source_runs insert failed: ${runRes.status}`);
  }
  const runs = (await runRes.json()) as { id: string }[];
  const runId = runs[0]?.id ?? "unknown";

  for (const item of payload.items) {
    await fetch(`${base}/rest/v1/source_items`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        source_key: payload.source_key,
        external_id: item.external_id,
        title: item.title,
        url: item.url,
        published_at: item.published_at,
        summary_excerpt: item.summary_excerpt,
        content_hash: item.content_hash,
        metadata_json: { review_required: true, pilot: "T078-worker" },
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }),
    });
  }

  await fetch(`${base}/rest/v1/runtime_events`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event_type: "worker_pilot_run",
      event_status: "completed",
      source_key: payload.source_key,
      message: `Worker pilot run for ${payload.source_key}`,
      metadata_json: { item_count: payload.items.length, dry_run: false },
    }),
  });

  return { run_id: runId, item_count: payload.items.length, persisted: true };
}

export async function getLastRunStatus(env: Env): Promise<{
  configured: boolean;
  latest_runs: unknown[];
}> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { configured: false, latest_runs: [] };
  }
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const res = await fetch(
    `${base}/rest/v1/source_runs?select=id,source_key,status,item_count,completed_at&order=created_at.desc&limit=5`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  if (!res.ok) return { configured: true, latest_runs: [] };
  const latest_runs = (await res.json()) as unknown[];
  return { configured: true, latest_runs };
}
