class ContactFormController {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.submitButton = document.getElementById("submitButton");
    this.notification = document.getElementById("formNotification");
    this.isSubmitting = false;

    this.validationRules = {
      fullName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-ZğüşöçİĞÜŞÖÇəƏ\s]+$/,
        errorMessages: {
          required: "Ad və soyad daxil edin",
          minLength: "Ad və soyad ən azı 2 simvol olmalıdır",
          pattern: "Yalnız hərf daxil edin",
        },
      },
      emailAddress: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessages: {
          required: "Email daxil edin",
          pattern: "Düzgün email daxil edin",
        },
      },
      messageContent: {
        required: true,
        minLength: 10,
        errorMessages: {
          required: "Mesaj daxil edin",
          minLength: "Mesaj ən azı 10 simvol olmalıdır",
        },
      },
    };

    this.init();
  }

  init() {
    if (!this.form) return;
    this.bindEvents();
    this.setupRealTimeValidation();
  }

  bindEvents() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    const closeButton = this.notification?.querySelector(
      ".contact-form-notification__close"
    );
    if (closeButton) {
      closeButton.addEventListener("click", () => this.hideNotification());
    }
  }

  setupRealTimeValidation() {
    Object.keys(this.validationRules).forEach((fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      field.addEventListener("blur", () => {
        this.validateField(fieldName, field.value);
      });

      field.addEventListener("input", () => {
        if (field.classList.contains("contact-form__input--error")) {
          this.validateField(fieldName, field.value);
        }
      });
    });
  }

  validateField(fieldName, value) {
    const rules = this.validationRules[fieldName];
    if (!rules) return true;

    const field = this.form.querySelector(`[name="${fieldName}"]`);
    const errorElement = this.form.querySelector(`[data-error="${fieldName}"]`);

    if (rules.required && !value.trim()) {
      this.showFieldError(field, errorElement, rules.errorMessages.required);
      return false;
    }

    if (rules.minLength && value.trim().length < rules.minLength) {
      this.showFieldError(field, errorElement, rules.errorMessages.minLength);
      return false;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      this.showFieldError(field, errorElement, rules.errorMessages.pattern);
      return false;
    }

    this.clearFieldError(field, errorElement);
    return true;
  }

  showFieldError(field, errorElement, message) {
    field?.classList.add("contact-form__input--error");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("contact-form__error-message--visible");
    }
  }

  clearFieldError(field, errorElement) {
    field?.classList.remove("contact-form__input--error");
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("contact-form__error-message--visible");
    }
  }

  validateForm() {
    let isValid = true;

    Object.keys(this.validationRules).forEach((fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      const ok = this.validateField(fieldName, field.value);
      if (!ok) isValid = false;
    });

    return isValid;
  }

  async handleSubmit() {
    if (this.isSubmitting) return;

    if (!this.validateForm()) {
      this.showNotification(
        "Zəhmət olmasa bütün xanaları düzgün doldurun",
        "error"
      );
      return;
    }

    this.isSubmitting = true;
    this.setLoadingState(true);

    const formData = {
      fullName: this.form.fullName.value.trim(),
      emailAddress: this.form.emailAddress.value.trim(),
      companyName: this.form.companyName.value.trim(),
      serviceInterested: this.form.serviceInterested.value,
      messageContent: this.form.messageContent.value.trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
    };

    try {
      const response = await this.sendToBackend(formData);

      if (response.success) {
        this.showNotification(
          "Mesajınız uğurla göndərildi! Tezliklə sizinlə əlaqə saxlayacağıq.",
          "success"
        );
        this.form.reset();
        this.trackConversion(formData);
      } else {
        throw new Error(response.message || "Xəta baş verdi");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      this.showNotification(
        "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
        "error"
      );
    } finally {
      this.isSubmitting = false;
      this.setLoadingState(false);
    }
  }

  async sendToBackend(formData) {
   const BACKEND_URL = "http://localhost:3000/api/contact";

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  setLoadingState(loading) {
    if (!this.submitButton) return;

    if (loading) {
      this.submitButton.classList.add("contact-form__submit-button--loading");
      this.submitButton.disabled = true;
    } else {
      this.submitButton.classList.remove(
        "contact-form__submit-button--loading"
      );
      this.submitButton.disabled = false;
    }
  }

  showNotification(message, type = "success") {
    if (!this.notification) return;

    this.notification.className =
      "contact-form-notification contact-form-notification--visible";
    this.notification.classList.add(`contact-form-notification--${type}`);

    const messageElement = this.notification.querySelector(
      ".contact-form-notification__message"
    );
    if (messageElement) messageElement.textContent = message;

    setTimeout(() => this.hideNotification(), 5000);
  }

  hideNotification() {
    this.notification?.classList.remove("contact-form-notification--visible");
  }

  trackConversion(formData) {
    if (typeof gtag !== "undefined") {
      gtag("event", "form_submission", {
        event_category: "Contact",
        event_label: "Contact Form",
        value: 1,
      });
    }

    if (typeof fbq !== "undefined") {
      fbq("track", "Contact");
    }

    console.log("Conversion tracked:", formData);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = new ContactFormController("#contactForm");
  window.contactForm = contactForm;
});
