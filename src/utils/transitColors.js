/**
 * Infers SL line color from its designation and transport type
 * @param {string} designation Line number or name (e.g., "11", "13")
 * @param {string} transportType Type of transport (e.g., "METRO", "BUS")
 * @returns {string} Hex color string
 */
export function getLineColor(designation, transportType) {
  if (transportType === "METRO") {
    // Stockholm metro colors
    if (["10", "11"].includes(designation)) return "#005AA7"; // Blue line
    if (["13", "14"].includes(designation)) return "#DA291C"; // Red line
    if (["17", "18", "19"].includes(designation)) return "#007F3E"; // Green line
  }

  if (transportType === "BUS") {
    // Most SL buses are red or blue
    if (designation.startsWith("1") || designation.startsWith("2"))
      return "#DA291C"; // Red buses
    if (designation.startsWith("5") || designation.startsWith("6"))
      return "#005AA7"; // Blue buses
  }

  return "#FFFFFF"; // fallback white
}