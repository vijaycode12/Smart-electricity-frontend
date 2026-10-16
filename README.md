# WattTrack — Smart Electricity Tracker

A full-stack web app to track your electricity usage. Upload your electricity bill, add your home appliances, and see how much power you use, what your next bill may cost, and how you can save.

**Live app:** https://watttrack-five.vercel.app

| Part | Repository |
| --- | --- |
| Frontend | https://github.com/vijaycode12/Smart-electricity-frontend |
| Backend | https://github.com/vijaycode12/Smart-electricity-backend |

---

## Features

- Sign up and log in securely
- **Upload a bill photo or PDF** — the app reads the units and amount automatically (OCR)
- Add bills manually
- Add home appliances to see how many units each one uses
- Dashboard with monthly usage
- Prediction of your next bill
- Energy efficiency score
- Alerts when your usage suddenly increases
- Tips to reduce your electricity usage
- Profile page to update your details

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Bill reading (OCR):** Tesseract.js
- **Hosting:** Vercel (frontend), Render (backend)

## Project Structure

```
Smart-electricity-frontend/    # Frontend
└── src/
    ├── pages/                 # Dashboard, Bills, Appliances, Analytics, Profile
    ├── components/            # Reusable UI parts
    ├── api/                   # Backend API calls
    └── App.jsx

Smart-electricity-backend/     # Backend
├── controllers/               # Logic for each feature
├── models/                    # Database schemas
├── routes/                    # API routes
├── middleware/                # Auth, file upload, error handling
├── utils/                     # Bill reading (OCR)
└── app.js                     # Server entry point
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/sign-up` | Create an account |
| POST | `/api/v1/auth/log-in` | Log in |
| PUT | `/api/v1/auth/profile` | Update profile |
| GET / POST | `/api/v1/bill/bills` | Get or add bills |
| POST | `/api/v1/bill/upload` | Upload a bill (image / PDF) |
| GET / POST | `/api/v1/appliance/appliances` | Get or add appliances |
| GET | `/api/v1/analytics/analytics/monthly-usage` | Monthly usage |
| GET | `/api/v1/analytics/analytics/predictions` | Next bill prediction |
| GET | `/api/v1/analytics/analytics/eff-score` | Efficiency score |

## How to Run Locally

### Backend

```bash
git clone https://github.com/vijaycode12/Smart-electricity-backend.git
cd Smart-electricity-backend
npm install
```

Create a file named `.env.development.local`:

```env
PORT=4000
NODE_ENV=development
DB_URL=your_mongodb_url
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
ARCJET_KEY=your_arcjet_key
```

Start the server:

```bash
npm run dev
```

> To upload PDF bills, install **Poppler** on your computer. Image uploads work without it.

### Frontend

```bash
git clone https://github.com/vijaycode12/Smart-electricity-frontend.git
cd Smart-electricity-frontend
npm install
npm run dev
```

Open http://localhost:5173.

To use your local backend, change `BASE_URL` in `src/api/index.js` to `http://localhost:4000`.

## Future Improvements

- Let users check and edit the bill details read by OCR before saving
- More accurate bill prediction using electricity tariff slabs
- Mobile-friendly layout
