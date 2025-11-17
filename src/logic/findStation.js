import { haversineDistance } from "../utils/geo.js";
import { uiState } from "../ui/uiState.js";

/**
 * Finds the seven closest stations from all available stations using user location data
 * and stores them in uiState.nearestStations.
 * @param {Array} allStationData JSON array retrieved from Traffik Lab station API
 * @param {Object} user Object containing user geographic data such as latitude and longitude
 */
export function findClosestStations(allStationData, user) {
  if (!Array.isArray(allStationData)) {
    console.error("Station data is not an array", allStationData);
    uiState.nearestStations = [];
    return;
  }

  const userLat = user.lat;
  const userLon = user.lon;

  const stationsWithDistance = allStationData.map((station) => ({
    ...station,
    distanceKm: haversineDistance(userLat, userLon, station.lat, station.lon),
  }));

  const closestStations = stationsWithDistance
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 7)
    .map((s) => ({
      ...s,
      color: [255, 255, 255], // default pixel color for stops
    }));

  uiState.nearestStations = closestStations;

  // Ensure the stop selector stays in bounds
  if (uiState.stopIndex >= uiState.nearestStations.length) {
    uiState.stopIndex = uiState.nearestStations.length - 1;
  }

  console.log("Updated nearest stations in uiState:", uiState.nearestStations);
}
