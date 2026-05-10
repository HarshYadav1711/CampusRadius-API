/**
 * Verify MySQL connectivity using the same settings as the app (no mysql CLI needed).
 * Usage: npm run db:test
 *
 * For Aiven and most managed MySQL: set DB_SSL=true in .env (and DB_PORT to the value they show, e.g. 15122).
 */

const path = require("path");
const mysql = require("mysql2/promise");
const { envInt } = require("../src/config/env");

const rootDir = path.join(__dirname, "..");

require("dotenv").config({ path: path.join(rootDir, ".env") });
if (!process.env.DB_HOST) {
  require("dotenv").config({ path: path.join(process.cwd(), ".env") });
}

function required(name) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function sslOption() {
  if (process.env.DB_SSL !== "true") {
    return undefined;
  }
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
    return { rejectUnauthorized: false };
  }
  return {};
}

async function main() {
  const host = required("DB_HOST");
  const port = envInt("DB_PORT", 3306);
  const user = required("DB_USER");
  const password = process.env.DB_PASSWORD ?? "";
  const database = required("DB_NAME");
  const ssl = sslOption();

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ...(ssl !== undefined ? { ssl } : {}),
  });

  try {
    await conn.ping();
    const [rows] = await conn.query("SELECT 1 AS ok");
    console.log("MySQL connection OK.");
    console.log(`  Host: ${host}:${port}  Database: ${database}  User: ${user}`);
    console.log(`  TLS: ${ssl !== undefined ? "on" : "off"}`);
    console.log(`  Probe: ${JSON.stringify(rows[0])}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  const code = err && err.code;

  if (code === "ECONNREFUSED") {
    console.error("Connection refused. Check DB_HOST, DB_PORT, and that MySQL accepts remote connections.");
  } else if (code === "ER_ACCESS_DENIED_ERROR") {
    console.error("Access denied. Check DB_USER and DB_PASSWORD in .env.");
  } else if (code === "ENOTFOUND") {
    console.error("Host not found. Check DB_HOST spelling.");
  } else if (code === "ER_BAD_DB_ERROR") {
    console.error(`Database "${process.env.DB_NAME}" does not exist on this server. Create it or fix DB_NAME (Aiven often uses defaultdb).`);
  } else if (
    String(err.message || "").includes("SSL") ||
    String(err.message || "").includes("certificate")
  ) {
    console.error(err.message);
    console.error("Hint: For Aiven / managed MySQL, set DB_SSL=true in .env. If it still fails, try DB_SSL_REJECT_UNAUTHORIZED=false only per provider docs.");
  } else {
    console.error(err.message || err);
  }

  console.error("\nYou do not need the `mysql` program on Windows — use: npm run db:test");
  process.exit(1);
});
