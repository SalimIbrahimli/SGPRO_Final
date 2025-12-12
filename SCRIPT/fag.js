document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(
    ".faq-question-item-container-wrapper"
  );

  items.forEach((item) => {
    const btn = item.querySelector(".question-button-trigger-element");
    const panel = item.querySelector(".answer-content-collapsible-wrapper");

    if (!btn || !panel) return;

    // Başlanğıcda panel bağlı olsun
    panel.style.maxHeight = "0px";

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("active-expanded-state");

      // Hamısını bağla
      items.forEach((it) => {
        it.classList.remove("active-expanded-state");
        const p = it.querySelector(".answer-content-collapsible-wrapper");
        if (p) p.style.maxHeight = "0px";
      });

      // Əgər bağlı idisə, aç
      if (!isOpen) {
        item.classList.add("active-expanded-state");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // Search funksiyası
  const searchInput = document.querySelector(".search-input-field-element");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      items.forEach((item) => {
        const question =
          item
            .querySelector(".question-button-trigger-element")
            ?.textContent?.toLowerCase() || "";
        const answer =
          item
            .querySelector(".answer-text-inner-content-element")
            ?.textContent?.toLowerCase() || "";

        if (question.includes(query) || answer.includes(query)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(
    ".faq-question-item-container-wrapper"
  );

  items.forEach((item) => {
    const btn = item.querySelector(".question-button-trigger-element");
    const panel = item.querySelector(".answer-content-collapsible-wrapper");

    if (!btn || !panel) return;

    // başlanğıcda bağlı
    panel.style.maxHeight = "0px";

    btn.addEventListener("click", () => {
      const isOpen = panel.style.maxHeight !== "0px";

      // hamısını bağla
      items.forEach((i) => {
        const p = i.querySelector(".answer-content-collapsible-wrapper");
        if (p) p.style.maxHeight = "0px";
      });

      // yalnız klik olunanı aç
      if (!isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
});
