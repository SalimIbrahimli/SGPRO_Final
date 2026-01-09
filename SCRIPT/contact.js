const EMAILJS_CONFIG = {
  SERVICE_ID: "service_20pc38c", // ← EmailJS-dən Service ID
  TEMPLATE_ID: "template_6wqnb15", // ← EmailJS-dən Template ID
  PUBLIC_KEY: "tOylK2iNEjK1hlaTT", // ← EmailJS-dən Public Key
};

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
      companyName: { required: false },
      serviceInterested: { required: false },
    };

    this.init();
  }

  init() {
    if (!this.form) {
      console.error("❌ Form tapılmadı!");
      return;
    }

    if (typeof emailjs !== "undefined") {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log("✅ EmailJS yükləndi");
    } else {
      console.error("❌ EmailJS yüklənmədi!");
    }

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

      const rules = this.validationRules[fieldName];
      const hasRules = rules?.required || rules?.minLength || rules?.pattern;
      if (!hasRules) return;

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

    if (rules.required && !String(value || "").trim()) {
      this.showFieldError(field, errorElement, rules.errorMessages?.required);
      return false;
    }

    if (
      rules.minLength &&
      String(value || "").trim().length < rules.minLength
    ) {
      this.showFieldError(field, errorElement, rules.errorMessages?.minLength);
      return false;
    }

    if (rules.pattern && !rules.pattern.test(String(value || ""))) {
      this.showFieldError(field, errorElement, rules.errorMessages?.pattern);
      return false;
    }

    this.clearFieldError(field, errorElement);
    return true;
  }

  showFieldError(field, errorElement, message) {
    field?.classList.add("contact-form__input--error");
    if (errorElement) {
      errorElement.textContent = message || "Xəta";
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
      const rules = this.validationRules[fieldName];
      const hasRules = rules?.required || rules?.minLength || rules?.pattern;
      if (!hasRules) return;

      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      const ok = this.validateField(fieldName, field.value);
      if (!ok) isValid = false;
    });
    return isValid;
  }

  handleSubmit() {
    if (this.isSubmitting) return;

    if (!this.validateForm()) {
      this.showNotification(
        "Zəhmət olmasa bütün xanaları düzgün doldurun",
        "error"
      );
      return;
    }

    if (typeof emailjs === "undefined") {
      console.error("❌ EmailJS yüklənməyib!");
      this.showNotification("Texniki xəta. Yenidən cəhd edin.", "error");
      return;
    }

    this.isSubmitting = true;
    this.setLoadingState(true);

    const formData = {
      user_name: this.form.querySelector('[name="fullName"]')?.value || "",
      user_email: this.form.querySelector('[name="emailAddress"]')?.value || "",
      company:
        this.form.querySelector('[name="companyName"]')?.value ||
        "Qeyd edilməyib",
      service:
        this.form.querySelector('[name="serviceInterested"]')?.value ||
        "Qeyd edilməyib",
      message: this.form.querySelector('[name="messageContent"]')?.value || "",
    };

    console.log("📤 Email göndərilir...", formData);

    emailjs
      .send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        formData,
        EMAILJS_CONFIG.PUBLIC_KEY
      )
      .then((response) => {
        console.log("✅ Email göndərildi:", response.status);
        this.showNotification(
          "Mesajınız uğurla göndərildi! Tezliklə əlaqə saxlayacağıq.",
          "success"
        );
        this.form.reset();
        Object.keys(this.validationRules).forEach((fieldName) => {
          const field = this.form.querySelector(`[name="${fieldName}"]`);
          const errorElement = this.form.querySelector(
            `[data-error="${fieldName}"]`
          );
          if (field && errorElement) {
            this.clearFieldError(field, errorElement);
          }
        });
      })
      .catch((error) => {
        console.error("❌ EmailJS xətası:", error);
        this.showNotification(
          "Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.",
          "error"
        );
      })
      .finally(() => {
        this.isSubmitting = false;
        this.setLoadingState(false);
      });
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
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 SGPRO Contact Form yükləndi");
  const contactForm = new ContactFormController("#contactForm");
  window.contactForm = contactForm;
});
