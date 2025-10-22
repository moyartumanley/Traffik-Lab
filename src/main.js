const stationJSONURL =
  "https://transport.integration.sl.se/v1/sites?expand=true";

/** Retrieving all sites within API */
async function fetchStations() {
  const response = await fetch(stationJSONURL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log("Fetched stations:", data);
  return data;
}

/** Tracking user geographic data */
async function getUserLocation() {
  const lat = 59.3293; 
  const lon = 18.0686;
  console.log("📍 Mock location:", { lat, lon });
  return { lat, lon }; 
  // return new Promise((resolve, reject) => {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const coords = {
  //         lat: position.coords.latitude,
  //         lon: position.coords.longitude,
  //       };

  //       console.log("User location: ", coords);
  //       resolve(coords);
  //     },
  //     (error) => reject(error)
  //   );
  // });
}

// Haversine formula to calculate distance:
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

/** Finding the closest station */
function findClosestStation(stations, user) {
  if (!Array.isArray(stations)) {
    console.error("Station data is not an array", stations);
    return null;
  }

  const stations = stationData.map((station) => ({
    // keep all avail values, create a new key called distanceKm which calculates distance from current geo pos
    ...station,
    distanceKm: haversineDistance(userLat, userLon, station.lat, station.lon),
  }));

  // reduce basically is kinda like a for loop, for all stations, is the current closer than what was previously considered the closest? if so, replace
  const closest = stations.reduce((closest, current) =>
    closest.distanceKm < current.distanceKm ? closest : current
  );

  console.log("Closest station:", closest);
  return closest;
}

// const closestDistanceKm = closestStation.distanceKm;
// console.log(closestDistanceKm);
// const siteId = closestStation.id;

function observeDepartures(siteId){
  const stationDeparturesJSON = `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;

  async function fetchDepartures() {
    const response = await fetch(stationDeparturesJSON);
     if (!response.ok) throw new Error(`HTTP ${response.status}`);
     const data = await response.json();
     console.log("latest departures:", data)
  }

  fetchDepartures();
  return setInterval(fetchDepartures, 30000);
}

(async () => {
  try {
    const [stations, user] = await Promise.all([
      fetchStations(),
      getUserLocation(),
    ]);

    const closestStation = findClosestStation(stations, user);
    if(!closestStation) return;

    // Watch for departures
    observeDepartures(closestStation.id);
    
  } catch (error) {
    console.error("Error:", error)
  }
})();

// const stationDepartureData = stationDepartures.departures.map((d) => ({
//   destination: d.destination,
//   direction: d.direction,
//   state: d.state,
//   scheduled: d.scheduled,
//   expected: d.display,
//   line: d.line.id,
//   transport_mode: d.line.transport_mode,
// }
// ));
