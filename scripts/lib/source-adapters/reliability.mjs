/**
 * Watcher reliability defaults and error classification (v0.7.3).
 */

export const ERROR_CATEGORIES = [
  "timeout",
  "dns_error",
  "rate_limited",
  "forbidden",
  "server_error",
  "invalid_feed",
  "invalid_api_response",
  "network_error",
  "unknown_error",
];

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveReliability(watcher, adapterKind) {
  const defaults = {
    page: { timeout_ms: 20000, retry_count: 1, retry_delay_ms: 2500, soft_fail: true },
    feed: { timeout_ms: 25000, retry_count: 2, retry_delay_ms: 5000, soft_fail: true },
    api: { timeout_ms: 25000, retry_count: 1, retry_delay_ms: 4000, soft_fail: true },
  };
  const d = defaults[adapterKind] ?? defaults.page;
  return {
    timeout_ms: watcher.timeout_ms ?? d.timeout_ms,
    retry_count: watcher.retry_count ?? d.retry_count,
    retry_delay_ms: watcher.retry_delay_ms ?? d.retry_delay_ms,
    soft_fail: watcher.soft_fail ?? d.soft_fail,
    user_agent_note: watcher.user_agent_note ?? null,
  };
}

export function classifyHttpStatus(status, headers = {}) {
  if (status === 429) return "rate_limited";
  if (status === 403 || status === 401) return "forbidden";
  if (status >= 500 && status <= 599) return "server_error";
  if (status >= 400 && status < 500) return "unknown_error";
  return null;
}

export function classifyFetchError(err, httpStatus = null, headers = null) {
  if (httpStatus) {
    const fromStatus = classifyHttpStatus(httpStatus, headers);
    if (fromStatus) return fromStatus;
  }
  const msg = String(err?.message ?? err ?? "").toLowerCase();
  const name = String(err?.name ?? "").toLowerCase();
  if (name === "aborterror" || msg.includes("abort") || msg.includes("timeout")) {
    return "timeout";
  }
  if (msg.includes("enotfound") || msg.includes("getaddrinfo") || msg.includes("dns")) {
    return "dns_error";
  }
  if (msg.includes("fetch failed") || msg.includes("network") || msg.includes("econnreset")) {
    return "network_error";
  }
  return "unknown_error";
}

/**
 * Fetch with conservative retries. Does not retry 403/404.
 */
export async function fetchWithRetry(url, options, reliability) {
  const maxAttempts = Math.max(1, (reliability.retry_count ?? 0) + 1);
  let lastError = null;
  let lastCategory = "unknown_error";
  let lastStatus = null;
  let lastHeaders = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), reliability.timeout_ms);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      lastStatus = res.status;
      lastHeaders = res.headers;

      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        lastCategory = classifyHttpStatus(res.status, res.headers);
        lastError = new Error(`HTTP ${res.status}`);
        if (attempt < maxAttempts) {
          await sleep(reliability.retry_delay_ms * attempt);
          continue;
        }
        const body = await res.arrayBuffer();
        return {
          ok: false,
          res,
          body: Buffer.from(body),
          attempt,
          error_category: lastCategory,
        };
      }

      if (!res.ok) {
        lastCategory = classifyHttpStatus(res.status, res.headers) ?? "unknown_error";
        const body = await res.arrayBuffer();
        return {
          ok: false,
          res,
          body: Buffer.from(body),
          attempt,
          error_category: lastCategory,
        };
      }

      const body = await res.arrayBuffer();
      return {
        ok: true,
        res,
        body: Buffer.from(body),
        attempt,
        error_category: null,
      };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      lastCategory = classifyFetchError(err, lastStatus, lastHeaders);
      if (attempt < maxAttempts && (lastCategory === "timeout" || lastCategory === "network_error")) {
        await sleep(reliability.retry_delay_ms * attempt);
        continue;
      }
      return {
        ok: false,
        res: null,
        body: null,
        attempt,
        error_category: lastCategory,
        error: err,
      };
    }
  }

  return {
    ok: false,
    res: null,
    body: null,
    attempt: maxAttempts,
    error_category: lastCategory,
    error: lastError,
  };
}

export function buildFetchErrorMessage(category, detail) {
  return `[${category}] ${detail}`;
}
