# healthify

A full-stack online therapy platform — browse and book licensed therapists, track your mood and sessions, get a rule-driven wellness self-check, and chat with an AI support assistant. Includes a separate portal therapists use to keep their own public profile up to date.

## Features

- **Auth & dashboard** — register/login, mood logging, upcoming/past session tracking.
- **Therapist directory** — search and filter by specialty, book sessions across video/phone/chat/in-person.
- **AI Support** — a Claude-powered chat companion for talking through what's on your mind.
- **AI Analyser** — a guided, chat-style check-in (mood, symptoms, sleep, stress, history) that scores patterns across categories like anxiety, low mood, stress, sleep, trauma, relationships, grief, and self-esteem, then suggests matching therapists and practical self-care ideas. Immediately surfaces crisis resources if risk indicators come up.
- **Therapist portal** — a separate login therapists use to update their own public-facing details (response time, languages, areas of expertise, completion rate, experience, verified badge, bio, price). Each profile is additionally protected by its own 4-digit PIN.
- **Dark mode** — available everywhere, including logged-out pages, no account required.

## Tech stack

- **Frontend**: React 18, React Router, Vite,CSS 
- **Backend**: Node.js, Express 5, MongoDB via Mongoose
- **Auth**: JWT (separate token schemes for regular users vs. the therapist portal)
  **AI Analyser** is a self-contained scoring engine, not an LLM call

## Project structure

```
healthify/
├── backend/
│   ├── config/          # DB connection, seed script
│   ├── middleware/      # auth middleware
│   ├── models/          # Mongoose schemas (User, Therapist, Session)
│   ├── routes/          # Express routers (auth, therapists, sessions, ai, analyser, therapistPortal)
│   ├── utils/           # rule-based analyser scoring engine
│   └── server.js
└── frontend/
    ├── index.html
    └── src/
        ├── components/  # Navbar, BookingModal, Toast
        ├── context/     # Auth, Toast, Theme (dark mode) providers
        ├── pages/        # route-level pages
        ├── styles/       # global.css, components.css (design tokens + dark theme overrides)
        └── utils/        # api.js (axios clients), constants.js
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthify
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=your_anthropic_key      # only needed for AI Support chat
CLIENT_URL=http://localhost:5173
NODE_ENV=development
THERAPIST_PORTAL_EMAIL=healthifyrtherapists@gmail.com
THERAPIST_PORTAL_PASSWORD=MHUNHEALTHIFY@therapist
```

Seed the database with 14 demo therapists and a demo user:

```bash
npm run seed
```

Run the API:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies API calls to `/api`.

## Demo credentials

**Regular user** (created by the seed script):
- Email: `demo@healthify.com`
- Password: `demo1234`

**Therapist portal** (`/therapist-portal/login`):
- Email: `healthifyrtherapists@gmail.com`
- Password: `MHUNHEALTHIFY@therapist`

After logging in, pick a therapist from the grid and unlock it with its 4-digit PIN:

| Therapist | PIN |
|---|---|
| Dr. Sarah Chen | 0000 |
| Marcus Williams | 0010 |
| Dr. Priya Patel | 0020 |
| James Rivera | 0030 |
| Dr. Amina Hassan | 0040 |
| Lisa Tanaka | 0050 |
| Dr. Elena Vasquez | 0060 |
| David Okafor | 0070 |
| Dr. Grace Kim | 0080 |
| Michael Brennan | 0090 |
| Dr. Naomi Osei | 0100 |
| Thomas Reilly | 0110 |
| Dr. Fatima Al-Sayed | 0120 |
| Ben Coleman | 0130 |

## API overview

| Route | Purpose |
|---|---|
| `POST /api/auth/register`, `/login`, `/me` | User auth |
| `GET /api/therapists`, `/:id`, `/:id/slots` | Browse therapists |
| `POST /api/sessions`, `GET /api/sessions` | Book & manage sessions |
| `POST /api/ai/chat` | AI Support (Claude-backed) |
| `POST /api/analyser/analyse` | AI Analyser (rule-based scoring) |
| `POST /api/therapist-portal/login` | Therapist portal login |
| `GET /api/therapist-portal/therapists` | List profiles for selection |
| `POST /api/therapist-portal/therapists/:id/unlock` | PIN-unlock a profile |
| `PUT /api/therapist-portal/therapists/:id` | Update an unlocked profile |
 
