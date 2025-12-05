// server.js — Google Gemini üçün hazır backend

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Google AI Studio açarı .env faylındadır
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini modeli
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mesaj tapılmadı" });
  }

  try {
    const result = await model.generateContent(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "AI cavabı alınmadı" });
  }
});

// Server işə düşür
app.listen(3000, () => {
  console.log("AI server http://localhost:3000 ünvanında işləyir");
});
