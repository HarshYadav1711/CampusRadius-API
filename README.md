# CampusRadius API

CampusRadius API is a small HTTP service for registering schools and listing them in distance order from a caller-supplied location. It is built as a practical backend piece you can run locally, exercise with curl or Postman, and ship behind a process manager or container with minimal ceremony.

The API keeps persistence in MySQL, validates inputs before hitting the database, and computes geographic distance in application code so the schema stays portable across hosts.

## What it provides

- **Register a school** with a name, address, and WGS84 coordinates.
- **List all schools** sorted from nearest to farthest relative to a user latitude and longitude.
- A **health** route that reports whether the process is up and whether MySQL answers a connection ping.

Responses use a single JSON shape for success and a separate, explicit shape for errors, including structured validation details when a request fails input checks.

## Tech stack

| Layer        | Choice |
| ------------ | ------ |
| Runtime      | Node.js 18+ |
| HTTP         | Express 4 |
| Database     | MySQL 8.x |
| DB driver    | mysql2 (promise API, pooled connections) |
| Validation   | express-validator |
| Config       | dotenv |
| CORS         | cors (configurable origin) |
| Dev reload   | nodemon |

No ORM, no geospatial SQL extensions, and no third-party distance libraries: distance is computed in Node using the Haversine formula.

## Project layout

```
├── app.js                      Express app, middleware, error handling
├── server.js                   Listens on PORT
├── sql/
│   └── schema.sql              Table definition for `schools`
├── src/
│   ├── config/
│   │   ├── database.js         MySQL pool (env-driven)
│   │   └── env.js              Integer parsing helpers for env vars
│   ├── controllers/
│   │   ├── health.controller.js
│   │   └── school.controller.js
│   ├── middleware/
│   │   ├── handleValidationErrors.js
│   │   ├── validateAddSchool.js
│   │   └── validateListSchools.js
│   ├── routes/
│   │   ├── index.js            Mounts route modules
│   │   ├── health.routes.js
│   │   └── school.routes.js
│   ├── services/
│   │   ├── health.service.js
│   │   └── school.service.js
│   └── utils/
│       ├── haversine.js        Distance calculation
│       └── response.js         Standard JSON responses
└── package.json
```

## Database schema

The service expects one table, `schools`, aligned with the assessment specification:

| Column     | Type          | Notes |
| ---------- | ------------- | ----- |
| `id`       | INT           | Auto-increment primary key |
| `name`     | VARCHAR(255)  | Required |
| `address`  | VARCHAR(255)  | Required |
| `latitude` | FLOAT         | Required, stored as degrees |
| `longitude`| FLOAT         | Required, stored as degrees |

Full DDL is in `sql/schema.sql`. Apply it after creating an empty database (see installation).

## Installation

Prerequisites: Node.js 18 or newer, and a reachable MySQL 8 server.

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create the database and load the schema (adjust user and database name as needed):

   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campus_radius;"
   mysql -u root -p campus_radius < sql/schema.sql
   ```

3. Copy the example environment file and edit values for your machine:

   ```bash
   copy .env.example .env
   ```

   On Unix shells, use `cp .env.example .env`.

4. Start the server:

   ```bash
   npm run dev
   ```

   For production-style runs without file watching:

   ```bash
   npm start
   ```

   By default the API listens on port 3000 unless `PORT` overrides it.

## Environment variables

Values are read at startup. The database pool expects **DB_HOST**, **DB_USER**, and **DB_NAME** to be set; an empty **DB_PASSWORD** is allowed for typical local MySQL installs.

| Variable        | Required | Description |
| --------------- | -------- | ----------- |
| `PORT`          | No       | HTTP port (default `3000`). |
| `NODE_ENV`      | No       | Set to `production` to reduce error detail in logs and responses. |
| `DB_HOST`       | Yes      | MySQL host. |
| `DB_PORT`       | No       | MySQL port (default `3306`). |
| `DB_USER`       | Yes      | MySQL user. |
| `DB_PASSWORD`   | No       | Password; omit or leave empty if your server allows it. |
| `DB_NAME`       | Yes      | Database name containing `schools`. |
| `DB_POOL_LIMIT` | No       | Max connections in the pool (default `10`). |
| `CORS_ORIGIN`   | No       | Allowed browser origin, or `*` for any during local testing. |

## API reference

Base URL in examples: `http://localhost:3000`. Replace with your host when deployed.

