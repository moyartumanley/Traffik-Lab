import { getLineColor } from "../utils/transitColors.js";
import { parseTime } from "../utils/geo.js";
import { triggerAnimation } from "../logic/animationTrigger.js";
import { displayDepartureInfo } from "../transit-animations/textDisplay.js";

export function fetchEarliestDepature(departures) {
  if (!departures || departures.length === 0) {
    return null;
  }

  // console.log(departures);
  return departures.reduce((earliest, current) => {
    return parseTime(current.scheduled) < parseTime(earliest.scheduled)
      ? current
      : earliest;
  });
}

/**
 * Renders departure data onto index.html for debugging purposes.
 * @param {Object} data An object containing data for forms of transport approaching and departing from a given station.
 */
export function renderDepartures(data, stationName, stationType) {  console.clear();
  data.forEach((departure) => {
    console.log(
      `Line: ${departure.line.id} → ${departure.destination} | Expected Arrival: (${departure.expected}) | Time: ${departure.scheduled} | Transport Type: ${departure.line.transport_mode}`
    );
  });
}

/**
 * Observes departure data for a given station
 * @param {int} siteId Specific site id for a given station.
 * @return {setInterval} Re-executes departure retrieval every 30s to get up-to-date data.
 */
export function observeDepartures(siteId, allowedLineIds, filteredLines, stationName) {
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

      // Filter departures to include only metro or bus
      const filteredDepartures = data.departures.filter((d) =>
        allowedLineIds.has(d.line.id)
      );

      // Determine station type from the first filtered departure
      const stationType =
        filteredDepartures.length > 0
          ? filteredLines.find((l) => l.id === filteredDepartures[0].line.id)
              ?.type || "unknown"
          : "unknown";

      // Add the station type to each departure for rendering
      const departuresWithType = filteredDepartures.map((d) => ({
        ...d,
        station_transport_type: stationType,
      }));

      const earliest = fetchEarliestDepature(departuresWithType);

      if (earliest) {
        console.log(
          `Earliest departure @ ${stationName}:`,
          earliest.line.designation,
          earliest.destination,
          earliest.scheduled,
          earliest.expected
        );

        const lineColorHex = getLineColor(
          earliest.line.designation,
          earliest.station_transport_type
        );
        // Trigger corresponding animation using the real color
        console.log(
          `Detected color ${lineColorHex} for ${earliest.station_transport_type} line ${earliest.line.designation}`
        );

        await triggerAnimation(lineColorHex, earliest.station_transport_type);
        await displayDepartureInfo(earliest, earliest.display, stationName, lineColorHex);
      }

      // console.log(`Closest station type: ${stationType}`);
      // console.log("Filtered departures:", departuresWithType);

      // const departures = fetchTransportData(departuresWithType);
      renderDepartures(departuresWithType, stationName, stationType);
    } catch (error) {
      console.error("Error fetching departures:", error);
    }
  }

  fetchDepartures(); // initial fetch
  return setInterval(fetchDepartures, 60000); //refresh every min so theres time for animations
}

