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
  "CaesarRegulationWatch/1.0.37 (worker-pilot; +https://regulation-watch.caesar.no/methodology/)";

/** T086 — metadata for regulation_sources upsert before source_runs FK insert */
const REGISTRY_SOURCE_META: Record<
  string,
  { source_name: string; source_type: string; source_url: string }
> = {
  "edpb-publications-rss": {
    source_name: "European Data Protection Board (EDPB) — publications RSS",
    source_type: "rss",
    source_url: "https://www.edpb.europa.eu/feed/publications_en",
  },
  "edps-news-rss": {
    source_name: "European Data Protection Supervisor (EDPS) — news RSS",
    source_type: "rss",
    source_url: "https://www.edps.europa.eu/feed/news_en",
  },
  "eu-digital-strategy-ai-framework": {
    source_name: "European Commission — Digital strategy news RSS (AI policy)",
    source_type: "rss",
    source_url:
      "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
  },
  "us-nist-ai-rmf": {
    source_name: "NIST — News RSS (AI / cybersecurity policy signals)",
    source_type: "rss",
    source_url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  "france-cnil-ai-fr": {
    source_name: "CNIL — News RSS (French)",
    source_type: "rss",
    source_url: "https://www.cnil.fr/fr/intelligence-artificielle",
  },
  "uk-dsit-organisation": {
    source_name: "UK DSIT — Department updates (GOV.UK Atom)",
    source_type: "atom",
    source_url:
      "https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology",
  },
};

export const PILOT_ALLOWLIST: Record<
  string,
  { feed_url: string; allowed_host: string; max_items_per_run?: number }
> = {
  "edpb-publications-rss": {
    feed_url: "https://www.edpb.europa.eu/feed/publications_en",
    allowed_host: "www.edpb.europa.eu",
    max_items_per_run: 20,
  },
  "edps-news-rss": {
    feed_url: "https://www.edps.europa.eu/feed/news_en",
    allowed_host: "www.edps.europa.eu",
    max_items_per_run: 20,
  },
  "eu-digital-strategy-ai-framework": {
    feed_url: "https://digital-strategy.ec.europa.eu/en/rss.xml",
    allowed_host: "digital-strategy.ec.europa.eu",
    max_items_per_run: 20,
  },
  "us-nist-ai-rmf": {
    feed_url: "https://www.nist.gov/news-events/news/rss.xml",
    allowed_host: "www.nist.gov",
    max_items_per_run: 20,
  },
  "france-cnil-ai-fr": {
    feed_url: "https://www.cnil.fr/fr/rss.xml",
    allowed_host: "www.cnil.fr",
    max_items_per_run: 20,
  },
  "uk-dsit-organisation": {
    feed_url:
      "https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology.atom",
    allowed_host: "www.gov.uk",
    max_items_per_run: 20,
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

async function ensureRegulationSourceRow(
  base: string,
  headers: Record<string, string>,
  sourceKey: string,
): Promise<void> {
  const meta = REGISTRY_SOURCE_META[sourceKey];
  if (!meta) return;
  const res = await fetch(
    `${base}/rest/v1/regulation_sources?on_conflict=source_key`,
    {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        source_key: sourceKey,
        source_name: meta.source_name,
        source_type: meta.source_type,
        source_url: meta.source_url,
        status: "active",
        metadata_only: true,
        schedule_enabled: false,
      }),
    },
  );
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    throw new Error(
      `regulation_sources upsert failed: ${res.status} (${detail || "no body"})`,
    );
  }
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

  await ensureRegulationSourceRow(base, headers, payload.source_key);

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
    const detail = (await runRes.text()).slice(0, 200);
    const kind =
      runRes.status === 409 ? "registry_fk_or_conflict" : "insert_error";
    throw new Error(
      `source_runs insert failed: ${runRes.status} (${kind}; ${detail || "no body"})`,
    );
  }
  const runs = (await runRes.json()) as { id: string }[];
  const runId = runs[0]?.id ?? "unknown";

  for (const item of payload.items) {
    await fetch(
      `${base}/rest/v1/source_items?on_conflict=source_key,external_id`,
      {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        source_key: payload.source_key,
        external_id: item.external_id,
        title: item.title,
        url: item.url,
        published_at: item.published_at,
        summary_excerpt: item.summary_excerpt,
        content_hash: item.content_hash,
        metadata_json: { review_required: true, pilot: "T086-worker" },
        first_seen_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }),
    },
    );
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
