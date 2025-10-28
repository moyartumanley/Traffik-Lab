import { haversineDistance } from "../utils/geo.js";

/**
 * Finds the closest station from all availiable stations using user location data.
 * @param {Object} allStationData JSON retrieved from Traffik Lab station API that contains all station sites.
 * @param {Object} user Object containing user geographic data such as latitude and longitude.
 * @return {Object} Object containing data for closest station.
 *
 */
export function findClosestStation(allStationData, user) {
  if (!Array.isArray(allStationData)) {
    console.error("Station data is not an array", allStationData);
    return null;
  }

  // Assign user latitude and longitude to local vars
  console.log("User location:", user);
  const userLat = user.lat;
  console.log("User latitude:", userLat);
  const userLon = user.lon;
  console.log("User longitude:", userLon);

  const stations = allStationData.map((station) => ({
    // keep all avail values, create a new key called distanceKm which calculates distance from current geo pos
    ...station,
    distanceKm: haversineDistance(userLat, userLon, station.lat, station.lon), // calculate distance from user using haversine distance
  }));

  // reduce basically is kinda like a for loop, for all stations, is the current closer than what was previously considered the closest? if so, replace
  const closest = stations.reduce((closest, current) =>
    closest.distanceKm < current.distanceKm ? closest : current
  );

  console.log("Closest station:", closest);
  return closest;
}