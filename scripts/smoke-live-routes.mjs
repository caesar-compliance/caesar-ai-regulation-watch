#!/usr/bin/env node
/**
 * T086 — Post-deploy live smoke with cache-busted requests.
 * Fails if canonical URLs serve stale pre-v1.0.37 HTML or missing T086 runtime markers.
 */
const BASE = process.env.LIVE_BASE_URL || "https://regulation-watch.caesar.no";
const BUST = process.env.LIVE_CACHE_BUST || `T086-${Date.now()}`;
const VERSION = process.env.EXPECTED_PRODUCT_VERSION || "1.0.37";
const VERSION_LABEL = `v${VERSION}`;

const ROUTES = [
  {
    path: "/",
    mustInclude: [
      VERSION_LABEL,
      "T086 Six-Source Runtime DB Alignment",
      "T085 Six-Source Worker Runtime Run",
      "T084 Automated Source Expansion and Ingress Filtering",
      "T083 Signal Quality and Review Prioritization",
      "T082 Operator Decision Workflow",
      "ingress-filter-summary.json",
      "signal-quality-summary.json",
      "operator decisions",
      "Regulation records",
      "Jurisdiction profile",
      "25 official sources",
      "6 automated RSS/Atom",
      "19 manual-review",
      "4 operator-visible candidates",
      "16 suppressed noise",
      "gates closed",
      "cron disabled",
    ],
    mustExclude: [
      "v1.0.29",
      "v1.0.31",
      "v1.0.33",
      "v1.0.35",
      "v1.0.36",
      "T080 coverage model (v1.0.31)",
      "13 jurisdictions grouped",
      "13 Jurisdictions tracked",
      "9 Monitored sources",
      "0 Automated RSS pilot",
      "not_configured",
      "Global coverage map",
      "Product tracker dashboard (T080)",
    ],
  },
  {
    path: "/tracker/",
    mustInclude: [
      VERSION_LABEL,
      "Six-source runtime alignment (T086)",
      "Six-source Worker run (T085)",
      "Ingress filter dashboard (T084)",
      "Signal quality dashboard (T083)",
      "Priority distribution",
      "Recommended operator actions",
      "Operator review pipeline (T082)",
      "not legal verification",
      "Coverage dashboard (T080)",
      "25 official",
      "6 automated RSS/Atom",
      "19 manual-review",
      "Suppressed noise",
      "gates closed",
      "cron disabled",
      "/review-queue/",
      "/sources/",
      "/runtime-health/",
    ],
    mustExclude: [
      "v1.0.29",
      "v1.0.31",
      "v1.0.33",
      "Product tracker dashboard (T080)",
      "13 Jurisdictions tracked",
      "9 Monitored sources",
      "0 Automated RSS pilot",
      "not_configured",
    ],
  },
  {
    path: "/map/",
    mustInclude: [VERSION_LABEL, "Global regulation map", "freshness"],
    mustExclude: ["v1.0.29", "Global coverage map", "Display-only map"],
  },
  {
    path: "/countries/",
    mustInclude: [VERSION_LABEL, "jurisdiction profile"],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/compare/",
    mustInclude: [VERSION_LABEL],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/review-queue/",
    mustInclude: [
      "Regulation review queue",
      VERSION_LABEL,
      "Ingress filter (T084)",
      "ingress_decision",
      "Signal quality (T083)",
      "Operator decisions (T082)",
      "signal_score",
      "ai_regulation_relevance",
      "signal_category",
      "recommended_operator_action",
      "reason_codes",
      "data-signal-score=",
    ],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/runtime-health/",
    mustInclude: [
      VERSION_LABEL,
      "DB registry alignment (T086)",
      "Six-source Worker (T085)",
      "Ingress filtering (T084)",
      "validate:ingress-filtering",
      "Signal quality (T083)",
      "validate:signal-quality",
      "Operator workflow health (T082)",
    ],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/runtime-services/",
    mustInclude: [VERSION_LABEL],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/jurisdictions/eu/",
    mustInclude: ["Country review workflow", VERSION_LABEL],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/jurisdictions/france/",
    mustInclude: ["Country review workflow", VERSION_LABEL],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33"],
  },
  {
    path: "/sources/",
    mustInclude: [VERSION_LABEL, "Monitoring pilot registry", "automated", "manual-review"],
    mustExclude: ["v1.0.29", "v1.0.31", "v1.0.33", "v1.0.34"],
  },
];

const DATA_ROUTES = [
  "/data/regulation-review-queue.json",
  "/data/source-freshness.json",
  "/data/operator-review-summary.json",
  "/data/signal-quality-summary.json",
  "/data/ingress-filter-summary.json",
  "/data/review-packets-index.json",
  "/data/tracker-summary.json",
];

const RUNTIME_MONITORING_ROUTE = "/data/runtime-monitoring-status.json";

