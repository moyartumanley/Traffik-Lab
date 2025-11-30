import fs from "fs";
import { PNG } from "pngjs";

/**
 * Extracts frames from a Pixilart PNG sprite and saves as JSON
 * @param {string} input - Path to the PNG file
 * @param {string} animationName - Output JSON filename (without extension)
 * @param {number} frameCount - Number of frames horizontally in the PNG
 */
export async function extractFrames(input, animationName, frameCount = 2) {
  const FRAME_WIDTH = 8;
  const FRAME_HEIGHT = 8;

  const buffer = fs.readFileSync(input);
  // loads png and parses it using pngjs
  // var is now an array of raw pixel bytes in rgba format
  const png = PNG.sync.read(buffer); 
  const frames = [];

  // loop through each frame
  for (let f = 0; f < frameCount; f++) {
    const frame = [];

    // read each pixel in 8x8 grid
    for (let y = 0; y < FRAME_HEIGHT; y++) {
      for (let x = 0; x < FRAME_WIDTH; x++) {
        const idx = (y * png.width + x + f * FRAME_WIDTH) << 2;
        // y * png.width moves vertically by full frame width
        // x moves horizontally within frame
        // f * frame_width jumpts to starting pos of the fth frame in spritesheet
        // << 2 multiplies the int by 4 since each pixel contains 4 bytes of data
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        frame.push([r, g, b]);
      }
    }
    frames.push(frame);
  }
  return frames;
}

/**
 * Saves frames to a file
 * @param {array} frames Matrix of RGB values
 */
function saveFrames(frames) {
  const outputFile = `./sensehat-animations/sprites/${animationName}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(frames, null, 2));
  console.log(`Extracted ${frames.length} frames: ${outputFile}`);
}
