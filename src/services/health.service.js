const { pool } = require("../config/database");

/**
 * Lightweight readiness-style check: process is up and MySQL accepts a round trip.
 */
async function checkDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return { connected: true };
  } finally {
    conn.release();
  }
}

async function getHealthSnapshot() {
  try {
    await checkDatabase();
    return {
      status: "ok",
      database: "up",
    };
  } catch (err) {
    return {
      status: "degraded",
      database: "down",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message,
    };
  }
}

module.exports = {
  getHealthSnapshot,
};