const STALE_FOOTER = /\bv1\.0\.(21|29|30|31|32|33|34|35|36)\b/;

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
    if (json.product_version && json.product_version !== VERSION) {
      errors.push(`${dataPath}: product_version ${json.product_version} != ${VERSION}`);
    }
    console.log(
      `  ${dataPath} ← ${url} (${json.card_count ?? json.decision_count ?? json.source_count ?? json.packet_count ?? json.total_candidates ?? "ok"})`,
    );
  }

  {
    const url = new URL(RUNTIME_MONITORING_ROUTE, BASE);
    url.searchParams.set("t", BUST);
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) {
      errors.push(`${RUNTIME_MONITORING_ROUTE}: HTTP ${res.status}`);
    } else {
      const json = await res.json();
      if (json.product_version && json.product_version !== VERSION) {
        errors.push(
          `${RUNTIME_MONITORING_ROUTE}: product_version ${json.product_version} != ${VERSION}`,
        );
      }
      if (json.backend_mvp !== "T086") {
        errors.push(`${RUNTIME_MONITORING_ROUTE}: backend_mvp must be T086`);
      }
      if (json.db_registry_alignment_status !== "aligned") {
        errors.push(
          `${RUNTIME_MONITORING_ROUTE}: db_registry_alignment_status must be aligned`,
        );
      }
      if ((json.automated_registry_row_count ?? 0) < 6) {
        errors.push(
          `${RUNTIME_MONITORING_ROUTE}: automated_registry_row_count must be >= 6`,
        );
      }
      if ((json.no_registry_fk_error_count ?? 1) !== 0) {
        errors.push(
          `${RUNTIME_MONITORING_ROUTE}: no_registry_fk_error_count must be 0`,
        );
      }
      if (json.worker_redeployed !== true) {
        errors.push(`${RUNTIME_MONITORING_ROUTE}: worker_redeployed must be true`);
      }
      if (json.cron_enabled === true) {
        errors.push(`${RUNTIME_MONITORING_ROUTE}: cron_enabled must be false`);
      }
      if (json.gates_closed !== true) {
        errors.push(`${RUNTIME_MONITORING_ROUTE}: gates_closed must be true`);
      }
      console.log(
        `  ${RUNTIME_MONITORING_ROUTE} ← ${url} (runs=${json.source_runs_count}, ok=${json.worker_run_source_success_count}, err=${json.worker_run_source_failure_count})`,
      );
    }
  }

  console.log("Live route smoke (T086)");
  console.log(`  base: ${BASE}`);
  console.log(`  cache bust: ${BUST}`);
  console.log(`  expected version: ${VERSION_LABEL}`);

  for (const route of ROUTES) {
    const { url, html } = await fetchHtml(route.path);
    console.log(`  ${route.path} ← ${url}`);
    const htmlTextNorm =
      route.path === "/" || route.path === "/tracker/"
        ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
        : html;
    for (const needle of route.mustInclude) {
      const haystack =
        needle.startsWith("/") && needle.endsWith("/") ? html : htmlTextNorm;
      if (!haystack.includes(needle)) {
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
    if (route.path === "/") {
      if (
        html.indexOf("T086 Six-Source Runtime DB Alignment") >
        html.indexOf("T085 Six-Source Worker Runtime Run")
      ) {
        errors.push(`${route.path}: T086 banner must appear before T085`);
      }
      if (
        html.indexOf("T085 Six-Source Worker Runtime Run") >
        html.indexOf("T084 Automated Source Expansion")
      ) {
        errors.push(`${route.path}: T085 banner must appear before T084`);
      }
      if (
        html.indexOf("T084 Automated Source Expansion") >
        html.indexOf("T083 Signal Quality")
      ) {
        errors.push(`${route.path}: T084 banner must appear before T083`);
      }
      if (
        html.indexOf("T083 Signal Quality") > html.indexOf("T082 Operator Decision Workflow")
      ) {
        errors.push(`${route.path}: T083 banner must appear before T082`);
      }
    }
    if (route.path === "/tracker/") {
      if (
        html.indexOf("Six-source runtime alignment (T086)") >
        html.indexOf("Six-source Worker run (T085)")
      ) {
        errors.push(`${route.path}: T086 section must appear before T085`);
      }
      if (
        html.indexOf("Six-source Worker run (T085)") >
        html.indexOf("Ingress filter dashboard (T084)")
      ) {
        errors.push(`${route.path}: T085 section must appear before T084`);
      }
      if (
        html.indexOf("Ingress filter dashboard (T084)") >
        html.indexOf("Signal quality dashboard (T083)")
      ) {
        errors.push(`${route.path}: T084 section must appear before T083`);
      }
      if (
        html.indexOf("Signal quality dashboard (T083)") >
        html.indexOf("Operator review pipeline (T082)")
      ) {
        errors.push(`${route.path}: T083 section must appear before T082`);
      }
      if (
        html.indexOf("Operator review pipeline (T082)") >
        html.indexOf("Coverage dashboard (T080)")
      ) {
        errors.push(`${route.path}: T082 section must appear before T080 coverage`);
      }
    }
  }

  if (errors.length) {
    console.error(`  FAIL: ${errors.length} issue(s)`);
    for (const e of errors) console.error(`    ✗ ${e}`);
    process.exit(1);
  }

  console.log(`  PASS: live routes match ${VERSION_LABEL} / T086 expectations\n`);
}

main().catch((err) => {
  console.error(`  FAIL: ${err.message}`);
  process.exit(1);
});
