/**
 * Regulation Watch monitor worker — T073 scaffold.
 * No live fetch in default path. No secrets in source.
 */

export interface Env {
  RUN_TOKEN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RUNTIME_ID?: string;
}

const ALLOWLISTED_SOURCE_KEYS = new Set([
  "edpb-publications-rss",
  "edps-news-rss",
  "eu-ai-office-updates",
  "uk-dsit-ai-updates",
  "nist-ai-updates",
]);

type RssItemStub = {
  external_id: string;
  title: string;
  url: string;
  published_at: string | null;
  summary_excerpt: string | null;
  content_hash: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function unauthorized(): Response {
  return jsonResponse({ error: "unauthorized" }, 401);
}

function isAuthorized(request: Request, env: Env): boolean {
  const token = env.RUN_TOKEN;
  if (!token) return false;
  const header = request.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] === token;
}

/** TODO(T074+): metadata-only RSS fetch — one feed URL per allowlisted source_key. */
export async function fetchAllowlistedRssMetadata(
  _sourceKey: string,
): Promise<RssItemStub[]> {
  // Stub: no network in T073 scaffold default.
  return [];
}

/** TODO(T074+): insert source_run + snapshot + items into Supabase. */
export async function insertMonitoringRunStub(
  _env: Env,
  _payload: {
    source_key: string;
    run_type: string;
    items: RssItemStub[];
  },
): Promise<{ run_id: string; item_count: number }> {
  return { run_id: "stub-not-persisted", item_count: 0 };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return jsonResponse({
        ok: true,
        runtime_id: env.RUNTIME_ID ?? "regulation-watch-runtime-v1",
        live_ingestion_enabled: false,
        scheduled_monitoring_enabled: false,
      });
    }

    const runMatch = url.pathname.match(/^\/run\/([a-z][a-z0-9-]*)$/);
    if (runMatch && request.method === "POST") {
      if (!isAuthorized(request, env)) {
        return unauthorized();
      }

      const sourceKey = runMatch[1];
      if (!ALLOWLISTED_SOURCE_KEYS.has(sourceKey)) {
        return jsonResponse({ error: "source_key not allowlisted" }, 403);
      }

      // TODO: enable fetch only when network_execution_enabled is approved in runtime config.
      const items = await fetchAllowlistedRssMetadata(sourceKey);
      const persisted = await insertMonitoringRunStub(env, {
        source_key: sourceKey,
        run_type: "manual",
        items,
      });

      return jsonResponse({
        source_key: sourceKey,
        status: "stub_complete",
        item_count: persisted.item_count,
        run_id: persisted.run_id,
        metadata_only: true,
      });
    }

    return jsonResponse({ error: "not_found" }, 404);
  },
};
