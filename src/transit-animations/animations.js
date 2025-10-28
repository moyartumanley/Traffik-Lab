import { extractFrames } from './extractFrames.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sense = require('sense-hat-led');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function redMetro() {
  const spritePath = "/home/pi/Traffik-Lab/images/metro/red-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "red_metro_animation", 32);
  await animate(frames);
}

export async function blueMetro() {
  const spritePath = "/home/pi/Traffik-Lab/images/metro/blue-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "blue_metro_animation", 32);
  await animate(frames);
}

export async function greenMetro() {
  const spritePath = "/home/pi/Traffik-Lab/images/metro/green-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "green_metro_animation", 32);
  await animate(frames);
}

export async function redBus() {
  const spritePath = "/home/pi/Traffik-Lab/images/bus/red-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "red_bus_animation", 17);
  await animate(frames);
}

export async function blueBus() {
  const spritePath = "/home/pi/Traffik-Lab/images/bus/blue-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "blue_bus_animation", 17);
  await animate(frames);
}


async function animate(frames) {
  const LOOP_COUNT = 1;
  for (let i = 0; i < LOOP_COUNT; i++){
    for (const frame of frames) {
      sense.setPixels(frame);
      await sleep(200);
    }
  }
}
