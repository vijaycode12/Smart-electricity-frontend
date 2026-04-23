Smart electricity tracker(WattTrack) Frontend
React-based frontend for WattTrack — an electricity bill tracker that lets users upload bills, track appliances, and visualise monthly usage trends.
Built with React and Vite.

Tech Stack

Framework — React 18
Bundler — Vite
Styling — CSS (custom, no UI library)
State — React Context (Auth, Theme, Toast)
HTTP — Fetch API


Project Structure
src/
├── api/                # API call functions (auth, bills, appliances, analytics)
├── components/         # Reusable UI components
│   ├── AuthModal.jsx
│   ├── Layout.jsx      # App shell (sidebar + main area)
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   └── ...
├── context/            # Global state via React Context
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
├── pages/              # One file per screen
│   ├── HomePage.jsx    # Public landing page
│   ├── Dashboard.jsx
│   ├── BillsPage.jsx
│   ├── AppliancesPage.jsx
│   ├── AnalyticsPage.jsx
│   └── ProfilePage.jsx
├── styles/             # CSS files mirroring components/pages structure
├── App.jsx
└── main.jsx

Getting Started
Prerequisites

Node.js v18+

Installation
bash# Clone the repo
git clone https://github.com/vijaycode12/Smart-electricity-frontend.git


# Install dependencies
npm install
Environment Variables

# Production build
npm run build

# Preview production build
npm run preview
App runs on http://localhost:5173 by default.


Features

Authentication — Register, login, JWT stored in memory via Context
Bill tracking — Upload bill details (units, amount, date) and manage history
Appliance tracking — Add devices with usage hours to estimate consumption
Analytics — Bar chart of monthly units and amount with a forecast for the next bill
Theme toggle — Light and dark mode, accessible from every page
Toast notifications — Feedback for all user actions


Backend
This app connects to the WattTrack REST API backend.
Repo: https://github.com/vijaycode12/Smart-electricity-backend.git
