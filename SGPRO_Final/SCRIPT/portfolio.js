const faqItems = document.querySelectorAll(
  ".faq-question-item-container-wrapper"
);
const searchInput = document.querySelector(".search-input-field-element");

faqItems.forEach((item) => {
  const question = item.querySelector(".question-button-trigger-element");

  question.addEventListener("click", () => {
    const isActive = item.classList.contains("active-expanded-state");

    faqItems.forEach((otherItem) => {
      otherItem.classList.remove("active-expanded-state");
    });

    if (!isActive) {
      item.classList.add("active-expanded-state");

      item.style.animation = "none";
      setTimeout(() => {
        item.style.animation = "";
      }, 10);
    }
  });
});

searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  faqItems.forEach((item) => {
    const question = item
      .querySelector(".question-button-trigger-element")
      .textContent.toLowerCase();
    const answer = item
      .querySelector(".answer-text-inner-content-element")
      .textContent.toLowerCase();

    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
      item.style.display = "block";
      item.style.animation = "bounceIn 0.5s ease-out";
    } else {
      item.style.display = "none";
    }
  });
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
    }
  });
}, observerOptions);

faqItems.forEach((item) => {
  observer.observe(item);
});
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(
    ".faq-question-item-container-wrapper"
  );

  items.forEach((item) => {
    const btn = item.querySelector(".question-button-trigger-element");
    const answer = item.querySelector(".answer-content-collapsible-wrapper");

    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active-expanded-state");

      // istəsən hamısını bağla, sonra klik ediləni aç
      items.forEach((it) => {
        it.classList.remove("active-expanded-state");
        const ans = it.querySelector(".answer-content-collapsible-wrapper");
        ans.style.maxHeight = null;
      });

      // kliklənən item artıq aktiv deyildirsə – aç
      if (!isActive) {
        item.classList.add("active-expanded-state");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
});
