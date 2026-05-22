#!/usr/bin/env node
/**
 * T080B — Post-deploy live smoke with cache-busted requests.
 * Fails if canonical URLs serve stale v1.0.29-era HTML markers.
 */
const BASE = process.env.LIVE_BASE_URL || "https://regulation-watch.caesar.no";
const BUST = process.env.LIVE_CACHE_BUST || `T080B-${Date.now()}`;

const ROUTES = [
  {
    path: "/",
    mustInclude: ["v1.0.31", "Jurisdiction profile", "Regulation records"],
    mustExclude: ["v1.0.29", "v1.0.21", "13 jurisdictions grouped", "Global coverage map"],
  },
  {
    path: "/tracker/",
    mustInclude: ["v1.0.31", "Product tracker dashboard (T080)"],
    mustExclude: ["v1.0.29", "13 Jurisdictions tracked"],
  },
  {
    path: "/map/",
    mustInclude: ["v1.0.31", "Global regulation map"],
    mustExclude: ["v1.0.29", "Global coverage map", "Display-only map"],
  },
];

const STALE_FOOTER = /\bv1\.0\.(21|29|30)\b/;

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
  console.log("Live route smoke (T080B)");
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

  console.log("  PASS: live routes match v1.0.31 / T080 expectations\n");
}

main().catch((err) => {
  console.error(`  FAIL: ${err.message}`);
  process.exit(1);
});
