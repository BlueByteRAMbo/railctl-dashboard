# 🚆 RailCTL — Indian Railways Admin Dashboard

A modern, full-stack Next.js dashboard for tracking Indian Railways data in real time using the `irctc-connect` library.

## Features
- **Live Train Status** — Real-time tracking and live progress of trains
- **PNR Lookup** — Passenger booking, coach allocation, and seat details
- **Train Schedule** — Complete route timetable for any running train
- **Trains Between Stations** — Find all trains operating on a specific route by date

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run the application
```bash
npm run dev
```

Visit `http://localhost:3000` to view the dashboard.

## Tech Stack
- **Next.js 14** (App Router)
- **Data Source** — Uses the [`irctc-connect`](https://www.npmjs.com/package/irctc-connect) npm package which aggregates free IRCTC scrape APIs.
- Custom CSS with CSS variables (no Tailwind, no UI libs)
- Server-side API routes

## API Routes
| Route | Purpose |
|---|---|
| `GET /api/live-status?trainNo=12301&date=0` | Live train tracking |
| `GET /api/pnr?pnr=2145678901` | PNR status |
| `GET /api/station-schedule?stationCode=12301` | Train route timetable |
| `GET /api/trains-between?from=NDLS&to=BCT&date=18-03-2026` | Trains between stations |
