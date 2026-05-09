# Deployment notes (demo / assessment)

This project is a standard Node + Express app: one web process, one MySQL database, environment variables for configuration. Below is a realistic path that stays on **free or zero-cost tiers** suitable for a reviewer to hit your API over HTTPS.

Limitations are called out plainly: free app tiers often **spin down after idle time** (cold starts), enforce **memory and CPU caps**, and may **sleep** until the next request. That is acceptable for a demonstration but not for production traffic.

## Application hosting: Render (recommended for simplicity)

[Render](https://render.com) offers a **free Web Service** that fits this stack: connect a Git repository, run `npm install`, start with `npm start`, and bind to the `PORT` they inject.

### Steps

1. Push this repository to GitHub (or GitLab / Bitbucket connected to Render).
2. In Render: **New** → **Web Service** → select the repo.
3. Configure:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/health` (optional but helps the dashboard stay green when MySQL is up)
4. Under **Environment**, set at least:

   | Key | Example |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DB_HOST` | From your MySQL provider |
   | `DB_PORT` | Usually `3306` or as documented |
   | `DB_USER` | |
   | `DB_PASSWORD` | |
   | `DB_NAME` | |
   | `DB_SSL` | `true` if the provider requires TLS (common on managed MySQL) |

5. Deploy. Your API base URL will look like `https://<service-name>.onrender.com`.

### Free-tier honesty

- The instance **may sleep** after inactivity; the first request after sleep can take **tens of seconds**.
- Cold starts are normal on free demo hosts; mention them to reviewers if timing matters.

Optional: this repo includes a **Render Blueprint** file `render.yaml`. You can use Render’s “Blueprint” flow to provision from the repo, then fill in secret env vars (database password) in the dashboard—never commit secrets.

## Database hosting: MySQL options that fit a student demo

You need a network-reachable MySQL 8–compatible instance. Credentials almost always differ from local `root` / empty password.

### Option A — Aiven (free MySQL tier)

[Aiven](https://aiven.io) documents a **free MySQL** tier suitable for development (limits and terms change—confirm on their site). Create a MySQL service, note **host**, **port**, **user**, **password**, **database name**, and enable TLS if required—set **`DB_SSL=true`** in the web service environment.

### Option B — db4free.net (quick test only)

[db4free.net](https://www.db4free.net/) offers free MySQL for testing. Service is **best-effort**, not a SLA—fine for a short demo if you accept possible downtime. Import `sql/schema.sql` through phpMyAdmin or the MySQL CLI using the credentials they give you.

### Option C — MySQL you already have

Any VPS, school lab server, or cloud VM with MySQL works if **firewall rules allow inbound 3306** (or the host’s port) from your app host’s egress IPs. Many providers restrict this; managed DB + TLS is usually easier.

After the database exists, run:

```bash
mysql -h <host> -u <user> -p <DB_NAME> < sql/schema.sql
```

(or paste `sql/schema.sql` in the host’s SQL UI).

## Environment checklist on the host

Set the same variables as in `.env.example`. Critical points:

- **`NODE_ENV=production`** so stack traces are not returned to API clients.
- **`PORT`** is normally **provided by the platform**—do not hardcode it in Render.
- **`BIND_HOST`** defaults to `0.0.0.0` in code; you rarely need to set it unless the platform documents otherwise.
- **`DB_SSL=true`** when the MySQL provider requires encrypted connections (check their connection string / docs).
- **`CORS_ORIGIN`** — set to your deployed frontend origin if you add one later; `*` is permissive and acceptable for a backend-only demo.

## Post-request verification

1. `GET https://<your-host>/health` → expect **200** when MySQL is reachable.
2. `POST https://<your-host>/addSchool` with JSON body from the README.
3. `GET https://<your-host>/listSchools?latitude=28.6139&longitude=77.2090`.

Import `postman/CampusRadius-API.postman_collection.json` and set the `baseUrl` variable to your HTTPS base URL.

## Deployment URL placeholder (fill in for submission)

**Live API base URL:** `https://_______________`

Replace with your Render (or other) URL once deployed.
