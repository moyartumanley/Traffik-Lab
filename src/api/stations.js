// Station API data
const stationJSONURL =
  "https://transport.integration.sl.se/v1/sites?expand=true";

/**
 * Fetches all availiable stations from Traffik Lab station API
 * @return {Object} Object containing data for all stations
 */
export async function fetchStations() {
  const response = await fetch(stationJSONURL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log("Fetched stations:", data);
  return data;
}
