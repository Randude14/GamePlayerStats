# GamePlayerStats

A full-stack game player statistics app with:

- `stats-backend`: Express API + MySQL + Knex
- `stats-frontend`: React + TypeScript + Vite

## Project Structure

- `stats-backend/` — backend service with Docker Compose, Knex migrations, authentication, and external game search and import features.
- `stats-frontend/` — React UI for searching/importing games, creating player accounts, and adding player stats.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 14+ for local development
- Optional: `npm` or `pnpm` for frontend/backend package installation

## Backend Setup

1. Open `stats-backend/`.
2. Copy `.env.example` to `.env` and update values if needed.
   - Make sure `DB_USER` is not set to `root` if using the included MySQL image.
   - Set any API credentials required by external game search services.

```bash
cd stats-backend
cp .env.example .env
```

3. Start the backend service with Docker Compose:

```bash
docker-compose up --build
```

4. The API should be available at `http://localhost:3000`.

### Backend local development (without Docker)

```bash
cd stats-backend
npm install
npm run dev
```

### Run migrations

The backend runs pending Knex migrations on startup, but you can also run them manually:

```bash
cd stats-backend
npm install
npm run migrate
```

## Frontend Setup

1. Open `stats-frontend/`.
2. Install dependencies and start the Vite development server.

```bash
cd stats-frontend
npm install
npm run dev
```

3. The app will be available at the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Running the Full App

1. Start the backend first so the API is available.
2. Then start the frontend.
3. Open the frontend URL in your browser and use the app.

## Notes

- If you use Docker for the backend, the database runs in the `stats-backend` stack and the API listens on port `3000`.
- If you use the frontend locally, make sure it can reach `http://localhost:3000` for API requests.

## Subproject READMEs

- `stats-backend/README.md` contains backend-specific details.
