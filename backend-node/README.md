# SGPRO Node.js Backend (Contact Form)

Bu backend `/api/contact` endpoint-i ilə contact form mesajlarını:
1) Email kimi göndərir (SMTP ilə)
2) SQLite bazada lead kimi saxlayır

## Quraşdırma
```bash
cd backend-node
npm install
cp .env.example .env
# .env içində SMTP və MAIL_TO məlumatlarını doldur
npm run dev
```

## Test
- Health: `GET http://localhost:3000/health`
- Contact: `POST http://localhost:3000/api/contact` (JSON)

## Frontend əlaqə
Saytda `SCRIPT/contact.js` artıq `window.SGPRO_API_BASE` dəyişəni ilə işləyir.

- Eyni domen + reverse proxy istifadə edəcəksənsə:
  `global/global.js` içində `window.SGPRO_API_BASE = ""` saxla.
  Frontend `/api/contact`-ə gedəcək.

- Backend ayrı subdomaindədirsə (məs: https://api.sgpro.az):
  `global/global.js` içində:
  `window.SGPRO_API_BASE = "https://api.sgpro.az";`
