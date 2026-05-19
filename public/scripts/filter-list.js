/**
 * Simple client-side filters for static list pages (no remote fetch).
 */
function applyFilters(listEl) {
  const root = listEl.closest("[data-filter-page]") || document;
  const selects = root.querySelectorAll("select[data-filter-key]");
  const items = listEl.querySelectorAll("[data-filter-item]");

  const filters = {};
  selects.forEach((sel) => {
    const key = sel.getAttribute("data-filter-key");
    if (key) filters[key] = sel.value;
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
    item.hidden = !show;
    if (show) visible += 1;
  });

  const countEl = root.querySelector("[data-filter-count]");
  if (countEl) {
    countEl.textContent = `${visible} of ${items.length} shown`;
  }
}

function initFilterLists() {
  document.querySelectorAll("[data-filter-list]").forEach((list) => {
    const root = list.closest("[data-filter-page]") || document;
    root.querySelectorAll("select[data-filter-key]").forEach((sel) => {
      sel.removeEventListener("change", sel._filterHandler);
      sel._filterHandler = () => applyFilters(list);
      sel.addEventListener("change", sel._filterHandler);
    });
    applyFilters(list);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFilterLists);
} else {
  initFilterLists();
}
