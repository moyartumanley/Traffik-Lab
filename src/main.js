import { fetchStations } from "./api/stations.js";
import { fetchLines } from "./api/lines.js";
import { observeDepartures } from "./api/departures.js";
import { findClosestStation } from "./logic/findStation.js";

async function getUserLocation() {
  //TODO: Replace with actual GPS
  const lat = 59.3293;
  const lon = 18.0686;
  console.log("Mock location:", { lat, lon });
  return { lat, lon };
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
