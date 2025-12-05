// server.js – Google Gemini backend (Düzəldilmiş)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ENV yoxlaması
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY .env faylında tapılmadı!");
  process.exit(1);
}

console.log("✅ GEMINI_API_KEY tapıldı.");

// Gemini client - DÜZƏLDİLMİŞ MODEL ADI
const genAI = new GoogleGenerativeAI(apiKey);

// Doğru model adı: gemini-pro (və ya gemini-1.5-pro-latest)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
console.log("✅ Gemini model yükləndi: gemini-pro");

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("➡️ Gələn mesaj:", message);

    // Validasiya
    if (!message || typeof message !== "string") {
      console.error("❌ Mesaj düzgün deyil:", message);
      return res
        .status(400)
        .json({ error: "Mesaj tələb olunur və string olmalıdır" });
    }

    if (message.trim().length === 0) {
      console.error("❌ Boş mesaj göndərilib");
      return res.status(400).json({ error: "Boş mesaj göndərilə bilməz" });
    }

    // Gemini-dən cavab al
    console.log("🤖 Gemini-yə sorğu göndərilir...");
    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    console.log("⬅️ Gemini cavabı (ilk 100 simvol):", reply.slice(0, 100));

    res.json({ reply });
  } catch (error) {
    console.error("❌ Server xətası:", error);

    // Daha ətraflı xəta məlumatı
    const errorDetails = {
      message: error?.message || "Naməlum xəta",
      type: error?.constructor?.name || "Error",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    };

    console.error("Xəta detalları:", errorDetails);

    res.status(500).json({
      error: "Gemini API xətası",
      details: errorDetails.message,
      suggestion: "Gemini API key-in düzgündürmü? Model adı düzgündürmü?",
    });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend işləyir!",
    model: "gemini-pro",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "SG AI Backend",
    endpoints: {
      chat: "POST /api/chat",
      test: "GET /api/test",
    },
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI server http://localhost:${PORT} ünvanında işləyir`);
  console.log(`📝 Test üçün: http://localhost:${PORT}/api/test`);
});
