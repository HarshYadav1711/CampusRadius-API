# CampusRadius API

Node.js + Express + MySQL foundation for the CampusRadius school-management backend. The layout favors small modules, explicit boundaries, and predictable JSON responses.

## Layout

```
├── app.js                 # Express configuration & middleware
├── server.js              # HTTP listener
├── sql/                   # Schema migrations / DDL (run manually)
├── src/
│   ├── config/            # Environment & database pool
│   ├── controllers/       # HTTP handlers (thin)
│   ├── routes/            # Route definitions → controllers
│   ├── services/          # Orchestration & external side-effects
│   └── utils/             # Shared helpers (responses, etc.)
└── package.json
```

## Prerequisites

- Node.js 18+
- MySQL 8.x

## Setup

1. Create the database and apply the starter schema when you begin modelling schools:

   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campus_radius;"
   mysql -u root -p campus_radius < sql/schema.sql
   ```

2. Environment:

   ```bash
   copy .env.example .env
   ```

   Set **DB_HOST**, **DB_USER**, and **DB_NAME** (required). **DB_PASSWORD** may be left empty locally. Adjust optional **CORS_ORIGIN** if needed.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Production:

```bash
npm start
```

## HTTP surface

| Method | Path           | Description |
| ------ | -------------- | ----------- |
| GET    | `/health`      | Liveness / DB connectivity (`503` when MySQL is unreachable) |
| POST   | `/addSchool`   | Create a school (validated JSON body) |
| GET    | `/listSchools` | List schools sorted by distance from `latitude` / `longitude` query params |

## Response shape

All handlers use a consistent envelope:

- **Success:** `{ "success": true, "message": "<string>", "data": { ... } }` (HTTP `2xx`; often `200`, `201` for creates).
- **Validation:** `{ "success": false, "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [ { "field", "location", "message" } ] } }` with HTTP `400`.
- **Other errors:** `{ "success": false, "error": { "code", "message", ... } }` — e.g. `404` not found, `500` internal error, `503` when `/health` reports an unhealthy database.

Requests are validated with **`express-validator`** — no ORM and no auth in this baseline.

## Scripts

| Script       | Command           |
| ------------ | ----------------- |
| Development  | `npm run dev`     |
| Production   | `npm start`       |
