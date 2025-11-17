import Joystick from "../joystick.js";
import { uiState } from "../ui/uiState.js";
import { drawMatrix } from "./renderMatrix.js";
import { displayDepartureInfo, displayText } from "../transit-animations/textDisplay.js";
import { getLineColor } from "../utils/transitColors.js";
import { lock, unlock } from "./animationLock.js";
import {
  redMetro,
  blueMetro,
  greenMetro,
  redBus,
  blueBus,
} from "../transit-animations/animations.js";

const joystick = new Joystick();
export const ANIMATIONS = {
  metro: {
    "#DA291C": redMetro,
    "#005AA7": blueMetro,
    "#007F3E": greenMetro,
  },
  bus: {
    "#DA291C": redBus,
    "#005AA7": blueBus,
  },
};

export async function playAnimation(departure) {
  lock();

  const mode = departure.station_transport_type.toLowerCase(); // either metro or bus
  const lineColorHex = getLineColor(
    departure.line.designation,
    departure.line.transport_mode
  );

  const animation = ANIMATIONS[mode]?.[lineColorHex];

  if (!animation) {
    console.warn(
      "No animation defined for",
      mode,
      departure.line.designation,
      lineColorHex
    );
    uiState.animationLock = false;
    return;
  }

  await animation().finally(() => (unlock()));
}

/** navigation ui */
// top 7 rows = departures, bottom row = stops

// Navigate departures (up/down)
joystick.on("up", () => {
  uiState.departureIndex = Math.max(0, uiState.departureIndex - 1);
  drawMatrix();
});

joystick.on("down", () => {
  uiState.departureIndex = Math.min(uiState.departures.length - 1, uiState.departureIndex + 1);
  drawMatrix();
});

joystick.on("left", () => {
  uiState.stopIndex = (uiState.stopIndex - 1 + uiState.nearestStations.length) % uiState.nearestStations.length;
  drawMatrix();
});

joystick.on("right", () => {
  uiState.stopIndex = (uiState.stopIndex + 1) % uiState.nearestStations.length;
  drawMatrix();
});

joystick.on("enter", async () => {
  if (uiState.animationLock) return;

  const dep = uiState.departures[uiState.departureIndex];

  if (dep) {
    await playAnimation(dep);
    await displayDepartureInfo(
      dep,
      dep.display,
      dep.stationName,
      dep.lineColor
    );
  } else {
    const stop = uiState.nearestStations[uiState.stopIndex];
    if (stop) {
      await displayText(stop.name, "#FFA500");
    }
  }

  drawMatrix();
});