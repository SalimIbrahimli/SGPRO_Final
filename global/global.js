// ==== AI CHAT WIDGET (global.js) ====
document.addEventListener("DOMContentLoaded", () => {
  // Bəzi səhifələrdə widget olmaya da bilər – səhv atmasın deyə check edirik
  const widget = document.querySelector(".ai-chat-widget");
  if (!widget) return;

  const toggle = widget.querySelector(".ai-chat-toggle");
  const closeBtn = widget.querySelector(".ai-chat-close");
  const input = widget.querySelector(".ai-chat-footer input");
  const sendBtn = widget.querySelector(".ai-chat-footer button");
  const chatBody = widget.querySelector(".ai-chat-body");

  if (!toggle || !closeBtn || !input || !sendBtn || !chatBody) {
    console.warn("AI chat widget strukturu tam deyil.");
    return;
  }

  // Backend ünvanı (hal-hazırda lokalda işləyir)
  const API_URL = "http://localhost:3000/api/chat";

  // Mesaj əlavə etmək üçün helper
  function addMessage(text, role = "assistant") {
    const msg = document.createElement("div");
    msg.className = "chat-msg" + (role === "user" ? " user" : "");
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  // Açılışda ilk salam
  if (!chatBody.dataset.initialized) {
    addMessage(
      "Salam! Mən AzLand AI assistentiyəm. Mənə sual verə və ya səyahət planlaması üçün kömək istəyəsən. ✨"
    );
    chatBody.dataset.initialized = "true";
  }

  // CHAT AÇ / BAĞLA
  toggle.addEventListener("click", () => {
    widget.classList.toggle("open");
    if (widget.classList.contains("open")) {
      input.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    widget.classList.remove("open");
  });

  // Mesaj göndər funksiyası
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // İstifadəçi mesajı
    addMessage(text, "user");
    input.value = "";

    // "Yazır..." indikatoru
    const typingMsg = addMessage("AI yazır...", "assistant");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      typingMsg.textContent = data.reply || "Cavab ala bilmədim.";
    } catch (err) {
      console.error(err);
      typingMsg.textContent = "Xəta baş verdi. Bir az sonra yenidən yoxla.";
    }

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Button click
  sendBtn.addEventListener("click", sendMessage);

  // Enter ilə göndərmə
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
});
