/**
 * Regulation Watch monitor worker — T078 backend monitoring MVP.
 * Metadata-only. No secrets in source. Cron gated by REGWATCH_ENABLE_SCHEDULED_MONITORING.
 */

import {
  type Env,
  fetchAllowlistedRssMetadata,
  insertMonitoringRun,
  getLastRunStatus,
  PILOT_ALLOWLIST,
} from "./monitoring";

export type { Env } from "./monitoring";

const APP_NAME = "caesar-ai-regulation-watch";
const APP_VERSION = "1.0.37";
const PILOT_MAX_SOURCES = 6;
const PILOT_MAX_ITEMS_PER_SOURCE = 20;

function scheduledEnabled(env: Env): boolean {
  const v = (env.REGWATCH_ENABLE_SCHEDULED_MONITORING ?? "").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function buildHealthPayload(env: Env) {
  return {
    ok: true,
    status: "ok",
    app: APP_NAME,
    version: APP_VERSION,
    runtime_id: env.RUNTIME_ID ?? "regulation-watch-runtime-v1",
    live_ingestion_enabled: false,
    scheduled_monitoring_enabled: scheduledEnabled(env),
    backend_mvp: "T086",
    worker_allowlist_source_count: PILOT_MAX_SOURCES,
  };
}

function buildReadyPayload(env: Env) {
  const supabaseConfigured = Boolean(
    env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const runTokenConfigured = Boolean(env.RUN_TOKEN);
  return {
    ok: supabaseConfigured && runTokenConfigured,
    ready: supabaseConfigured && runTokenConfigured,
    checks: {
      supabase_configured: supabaseConfigured,
      run_token_configured: runTokenConfigured,
    },
    live_ingestion_enabled: false,
    scheduled_monitoring_enabled: scheduledEnabled(env),
    backend_mvp: "T086",
    worker_allowlist_source_count: PILOT_MAX_SOURCES,
  };
}

function buildVersionPayload(env: Env) {
  return {
    app: APP_NAME,
    version: APP_VERSION,
    worker:
      env.WORKER_NAME ?? env.RUNTIME_ID ?? "regulation-watch-monitor-dev",
    runtime_env: env.RUNTIME_ENV ?? "dev",
    git_sha: env.GIT_SHA ?? null,
    build_time: env.BUILD_TIME ?? null,
    runtime_id: env.RUNTIME_ID ?? "regulation-watch-runtime-v1",
    backend_mvp: "T086",
    worker_allowlist_source_count: PILOT_MAX_SOURCES,
    scheduled_monitoring_enabled: scheduledEnabled(env),
  };
}

const ALLOWLISTED_SOURCE_KEYS = new Set(Object.keys(PILOT_ALLOWLIST));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://regulation-watch.caesar.no",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://regulation-watch.caesar.no",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      });
    }

    if (url.pathname === "/health" || url.pathname === "/healthz") {
      return jsonResponse(buildHealthPayload(env));
    }

    if (url.pathname === "/readyz") {
      const payload = buildReadyPayload(env);
      return jsonResponse(payload, payload.ready ? 200 : 503);
    }

    if (url.pathname === "/version") {
      return jsonResponse(buildVersionPayload(env));
    }

    if (url.pathname === "/last-run" && request.method === "GET") {
      const status = await getLastRunStatus(env);
      return jsonResponse({
        ...status,
        scheduled_monitoring_enabled: scheduledEnabled(env),
        metadata_only: true,
        review_required: true,
      });
    }

    if (url.pathname === "/run-pilot" && request.method === "POST") {
      if (!isAuthorized(request, env)) {
        return unauthorized();
      }

      const dryRun =
        url.searchParams.get("dry_run") === "true" ||
        url.searchParams.get("dry_run") === "1";
      const maxSources = Math.min(
        Number(url.searchParams.get("max_sources") ?? String(PILOT_MAX_SOURCES)),
        PILOT_MAX_SOURCES,
      );
      const maxItems = Math.min(
        Number(url.searchParams.get("max_items") ?? String(PILOT_MAX_ITEMS_PER_SOURCE)),
        PILOT_MAX_ITEMS_PER_SOURCE,
      );

      const sourceKeys = [...ALLOWLISTED_SOURCE_KEYS].slice(0, maxSources);
      const results: {
        source_key: string;
        status: string;
        item_count: number;
        run_id?: string;
        error?: string;
      }[] = [];

      for (const sourceKey of sourceKeys) {
        try {
          const items = dryRun
            ? []
            : await fetchAllowlistedRssMetadata(sourceKey, maxItems);
          const persisted = await insertMonitoringRun(env, {
            source_key: sourceKey,
            run_type: "worker_pilot",
            items,
            dry_run: dryRun,
          });
          results.push({
            source_key: sourceKey,
            status: dryRun ? "dry_run" : "complete",
            item_count: persisted.item_count,
            run_id: persisted.run_id,
          });
        } catch (err) {
          results.push({
            source_key: sourceKey,
            status: "error",
            item_count: 0,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      const successCount = results.filter((r) => r.status === "complete" || r.status === "dry_run").length;
      const failureCount = results.filter((r) => r.status === "error").length;

      return jsonResponse({
        status: "pilot_complete",
        dry_run: dryRun,
        metadata_only: true,
        review_required: true,
        max_sources: maxSources,
        max_items_per_source: maxItems,
        worker_allowlist_source_count: ALLOWLISTED_SOURCE_KEYS.size,
        worker_run_source_success_count: successCount,
        worker_run_source_failure_count: failureCount,
        scheduled_monitoring_enabled: scheduledEnabled(env),
        results,
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

      const dryRun = url.searchParams.get("dry_run") === "true";
      const maxItems = Math.min(
        Number(url.searchParams.get("max_items") ?? "20"),
        20,
      );

      const items = dryRun
        ? []
        : await fetchAllowlistedRssMetadata(sourceKey, maxItems);
      const persisted = await insertMonitoringRun(env, {
        source_key: sourceKey,
        run_type: "manual",
        items,
        dry_run: dryRun,
      });

      return jsonResponse({
        source_key: sourceKey,
        status: dryRun ? "dry_run" : "complete",
        item_count: persisted.item_count,
        run_id: persisted.run_id,
        persisted: persisted.persisted,
        metadata_only: true,
        review_required: true,
      });
    }

    return jsonResponse({ error: "not_found" }, 404);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    if (!scheduledEnabled(env)) return;
    ctx.waitUntil(
      (async () => {
        for (const sourceKey of ALLOWLISTED_SOURCE_KEYS) {
          try {
            const items = await fetchAllowlistedRssMetadata(sourceKey, 10);
            await insertMonitoringRun(env, {
              source_key: sourceKey,
              run_type: "scheduled",
              items,
              dry_run: false,
            });
          } catch {
            /* dev-only cron; failures logged via Supabase when configured */
          }
        }
      })(),
    );
  },
};
