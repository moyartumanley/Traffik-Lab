import { extractFrames } from "./extractFrames.js";
import { createRequire } from "module";
import { sleep } from "../utils/sleep.js";
import { animationCancel } from "../ui/animationCancel.js";

const require = createRequire(import.meta.url);
const sense = require("sense-hat-led");
const busFrames = 28;
const metroFrames = 33;
const directionFrames = 12;

export async function redMetro() {
  const spritePath = "./images/metro/red-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "red_metro_animation", metroFrames);
  await animate(frames);
  await sleep(200);
}

export async function blueMetro() {
  const spritePath = "./images/metro/blue-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "blue_metro_animation", metroFrames);
  await animate(frames);
  await sleep(200);
}

export async function greenMetro() {
  const spritePath = "./images/metro/green-line-metro/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "green_metro_animation", metroFrames);
  await animate(frames);
  await sleep(200);
}

export async function redBus() {
  const spritePath = "./images/bus/red-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "red_bus_animation", busFrames);
  await animate(frames);
  await sleep(200);
}

export async function blueBus() {
  const spritePath = "./images/bus/blue-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "blue_bus_animation", busFrames);
  await animate(frames);
  await sleep(200);
}

export async function yellowBus() {
  const spritePath = "./images/bus/yellow-line-bus/pixilart-sprite.png";
  const frames = await extractFrames(spritePath, "yellow_bus_animation", busFrames);
  await animate(frames);
  await sleep(200);
}

export async function northbound() {
  const spritePath = "./images/direction/northbound/northbound.png";
  const frames = await extractFrames(spritePath, "northbound", directionFrames);
  await animate(frames);
  await sleep(200);
}

export async function southbound() {
  const spritePath = "./images/direction/southbound/southbound.png";
  const frames = await extractFrames(spritePath, "southbound", directionFrames);
  await animate(frames);
  await sleep(200);
}

async function animate(frames) {
  const LOOP_COUNT = 1;
  for (let i = 0; i < LOOP_COUNT; i++) {
    // Iterate through every frame
    for (const frame of frames) {
      // check each frame for cancellation flag
      if (animationCancel.isCancelled) {
        return; // if cancelled, stop animation
      }
      
      sense.setPixels(frame);
      await sleep(45); 
    }
  }
}