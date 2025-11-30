import Joystick from "../joystick.js";
import { uiState } from "../ui/uiState.js";
import { drawMatrix } from "./renderMatrix.js";
import {
  displayDepartureInfo,
  displayText,
} from "../sensehat-animations/textDisplay.js";
import { getLineColor } from "../utils/transitColors.js";
import { lock, unlock } from "./animationLock.js";
import { sleep } from "../utils/sleep.js";
import {
  redMetro,
  blueMetro,
  greenMetro,
  redBus,
  blueBus,
  yellowBus,
  northbound,
  southbound,
} from "../sensehat-animations/animations.js";

import {
  animationCancel,
  setCancellation,
  resetCancellation,
} from "./animationCancel.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

const joystick = new Joystick();

// idx 7 = station rows, meaning we are no longer highlighting departures
const STATION_MODE_INDEX = 7;

export const ANIMATIONS = {
  metro: {
    "#DA291C": redMetro,
    "#005AA7": blueMetro,
    "#007F3E": greenMetro,
  },
  bus: {
    "#DA291C": redBus,
    "#005AA7": blueBus,
    "#FFA500": yellowBus,
  },
  direction: {
    1: northbound,
    2: southbound,
  },
};

/** HELPER FUNCTIONS */

/** Sets cancellation flag for animation lock */
function cancelAnimation() {
  console.log("Animation interrupted, cancelling.");
  setCancellation();
}
/** Cancels animation and redraws matrix */
async function cancelAndRedraw() {
  cancelAnimation();

  // release animation lock and add a timer buffer to hopefully prevent flickering.
  while (uiState.animationLock) {
    await sleep(50);
  }
  await sleep(50);

  sense.clear();
  drawMatrix();
}

/** Cancel on joystick touch, meant to be used in joystick feedback conditionals*/
function cancelOnTouch(){
    if (uiState.animationLock) {
    await cancelAndRedraw();
    return;
  }
}

/** Retrieves departures from a selected stop */
function getSelectedStopDepartures() {
  const selectedStop = uiState.nearestStations[uiState.stopIndex];
  if (!selectedStop) return [];
  return uiState.departuresByStopId.get(selectedStop.id) || [];
}

/** Plays animation associated with departure */
export async function playAnimation(departure) {
  const direction_code = departure.direction_code;
  const mode = departure.station_transport_type.toLowerCase();
  const lineColorHex = getLineColor(
    departure.line.designation,
    departure.line.transport_mode
  );

  const direction_animation = ANIMATIONS.direction[direction_code];
  const animation = ANIMATIONS[mode]?.[lineColorHex];

  // animation for departure direction (northbound/southbound)
  if (direction_animation) {
    await direction_animation();
    if (animationCancel.isCancelled) return;
  }

  // if there is no transit animation mapped then return, otherwise play
  if (!animation) return;
  await animation();
}

/** JOYSTICK NAVIGATION HANDLING */
joystick.on("up", async () => {
  cancelOnTouch();
  const currentDepartures = getSelectedStopDepartures();

  // if in station selector, jump back to the last departure on up
  if (uiState.departureIndex === STATION_MODE_INDEX) {
    // select last departure, or 0 if list is empty
    uiState.departureIndex = Math.max(0, currentDepartures.length - 1);
  } else {
    // normal navigation up
    uiState.departureIndex = Math.max(0, uiState.departureIndex - 1);
  }
  
  drawMatrix();
});

joystick.on("down", async () => {
  cancelOnTouch();
  const currentDepartures = getSelectedStopDepartures();
  
  // if in station selector, stay there
  if (uiState.departureIndex === STATION_MODE_INDEX) return;

  // if at last departure or list is empty, go to station selector
  if (uiState.departureIndex >= currentDepartures.length - 1) {
    uiState.departureIndex = STATION_MODE_INDEX;
  } else {
    // normal navigation down
    uiState.departureIndex++;
  }

  drawMatrix();
});

joystick.on("left", async () => {
  cancelOnTouch();
  uiState.stopIndex =
    (uiState.stopIndex - 1 + uiState.nearestStations.length) %
    uiState.nearestStations.length;
  
  // reset to top of departure list when changing stations
  uiState.departureIndex = 0;
  drawMatrix();
});

joystick.on("right", async () => {
  cancelOnTouch();
  uiState.stopIndex = (uiState.stopIndex + 1) % uiState.nearestStations.length;
  
  // reset to top of departure list when changing stations
  uiState.departureIndex = 0;
  drawMatrix();
});

/** ENTER HANDLING */

joystick.on("enter", async () => {
  cancelOnTouch();
  resetCancellation();
  lock();

  try {
    const selectedStop = uiState.nearestStations[uiState.stopIndex];
    const departures = getSelectedStopDepartures();

    // check if in station selector or valid departure
    if (uiState.departureIndex === STATION_MODE_INDEX) {
      // if station selector, just show the station name
      if (selectedStop) {
        await displayText(selectedStop.name, "#FFA500");
      }
    } else {
      // otherwise, show animation and info
      const dep = departures[uiState.departureIndex];
      // if departureIndex is 0 but list is empty, treat as station selector
      if (dep) {
        await playAnimation(dep);
        if (!animationCancel.isCancelled) {
          await displayDepartureInfo(
            dep,
            dep.display,
            selectedStop.name,
            dep.lineColor
          );
        }
      } else if (selectedStop) {
        await displayText(selectedStop.name, "#FFA500");
      }
    }

    if (!animationCancel.isCancelled) {
        drawMatrix();
    }
  } catch (error) {
    console.error("Error during enter sequence:", error);
    await displayText("ERROR", "#FF0000");
  } finally {
    if (uiState.animationLock) {
      unlock();
    }
  }
});