// ==== AI CHAT WIDGET (global.js) ====
document.addEventListener("DOMContentLoaded", () => {
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

  const API_URL = "http://localhost:3000/api/chat";

  // Mesaj əlavə etmək üçün helper (HTML dəstəyi)
  function addMessage(text, role = "assistant") {
    const msg = document.createElement("div");
    msg.className = "chat-msg" + (role === "user" ? " user" : "");
    msg.innerHTML = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  // Açılış salamı
  if (!chatBody.dataset.initialized) {
    addMessage(
      `
      <div class="ai-welcome-box">
        <strong>✨ Salam! Mən <span style="color:#d8b4ff;">AzLand AI</span> assistentiyəm.</strong><br><br>
        Sizə marşrut, turlar, qiymətlər və səyahət planlaması ilə bağlı kömək edə bilərəm.<br>
        Sualınızı yazmağa başlaya bilərsiniz. 🌟
      </div>
    `,
      "assistant"
    );
    chatBody.dataset.initialized = "true";
  }

  // Aç / bağla
  toggle.addEventListener("click", () => {
    widget.classList.toggle("open");
    if (widget.classList.contains("open")) {
      input.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    widget.classList.remove("open");
  });

  // Mesaj göndər
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // İstifadəçi mesajı
    addMessage(text, "user");
    input.value = "";

    // "AI yazır..." indikatoru
    const typingMsg = addMessage("AI yazır...", "assistant");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Server error:", res.status, errText);
        throw new Error("Server error " + res.status);
      }

      const data = await res.json();
      typingMsg.textContent = data.reply || "Cavab ala bilmədim.";
    } catch (err) {
      console.error("Fetch/Gemini error:", err);
      typingMsg.textContent = "Xəta baş verdi. Bir az sonra yenidən yoxla.";
    }

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
});
