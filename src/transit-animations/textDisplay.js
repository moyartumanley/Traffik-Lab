import { createRequire } from "module";
import { isLockedStatus, lock, unlock } from "../ui/animationLock.js";
import {hexToRgb} from "../utils/hexToRGB.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

/**
 * Displays a scrolling text message on the Sense HAT LED matrix.
 * @param {string} message - The text to display.
 * @param {string} color - Hex color string (e.g., "#FFA500").
 * @param {number} speed - Scroll speed (default 0.05).
 */
export async function displayText(message, color = "#FFFFFF", speed = 0.05) {
  const rgb = hexToRgb(color);
  return new Promise((resolve) => {
    sense.showMessage(message, speed, rgb, () => {
      sense.clear();
      resolve();
    });
  });
}

/**
 * Displays detailed departure info (station, destination, line, time).
 * @param {object} departure  The earliest departure object
 * @param {string} name  Name of station
 * @param {string} lineColorHex  HEX of line.
 */
export async function displayDepartureInfo(
  departure,
  timeUntilArrival,
  stationName,
  lineColorHex = "#FFFFFF"
) {
  if (!isLockedStatus()){
    lock(); // skip if matrix is busy
  }

  try {
    const orange = "#FFA500"; // default text color

    const safeStation = (stationName || "Unknown Station").toUpperCase();
    const safeDestination = departure?.destination || "Unknown Destination";
    const safeLine = departure?.line?.designation || "?";

    sense.clear();

    // Scroll station name
    await displayText(normalizeText(`${safeStation}`), orange, 0.07);
    await sleep(400);

    // Scroll destination
    await displayText(normalizeText(`to ${safeDestination}`), lineColorHex, 0.07);
    await sleep(400);

    // Scroll line
    await displayText(normalizeText(`Line ${safeLine}`), lineColorHex, 0.07);
    await sleep(400);

    // Scroll arrival time
    const timeText =
      timeUntilArrival === "Nu"
        ? `Arrives ${timeUntilArrival}`
        : `Arrives in ${timeUntilArrival || "?"}`;
    await displayText(normalizeText(timeText), orange, 0.07);
  } finally {
    unlock(); // release lock
  }
}


/**
 * Some characters can't be read by the screen.
 */
function normalizeText(str) {
  return str
    .replace(/Å|Ä/g, "A")
    .replace(/å|ä/g, "a")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o");
}

/**
 * Calculate minutes from now until the scheduled time.
 * @param {string} scheduled - ISO or time string.
 * @returns {number}
 */
function calcMinutesUntil(scheduled) {
  const now = new Date();
  const target = new Date(scheduled);
  const diffMs = target - now;
  return Math.max(0, Math.round(diffMs / 60000)); // convert ms → minutes
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
