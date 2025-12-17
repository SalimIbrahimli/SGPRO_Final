// script.js

class LanguageSwitcherController {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);

    if (!this.container) {
      console.error(`Container ${containerSelector} not found`);
      return;
    }

    this.trigger = this.container.querySelector("#languageSwitcherTrigger");
    this.dropdown = this.container.querySelector("#languageSwitcherDropdown");
    this.languageButtons = this.container.querySelectorAll(
      ".language-switcher-dropdown__button"
    );
    this.isOpen = false;
    this.currentLanguage = null;
    this.closeTimeout = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setInitialState();
    this.setupAccessibility();
  }

  bindEvents() {
    // Toggle dropdown
    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Language selection
    this.languageButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleLanguageSelection(e.currentTarget);
      });
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closeDropdown();
        this.trigger.focus();
      }
    });

    // Arrow key navigation within dropdown
    this.dropdown.addEventListener("keydown", (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  setupAccessibility() {
    this.dropdown.setAttribute("role", "menu");
    this.dropdown.setAttribute("aria-label", "Language selection menu");

    this.languageButtons.forEach((button, index) => {
      button.setAttribute("id", `lang-option-${index}`);
    });
  }

  setInitialState() {
    const activeItem = this.container.querySelector(
      ".language-switcher-dropdown__item--active"
    );
    if (activeItem) {
      const button = activeItem.querySelector(
        ".language-switcher-dropdown__button"
      );
      const langCode = button.dataset.lang;
      const countryCode = button.dataset.code;
      this.currentLanguage = langCode;
      this.updateTriggerText(countryCode, langCode.toUpperCase());
    }
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.isOpen = true;
    this.trigger.setAttribute("aria-expanded", "true");
    this.dropdown.classList.add("language-switcher-dropdown--active");
    this.dropdown.setAttribute("aria-hidden", "false");

    const activeButton = this.dropdown.querySelector(
      ".language-switcher-dropdown__item--active .language-switcher-dropdown__button"
    );
    const targetButton =
      activeButton ||
      this.dropdown.querySelector(".language-switcher-dropdown__button");

    setTimeout(() => {
      if (targetButton) {
        targetButton.focus();
      }
    }, 100);
  }

  closeDropdown() {
    this.isOpen = false;
    this.trigger.setAttribute("aria-expanded", "false");
    this.dropdown.classList.remove("language-switcher-dropdown--active");
    this.dropdown.setAttribute("aria-hidden", "true");
  }

  handleLanguageSelection(button) {
    const langCode = button.dataset.lang;
    const countryCode = button.dataset.code;
    const label = button.querySelector(
      ".language-switcher-dropdown__label"
    ).textContent;

    if (this.currentLanguage === langCode) {
      this.closeDropdown();
      this.trigger.focus();
      return;
    }

    this.container.classList.add("language-switcher-container--loading");

    setTimeout(() => {
      this.container
        .querySelectorAll(".language-switcher-dropdown__item")
        .forEach((item) => {
          item.classList.remove("language-switcher-dropdown__item--active");
        });

      button
        .closest(".language-switcher-dropdown__item")
        .classList.add("language-switcher-dropdown__item--active");

      this.currentLanguage = langCode;
      this.updateTriggerText(countryCode, langCode.toUpperCase());
      this.container.classList.remove("language-switcher-container--loading");
      this.closeDropdown();
      this.dispatchLanguageChangeEvent(langCode, countryCode, label);
      this.trigger.focus();

      console.log(`Dil dəyişdirildi: ${label}`);
    }, 300);
  }

  updateTriggerText(code, lang) {
    const codeElement = this.trigger.querySelector(
      ".language-switcher-trigger__code"
    );
    const labelElement = this.trigger.querySelector(
      ".language-switcher-trigger__label"
    );

    if (codeElement) {
      codeElement.textContent = code;
    }

    if (labelElement) {
      labelElement.textContent = lang;
    }
  }

  handleKeyboardNavigation(e) {
    const focusableButtons = Array.from(this.languageButtons);
    const currentIndex = focusableButtons.indexOf(document.activeElement);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % focusableButtons.length;
        focusableButtons[nextIndex].focus();
        break;

      case "ArrowUp":
        e.preventDefault();
        const prevIndex =
          currentIndex === 0 ? focusableButtons.length - 1 : currentIndex - 1;
        focusableButtons[prevIndex].focus();
        break;

      case "Home":
        e.preventDefault();
        focusableButtons[0].focus();
        break;

      case "End":
        e.preventDefault();
        focusableButtons[focusableButtons.length - 1].focus();
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (
          document.activeElement.classList.contains(
            "language-switcher-dropdown__button"
          )
        ) {
          this.handleLanguageSelection(document.activeElement);
        }
        break;
    }
  }

  dispatchLanguageChangeEvent(langCode, countryCode, label) {
    const event = new CustomEvent("languagechange", {
      detail: {
        language: langCode,
        country: countryCode,
        label: label,
        timestamp: new Date().toISOString(),
        previousLanguage: this.currentLanguage,
      },
      bubbles: true,
      cancelable: false,
    });
    this.container.dispatchEvent(event);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  setLanguage(langCode) {
    const button = Array.from(this.languageButtons).find(
      (btn) => btn.dataset.lang === langCode
    );

    if (button) {
      this.handleLanguageSelection(button);
    } else {
      console.warn(`Dil kodu ${langCode} tapılmadı`);
    }
  }

  disable() {
    this.trigger.disabled = true;
    this.closeDropdown();
  }

  enable() {
    this.trigger.disabled = false;
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const languageSwitcher = new LanguageSwitcherController(
    ".language-switcher-container"
  );

  // Make globally accessible
  window.languageSwitcher = languageSwitcher;

  // Listen for language change events
  const container = document.querySelector(".language-switcher-container");

  if (container) {
    container.addEventListener("languagechange", (e) => {
      console.log("Language Change Event:", e.detail);

      // Save to localStorage
      localStorage.setItem("preferredLanguage", e.detail.language);
      localStorage.setItem("preferredCountry", e.detail.country);
    });
  }
});
