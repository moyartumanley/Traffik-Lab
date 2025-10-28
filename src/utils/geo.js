/**
 * Converts a time string to a Date object.
 * @param {string} timeStr ISO-formatted time string
 * @returns {Date}
 */
export function parseTime(timeStr) {
  return new Date(timeStr);
}

/**
 * Uses the Haversine formula to calculate the distance between two geographic points.
 * @param {float} lat1 Latitude of first point
 * @param {float} lon1 Longitude of first point
 * @param {float} lat2 Latitude of second point
 * @param {float} lon2 Longitude of second point
 * @return Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2){
  const earthRadius = 6371;
  const toRadians = (angle) => angle * (Math.PI / 180);

  // distances between lats and lons as radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = earthRadius * c; // distance in km
  return d;
};