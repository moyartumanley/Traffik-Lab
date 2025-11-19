import { extractFrames } from './extractFrames.js';
import { createRequire } from "module";
import { sleep } from "../utils/sleep.js";

const require = createRequire(import.meta.url);
const sense = require('sense-hat-led');
const busFrames = 28;
const metroFrames = 33;

export async function redMetro() {
  const spritePath = "/home/pi/Traffik-Lab/images/metro/red-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "red_metro_animation", metroFrames);
  await animate(frames);
  await sleep(200);
}

export async function blueMetro() {
  const spritePath = "/home/pi/Traffik-Lab/images/metro/blue-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "blue_metro_animation", metroFrames);
  await animate(frames);
  await sleep(200);
}

export async function greenMetro() {
  const spritePath = "/home/pi/Traffik-Lab/images/metro/green-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "green_metro_animation", metroFrames);
  await animate(frames);
  await sleep(200);
}

export async function redBus() {
  const spritePath = "/home/pi/Traffik-Lab/images/bus/red-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "red_bus_animation", busFrames);
  await animate(frames);
  await sleep(200);
}

export async function blueBus() {
  const spritePath = "/home/pi/Traffik-Lab/images/bus/blue-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "blue_bus_animation", busFrames);
  await animate(frames);
  await sleep(200);
}

export async function yellowBus() {
  const spritePath = "/home/pi/Traffik-Lab/images/bus/yellow-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "yellow_bus_animation", busFrames);
  await animate(frames);
  await sleep(200);
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
