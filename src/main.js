import { fetchLines } from "./api/lines.js";
import { fetchStations } from "./api/stations.js";
import {
  getLocationFromIP,
  getLocationFromPort,
  haversineDistance,
} from "./utils/geo.js";
import { findClosestStations } from "./utils/findStation.js";
import { observeDepartures } from "./api/departures.js";
import { uiState } from "./ui/uiState.js";
import { startMatrixLoop } from "./ui/renderMatrix.js";
import "./ui/joystickController.js";
import { sleep } from "./utils/sleep.js";
import { displayText } from "./sensehat-animations/textDisplay.js";

/** Global states */
let allStationsCache = null;
let linesCache = null;
let lastKnownLocation = null;
let departureUpdateIntervalId = null; // ID for the 10s departure fetch

/** Thresholds */
const LOCATION_CHANGE_KM = 0.5; // only update location if changed by 1/2 km
const LOCATION_CHECK_INTERVAL_MS = 30000; // check location every 30s

/** Retrieves user location either from GPS connected to port, or from IP address, */
async function getUserLocation() {
  try {
    const location = await getLocationFromPort();
    return location;
  } catch (gpsError) {
    console.warn(
      "GPS failed, falling back to IP-based location:",
      gpsError.message
    );
    const location = await getLocationFromIP();
    console.log("Detected location:", location);
    return location;
  }
}

/**
 * Find nearest stations and start/restart departure observation.
 * Runs on initial setup and whenever the location changes significantly.
 * @param {Object} location The current user location {lat, lon}.
 */
async function updateStationsAndDepartures(location) {
  console.log("Starting station and departure update for new location.");
  const { filteredLines, allowedLineIds } = linesCache;

  // Determine the 8 nearest stations
  uiState.nearestStations = findClosestStations(allStationsCache, location);

  // Reset selection index at the new closest station
  uiState.stopIndex = 0;
  uiState.departureIndex = 0;

  // for debugging: log closest station and distance
  console.log(
    "Closest station:",
    uiState.nearestStations[0].name,
    "at",
    uiState.nearestStations[0].distanceKm.toFixed(3),
    "km"
  );

  // Clear any existing 10s departure update loop to prevent duplicates
  if (departureUpdateIntervalId) {
    clearInterval(departureUpdateIntervalId);
    departureUpdateIntervalId = null;
  }

  // Departure fetch logic for the 8 closest stops
  const stopsToObserve = uiState.nearestStations.slice(0, 8);
  const fetchAllDepartures = async () => {
    await Promise.all(
      stopsToObserve.map((stop) =>
        observeDepartures(stop.id, allowedLineIds, filteredLines, stop.name)
      )
    );
  };

  // Initial departure fetch
  await fetchAllDepartures();

  // Start recurring 10s departure fetch
  departureUpdateIntervalId = setInterval(fetchAllDepartures, 10000);
}

/**
 * Checks the device's location and calls updateStationsAndDepartures
 * if the change exceeds the defined thresholds.
 */
async function checkLocationPeriodically() {
  const currentLocation = await getUserLocation();

  if (lastKnownLocation === null) {
    // initial run: always update stations/departures
    lastKnownLocation = currentLocation;
    await updateStationsAndDepartures(currentLocation);
    return;
  }

  // Calculate distance between last known location and current location
  const distance = haversineDistance(
    lastKnownLocation.lat,
    lastKnownLocation.lon,
    currentLocation.lat,
    currentLocation.lon
  );

  console.log(
    `Location check: Moved ${distance.toFixed(3)} km from last update.`
  );

  // log for debugging
  if (distance >= LOCATION_CHANGE_KM) {
    console.log(
      `significant location change detected. ${distance.toFixed(2)} km.`
    );

    // Update state and rerun the main update logic
    lastKnownLocation = currentLocation;
    await updateStationsAndDepartures(currentLocation);
  }
}

(async () => {
  try {
    // display initial connecting msg
    displayText("Connecting...","#FFFFFF",0.065);
    // Fetch initial data (stations, lines) and cache them
    const [stations, lines] = await Promise.all([
      fetchStations(),
      fetchLines(),
    ]);

    allStationsCache = stations;
    linesCache = lines;

    // Perform starting location check and set up initial set of stations/departures
    await checkLocationPeriodically();

    // Start the periodic location check interval (runs every 5 min)
    setInterval(checkLocationPeriodically, LOCATION_CHECK_INTERVAL_MS);

    // Start the Sense HAT matrix refresh loop
    startMatrixLoop();
  } catch (err) {
    console.error("Critical failure during startup:", err.message);
    process.exit(1);
  }
})();
