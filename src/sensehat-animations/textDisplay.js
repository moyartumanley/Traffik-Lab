import { createRequire } from "module";
import { hexToRgb } from "../utils/hexToRGB.js";
import { sleep } from "../utils/sleep.js";
import { animationCancel } from "../ui/animationCancel.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

// global lock var
let isAnimating = false;

/**
 * Manages departure info display
 * @param {Object} departure Object containing departure info
 * @param {String} time Time until arrival
 * @param {String} station Station name
 * @param {String} color Hex code containing color
 */
export async function departureManager(departure, time, station, color) {
  if (isAnimating) {
    console.log("Animation occurring, cancelling.");
    animationCancel.isCancelled = true;
    while (isAnimating) {
      await sleep(50);
    }
  }
  animationCancel.isCancelled = false;
  return displayDepartureInfo(departure, time, station, color);
}

/**
 * Displays a given message.
 * @param {String} message String containing text that will appear on-screen
 * @param {String} color Hex code containing color
 * @param {Float} speed Float that denotes speed of message scroll
 */
export async function displayText(message, color = "#FFFFFF", speed = 0.05) {
  // if animation is already cancelled then dont display text
  if (animationCancel.isCancelled) {
    return Promise.resolve();
  }

  // converts hex to rgb for sensehat to parse
  // could probably have used rgb throughout code to make it easier...
  const rgb = hexToRgb(color);

  return new Promise((resolve) => {
    // resolves when message is finished, avoids exiting animation early & ui screen flickering
    sense.showMessage(normalizeText(message).toUpperCase(), speed, rgb, () => {
      resolve("completed");
    });
  });
}

/**
 * Manages departure info display
 * @param {Object} departure Object containing departure info
 * @param {String} timeUntilArrival Time until arrival
 * @param {String} stationName Station name
 * @param {String} lineColorHex Hex code containing color
 */
export async function displayDepartureInfo(
  departure,
  timeUntilArrival,
  stationName,
  lineColorHex = "#FFFFFF"
) {
  isAnimating = true;

  try {
    const speed = 0.05;
    const orange = "#FFA500";
    // protect against possible null vals
    const safeStation = (stationName || "Unknown Station").toUpperCase();
    const safeDestination = departure?.destination || "Unknown Destination";
    const safeLine = departure?.line?.designation || "?";
    sense.clear();

    const runMessage = async (animation) => {
      // check if there is an animation ongoing
      if (animationCancel.isCancelled) return false;
      await animation();
      // check after animation to prevent overlap
      if (animationCancel.isCancelled) return false;
      return true;
    };

    /** Full departure info */

    // 1. Station info
    if (
      !(await runMessage(() =>
        displayText(normalizeText(safeStation), orange, speed)
      ))
    )
      return;

    // skip next set of info if cancelled
    if (animationCancel.isCancelled) return;

    // add a wait between messages
    await sleep(200);

    // 2. Destination info
    if (
      !(await runMessage(() =>
        displayText(normalizeText(`to ${safeDestination}`), lineColorHex, speed)
      ))
    )
      return;

    if (animationCancel.isCancelled) return;
    await sleep(400);

    // 3. Line info
    if (
      !(await runMessage(() =>
        displayText(normalizeText(`Line ${safeLine}`), lineColorHex, speed)
      ))
    )
      return;

    if (animationCancel.isCancelled) return;
    await sleep(400);

    // 4. Arrival time
    const timeText =
      // change grammar if arriving now
      timeUntilArrival === "Nu"
        ? `Arrives ${timeUntilArrival}`
        : `Arrives in ${timeUntilArrival || "?"}`;
    await runMessage(() => displayText(normalizeText(timeText), orange, speed));
  } catch (err) {
    console.error("Text display error", err);
  } finally {
    isAnimating = false;
  }
}

/** Normalizes text that sensehat cant recognize */
function normalizeText(str) {
  return str
    .replace(/Å|Ä/g, "A")
    .replace(/å|ä/g, "a")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o");
}
