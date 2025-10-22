const stationJSONURL = "https://transport.integration.sl.se/v1/sites?expand=true";

/** Retrieving all sites within API */
const stationData = stationData = 
  fetch(stationJSONURL)
  .then(response => {
    if(!response.ok) throw new Error(response.status)
    return response.json();
  })

/** Tracking user geographic data */
const userLocation = new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let [lon, lat] = [position.coords.longitude, position.coords.latitude];
      resolve({ lon, lat });
    },
    (error) => {
      reject(error);
    }
  );
}).catch((error) => error)

// Haversine formula to calculate distance:
function haversineDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371
  const toRadians = (angle) => angle * (Math.PI/180)

  // distances between lats and lons as radians
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = earthRadius * c // distance in km
  return d
}

/** Finding the closest station */
function closestStation = stationData.map(station => ({
  // keep all avail values, create a new key called distanceKm which calculates distance from current geo pos
  ...station, 
  distanceKm: haversineDistance(userLat, userLon, station.lat, station.lon)
}))
// reduce basically is kinda like a for loop, for all stations, is the current closer than what was previously considered the closest? if so, replace
.reduce((closest, current) => {
  return (closest.distanceKm < current.distanceKm ? closest: current)
});

const closestDistanceKm = closestStation.distanceKm;
const siteId = closestStation.id;
const stationDeparturesJSON = `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;
const stationDepartures = Generators.observe(notify => {
  const fetchDepartures = () => {
    fetch(stationDeparturesJSON)
      .then(response => {
        if(!response.ok) throw new Error(response.status)
          return response.json()
      })
      .then(data => {
        // notify provides cell w/ value
        notify(data)
      })
  }

  //call fetchDepartures to get initial result
  fetchDepartures()

  //then repeat call ever 30sec so cells below update w/ new data
  const interval = setInterval(fetchDepartures, 30000)

  //cleans if cell is deleted/reran
  return() => clearInterval(interval)
});

const stationDepartureData = stationDepartures.departures.map(d => ({
  destination: d.destination,
  direction: d.direction,
  state: d.state, 
  scheduled: d.scheduled,
  expected: d.display,
  line: d.line.id,
  transport_mode: d.line.transport_mode
}));

