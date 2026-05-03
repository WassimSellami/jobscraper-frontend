# LinkedIn Job Scraper Dashboard

A minimal Angular dashboard for the LinkedIn job scraper backend.

## Prerequisites

- Node.js 18+ and npm 9+
- Backend running on `http://localhost:8000` with `/api/scrape/linkedin` endpoint

## Setup

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at `http://localhost:4200`.

## Features

- **Filters Bar**: Search terms, job levels, location, distance, hours old, results wanted
- **Chip Inputs**: Add/remove search terms and job levels dynamically
- **AG Grid Table**: Full-width results grid with infinite scroll
- **Dark Mode**: Toggle dark/light theme with persistence
- **CSV Export**: Download filtered results as CSV file
- **KPI Row**: Shows total jobs found
- **Error Handling**: Display error messages from backend

## Layout

```
┌─────────────────────────────────────────┐
│  Header (Title + Dark Mode Toggle)      │
├─────────────────────────────────────────┤
│  Filters Bar (Chips + Inputs + Buttons) │
├─────────────────────────────────────────┤
│  KPI Row (Total Jobs Found)             │
│  Error Message (if any)                 │
│  AG Grid Table (Full Width)             │
└─────────────────────────────────────────┘
```

## Default Values

- Search Terms: `["software engineer", "software developer", "full stack developer"]`
- Job Levels: `["entry level", "mid-senior level", "not applicable"]`
- Location: `"Munich, Germany"`
- Distance: `31` miles
- Hours Old: `24`
- Results Wanted: `50`

## Build

```bash
npm run build
```

Output: `dist/jobscraper-dashboard/`

## Architecture

- **Standalone Components**: No NgModules, pure component-based
- **Services**: `ScraperService` manages state with `BehaviorSubject`
- **Styling**: SCSS with CSS variables for light/dark mode
- **State Management**: Reactive streams with RxJS observables
