import { redMetro, blueMetro, greenMetro, redBus, blueBus } from "../transit-animations/animations.js";
/**
 * Triggers the corresponding animation for a given line ID and transport type
 * @param {string} lineId
 * @param {string} transportType
 */
export function triggerAnimation(lineColorHex, transportType) {
  if (!lineColorHex) return console.log("No color info for this line.");

  const normalizedColor = lineColorHex.toUpperCase();

  if (transportType === "METRO") {
    if (normalizedColor === "#DA291C") return redMetro();
    if (normalizedColor === "#007F3E") return greenMetro();
    if (normalizedColor === "#005AA7") return blueMetro();
  }

  if (transportType === "BUS") {
    if (normalizedColor === "#DA291C") return redBus();
    if (normalizedColor === "#005AA7") return blueBus();
  }

  console.log(`No matching animation for color ${lineColorHex}`);
}