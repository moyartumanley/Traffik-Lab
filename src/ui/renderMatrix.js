import { uiState } from "./uiState.js";
import { createRequire } from "module";
import { isLockedStatus } from "./animationLock.js";
import { hexToRgb } from "../utils/hexToRGB.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");

const BLACK = [0, 0, 0];
const HIGHLIGHT_MULTIPLIER = 1.5;

// ---------------------------
// Helper Functions
// ---------------------------

function emptyMatrix() {
  return new Array(64).fill(BLACK);
}

function dim([r, g, b]) {
  return [
    Math.round(r * 0.2),
    Math.round(g * 0.2),
    Math.round(b * 0.2),
  ];
}

function isBlack([r, g, b]) {
  return r === 0 && g === 0 && b === 0;
}

function highlight(color) {
  return color.map(v => Math.min(255, Math.round(v * HIGHLIGHT_MULTIPLIER)));
}

function mergeLayers(...layers) {
  const out = emptyMatrix();

  layers.forEach(layer => {
    for (let i = 0; i < 64; i++) {
      // Only overwrite if the pixel is not BLACK
      const px = layer[i];
      if (!isBlack(px)) {
        out[i] = px;
      }
    }
  });

  return out;
}

// ---------------------------
// Layer 1: Static Background UI
// (Colored blocks shown in your diagram)
// ---------------------------

function drawBackgroundLayer() {
  const m = emptyMatrix();

  // You can update this to reflect your actual static design.
  // Below are placeholder positional examples based on your sketch:

  // Green blocks (top-left and top-right)
  const green = [0, 120, 0];
  const greenPositions = [0, 1, 8, 9, 6, 7, 14, 15];
  greenPositions.forEach(i => (m[i] = green));

  // Red chain in the middle
  const red = [150, 0, 0];
  const redPositions = [16 + 2, 24 + 2, 32 + 2, 40 + 3]; // roughly matching your drawing
  redPositions.forEach(i => (m[i] = red));

  // Blue block bottom-left-ish
  const blue = [0, 0, 150];
  m[40 + 1] = blue;

  return m;
}

// ---------------------------
// Layer 2: Departure Grid (Top 7 rows)
// ---------------------------

function drawDepartureGrid(departures, stopIndex, departureIndex) {
  const m = emptyMatrix();

  // Split into 8 columns × 7 rows as per the diagram
  const cols = Array(8)
    .fill(0)
    .map((_, c) => departures.slice(c * 7, c * 7 + 7));

  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 7; row++) {
      const dep = cols[col][row];

      let color = dep && dep.lineColor
        ? hexToRgb(dep.lineColor)
        : [40, 40, 40];

      if (col === stopIndex && row === departureIndex) {
        color = highlight(color);
      } else {
        color = dim(color);
      }

      const index = row * 8 + col;
      m[index] = color;
    }
  }

  return m;
}

// ---------------------------
// Layer 3: Stop Selector Row (Bottom row)
// ---------------------------

function drawStopSelectorRow(stops, stopIndex) {
  const m = emptyMatrix();
  const row = 7; // bottom row

  stops.slice(0, 8).forEach((stop, col) => {
    let color = stop.color
      ? hexToRgb(stop.color)
      : [60, 60, 60];

    if (col === stopIndex) {
      color = highlight(color);
    } else {
      color = dim(color);
    }

    m[row * 8 + col] = color;
  });

  return m;
}

// ---------------------------
// Main Renderer
// ---------------------------

export function drawMatrix() {
  if (isLockedStatus()) return;

  const bgLayer = drawBackgroundLayer();
  const stopsLayer = drawStopSelectorRow(
    uiState.nearestStations || [],
    uiState.stopIndex
  );
  const depsLayer = drawDepartureGrid(
    uiState.departures || [],
    uiState.stopIndex,
    uiState.departureIndex
  );

  const finalPixels = mergeLayers(bgLayer, depsLayer, stopsLayer);

  sense.setPixels(finalPixels);
}

// ---------------------------
// Update Loop
// ---------------------------

export function startMatrixLoop() {
  setInterval(drawMatrix, 200); // ~5 FPS
}