const { pool } = require("../config/database");

async function createSchool({ name, address, latitude, longitude }) {
  const [result] = await pool.execute(
    `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`,
    [name, address, latitude, longitude]
  );

  return {
    id: result.insertId,
    name,
    address,
    latitude,
    longitude,
  };
}

module.exports = {
  createSchool,
};
