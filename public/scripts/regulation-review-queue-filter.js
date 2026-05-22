(function () {
  function matchesFilters(item, filters) {
    if (filters.priority && item.dataset.priority !== filters.priority) return false;
    if (filters.status && item.dataset.status !== filters.status) return false;
    if (filters.jurisdiction && item.dataset.jurisdiction !== filters.jurisdiction)
      return false;
    if (filters.source && item.dataset.source !== filters.source) return false;
    if (filters.hasDecision && item.dataset.hasDecision !== filters.hasDecision)
      return false;
    if (filters.relevance && item.dataset.relevance !== filters.relevance) return false;
    if (filters.signalCategory && item.dataset.signalCategory !== filters.signalCategory)
      return false;
    if (filters.recommendedAction && item.dataset.recommendedAction !== filters.recommendedAction)
      return false;
    if (filters.topic) {
      const topics = (item.dataset.topic || "").split(/\s+/);
      if (!topics.includes(filters.topic)) return false;
    }
    return true;
  }

  function init(page) {
    const list = page.querySelector("[data-regulation-review-queue-list]");
    if (!list) return;
    const items = [...list.querySelectorAll("[data-filter-item]")];
    const countEl = page.querySelector("[data-filter-count]");
    const selects = page.querySelectorAll("[data-filter-key]");

    function apply() {
      const filters = {};
      selects.forEach((sel) => {
        const key = sel.getAttribute("data-filter-key");
        if (sel.value) filters[key] = sel.value;
      });
      let visible = 0;
      items.forEach((item) => {
        const show = matchesFilters(item, filters);
        item.hidden = !show;
        if (show) visible += 1;
      });
      if (countEl) {
        countEl.textContent = `Showing ${visible} of ${items.length} candidate(s)`;
      }
    }

    selects.forEach((sel) => sel.addEventListener("change", apply));
    apply();
  }

  document.querySelectorAll("[data-filter-page]").forEach(init);

  document.querySelectorAll("[data-noise-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-noise-target");
      const panel = document.querySelector(`[data-noise-panel="${target}"]`);
      if (!panel) return;
      const hidden = panel.hasAttribute("hidden");
      if (hidden) {
        panel.removeAttribute("hidden");
        btn.textContent = btn.getAttribute("data-label-hide") || "Hide noise";
      } else {
        panel.setAttribute("hidden", "");
        btn.textContent = btn.getAttribute("data-label-show") || "Show noise";
      }
    });
  });
})();
