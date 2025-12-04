import { uiState } from "./uiState.js";
import { createRequire } from "module";
import { hexToRgb } from "../utils/hexToRGB.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

// blink every 300ms
let blink = true;
setInterval(() => {
  blink = !blink;
}, 300);

// Global vars
const BLACK = [19, 17, 17];
const TRANSPARENT = [0, 0, 0];

/** Returns an empty 8x8 matrix */
function emptyMatrix() {
  return new Array(64).fill(BLACK);
}

/** Dims color */
function dim([r, g, b]) {
  const gamma = 2.2; // typical LED gamma
  const DIM_FACTOR = 0.05; // max factor
  return [
    Math.round(255 * Math.pow((r / 255) * DIM_FACTOR, 1 / gamma)),
    Math.round(255 * Math.pow((g / 255) * DIM_FACTOR, 1 / gamma)),
    Math.round(255 * Math.pow((b / 255) * DIM_FACTOR, 1 / gamma)),
  ];
}

/** Bool that checks if rbg associated w/ pixel is black */
function isBlack([r, g, b]) {
  return r === 0 && g === 0 && b === 0;
}

/** Highlights color */
function highlight(color) {
  const HIGHLIGHT_MULTIPLIER = 1.5;
  return color.map((v) => Math.min(255, Math.round(v * HIGHLIGHT_MULTIPLIER)));
}

/** Merges given layers to a new matrix */
function mergeLayers(...layers) {
  const matrix = emptyMatrix();
  layers.forEach((layer) => {
    for (let i = 0; i < 64; i++) {
      const px = layer[i];
      // if pixel is not empty on the layer, add it to the merged matrix
      if (!isBlack(px)) {
        matrix[i] = px;
      }
    }
  });
  return matrix;
}

/** Adds white row for station selector */
function drawStopSelectorRow(stops, stopIndex) {
  const m = new Array(64).fill(TRANSPARENT);
  const row = 7;
  stops.slice(0, 8).forEach((stop, col) => {
    let color = stop.color ? hexToRgb(stop.color) : [60, 60, 60];
    // if stop is the one selected, make it brighter than the others
    if (col === stopIndex) {
      color = highlight(color);
    } else {
      // otherwise, keep dim
      color = dim(color);
    }
    m[row * 8 + col] = color;
  });
  return m;
}

function drawDepartureGrid(
  stops,
  stopIndex,
  departureIndex,
  departuresByStopId
) {
  const m = new Array(64).fill(TRANSPARENT);
  stops.slice(0, 8).forEach((stop, col) => {
    const departures = departuresByStopId.get(stop.id) || [];
    for (let row = 0; row < 7; row++) {
      const dep = departures[row];
      let color = TRANSPARENT; // default off
      if (dep && dep.lineColor) {
        // color is determined by line color
        const baseColor = hexToRgb(dep.lineColor);

        if (col === stopIndex && row === departureIndex) {
          color = blink ? baseColor : dim(baseColor);  // departure blinks between normal led color and dim
        } else {
          color = baseColor;
        }
      }
      const index = row * 8 + col;
      m[index] = color;
    }
  });
  return m;
}

/** Draws UI matrix */
export function drawMatrix() {
  if (uiState.animationLock) return;

  const stops = uiState.nearestStations || [];
  const { stopIndex, departureIndex, departuresByStopId } = uiState;

  const depsLayer = drawDepartureGrid(
    stops,
    stopIndex,
    departureIndex,
    departuresByStopId
  );
  const stopsLayer = drawStopSelectorRow(stops, stopIndex);
  const finalPixels = mergeLayers(depsLayer, stopsLayer);

  sense.setPixels(finalPixels);
}

// start matrix refresh loop
export function startMatrixLoop() {
  setInterval(drawMatrix, 100);
}
