#!/usr/bin/env node
/**
 * T081 — Post-deploy live smoke with cache-busted requests.
 * Fails if canonical URLs serve stale pre-v1.0.32 HTML markers.
 */
const BASE = process.env.LIVE_BASE_URL || "https://regulation-watch.caesar.no";
const BUST = process.env.LIVE_CACHE_BUST || `T081-${Date.now()}`;

const ROUTES = [
  {
    path: "/",
    mustInclude: ["v1.0.32", "Jurisdiction profile", "Regulation records"],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.21", "13 jurisdictions grouped", "Global coverage map"],
  },
  {
    path: "/tracker/",
    mustInclude: ["v1.0.32", "Product tracker dashboard (T080)", "Review queue"],
    mustExclude: ["v1.0.29", "13 Jurisdictions tracked"],
  },
  {
    path: "/map/",
    mustInclude: ["v1.0.32", "Global regulation map", "freshness"],
    mustExclude: ["v1.0.29", "Global coverage map", "Display-only map"],
  },
  {
    path: "/countries/",
    mustInclude: ["v1.0.32", "jurisdiction profile"],
    mustExclude: ["v1.0.29"],
  },
  {
    path: "/compare/",
    mustInclude: ["v1.0.32"],
    mustExclude: ["v1.0.29"],
  },
  {
    path: "/review-queue/",
    mustInclude: ["Regulation review queue", "v1.0.32", "Review required"],
    mustExclude: ["v1.0.29"],
  },
  {
    path: "/runtime-health/",
    mustInclude: ["v1.0.32", "Review queue", "source freshness"],
    mustExclude: ["v1.0.29"],
  },
  {
    path: "/runtime-services/",
    mustInclude: ["v1.0.32"],
    mustExclude: ["v1.0.29"],
  },
  {
    path: "/jurisdictions/eu/",
    mustInclude: ["Country review workflow", "v1.0.32"],
    mustExclude: ["v1.0.29"],
  },
  {
    path: "/jurisdictions/uk/",
    mustInclude: ["v1.0.32"],
    mustExclude: ["v1.0.29"],
  },
];

const DATA_ROUTES = [
  "/data/regulation-review-queue.json",
  "/data/source-freshness.json",
  "/data/operator-review-summary.json",
  "/data/review-packets-index.json",
];

const STALE_FOOTER = /\bv1\.0\.(21|29|30|31)\b/;

async function fetchHtml(path) {
  const url = new URL(path, BASE);
  url.searchParams.set("t", BUST);
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) {
    throw new Error(`${url} HTTP ${res.status}`);
  }
  return { url: url.toString(), html: await res.text() };
}

async function main() {
  const errors = [];
  for (const dataPath of DATA_ROUTES) {
    const url = new URL(dataPath, BASE);
    url.searchParams.set("t", BUST);
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) {
      errors.push(`${dataPath}: HTTP ${res.status}`);
      continue;
    }
    const json = await res.json();
    if (json.product_version && json.product_version !== "1.0.32") {
      errors.push(`${dataPath}: product_version ${json.product_version}`);
    }
    console.log(`  ${dataPath} ← ${url} (${json.card_count ?? json.source_count ?? json.packet_count ?? "ok"})`);
  }

  console.log("Live route smoke (T081)");
  console.log(`  base: ${BASE}`);
  console.log(`  cache bust: ${BUST}`);

  for (const route of ROUTES) {
    const { url, html } = await fetchHtml(route.path);
    console.log(`  ${route.path} ← ${url}`);
    for (const needle of route.mustInclude) {
      if (!html.includes(needle)) {
        errors.push(`${route.path}: missing "${needle}"`);
      }
    }
    for (const needle of route.mustExclude) {
      if (html.includes(needle)) {
        errors.push(`${route.path}: stale marker "${needle}"`);
      }
    }
    if (STALE_FOOTER.test(html)) {
      errors.push(`${route.path}: stale footer version label`);
    }
  }

  if (errors.length) {
    console.error(`  FAIL: ${errors.length} issue(s)`);
    for (const e of errors) console.error(`    ✗ ${e}`);
    process.exit(1);
  }

  console.log("  PASS: live routes match v1.0.32 / T081 expectations\n");
}

main().catch((err) => {
  console.error(`  FAIL: ${err.message}`);
  process.exit(1);
});
