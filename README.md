# WattTrack — Smart Electricity Tracker

**Stop guessing your electricity bill.** WattTrack is a full-stack app that lets you upload or enter your electricity bills, list the appliances in your home, and see where your units go — with monthly trends, a next-bill forecast, an efficiency score, spike alerts and saving tips.

Bills can be **uploaded as an image or PDF** — the server reads them with **Tesseract OCR** and fills in units, amount, billing dates and cost per unit automatically.

- **Frontend:** React 19 + Vite, hand-written CSS, React Context
- **Backend:** Node.js, Express and MongoDB (Mongoose), JWT auth, Multer + Tesseract.js OCR, Arcjet

**Live app:** https://watttrack-five.vercel.app

| Part | Repository |
| --- | --- |
| Frontend | https://github.com/vijaycode12/Smart-electricity-frontend |
| Backend | https://github.com/vijaycode12/Smart-electricity-backend |

![React](https://img.shields.io/badge/React%2019-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Tesseract](https://img.shields.io/badge/OCR-Tesseract.js-blue)

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Data models](#data-models)
- [API reference](#api-reference)
- [How the OCR works](#how-the-ocr-works)
- [Getting started](#getting-started)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Features

### Landing page
- Hero section, "What it does" feature grid and call-to-action
- Login and sign-up in a modal — no page reload

### Dashboard
- Stat cards: total bills, latest usage (kWh and ₹), predicted next units, efficiency score
- Monthly usage overview, latest alerts and saving suggestions

### Bills
- **Upload a bill (JPG, PNG or PDF)** — OCR extracts units, amount, dates and cost per unit
- **Add a bill manually** — missing values are calculated (days from dates, amount from units × rate, or rate from amount ÷ units)
- Bill history with delete

### Appliances
- Add an appliance with power (watts), hours per day and days — days default to your latest bill's billing period
- Add several of the same appliance at once (e.g. 3 fans), each with its own wattage and hours
- Estimated units: `watts × hours/day × days ÷ 1000`
- Edit, delete, and a built-in power reference for common appliances

### Analytics
- Monthly units and amount chart
- Appliance breakdown with share of total consumption
- Next-bill prediction (units and ₹) from your billing average
- Efficiency score gauge (0–100) based on average monthly units
- Alerts when usage or amount jumps more than 20 % over the previous bill
- Suggestions for appliances above 1500 W or running more than 10 h/day

### Profile and app-wide
- Update username and email, change password, account summary
- Light and dark theme (remembered between visits)
- Toast notifications for every action
- Session kept across reloads (token in `localStorage`, verified on start-up)

### Security
- bcrypt-hashed passwords, JWT sent as `Authorization: Bearer <token>`
- Arcjet shield, bot detection (production) and token-bucket rate limiting
- CORS allow-list; users can only read and change their own bills and appliances
- Upload filter: only PDF, JPG and PNG

## Architecture

```
┌────────────────────────────┐     fetch + Bearer token      ┌────────────────────────────┐
│  Frontend (Vercel)         │ ────────────────────────────► │  Backend API (Render)      │
│  React 19 · Vite           │ ◄────────── JSON ──────────── │  Express · Arcjet · JWT    │
│  Auth / Theme / Toast      │                               │  Multer → Tesseract OCR    │
│  Context                   │   multipart/form-data (bill)  │  (Poppler for PDFs)        │
└────────────────────────────┘ ────────────────────────────► └──────────────┬─────────────┘
                                                                            │
                                                                            ▼
                                                                     MongoDB Atlas
                                                               (users, bills, appliances)
```

### Frontend flow

```
App
 └─ ThemeProvider → AuthProvider → ToastProvider
      └─ AppInner
           ├─ checking token … → <Loader />
           ├─ no user          → <HomePage />  (AuthModal for login / sign-up)
           └─ user             → <Layout />    (Sidebar + Dashboard | Bills | Appliances | Analytics | Profile)
```

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19 (function components and hooks), Vite |
| Styling | Hand-written CSS with CSS variables for theming; custom SVG charts and icons |
| Client state | React Context — `AuthContext`, `ThemeContext`, `ToastContext` |
| Backend | Node.js (ES modules), Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| File upload | Multer (disk storage) |
| OCR | Tesseract.js (bundled `eng.traineddata`), Poppler `pdftoppm` for PDFs |
| Security | Arcjet, CORS |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas |

## Project structure

### Frontend — `Smart-electricity-frontend`

```
src/
├── api/index.js            # BASE_URL + fetch wrapper: get / post / put / delete / upload
├── components/             # AuthModal, Layout, Sidebar, StatCard, Modal, Btn, Loader, Icon
├── context/                # AuthContext, ThemeContext, ToastContext
├── pages/                  # HomePage, Dashboard, BillsPage, AppliancesPage, AnalyticsPage, ProfilePage
├── styles/                 # global.css + components/*.css + pages/*.css
├── App.jsx
└── main.jsx
```

### Backend — `Smart-electricity-backend`

```
Smart-electricity-backend/
├── app.js                        # Express app: CORS, middleware, routes, server start
├── config/                       # env.js, arcjet.js
├── controllers/
│   ├── auth.controller.js        # signUp, logIn, signOut, getMe, updateProfile
│   ├── bill.controller.js        # addBills, getBills, getBill, deleteBill, uploadBill
│   ├── appliance.controller.js   # add, list, update, delete
│   └── analytics.controller.js   # monthly, breakdown, predictions, suggestions, alerts, score
├── database/mongodb.js
├── middleware/                   # auth (protect), upload (Multer), arcjet, error
├── models/                       # user, bill, appliance, analytics
├── routes/                       # auth, bill, appliance, analytics
├── utils/extractBillData.js      # OCR + text parsing
├── upload/bills/                 # Uploaded bill files
└── eng.traineddata               # Tesseract English model
```

## Data models

| Model | Fields |
| --- | --- |
| **User** | `username` (2–20), `email` (unique), `password` (bcrypt hash), timestamps |
| **Bill** | `user`, `billStartDate`, `billEndDate`, `totalDays`, `totalUnits` *(required)*, `costPerUnit`, `totalAmount`, `billFile`, timestamps |
| **Appliance** | `user`, `name`, `voltage` *(power in watts)*, `hoursPerDay`, `days`, `unitsConsumed`, timestamps |
| **Analytics** | `user`, `month`, `totalUnits`, `totalCost`, `highestUsageAppliance`, `suggestions[]` *(reserved)* |

> The appliance field is named `voltage` but stores the appliance's **power in watts**.

## API reference

Base URL: `/api/v1`. ✔ = needs `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/sign-up` | — | `username, email, password` | Create an account → `token`, `user` |
| `POST` | `/auth/log-in` | — | `email, password` | Log in → `token`, `user` |
| `POST` | `/auth/sign-out` | — | — | Client deletes the token |
| `GET` | `/auth/me` | ✔ | — | Current user |
| `PUT` | `/auth/profile` | ✔ | `username?, email?, currentPassword?, newPassword?` | Update profile / password |

### Bills

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/bill/bills` | ✔ | Add a bill manually |
| `GET` | `/bill/bills` | ✔ | List your bills (newest first) |
| `GET` | `/bill/bills/:id` | ✔ | One bill |
| `DELETE` | `/bill/bills/:id` | ✔ | Delete a bill |
| `POST` | `/bill/upload` | ✔ | Upload a file (form field **`bill`**) and extract data with OCR |

### Appliances

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/appliance/appliances` | ✔ | `name, voltage, hoursPerDay, days?` | Add an appliance |
| `GET` | `/appliance/appliances` | ✔ | — | List appliances |
| `PUT` | `/appliance/appliances/:id` | ✔ | any of the above | Update |
| `DELETE` | `/appliance/appliances/:id` | ✔ | — | Delete |

### Analytics

| Method | Endpoint | Returns |
| --- | --- | --- |
| `GET` | `/analytics/analytics/monthly-usage` | `[{ month, totalUnits, totalAmount, totalDays }]` |
| `GET` | `/analytics/analytics/app-breakdown` | `[{ name, units, percentage }]` |
| `GET` | `/analytics/analytics/predictions` | `{ predictedUnits, predictedCost }` |
| `GET` | `/analytics/analytics/suggestions` | `["..."]` |
| `GET` | `/analytics/analytics/alerts` | `["..."]` |
| `GET` | `/analytics/analytics/eff-score` | `{ efficiencyScore }` |

All analytics routes require ✔.

### Examples

```bash
# Log in
curl -X POST http://localhost:4000/api/v1/auth/log-in \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'

# Add a bill manually
curl -X POST http://localhost:4000/api/v1/bill/bills \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"billStartDate":"2026-05-04","billEndDate":"2026-06-04","totalUnits":170,"totalAmount":796}'

# Upload a bill for OCR
curl -X POST http://localhost:4000/api/v1/bill/upload \
  -H "Authorization: Bearer <token>" -F "bill=@./my-bill.jpg"

# Add an appliance (days auto-filled from the latest bill)
curl -X POST http://localhost:4000/api/v1/appliance/appliances \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"name":"Ceiling Fan","voltage":75,"hoursPerDay":10}'
```

Successful OCR upload:

```json
{
  "success": true,
  "message": "Bill uploaded and data extracted successfully",
  "extractedData": {
    "billStartDate": "2025-05-04T00:00:00.000Z",
    "billEndDate": "2025-06-04T00:00:00.000Z",
    "totalDays": 31,
    "totalUnits": 170,
    "costPerUnit": 4.68,
    "totalAmount": 796
  },
  "data": { "...": "saved bill" }
}
```

If units cannot be read, the API returns `400` with the raw OCR text and a hint, so the user can retry with a clearer image or enter the bill manually.

## How the OCR works

1. **Multer** saves the upload to `upload/bills/` (PDF, JPG and PNG only).
2. **PDFs** are converted to a 300 DPI PNG of the first page with Poppler's `pdftoppm`.
3. **Tesseract.js** reads the image with the bundled English model.
4. `parseExtractedText()` looks for:
   - units (`Units: 170`, `Units consumed`, `… kWh`, or *present − previous* meter reading)
   - billing days, or the difference between the two reading dates
   - bill amount (`Bill Amount`, `Total`, `Rs.` / `₹`)
   - cost per unit, or amount ÷ units
   - previous and present reading dates (Indian DD/MM/YY format)
5. The bill is saved together with the path to the original file.

## Getting started

### Prerequisites

- Node.js 20 or newer
- A MongoDB **replica set** — MongoDB Atlas works out of the box (sign-up uses a Mongoose transaction)
- An Arcjet key (free tier)
- **Poppler** for PDF uploads (image uploads work without it):
  - Ubuntu / Debian: `sudo apt install poppler-utils`
  - macOS: `brew install poppler`
  - Windows: install Poppler and add its `bin` folder to `PATH`

### 1. Backend

```bash
git clone https://github.com/vijaycode12/Smart-electricity-backend.git
cd Smart-electricity-backend
npm install
mkdir -p upload/bills
```

The app loads `.env.<NODE_ENV>.local`, so create **`.env.development.local`**:

```env
PORT=4000
NODE_ENV=development
BACKEND_URL=http://localhost:4000

DB_URL=mongodb+srv://<user>:<password>@<cluster>/watttrack

JWT_SECRET=change-me
JWT_EXPIRES_IN=7d

ARCJET_KEY=ajkey_xxxxxxxx
ARCJET_ENV=development
```

```bash
npm run dev    # development (nodemon)
npm start      # production
```

`GET http://localhost:4000/` returns *"Welcome to Smart electricity tracker"*.

### 2. Frontend

```bash
git clone https://github.com/vijaycode12/Smart-electricity-frontend.git
cd Smart-electricity-frontend
npm install
```

Point the app at your backend in `src/api/index.js`:

```js
const BASE_URL = 'http://localhost:4000'   // deployed: https://watttrack-backend.onrender.com
```

```bash
npm run dev
```

Open http://localhost:5173.

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |

> **CORS:** the backend allows `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:4000` and the Vercel URL (see `allowedOrigins` in `app.js`). Add any other origin you use.

## Deployment

| Part | Platform | Settings |
| --- | --- | --- |
| Frontend | Vercel | Preset *Vite*, build `npm run build`, output `dist` |
| Backend | Render | Build `npm install`, start `npm start`, all env vars with `NODE_ENV=production`; use a Dockerfile with `poppler-utils` if you need PDF uploads |
| Database | MongoDB Atlas | Allow Render's IPs in Network Access |

Render's disk is temporary, so uploaded bill files are lost on redeploy — the extracted bill data stays in MongoDB.

## Roadmap

- [ ] Store uploads in cloud storage (S3 / Cloudinary) and keep `upload/` out of git
- [ ] Run PDF conversion with `execFile` and an argument array instead of a shell command
- [ ] Let users review and correct OCR results before saving
- [ ] Slab-based tariff calculation for more accurate cost predictions
- [ ] Read the API address from `VITE_API_URL` instead of hard-coding it
- [ ] Show the backend's own error messages in toasts
- [ ] Rename `voltage` to `watts` and remove duplicated path segments (`/analytics/analytics`, `/bill/bills`)
- [ ] URL-based routing (React Router) and a mobile sidebar
- [ ] Remove unused dependencies, upgrade Express, add tests (Jest + Supertest)
