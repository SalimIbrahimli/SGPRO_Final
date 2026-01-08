const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password",
  },
});

app.post("/send-email", async (req, res) => {
  const { fullName, emailAddress, companyName, serviceInterested, messageContent } = req.body;

  if (!fullName || !emailAddress || !messageContent) {
    return res.status(400).json({ success: false, message: "Bütün məcburi xanaları doldurun" });
  }

  const mailOptions = {
    from: '"Website Contact" <noreply@example.com>',
    to: "info@example.com",
    replyTo: emailAddress,
    subject: `Yeni mesaj: ${fullName}`,
    html: `
      <h2>Yeni mesaj alındı</h2>
      <p><strong>Ad Soyad:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${emailAddress}</p>
      <p><strong>Şirkət:</strong> ${companyName || "N/A"}</p>
      <p><strong>Xidmət:</strong> ${serviceInterested || "N/A"}</p>
      <p><strong>Mesaj:</strong></p>
      <p>${messageContent}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email uğurla göndərildi" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Email göndərilmədi" });
  }
});

app.listen(PORT, () => console.log(`Server ${PORT} portunda işləyir`));
