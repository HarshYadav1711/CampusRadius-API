/**
 * Haversine great-circle distance between two WGS84 points (degrees).
 * Earth radius R = 6371 km (mean radius).
 *
 * @returns {number} Distance in kilometres (same units as typical GPS apps).
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);

  const a =
    sinΔφ * sinΔφ +
    Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = {
  haversineDistanceKm,
};
