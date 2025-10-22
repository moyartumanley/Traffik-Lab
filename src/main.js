// needed to read data from external GPS device
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

// Station API data
const stationJSONURL =
  "https://transport.integration.sl.se/v1/sites?expand=true";

/**
 * Fetches all availiable stations from Traffik Lab station API
 * @return {Object} Object containing data for all stations
 */
async function fetchStations() {
  const response = await fetch(stationJSONURL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log("Fetched stations:", data);
  return data;
}

/** Retrieves geographic data of user
 * @return {Object} Object containing latitude and longitude of user
 */
async function getUserLocation() {
  //TODO: Replace hard-coded location data with data from GPS.
  const lat = 59.3293;
  const lon = 18.0686;
  console.log("Mock location:", { lat, lon });
  return { lat, lon };
}

/**
 * Uses the Haversine formula to calculate the distance between two geographic points.
 * @param {float} lat1 Latitude of first point
 * @param {float} lon1 Longitude of first point
 * @param {float} lat2 Latitude of second point
 * @param {float} lon2 Longitude of second point
 * @return Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
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

/**
 * Finds the closest station from all availiable stations using user location data.
 * @param {Object} allStationData JSON retrieved from Traffik Lab station API that contains all station sites.
 * @param {Object} user Object containing user geographic data such as latitude and longitude.
 * @return {Object} Object containing data for closest station.
 *
 */
function findClosestStation(allStationData, user) {
  if (!Array.isArray(allStationData)) {
    console.error("Station data is not an array", allStationData);
    return null;
  }

  // Assign user latitude and longitude to local vars
  console.log("User location:", user);
  userLat = user.lat;
  console.log("User latitude:", userLat);
  userLon = user.lon;
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

/**
 * Retrieves data concerning transportation approaching and leaving a given station.
 * @param {Object} stationDepartures Object containing a JSON retrieved from Traffik Lab departure API.
 * @return {Object} departureData: Object containing data for all availiable departures.
 */
function fetchTransportData(stationDepartures) {
  if (!stationDepartures || !Array.isArray(stationDepartures.departures)) {
    console.error("Invalid station departures data:", stationDepartures);
    return [];
  }

  console.log("Station departure data:", stationDepartures);

  return stationDepartures.departures.map((departure) => ({
    destination: departure.destination,
    direction: departure.direction,
    state: departure.state,
    scheduled: departure.scheduled,
    expected: departure.display,
    line: departure.line,
    transport_mode: departure.line.transport_mode,
  }));
}

/**
 * Observes departure data for a given station
 * @param {int} siteId Specific site id for a given station.
 * @return {setInterval} Re-executes departure retrieval every 30s to get up-to-date data.
 */
function observeDepartures(siteId) {
  const url = `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;
  async function fetchDepartures() {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (!data.departures) {
        console.error("No departures found:", data);
        return;
      }

      const departures = fetchTransportData(data);
      renderDepartures(departures);
    } catch (error) {
      console.error("Error fetching departures:", error);
    }
  }

  fetchDepartures(); // initial fetch
  return setInterval(fetchDepartures, 30000);
}

/**
 * Renders departure data onto index.html for debugging purposes.
 * @param {Object} data An object containing data for forms of transport approaching and departing from a given station.
 */
function renderDepartures(data) {
  const output = document.getElementById("departures");
  output.innerHTML = ""; // clear previous list
  data.forEach((departure) => {
    const item = document.createElement("div");
    item.textContent = ` Line: ${departure.line.id} → ${departure.destination} | Expected Arrival: (${departure.expected}) | Time: ${departure.scheduled} | Transport Type: ${departure.line.transport_mode}`;
    output.appendChild(item);
  });
}

// Runs the code
(async () => {
  try {
    const [stations, user] = await Promise.all([
      fetchStations(),
      getUserLocation(),
    ]);

    const closestStation = findClosestStation(stations, user);
    if (!closestStation) return;

    // Watch for departures
    observeDepartures(closestStation.id);
  } catch (error) {
    console.error("Error:", error);
  }
})();
