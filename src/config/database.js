const mysql = require("mysql2/promise");
const { envInt } = require("./env");

/**
 * Single shared pool for the process. mysql2 pools recover from idle disconnects.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: envInt("DB_PORT", 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "campus_radius",
  waitForConnections: true,
  connectionLimit: envInt("DB_POOL_LIMIT", 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = { pool };
