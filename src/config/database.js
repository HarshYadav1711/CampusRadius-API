const mysql = require("mysql2/promise");
const { envInt } = require("./env");

/**
 * Fail fast when mandatory DB env vars are absent (prevents silent localhost defaults in prod).
 * Password may be empty for local dev — always read from env, never hardcoded.
 */
function required(name) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Hosted MySQL (Aiven, cloud providers) usually expects TLS. Set DB_SSL=true when the provider requires it.
 * Use DB_SSL_REJECT_UNAUTHORIZED=false only if the provider documents it for dev/demo tiers (weaker trust).
 */
function sslOption() {
  if (process.env.DB_SSL !== "true") {
    return undefined;
  }
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
    return { rejectUnauthorized: false };
  }
  return {};
}

function poolOptions() {
  const ssl = sslOption();

  return {
    host: required("DB_HOST"),
    port: envInt("DB_PORT", 3306),
    user: required("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: required("DB_NAME"),
    ...(ssl !== undefined ? { ssl } : {}),
    waitForConnections: true,
    connectionLimit: envInt("DB_POOL_LIMIT", 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

/** One shared pool per process — mysql2 reconnects within the pool as needed. */
const pool = mysql.createPool(poolOptions());

module.exports = { pool };
