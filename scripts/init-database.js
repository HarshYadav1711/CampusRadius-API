/**
 * Creates MySQL database + applies sql/schema.sql without the mysql CLI.
 * Usage (from project root): npm run db:init
 * Requires .env with DB_HOST, DB_USER, DB_NAME (and DB_PASSWORD if needed).
 */

const fs = require("fs");
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

function safeIdentifier(name, label) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `${label} must contain only letters, numbers, and underscores (got unsafe characters)`
    );
  }
  return name;
}

async function main() {
  const host = required("DB_HOST");
  const port = envInt("DB_PORT", 3306);
  const user = required("DB_USER");
  const password = process.env.DB_PASSWORD ?? "";
  const databaseName = safeIdentifier(required("DB_NAME"), "DB_NAME");
  const ssl = sslOption();

  const skipCreate =
    process.env.SKIP_CREATE_DATABASE === "true" ||
    process.env.SKIP_CREATE_DATABASE === "1";

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    ...(skipCreate ? { database: databaseName } : {}),
    ...(ssl !== undefined ? { ssl } : {}),
    multipleStatements: true,
  });

  try {
    if (!skipCreate) {
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
      await conn.query(`USE \`${databaseName}\``);
    }

    const schemaPath = path.join(rootDir, "sql", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    await conn.query(sql);

    console.log(`Database "${databaseName}" is ready (schema applied from sql/schema.sql).`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  const code = err && err.code;

  if (code === "ECONNREFUSED") {
    console.error(
      "Cannot connect to MySQL (connection refused). Start the MySQL Windows service (or your DB host), then check DB_HOST and DB_PORT in .env."
    );
  } else if (code === "ER_ACCESS_DENIED_ERROR") {
    console.error(
      "MySQL rejected the username/password. Fix DB_USER and DB_PASSWORD in .env."
    );
  } else if (code === "ENOTFOUND") {
    console.error(
      "DB_HOST could not be resolved. Check spelling in .env (use 127.0.0.1 or localhost for local MySQL)."
    );
  } else if (String(err.message || "").includes("Missing required environment variable")) {
    console.error(err.message);
    console.error('Tip: copy .env.example to .env in the project folder and set DB_HOST, DB_USER, DB_NAME.');
  } else {
    console.error(err.message || err);
  }

  process.exit(1);
});
