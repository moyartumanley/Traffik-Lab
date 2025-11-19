import { uiState } from "./uiState.js";
import { createRequire } from "module";
import { isLockedStatus } from "./animationLock.js";
import { hexToRgb } from "../utils/hexToRGB.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

// background color: (slightly off-black)
const BLACK = [19, 17, 17];
const TRANSPARENT = [0, 0, 0]; // true black is needed for layer merging
const HIGHLIGHT_MULTIPLIER = 1.5;

/** Helper functions */

function emptyMatrix() {
  // Returns matrix consisting of only background color
  return new Array(64).fill(BLACK);
}

function dim([r, g, b]) {
  // Dimming factor for visibility purposes
  const DIM_FACTOR = 0.5;
  return [
    Math.round(r * DIM_FACTOR),
    Math.round(g * DIM_FACTOR),
    Math.round(b * DIM_FACTOR),
  ];
}

function isBlack([r, g, b]) {
  // Checks if color is transparent
  return r === 0 && g === 0 && b === 0;
}

function highlight(color) {
  // Highlights color if selected
  return color.map(v => Math.min(255, Math.round(v * HIGHLIGHT_MULTIPLIER)));
}

/**
 * Merges layers by skipping transparent pixels, ensuring the background
 * is only applied where no other layer has a pixel.
 */
function mergeLayers(...layers) {
  // Start with an empty matrix
  const matrix = emptyMatrix(); 

  layers.forEach(layer => {
    for (let i = 0; i < 64; i++) {
      const px = layer[i];
      if (!isBlack(px)) { // bg color pixel is overwritten iff. it is not transparent
        matrix[i] = px;
      }
    }
  });

  return matrix;
}

function drawBackgroundLayer() {
  // Fills pixels with background color
  const m = emptyMatrix();
  return m;
}

/** STOP SELECTION ROW (bottom) */

function drawStopSelectorRow(stops, stopIndex) {
  // Initialize matrix with transparent pixels
  const m = new Array(64).fill(TRANSPARENT); 
  const row = 7; // bottom row

  stops.slice(0, 8).forEach((stop, col) => {
    // for each stop, check if it has a color defined
    let color = stop.color
      ? hexToRgb(stop.color) // if so, convert HEX to rgb
      : [60, 60, 60]; // otherwise, make it grey

    // if the column selected is the stop index, highlight the LED representing the stop
    if (col === stopIndex) {
      color = highlight(color);
    } else { // otherwise, dim it
      color = dim(color);
    }

    m[row * 8 + col] = color; // find the pixel idx and make it that color
  });

  return m;
}

/** DEPARTURE GRID (top 7 rows) */
function drawDepartureGrid(stops, stopIndex, departureIndex, departuresByStopId) {
  // Initialize matrix with transparent pixels
  const m = new Array(64).fill(TRANSPARENT); 
  const EMPTY_SLOT_COLOR = [80, 80, 80]; 

  // Iterate through  8 closest stops
  stops.slice(0, 8).forEach((stop, col) => {
    const departures = departuresByStopId.get(stop.id) || []; // get the departures for the current stop ID from map

    // Iterate through 7 earliest departures for stop
    for (let row = 0; row < 7; row++) {
      const dep = departures[row];

      // Use the line's color if available, otherwise use a brighter empty color
      let color = dep && dep.lineColor
        ? hexToRgb(dep.lineColor)
        : EMPTY_SLOT_COLOR;
      
      // Highlight selected departure
      if (col === stopIndex && row === departureIndex) {
        color = highlight(color);
      } else {
        color = dim(color);
      }

      const index = row * 8 + col; // find pixel idx
      m[index] = color;
    }
  });

  return m;
}

/** RENDER MATRIX */
export function drawMatrix() {
  //if theres an animation lock, don't update matrix
  if (isLockedStatus()) return;

  // otherwise get state properties
  const stops = uiState.nearestStations || [];
  const { stopIndex, departureIndex, departuresByStopId } = uiState; 

  // draw departure grid (top 7 rows)
  const depsLayer = drawDepartureGrid(
    stops,
    stopIndex,
    departureIndex,
    departuresByStopId
  );
  
  // draw stop selector (bottom row)
  const stopsLayer = drawStopSelectorRow(stops, stopIndex);
  
  // merge the layers (background should be initialized in mergeLayers)
  // merge order: departures then stops 
  const finalPixels = mergeLayers(depsLayer, stopsLayer);

  // update pixels in senseHat
  sense.setPixels(finalPixels);
}

// start matrix refresh loop
export function startMatrixLoop() {
  // every 1s refresh matrix state
  setInterval(drawMatrix, 1000); 
}