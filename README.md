# Brain-Barter

A community-driven knowledge-sharing platform that enables users to exchange ideas, connect with experts, and collaborate through interactive discussions and personalized learning communities.

Collaborative learning platform for skill and knowledge exchange.

---

## Table of contents
- [What this is](#what-this-is)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [How it works (high level)](#how-it-works-high-level)
- [Getting started (local development)](#getting-started-local-development)
  - [Prerequisites](#prerequisites)
  - [Backend — install & run](#backend--install--run)
  - [Frontend — install & run](#frontend--install--run)
  - [Seeding sample data](#seeding-sample-data)
- [Configuration / Environment variables](#configuration--environment-variables)
- [Server API surface (main routes)](#server-api-surface-main-routes)
- [Real-time & media flow](#real-time--media-flow)
- [Data models (representative)](#data-models-representative)
- [Deployment notes](#deployment-notes)
- [Contributing](#contributing)
- [Contact / Author](#contact--author)

---

## What this is
Brain-Barter is a web application for connecting people who want to teach or learn specific skills. Users create profiles, find matched peers or experts, exchange messages, schedule and run video sessions, submit feedback and reward teachers with credits. The app combines a REST API, real-time messaging (Socket.IO), and a React-based frontend.

---

## Key features
- User authentication and profiles
- Skill discovery and matching between learners and teachers
- Real-time private messaging (with offline persistence)
- Video session invitations with credit deduction/transfer
- Session feedback & teacher reviews
- File uploads (attachments / media)
- Seeders to populate demo data for local development

---

## Tech stack
- Language: JavaScript (Node.js + React)
- Backend: Express.js, MongoDB (Mongoose), Socket.IO
- Frontend: React (Create React App / react-scripts), React Router
- Notable libraries:
  - Backend: express, mongoose, socket.io, multer, bcryptjs, jsonwebtoken
  - Frontend: axios, socket.io-client, react-hot-toast, framer-motion, tailwind-merge

---

## Repository layout
Top-level:
```
README.md               <- this file
backend/                <- Node/Express backend
  server.js             <- main server and Socket.IO logic
  package.json
  seeder.js, seed_match.js, seed_session.js
  routes/               <- express route handlers (auth, user, chat, sessions, etc.)
  models/               <- Mongoose models (User, Message, VideoSession, MatchRequest, ...)
  middleware/           <- auth, validation, etc.
  uploads/              <- static files served to /uploads
frontend/               <- React frontend
  package.json
  src/
    app.js               <- React Router + app composition
    pages/               <- page-level components (landing, dashboard, chat, profile, etc.)
    components/          <- UI components
    context/             <- AuthContext and app contexts
    lib/, utils/, assets/
```

---

## How it works (high level)
- Backend (Express) exposes REST endpoints under `/api/*` for authentication, user management, skills, sessions, matches, chat history, stats, and file upload.
- Socket.IO (websockets) is used for real-time messaging, typing indicators, video call invitations/responses, and session-related notifications. Sockets are registered by userId and the server maintains a userId -> socketId mapping for direct delivery.
- MongoDB stores users, matches, messages, video sessions, and other entities via Mongoose models.
- Frontend is a React single-page app that authenticates users, manages client-side routing, connects to the Socket.IO server for real-time features, and consumes the REST API for persistence.

---

## Getting started (local development)

### Prerequisites
- Node.js (>= 18 recommended)
- npm (>= 8)
- MongoDB running locally or a connection string to a hosted MongoDB
- Optional: a modern browser

### Backend — install & run
1. Open a terminal and change to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env` file (see the "Configuration" section below).
4. Start the backend server:
   ```bash
   npm run start
   ```
   The backend uses `nodemon server.js` per package.json. By default it listens on `PORT` or 5000.

### Frontend — install & run
1. In a separate terminal:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. The frontend dev server runs on port 3000 by default (Create React App). Ensure `FRONTEND_ORIGIN` on the backend allows the frontend origin (or leave default allowed origin in dev).

### Seeding sample data
The backend has seeder scripts included (see package.json scripts and seeder files). From `backend/`:
```bash
# run the general seeder (if provided)
npm run seed

# or run the matches/seessions seed scripts (names as defined in package.json):
npm run seed:matches
npm run seed:sessions
```
If a named script errors due to filename mismatches, check the seeder files in `backend/` (e.g., `seeder.js`, `seed_match.js`, `seed_session.js`) and run them directly:
```bash
node seeder.js
node seed_match.js
node seed_session.js
```

---

## Configuration / Environment variables
The server reads environment variables via dotenv. The following variables are used or recommended (add to `backend/.env`):

- MONGO_URI — MongoDB connection string (default fallback: `mongodb://127.0.0.1:27017/brain_barter`)
- PORT — Backend port (default 5000)
- NODE_ENV — `development` or `production`
- FRONTEND_ORIGIN — frontend origin allowed for Socket.IO / CORS (default `http://localhost:3000`)
- JWT_SECRET — secret for signing JSON Web Tokens (used by auth routes)
- Any other API keys or secrets used by integrations (file store, mailer) — add as needed.

Important: Never commit secrets to source control.

---

## Server API surface (main routes)
The server mounts these routes (see `backend/server.js`):
- `POST /api/auth` — authentication, signup/login (exact routes inside `routes/auth`)
- `GET/PUT /api/user` — user profile endpoints
- `GET /api/users` — list users
- `GET /api/stats` — usage stats and metrics
- `POST /api/chat` — chat/message endpoints (history, attachments)
- `POST /api/matches` — create/accept/reject match requests
- `GET/POST /api/sessions` — manage learning sessions (scheduling, status)
- `GET/POST /api/skills` — skill discovery and management
- `POST /api/user-sessions` — user-specific session mappings
- `POST /api/video-sessions` — video session creation/status
- `POST /api/upload` — file upload (uploads served from `/uploads`)

Refer to the route handler files in `backend/routes/` for exact request/response formats.

---

## Real-time & media flow
- Socket.IO handles:
  - Client registration via `register` (client emits its authenticated userId)
  - `privateMessage` events: validated, persisted, and delivered to recipient (or stored if offline).
  - `videoCallInvitation` and `videoCallResponse`: invitation lifecycle and credit deduction flow when accepted.
  - `submitFeedback`: feedback storage, teacher review update, credit transfer, and notification events.
  - `typing` indicator and other session updates.
- Meeting links are created using Jitsi meeting link pattern in the server (example): `https://meet.jit.si/brainbarter-<sessionId>`. Adjust as needed when changing provider.

---

## Data models (representative)
The server references typical models:
- User — profile, skills, matches array, credits, blockedUsers, reviews
- Message — senderId, recipientId, text, type, timestamp, fileUrl, sessionId
- MatchRequest — stored match requests and status
- VideoSession — sessionId, teacherId, learnerId, meetingLink, feedback, status

Check `backend/models/` to see the full Mongoose schema definitions and validation rules.

---

## Deployment notes
- Set NODE_ENV=production and configure CORS / FRONTEND_ORIGIN appropriately.
- Use a process manager (pm2, systemd) or containerization (Docker) to run the backend.
- For production Socket.IO, ensure sticky sessions or a shared adapter (Redis) if you run multiple backend instances.
- Store uploaded files reliably (S3 or similar) rather than the local `uploads/` directory if scaling horizontally.
- Use HTTPS and secure JWT secrets; rotate secrets and enforce proper CORS policies.

---

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes, add tests if applicable.
4. Open a pull request with a clear description of changes.

---

## Contact / Author
Project: Brain-Barter  
Repo: https://github.com/aneeshj-05/Brain-Barter
