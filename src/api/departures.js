import { getLineColor } from "../utils/transitColors.js";
import { parseTime } from "../utils/geo.js";
import { uiState } from "../ui/uiState.js";

/**
 * Renders departure data onto index.html for debugging purposes.
 * @param {Object} data An object containing data for forms of transport approaching and departing from a given station.
 */
export function renderDepartures(data, stationName, stationType) {
  console.clear();
  data.forEach((departure) => {
    console.log(
      `Line: ${departure.line.id} → ${departure.destination} | Expected Arrival: (${departure.expected}) | Time: ${departure.scheduled} | Transport Type: ${departure.line.transport_mode}`
    );
  });
}

/**
 * Observes seven earliest departures for a given station and updates uiState.
 * @param {int} stopId Specific site id for a given station.
 * @param {Set<string>} allowedLineIds Set of line IDs to filter by.
 * @param {Array<Object>} filteredLines List of line objects used for color mapping.
 * @param {string} stopName Name of the station.
 */
export async function observeDepartures(
  stopId,
  allowedLineIds,
  filteredLines,
  stopName
) {
  if (!stopId) return;

  try {
    const response = await fetch(
      // TraffikLab API url for retrieving departures from a specific station
      `https://transport.integration.sl.se/v1/sites/${stopId}/departures`
    );

    // If link throws 404 or some other error output said error
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Returns departures as a object
    const stationDepartures = await response.json();

    // Filter departures for allowed lines (only looking at buses and metros to narrow scope)
    const filteredDepartures = stationDepartures.departures.filter((d) =>
      allowedLineIds.has(d.line.id)
    );

    // For each departure, map its form of transport (bus or metro) and assign lineColor
    const departuresWithColor = filteredDepartures.map((d) => {
      const mode = (d.line.transport_mode || "unknown").toLowerCase();
      const hex = getLineColor(d.line.designation, d.line.transport_mode); // hex to departure line color

      return {
        ...d,
        station_transport_type: mode,
        lineColor: hex, // used to change LEDs for renderMatrix
      };
    });

    // Store only the up to 7 earliest departures
    const currentDepartures = departuresWithColor.slice(0, 7);

    // Store the departures in the Map keyed by the station's stopId
    uiState.departuresByStopId.set(stopId, currentDepartures);

    // Set highlighted stop name to be the stop name of station
    uiState.currentStopName = stopName;
    // console.log(currentDepartures[0]);
    return currentDepartures;

  } catch (error) {
    console.error(
      `Error observing departures for ${stopName} (${stopId}):`,
      error
    );
    // Clears data for this stop on error to prevent displaying old data
    uiState.departuresByStopId.set(stopId, []);
  }
}
