require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const https = require("https");

const { initDb, insertLead } = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set("trust proxy", 1);

// Security
app.use(helmet());
app.use(express.json({ limit: "200kb" }));

// CORS (origin: * etmə — yalnız öz domenin)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      // Origin olmayan request-lərə (curl/postman) icazə
      if (!origin) return cb(null, true);

      if (allowedOrigins.length === 0) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("CORS blocked for origin: " + origin));
    },
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);

// Anti-spam rate limit
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çox tez-tez cəhd edirsiniz. Bir az sonra yenidən yoxlayın.",
  },
});

// DB
const db = initDb(process.env.SQLITE_PATH || "./leads.sqlite");

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helpers
function cleanText(v, max = 2000) {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, max);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return Promise.resolve(true);

  return new Promise((resolve) => {
    const postData = `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token || "")}`;

    const req = https.request(
      {
        hostname: "www.google.com",
        path: "/recaptcha/api/siteverify",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (resp) => {
        let data = "";
        resp.on("data", (chunk) => (data += chunk));
        resp.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(Boolean(json.success));
          } catch {
            resolve(false);
          }
        });
      }
    );

    req.on("error", () => resolve(false));
    req.write(postData);
    req.end();
  });
}

// Routes
app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * POST /api/contact
 * body: { fullName, emailAddress, companyName?, serviceInterested?, messageContent, recaptchaToken? }
 */
app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const fullName = cleanText(req.body.fullName, 120);
    const emailAddress = cleanText(req.body.emailAddress, 160);
    const companyName = cleanText(req.body.companyName || "N/A", 160);
    const serviceInterested = cleanText(req.body.serviceInterested || "N/A", 160);
    const messageContent = (req.body.messageContent || "").toString().trim();

    if (!fullName || !emailAddress || !messageContent) {
      return res
        .status(400)
        .json({ success: false, message: "Bütün məcburi xanaları doldurun." });
    }
    if (!isValidEmail(emailAddress)) {
      return res
        .status(400)
        .json({ success: false, message: "Düzgün email daxil edin." });
    }

    const okCaptcha = await verifyRecaptcha(req.body.recaptchaToken);
    if (!okCaptcha) {
      return res.status(400).json({ success: false, message: "reCAPTCHA təsdiqlənmədi." });
    }

    const createdAt = new Date().toISOString();
    const ip = req.ip || "";
    const userAgent = req.headers["user-agent"] || "";

    // Save lead to DB
    const leadId = await insertLead(db, {
      fullName,
      emailAddress,
      companyName,
      serviceInterested,
      messageContent: messageContent.slice(0, 5000),
      ip,
      userAgent,
      createdAt,
    });

    // Send email
    const subject = `Yeni Lead (#${leadId}): ${fullName}`;
    const safeMsg = messageContent
      .slice(0, 5000)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = `
      <div style="font-family:Arial;max-width:640px;margin:auto;padding:16px;">
        <h2 style="margin:0 0 12px;">🎉 Yeni Mesaj Alındı</h2>
        <p><b>ID:</b> ${leadId}</p>
        <p><b>Ad Soyad:</b> ${fullName}</p>
        <p><b>Email:</b> <a href="mailto:${emailAddress}">${emailAddress}</a></p>
        <p><b>Şirkət:</b> ${companyName}</p>
        <p><b>Xidmət:</b> ${serviceInterested}</p>
        <p><b>Mesaj:</b></p>
        <div style="white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px;">${safeMsg}</div>
        <hr style="margin:16px 0;border:none;border-top:1px solid #eee;">
        <p style="color:#666;font-size:12px;margin:0;">
          Tarix: ${createdAt}<br/>
          IP: ${ip}<br/>
          User-Agent: ${userAgent}
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "SGPRO Website Contact"}" <${process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: emailAddress,
      subject,
      html,
    });

    return res.json({ success: true, message: "Mesajınız uğurla göndərildi.", leadId });
  } catch (err) {
    console.error("CONTACT_ERROR:", err);
    return res.status(500).json({ success: false, message: "Server xətası. Yenidən cəhd edin." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SGPRO backend running on http://localhost:${PORT}`);
});
