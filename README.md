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

   Adjust MySQL credentials and optional `CORS_ORIGIN`.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

Production:

```bash
npm start
```

## HTTP surface (foundation)

| Method | Path      | Description |
| ------ | --------- | ----------- |
| GET    | `/health` | Process + MySQL ping (`503` when DB unavailable) |

Additional school-domain routes belong in `src/routes`, `src/controllers`, and `src/services` as you implement them. **`express-validator`** is included for request validation on those routes—no ORM and no auth layer in this baseline.

## Response shape

Success bodies use `{ "success": true, "data": ... }` where it fits; errors use `{ "success": false, "message": "...", "errors": [...] }` when validation applies.

## Scripts

| Script       | Command           |
| ------------ | ----------------- |
| Development  | `npm run dev`     |
| Production   | `npm start`       |
