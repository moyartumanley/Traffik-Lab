/**
 * Converts a hex color string to an RGB array [r, g, b].
 * Always returns integers between 0–255.
 *
 * @param {string} hex - Hex color string, with or without "#".
 * @returns {[number, number, number]} RGB array.
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return [255, 255, 255]; // fallback white

  // Remove "#" if present
  let clean = hex.replace("#", "").trim();

  // Handle shorthand hex like #FA3 → #FFAA33
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Ensure valid 6-digit hex
  if (clean.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(clean)) {
    console.warn("Invalid hex color:", hex);
    return [255, 255, 255];
  }

  // Convert to RGB integers
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return [r, g, b];
}
