import { redMetro, blueMetro, greenMetro, redBus, blueBus } from "../transit-animations/animations.js";
import { isLockedStatus, unlock } from "../ui/animationLock.js";

let animationLock = false;

/**
 * Triggers the corresponding animation for a given line ID and transport type
 * @param {string} lineId
 * @param {string} transportType
 */
export async function triggerAnimation(lineColorHex, transportType) {
  if (!lineColorHex) return console.log("No color info for this line.");

  if (!isLockedStatus()) return; // skip if matrix is busy

  try {
    const normalizedColor = lineColorHex.toUpperCase();

    // metro animations
    if (transportType === "METRO") {
      if (normalizedColor === "#DA291C") await redMetro();
      else if (normalizedColor === "#007F3E") await greenMetro();
      else if (normalizedColor === "#005AA7") await blueMetro();
      else console.log(`No animation defined for METRO ${normalizedColor}`);
    }

    // bus animations
    if (transportType === "BUS") {
      if (normalizedColor === "#DA291C") await redBus();
      else if (normalizedColor === "#005AA7") await blueBus();
      else console.log(`No animation defined for BUS ${normalizedColor}`);
    }
  } finally {
    releaseLock(); // release lock
  }
}