// server.js – Google Gemini backend

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

// Gemini client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// və ya: const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });


app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  console.log("➡️ Gələn mesaj:", message);

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const result = await model.generateContent(message);
    const reply = result.response.text();

    console.log("⬅️ Gemini cavabı (ilk 80 simvol):", reply.slice(0, 80));
    res.json({ reply });
  } catch (error) {
    console.error("❌ Gemini API error:", error?.message || error);
    res
      .status(500)
      .json({
        error: "Gemini error",
        details: String(error?.message || error),
      });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI server http://localhost:${PORT} ünvanında işləyir`);
});
