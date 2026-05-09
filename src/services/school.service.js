const { pool } = require("../config/database");
const { haversineDistanceKm } = require("../utils/haversine");

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

function buildSchoolWithDistance(row, userLatitude, userLongitude) {
  const schoolLat = Number(row.latitude);
  const schoolLon = Number(row.longitude);

  const distanceKmRaw = haversineDistanceKm(
    userLatitude,
    userLongitude,
    schoolLat,
    schoolLon
  );

  const distanceKm = Number(distanceKmRaw.toFixed(3));

  return {
    id: row.id,
    name: row.name,
    address: row.address,
    latitude: schoolLat,
    longitude: schoolLon,
    distanceKm,
  };
}

/**
 * All schools with Haversine distance from the user point, nearest first.
 * Original school attributes preserved; distance added as km (3 decimal places).
 */
async function listSchoolsSortedByDistance(userLatitude, userLongitude) {
  const [rows] = await pool.execute(
    `SELECT id, name, address, latitude, longitude FROM schools`
  );

  const schools = rows.map((row) =>
    buildSchoolWithDistance(row, userLatitude, userLongitude)
  );

  schools.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return a.id - b.id;
  });

  return schools;
}

module.exports = {
  createSchool,
  listSchoolsSortedByDistance,
};
