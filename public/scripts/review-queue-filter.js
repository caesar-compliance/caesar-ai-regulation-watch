/**
 * Filters for static review queue (no remote fetch, no write actions).
 */
function applyReviewQueueFilters(listEl) {
  const root = listEl.closest("[data-filter-page]") || document;
  const selects = root.querySelectorAll("select[data-filter-key]");
  const checkboxes = root.querySelectorAll("input[data-filter-flag]");
  const items = listEl.querySelectorAll("[data-filter-item]");

  const filters = {};
  selects.forEach((sel) => {
    const key = sel.getAttribute("data-filter-key");
    if (key) filters[key] = sel.value;
  });

  const flags = {};
  checkboxes.forEach((cb) => {
    const key = cb.getAttribute("data-filter-flag");
    if (key) flags[key] = cb.checked;
  });

  let visible = 0;
  items.forEach((item) => {
    let show = true;
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const attr = item.getAttribute(`data-${key}`);
      if (attr !== value) {
        show = false;
        break;
      }
    }
    if (show && flags.missingUrl) {
      if (item.getAttribute("data-missing-url") !== "true") show = false;
    }
    if (show && flags.unverified) {
      if (item.getAttribute("data-unverified") !== "true") show = false;
    }
    item.hidden = !show;
    if (show) visible += 1;
  });

  const countEl = root.querySelector("[data-filter-count]");
  if (countEl) {
    countEl.textContent = `${visible} of ${items.length} shown`;
  }
}

function initReviewQueueFilters() {
  document.querySelectorAll("[data-review-queue-list]").forEach((list) => {
    const root = list.closest("[data-filter-page]") || document;
    const handler = () => applyReviewQueueFilters(list);
    root.querySelectorAll("select[data-filter-key]").forEach((sel) => {
      sel.removeEventListener("change", sel._rqHandler);
      sel._rqHandler = handler;
      sel.addEventListener("change", sel._rqHandler);
    });
    root.querySelectorAll("input[data-filter-flag]").forEach((cb) => {
      cb.removeEventListener("change", cb._rqHandler);
      cb._rqHandler = handler;
      cb.addEventListener("change", cb._rqHandler);
    });
    applyReviewQueueFilters(list);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReviewQueueFilters);
} else {
  initReviewQueueFilters();
}
