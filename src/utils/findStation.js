import { haversineDistance } from "../utils/geo.js";

/**
 * Finds the closest stations from all available stations using user location data
 * @param {Array} allStationData JSON array retrieved from Traffik Lab station API
 * @param {Object} user Object containing user geographic data (latitude and longitude)
 * @returns {Array} The sorted and filtered list of the 8 closest stations.
 */
export function findClosestStations(allStationData, user) {
  if (!Array.isArray(allStationData)) {
    console.error("Station data is not an array", allStationData);
    return []; 
  }

  const userLat = user.lat;
  const userLon = user.lon;

  const stationsWithDistance = allStationData.map((station) => ({
    ...station,
    distanceKm: haversineDistance(userLat, userLon, station.lat, station.lon),
  })); // For all stations, add entry for distance in km from user location

  const closestStations = stationsWithDistance
    .sort((a, b) => a.distanceKm - b.distanceKm) // Sort stations by distance from user location
    .slice(0, 8) // Get 8 closest stations
    .map((s) => ({
      ...s,
      color: [255, 255, 255], // Add a default pixel color for stops
    }));

  return closestStations; // Array is returned to main.js for setting uiState.nearestStations, easier to see where vals r being set.
}