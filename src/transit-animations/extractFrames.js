import fs from "fs";
import { PNG } from "pngjs";

/**
 * Extracts frames from a Pixilart PNG sprite and saves as JSON
 * @param {string} input - Path to the PNG file (relative to project)
 * @param {string} animationName - Output JSON filename (without extension)
 * @param {number} frameCount - Number of frames horizontally in the PNG
 */
export async function extractFrames(input, animationName, frameCount = 2) {
  const FRAME_WIDTH = 8;
  const FRAME_HEIGHT = 8;

  const buffer = fs.readFileSync(input);
  const png = PNG.sync.read(buffer);
  const frames = [];

  for (let f = 0; f < frameCount; f++) {
    const frame = [];
    for (let y = 0; y < FRAME_HEIGHT; y++) {
      for (let x = 0; x < FRAME_WIDTH; x++) {
        const idx = ((y * png.width + x + f * FRAME_WIDTH) << 2);
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        frame.push([r, g, b]);
      }
    }
    frames.push(frame);
  }

  const outputFile = `./transit-animations/${animationName}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(frames, null, 2));
  console.log(`✅ Extracted ${frames.length} frames → ${outputFile}`);
  return frames;
}
