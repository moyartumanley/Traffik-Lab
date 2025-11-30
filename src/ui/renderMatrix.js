import { uiState } from "./uiState.js";
import { createRequire } from "module";
import { hexToRgb } from "../utils/hexToRGB.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

// Global vars
const BLACK = [19, 17, 17];
const TRANSPARENT = [0, 0, 0];
const HIGHLIGHT_MULTIPLIER = 1.5;

/** Returns an empty 8x8 matrix */
function emptyMatrix() {
  return new Array(64).fill(BLACK);
}

/** Dims color */
function dim([r, g, b]) {
  const DIM_FACTOR = 0.5;
  return [
    Math.round(r * DIM_FACTOR),
    Math.round(g * DIM_FACTOR),
    Math.round(b * DIM_FACTOR),
  ];
}

/** Bool that checks if rbg associated w/ pixel is black */
function isBlack([r, g, b]) {
  return r === 0 && g === 0 && b === 0;
}

/** Highlights color */
function highlight(color) {
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

function drawBackgroundLayer() {
  return emptyMatrix();
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
  const EMPTY_SLOT_COLOR = [80, 80, 80];
  stops.slice(0, 8).forEach((stop, col) => {
    const departures = departuresByStopId.get(stop.id) || [];
    for (let row = 0; row < 7; row++) {
      const dep = departures[row];

      // color is determined by line color
      let color =
        dep && dep.lineColor ? hexToRgb(dep.lineColor) : EMPTY_SLOT_COLOR;
      if (col === stopIndex && row === departureIndex) {
        color = highlight(color); // if selected, make brighter
      } else {
        color = dim(color);
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
