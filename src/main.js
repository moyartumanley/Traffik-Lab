import { fetchStations } from "./api/stations.js";
import { fetchLines } from "./api/lines.js";
import { observeDepartures } from "./api/departures.js";
import { findClosestStation } from "./logic/findStation.js";
import { getLocationFromIP, getLocationFromPort} from './utils/geo.js';

async function getUserLocation() {
  try {
    const location = await getLocationFromPort();
    return location;
  } catch (gpsError) {
    console.warn("GPS failed, falling back to IP-based location:", gpsError.message);
     const location = await getLocationFromIP();
    console.log("Detected location:", location);
    return location;
  }
}

(async () => {
  try {
    const [stations, user, lines] = await Promise.all([
      fetchStations(),
      getUserLocation(),
      fetchLines(),
    ]);

    const { filteredLines, allowedLineIds } = lines;
    const closestStation = findClosestStation(stations, user);
    if (!closestStation) return;

    observeDepartures(closestStation.id, allowedLineIds, filteredLines, closestStation.name);
  } catch (error) {
    console.error("Error:", error);
  }
})();
