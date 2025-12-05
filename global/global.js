// ==== AI ÇAT VİDCETİ (global.js) ====
document.addEventListener("DOMContentLoaded", () => {
  const widget = document.querySelector(".ai-chat-widget");
  if (!widget) {
    console.warn("AI çat vidceti tapılmadı.");
    return;
  }

  const toggle = widget.querySelector(".ai-chat-toggle");
  const closeBtn = widget.querySelector(".ai-chat-close");
  const input = widget.querySelector(".ai-chat-footer input");
  const sendBtn = widget.querySelector(".ai-chat-footer button");
  const chatBody = widget.querySelector(".ai-chat-body");

  if (!toggle || !closeBtn || !input || !sendBtn || !chatBody) {
    console.warn("AI çat vidceti strukturu tam deyil.");
    console.log("toggle:", toggle);
    console.log("closeBtn:", closeBtn);
    console.log("input:", input);
    console.log("sendBtn:", sendBtn);
    console.log("chatBody:", chatBody);
    return;
  }

  // Backend URL - əgər production-da başqa port/domain olarsa dəyişdirin
  const API_URL = "http://localhost:3000/api/chat";

  console.log("✅ AI Çat vidceti yükləndi. API URL:", API_URL);

  // Mesaj əlavə etmək üçün köməkçi funksiya (HTML dəstəyi ilə)
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
        <strong>✨ Salam! Mən <span style="color:#d8b4ff;">SG AI</span> assistentiyəm.</strong><br><br>
        Sizə kömək edə bilərəm. Sualınızı yazın! 🌟
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
      console.log("Çat açıldı");
    } else {
      console.log("Çat bağlandı");
    }
  });

  closeBtn.addEventListener("click", () => {
    widget.classList.remove("open");
    console.log("Çat bağlandı (bağla düyməsi)");
  });

  // Mesaj göndər
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) {
      console.warn("Boş mesaj göndərilə bilməz");
      return;
    }

    console.log("📤 Mesaj göndərilir:", text);

    // İstifadəçi mesajı
    addMessage(text, "user");
    input.value = "";

    // "AI yazır..." göstəricisi
    const typingMsg = addMessage("AI yazır...", "assistant");

    try {
      console.log("🔄 Sorğu başladı:", API_URL);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      console.log("📥 Cavab alındı. Status:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Server xətası:", res.status, errText);
        throw new Error(`Server xətası ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log("✅ Cavab məlumatı:", data);

      typingMsg.textContent = data.reply || "Cavab ala bilmədim.";
    } catch (err) {
      console.error("❌ Sorğu/Gemini xətası:", err);

      // Daha detallı xəta mesajı
      let errorMsg = "Xəta baş verdi. ";

      if (err.message.includes("Failed to fetch")) {
        errorMsg +=
          "Backend serverə qoşula bilmirəm. Server işləyir? (http://localhost:3000)";
      } else if (err.message.includes("CORS")) {
        errorMsg += "CORS xətası. Backend CORS konfiqurasiyasını yoxlayın.";
      } else {
        errorMsg += err.message;
      }

      typingMsg.textContent = errorMsg;
    }

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  sendBtn.addEventListener("click", () => {
    console.log("📨 Göndər düyməsi basıldı");
    sendMessage();
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("⌨️ Enter basıldı");
      sendMessage();
    }
  });

  // Test üçün - vidcet yüklənəndə konsola yaz
  console.log("✅ AI Çat vidceti tam yükləndi və hazırdır!");
});
