/**
 * Infers SL line color from its designation and transport type
 * @param {string} designation Line number or name (ex. 11, 13)
 * @param {string} transportType Type of transport (ex. metro or bus)
 * @returns {string} Hex color string
 */
export function getLineColor(designation, transportType) {
  if (transportType === "METRO") {
    // metro colors
    if (["10", "11"].includes(designation)) return "#005AA7"; // blue line
    if (["13", "14"].includes(designation)) return "#DA291C"; // red line
    if (["17", "18", "19"].includes(designation)) return "#007F3E"; // green line
  }

  // cool bus line facts: https://sl.se/reseplanering/var-trafik/bussarna
  if (transportType === "BUS") {
    // red city/local buses (ex. 1xx, 2xx, 3xx, 4xx)
    const isRedBus = 
        designation.startsWith("1") || 
        designation.startsWith("2") ||
        designation.startsWith("3") || 
        designation.startsWith("4");  

    if (isRedBus)
      return "#da425e"; // most likely an SL red bus

    // blue inner-city buses (ex. 5xx, 6xx)
    if (designation.startsWith("5") || designation.startsWith("6"))
      return "#55bee1"; // most likely an SL blue bus

    // regional buses (ex. 7xx, 8xx)
    // lines 76, 75, 8xx are regional/express and have their own visual color
    if (designation.startsWith("7") || designation.startsWith("8"))
      return "#FFA500"; // distinct color for a regional line
  }

  // fallback for other unhandled bus lines 
  return "#430076"; 
}