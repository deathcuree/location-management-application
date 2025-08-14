# Location Management Application - Setup & Run Guide

This guide covers how to set up dependencies, configure the database, and run both the backend API and the frontend in development.

## Project layout
- backend — Express + Prisma API
- client — React (Vite) SPA

## Prerequisites
- Node.js 20.19+ or 22.12+
- npm 10+
- PostgreSQL 14+ (local install)

## 1) Setup: Database

### Local PostgreSQL
- Ensure PostgreSQL is running locally.
- Create a database named `location_db` (example using psql):

```bash
createdb location_db
# or:
# psql -U postgres -c "CREATE DATABASE location_db;"
```

## 2) Setup: Environment variables

Create backend/.env with:

```env
DATABASE_URL="postgresql://postgres:092199@localhost:5432/location_db"
JWT_SECRET="fd7c3d36ba5fc4bb71e53c4b1f58580aef3499dcfa81e7a59a153e19bfb1a75e08da73b77efe50d021a0c26a41c020bb652d38835411be9d29ba1de47dfd16f0"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

Client (client/.env already exists; ensure it points to the backend):

```env
VITE_API_URL=http://localhost:4000
```

## 3) Install dependencies
From the repository root:

```bash
# Install root tools (concurrently) and set up workspaces
npm install

# Install client then backend packages via scripts
npm run setup
```

## 4) Database migrations and Prisma client
From repository root:

```bash
# From repo root
npm run prisma:generate
npm run prisma:migrate
```

## 5) Run the system (development)

### Option A: root scripts (recommended)

```bash
# 1) Install root tools (concurrently)
npm install

# 2) Install app dependencies (client then backend)
npm run setup

# 3) Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate

# 4) Start both apps (backend + client)
npm run dev
```

### Option B: manual terminals

```bash
# Terminal 1 (Backend)
cd backend
npm install
npx prisma generate
npm run prisma:migrate
npm run dev
```

```bash
# Terminal 2 (Client)
cd client
npm install
npm run dev
```

## Root scripts reference (from repository root)

- npm run setup — Install client then backend dependencies
- npm run install:client — Install client dependencies only
- npm run install:backend — Install backend dependencies only
- npm run prisma:generate — Generate Prisma client in backend
- npm run prisma:migrate — Apply Prisma migrations in backend
- npm run dev — Run backend and client concurrently

## 6) Open the app
- Frontend: http://localhost:5173
- API health check: `curl http://localhost:4000/`

## Troubleshooting
- JWT secret not configured: ensure `JWT_SECRET` is set in `backend/.env`.
- Database connection issues: verify `DATABASE_URL` and that PostgreSQL is running and accessible.
- CORS errors: `CLIENT_URL` in `backend/.env` must match the frontend origin (`http://localhost:5173` by default). Client `VITE_API_URL` must match backend URL.
- Need to reset DB during development: `cd backend && npx prisma migrate reset --force`
- Inspect DB with Prisma Studio: `cd backend && npx prisma studio`

## Notes
- Authentication uses HTTP-only cookies; allow cookies for `localhost`.
- File upload endpoint expects a `.zip` that contains exactly one `.txt` file with lines in the format: `Name, Latitude, Longitude`.