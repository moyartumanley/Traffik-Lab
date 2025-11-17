import { fetchLines } from "./api/lines.js";
import { fetchStations } from "./api/stations.js";
import { getLocationFromIP, getLocationFromPort } from "./utils/geo.js";
import { findClosestStations } from "./logic/findStation.js";
import { observeDepartures } from "./api/departures.js";
import { uiState } from "./ui/uiState.js";
import { startMatrixLoop } from "./ui/renderMatrix.js";
import "./ui/joystickController.js";

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

// (async () => {
//   try {
//     const [stations, user, lines] = await Promise.all([
//       fetchStations(),
//       getUserLocation(),
//       fetchLines(),
//     ]);

//     const { filteredLines, allowedLineIds } = lines;
//     const closestStation = findClosestStation(stations, user);
//     if (!closestStation) return;

//     observeDepartures(closestStation.id, allowedLineIds, filteredLines, closestStation.name);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();

(async () => {
  const [stations, user, lines] = await Promise.all([
    fetchStations(),
    getUserLocation(),
    fetchLines(),
  ]);

  const { filteredLines, allowedLineIds } = lines;

  // populate uiState.nearestStations
  findClosestStations(stations, user);

  // observe departures for the currently selected station
  const firstStation = uiState.nearestStations[0];
  if (firstStation) {
    observeDepartures(
      firstStation.id,
      allowedLineIds,
      filteredLines,
      firstStation.name
    );
  }

  // start matrix refresh loop
  startMatrixLoop();
})();
