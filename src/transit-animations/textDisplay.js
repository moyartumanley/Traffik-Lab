import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

/**
 * Displays a scrolling text message on the Sense HAT LED matrix.
 * @param {string} message - The text to display.
 * @param {string} color - Hex color string (e.g., "#FFA500").
 * @param {number} speed - Scroll speed (default 0.05).
 */
export async function displayText(message, color = "#FFFFFF", speed = 0.05) {
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };
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
 * @param {object} departure - The earliest departure object.
 * @param {string} stationName - Name of the station.
 * @param {string} lineColorHex - Color of the line (e.g., "#005AA7").
 */
export async function displayDepartureInfo(
  departure,
  timeUntilArrival,
  name,
  lineColorHex
) {
  const orange = "#FFA500"; // similar to departure board text color

  //   const minutesUntilArrival = calcMinutesUntil(departure.scheduled);
  const lineDesignation = departure.line.designation;
  const destination = departure.destination;
  const stationName = name.toUpperCase();

  // TODO: could maybe opt for displa similar to departure board in station [line number] [destination] [arrival]
  // ex: 14    Morby Centrum    3min
  sense.clear(); // refresh screen before displaying new info
  await displayText(normalizeText(`${stationName}`), orange, 0.07);
  await sleep(400); //pause befroe next str
  await displayText(normalizeText(`to ${destination}`), lineColorHex, 0.07);
  await sleep(400);
  await displayText(
    normalizeText(`Line ${lineDesignation}`),
    lineColorHex,
    0.07
  );
  await sleep(400);
  if (timeUntilArrival === "Nu") {
    await displayText(
      normalizeText(`Arrives ${timeUntilArrival}`),
      orange,
      0.07
    );
  } else {
    await displayText(
      normalizeText(`Arrives in ${timeUntilArrival}`),
      orange,
      0.07
    );
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
