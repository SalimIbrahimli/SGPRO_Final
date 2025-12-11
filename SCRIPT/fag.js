// FAQ səhifəsi üçün təmiz accordion + optional search

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(
    ".faq-question-item-container-wrapper"
  );
  const searchInput = document.querySelector(".search-input-field-element");

  // 🔹 Sualları aç / bağla
  items.forEach((item) => {
    const btn = item.querySelector(".question-button-trigger-element");
    const answer = item.querySelector(".answer-content-collapsible-wrapper");

    if (!btn || !answer) return;

    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active-expanded-state");

      // əvvəl hamısını bağla
      items.forEach((it) => {
        it.classList.remove("active-expanded-state");
        const ans = it.querySelector(".answer-content-collapsible-wrapper");
        if (ans) ans.style.maxHeight = null;
      });

      // bu item aktiv deyildirsə → aç
      if (!isActive) {
        item.classList.add("active-expanded-state");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // 🔹 Axtarış (istəsən, istifadə elə, istəməsən toxunma)
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();

      items.forEach((item) => {
        const qEl = item.querySelector(".question-button-trigger-element");
        const aEl = item.querySelector(".answer-text-inner-content-element");

        const q = qEl ? qEl.textContent.toLowerCase() : "";
        const a = aEl ? aEl.textContent.toLowerCase() : "";

        if (!query || q.includes(query) || a.includes(query)) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
});
