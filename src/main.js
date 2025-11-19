import { fetchLines } from "./api/lines.js";
import { fetchStations } from "./api/stations.js";
import { getLocationFromIP, getLocationFromPort } from "./utils/geo.js";
import { findClosestStations } from "./logic/findStation.js";
import { observeDepartures } from "./api/departures.js";
import { uiState } from "./ui/uiState.js";
import { startMatrixLoop } from "./ui/renderMatrix.js";
import "./ui/joystickController.js";

// TODO: improve gps implementation, implement ui matrix

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

(async () => {
  // Fetches initial api data (stations, lines) and user location asynchronously 
  const [stations, user, lines] = await Promise.all([
    fetchStations(),
    getUserLocation(),
    fetchLines(),
  ]);

  const { filteredLines, allowedLineIds } = lines;

  // Determines the 8 nearest stations and populates uiState.nearestStations (shared state that informs how the ui will look) 
  uiState.nearestStations = findClosestStations(stations, user);

  // Retrieves 8 closest stations for the bottom row display 
  const stopsToObserve = uiState.nearestStations.slice(0, 8);

  // Fetches departures for all 8 stations, initial fetch important for populating UI 
  const fetchAllDepartures = async () => {
    await Promise.all(
      stopsToObserve.map((stop) =>
        observeDepartures(stop.id, allowedLineIds, filteredLines, stop.name)
      )
    );
  };

  // Perform initial departure fetch and await ensures data is in uiState before rendering senseHat 
  await fetchAllDepartures();

 // Recurring departure fetch, checks for new departures every 30s 
  setInterval(fetchAllDepartures, 30000); 

  // Refreshes senseHat matrix iff. first departure data is availiable 
  startMatrixLoop();
})();
