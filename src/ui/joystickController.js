import Joystick from "../joystick.js";
import { uiState } from "../ui/uiState.js";
import { drawMatrix } from "./renderMatrix.js";
import {
  displayDepartureInfo,
  displayText,
} from "../sensehat-animations/textDisplay.js";
import { getLineColor } from "../utils/transitColors.js";
import { lock, unlock } from "./animationLock.js";
import {
  redMetro,
  blueMetro,
  greenMetro,
  redBus,
  blueBus,
  yellowBus
} from "../sensehat-animations/animations.js";

const joystick = new Joystick();

// Animations for specific lines and forms of transit
export const ANIMATIONS = {
  metro: {
    "#DA291C": redMetro,
    "#005AA7": blueMetro,
    "#007F3E": greenMetro,
  },
  bus: {
    "#DA291C": redBus,
    "#005AA7": blueBus,
    "#FFA500": yellowBus
  },
};

/** HELPER FUNCTIONS */

// Retrieves departures for the currently selected stop
function getSelectedStopDepartures() {
  const selectedStop = uiState.nearestStations[uiState.stopIndex];
  if (!selectedStop) return [];
  return uiState.departuresByStopId.get(selectedStop.id) || []; // retrieves departures from map by using the station's stop ID
}

/**
 * Plays a short animation for a given departure. Animation is dependent on departure mode and line color.
 * @param {Object} departure Object containing departure data
 */
export async function playAnimation(departure) {
  // retrieve form of transit and line color from departure
  const mode = departure.station_transport_type.toLowerCase();
  const lineColorHex = getLineColor(
    departure.line.designation,
    departure.line.transport_mode
  );

  // use departure mode of transit and line color to obtain animation
  const animation = ANIMATIONS[mode]?.[lineColorHex];

  // if there isnt an animation for the specific mode of transit or line color, warn in console
  if (!animation) {
    console.warn(
      "No animation defined for",
      mode,
      departure.line.designation,
      lineColorHex
    );
    return;
  }

  // wait for animation to finish
  await animation();
}

/** JOYSTICK NAVIGATION HANDLING */

// NAVIGATES DEPARTURES (up/down):
joystick.on("up", () => {
  if (uiState.animationLock) return; // prevent navigation during animation
  uiState.departureIndex = Math.max(0, uiState.departureIndex - 1); // changes departure index, goes to earlier departure
  drawMatrix(); // refresh senseHat matrix to reflect change
});

joystick.on("down", () => {
  if (uiState.animationLock) return; // prevent navigation during animation
  const currentDepartures = getSelectedStopDepartures(); // gets current stop's departures
  // limit the index to the number of available departures (max 7), goes to later departures
  uiState.departureIndex = Math.min(
    currentDepartures.length - 1, // highest valid index
    uiState.departureIndex + 1 // intended new index
  );
  drawMatrix(); // refresh senseHat matrix to reflect change
});

// NAVIGATES STATIONS (left/right):
joystick.on("left", () => {
  if (uiState.animationLock) return; // prevent navigation during animation
  uiState.stopIndex =
    (uiState.stopIndex -
      1 + // intended new idx
      uiState.nearestStations.length) % // + number of stops
    uiState.nearestStations.length; // ensures final idx is always in range of 0 to n-1 and wraps selection to right
  uiState.departureIndex = 0; // resets departure selection when changing stop
  drawMatrix(); // refresh senseHat matrix to reflect change
});

joystick.on("right", () => {
  if (uiState.animationLock) return; // prevent navigation during animation
  uiState.stopIndex = (uiState.stopIndex + 1) % uiState.nearestStations.length; // ensures in range of 0 to n-1
  uiState.departureIndex = 0; // Reset departure selection when changing stop
  drawMatrix(); // refresh senseHat matrix to reflect change
});

/** ENTER HANDLING (animation) */

joystick.on("enter", async () => {
  if (uiState.animationLock) return;

  // lock animation system to stop the matrix refresh loop, prevents pixel overlap
  lock();

  try {
    const selectedStop = uiState.nearestStations[uiState.stopIndex];
    const departures = getSelectedStopDepartures();
    const dep = departures[uiState.departureIndex];

    if (dep) {
      // vehicle animation runs while animation lock is active
      await playAnimation(dep);

      // text scrolling runs while animation lock is active
      await displayDepartureInfo(
        dep,
        dep.display,
        selectedStop.name,
        dep.lineColor
      );
    } else if (selectedStop) {
      // if stop is selected but no departure is found, display stop name
      await displayText(selectedStop.name, "#FFA500");
    }

    // redraw UI matrix to ensure navigation grid is back on screen
    drawMatrix();
  } catch (error) {
    console.error("Error during enter sequence:", error);
    await displayText("ERROR", "#FF0000");
  } finally {
    // unlock animation lock regardless of animation success/failure
    // allows matrix refesh loop to resume
    unlock();
  }
});