### Success and error envelopes

Success responses look like:

```json
{
  "success": true,
  "message": "…",
  "data": { }
}
```

Errors look like:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      { "field": "latitude", "location": "body", "message": "…" }
    ]
  }
}
```

Other error codes you may see include `NOT_FOUND`, `INTERNAL_ERROR`, and `SERVICE_UNAVAILABLE`. Validation failures always return HTTP **400** with the `details` array populated.

---

### `GET /health`

Checks that the app is running and that a pooled connection can ping MySQL.

**Sample response (200)**

```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "service": "campus-radius-api",
    "uptimeSeconds": 12,
    "database": "up"
  }
}
```

**Sample response (503)** — when MySQL cannot be reached:

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Database is not reachable",
    "context": {
      "database": "down"
    }
  }
}
```

---

### `POST /addSchool`

Creates a school. Body must be JSON with exactly these fields: `name`, `address`, `latitude`, `longitude`.

**Sample request**

```http
POST /addSchool HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Delhi Public School",
  "address": "Sector 45, Gurugram, Haryana",
  "latitude": 28.4595,
  "longitude": 77.0266
}
```

**Sample response (201)**

```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Delhi Public School",
    "address": "Sector 45, Gurugram, Haryana",
    "latitude": 28.4595,
    "longitude": 77.0266
  }
}
```

---

### `GET /listSchools`

Returns every school in the database, each with a `distanceKm` field and sorted ascending by that distance. Query parameters are required.

**Sample request**

```http
GET /listSchools?latitude=28.6139&longitude=77.2090 HTTP/1.1
Host: localhost:3000
```

**Sample response (200)**

```json
{
  "success": true,
  "message": "Schools retrieved successfully",
  "data": {
    "count": 2,
    "schools": [
      {
        "id": 1,
        "name": "Delhi Public School",
        "address": "Sector 45, Gurugram, Haryana",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "distanceKm": 22.412
      },
      {
        "id": 2,
        "name": "Example School",
        "address": "Noida",
        "latitude": 28.5355,
        "longitude": 77.391,
        "distanceKm": 25.104
      }
    ]
  }
}
```

---

### Unknown routes

Any path outside the routes above returns **404** with code `NOT_FOUND` and a short message.

## Validation behavior

**`POST /addSchool`**

- `name` and `address` must be present, non-empty strings after trimming, at most 255 characters.
- `latitude` and `longitude` must be present, parseable to finite numbers, and must not be objects, arrays, or booleans. Strings are trimmed before parsing.
- Latitude must fall between **-90** and **90**; longitude between **-180** and **180**.
- After validation, coordinates are normalized to numbers on `req.body` before insert.

**`GET /listSchools`**

- The same numeric rules and ranges apply to `latitude` and `longitude` query parameters. Values are normalized onto `req.query` before the handler runs.

Failed validation never triggers a database write or a full table scan for listing: the middleware responds with **400** and the structured `details` list described above.

## Distance sorting

All rows are read with a plain `SELECT` on `schools`. For each row, the service computes the great-circle distance in kilometres between the user point and the school point using the **Haversine** formula with Earth radius **6371 km**. Distances are rounded to three decimal places for readability, then rows are sorted in memory by `distanceKm` ascending (nearest first).

This keeps MySQL free of vendor-specific geospatial types and makes the behavior easy to test and reason about in code.

## Deployment

Production deployment is environment-specific. After you host the API, record the public base URL here for reviewers:

**Deployment base URL:** `https://your-deployment.example.com` _(replace when live)_

Typical steps: provision MySQL, run `sql/schema.sql`, set the `DB_*` and `PORT` variables on the host (many platforms inject `PORT` automatically), run `npm start` as the process command, and ensure the health check can reach your database from that network.

## Postman

Export or attach a Postman collection alongside this repo when you submit or share the project. Suggested location:

`postman/CampusRadius-API.postman_collection.json` _(add the exported file here)_

Include calls for `GET /health`, `POST /addSchool`, and `GET /listSchools` with the examples above so others can run the same flows without rewriting requests.

## Author

**Name:** [Your name]

**Contact / portfolio / org:** [Optional — email, link, or affiliation]

Replace the placeholders with your own details for submission.

---

*CampusRadius API — school registration and proximity listing over Express and MySQL.*
