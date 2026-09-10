# Micro-Volunteer Match (MERN Stack)

**Micro-Volunteer Match** is a full-stack web application designed for college campuses. It connects students to small, 15-minute community help tasks (tutoring, donation sorting, poster design, translation, directions, etc.) by matching task requests to nearby volunteers based on skills, interests, and campus zones.

---

## 🌟 Key Features

### MVP Core Features
1. **JWT Authentication & Authorization** (Signup/Login with password hashing using bcrypt, protected routes).
2. **Profile Setup** (Skills & interests tags, campus location zone, role selection).
3. **Task Feed** (Category filtering, SOS urgent task pinning, search bar, campus zone walk-time estimate).
4. **Post 15-Min Task** (Form with title, description, category selector, SOS Urgent toggle, AI title summarizer).
5. **Task Details & Accept Action** (View requester profile, trust badges, walk time, accept task).
6. **My Tasks & Dual Party Completion** (Posted & Accepted tabs, dual party confirmation flow triggering skill endorsement).

### Unique / Differentiating Features
1. **Karma Score & Tier Labels**
   - Base points per completed task (+10)
   - SOS Urgent tasks worth double (+20)
   - Speed bonus for completing within target time window (+5)
   - Dynamic tier title display: *"New Neighbor"* (0-49), *"Rising Helper"* (50-149), *"Campus Regular"* (150-299), *"Community Champion"* (300+).
2. **Auto-Computed Trust Badges**
   - **Verified**: Profile complete + at least 1 completed task.
   - **Fast Responder**: Average task accept time < 10 mins across last 5 tasks.
   - **Campus Regular**: 10+ completed tasks.
3. **Weekly Streak Tracker (🔥)**
   - Tracks consecutive active weeks of volunteering; displays 🔥 streak counter on profile.
4. **SOS Urgent Toggle & Pinning**
   - Pins urgent requests to the top of the campus feed with a visual highlight banner.
5. **Skill-Verified Tags (✓)**
   - Upon marking a task complete, requesters can endorse the helper's skill.
   - Skills receiving 3+ verifications unlock a **✓ Verified** checkmark badge on profile.
6. **Campus Zone Time-to-Help Estimate**
   - Maps user location and task location to static campus zones (~5 min same zone, ~10 min adjacent zone, ~15+ min).
7. **AI-Assisted Matching & Description Summarizer (Google Gemini API Stretch Goal)**
   - Uses `@google/generative-ai` to rank candidate volunteers based on skills and location.
   - Generates 1-line preview summaries for long task descriptions.

---

## 📁 Repository Structure

```
Micro-Volunteer Match/
├── client/                 # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/     # TaskCard, TrustBadges, KarmaBadge, SkillVerifyModal, AiMatchModal, Navbar, Footer
│   │   ├── context/        # AuthContext (JWT & state management)
│   │   ├── pages/          # Feed, Login, Signup, PostTask, TaskDetail, MyTasks, Profile
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Node.js + Express + MongoDB REST API Backend
│   ├── config/             # db.js (Mongoose connection)
│   ├── middleware/         # auth.js (JWT protection middleware)
│   ├── models/             # User.js, Task.js, SkillVerification.js
│   ├── routes/             # authRoutes, userRoutes, taskRoutes, verificationRoutes, aiRoutes
│   ├── utils/              # karma.js, badges.js, campusZones.js
│   ├── .env.example
│   ├── seed.js             # Demo seed script
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Setup & Run Instructions

### 1. Backend Setup (`/server`)

```bash
cd server
npm install
```

Create a `.env` file inside `/server` (or copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/micro_volunteer_match
JWT_SECRET=super_secret_micro_volunteer_jwt_key_2026
GEMINI_API_KEY=your_optional_gemini_api_key
```

Seed demo data:
```bash
npm run seed
```

Start backend API server:
```bash
npm run dev   # or npm start
```
The API server will run at `http://localhost:5000`.

### 2. Frontend Setup (`/client`)

```bash
cd client
npm install
npm run dev
```
The React Vite app will open at `http://localhost:3000`.

---

## 🔑 Demo Hackathon Test Accounts

Password for all seeded accounts: `password123`

1. **Alex Rivera**: `alex@campus.edu` (210 Karma, ⭐ Campus Regular, Verified Skill: Tutoring ✓)
2. **Samantha Lee**: `samantha@campus.edu` (320 Karma, 🏆 Community Champion, Translation Expert)
3. **Maya Patel**: `maya@campus.edu` (160 Karma, ⭐ Campus Regular, Poster Art & Design)
4. **Jordan Chen**: `jordan@campus.edu` (85 Karma, 🌱 Rising Helper, Food Drive Logistics)

---

## 🌐 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new campus user |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile |
| `GET` | `/api/users/:id` | Fetch public user profile & verifications |
| `PATCH` | `/api/users/:id` | Update skills, interests, and campus location |
| `GET` | `/api/users/:id/badges` | Recompute & fetch user trust badges |
| `GET` | `/api/tasks` | Fetch task feed (supports `category`, `search`, `userLocation`) |
| `POST` | `/api/tasks` | Post a new 15-minute help task |
| `GET` | `/api/tasks/mine` | Fetch posted & accepted tasks for logged-in user |
| `GET` | `/api/tasks/:id` | Get task details with requester & acceptor profiles |
| `PATCH` | `/api/tasks/:id/accept` | Accept an open task |
| `PATCH` | `/api/tasks/:id/complete` | Confirm completion & award Karma/Streaks |
| `POST` | `/api/verifications` | Confirm volunteer's skill post-completion |
| `POST` | `/api/ai/match` | Rank volunteer candidates using Gemini AI |
| `POST` | `/api/ai/summarize` | Generate 1-line task preview using Gemini AI |

---

## ☁️ Deployment Strategy

- **Frontend Deployment (Vercel)**:
  Deploy the `/client` directory directly to Vercel. Set `VITE_API_URL` environment variable if pointing to production backend.
- **Backend Deployment (Render)**:
  Deploy the `/server` directory to Render as a Web Service. Configure `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` in environment settings.
