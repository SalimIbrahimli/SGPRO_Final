document.addEventListener("DOMContentLoaded", () => {
  console.log("FAQ JS LOADED");

  const items = document.querySelectorAll(
    ".faq-question-item-container-wrapper"
  );
  const searchInput = document.querySelector(".search-input-field-element");

  // init: all closed + transition
  items.forEach((item) => {
    const panel = item.querySelector(".answer-content-collapsible-wrapper");
    if (!panel) return;

    panel.style.overflow = "hidden";
    panel.style.maxHeight = "0px";
    panel.style.transition = "max-height 0.45s ease";
  });

  const closeItem = (item) => {
    item.classList.remove("active-expanded-state");
    const panel = item.querySelector(".answer-content-collapsible-wrapper");
    if (panel) panel.style.maxHeight = "0px";
  };

  const openItem = (item) => {
    item.classList.add("active-expanded-state");
    const panel = item.querySelector(".answer-content-collapsible-wrapper");
    if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
  };

  // click handlers
  items.forEach((item) => {
    const btn = item.querySelector(".question-button-trigger-element");
    const panel = item.querySelector(".answer-content-collapsible-wrapper");
    if (!btn || !panel) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const isOpen = item.classList.contains("active-expanded-state");

      // accordion: close others
      items.forEach((it) => {
        if (it !== item) closeItem(it);
      });

      // toggle current
      if (isOpen) closeItem(item);
      else openItem(item);
    });
  });

  // search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      items.forEach((item) => {
        const q =
          item
            .querySelector(".question-button-trigger-element")
            ?.textContent?.toLowerCase() || "";
        const a =
          item
            .querySelector(".answer-text-inner-content-element")
            ?.textContent?.toLowerCase() || "";

        const match = q.includes(query) || a.includes(query);
        item.style.display = match ? "" : "none";

        // if hidden, close it
        if (!match) closeItem(item);
      });

      // keep open panel height correct
      const activePanel = document.querySelector(
        ".faq-question-item-container-wrapper.active-expanded-state .answer-content-collapsible-wrapper"
      );
      if (activePanel)
        activePanel.style.maxHeight = activePanel.scrollHeight + "px";
    });
  }

  // resize fix
  window.addEventListener("resize", () => {
    const activePanel = document.querySelector(
      ".faq-question-item-container-wrapper.active-expanded-state .answer-content-collapsible-wrapper"
    );
    if (activePanel)
      activePanel.style.maxHeight = activePanel.scrollHeight + "px";
  });
});
