"use strict";

import EventEmitter from "events";
import { globSync } from "glob";
import path from "path";
import fs from "fs";

const EV_KEY = 1;
const KEY_MAP = {
  103: "up",
  105: "left",
  106: "right",
  108: "down",
  28: "enter",
};

export default class Joystick extends EventEmitter {
  constructor() {
    super();

    let input;

    try {
      input = globSync("/sys/class/input/event*")
        .filter((inputPath) =>
          fs.existsSync(path.join(inputPath, "device/name"))
        )
        .find(
          (inputPath) =>
            fs
              .readFileSync(path.join(inputPath, "device/name"))
              .toString()
              .trim() === "Raspberry Pi Sense HAT Joystick"
        )
        .split("/")
        .pop();
    } catch (e) {
      throw new Error("Sense Hat not found");
    }

    let buffer = null;

    this.fd = fs.createReadStream("/dev/input/" + input);

    this.fd.on("data", (data) => {
      buffer = buffer === null ? data : Buffer.concat([buffer, data]);

      while (buffer.length >= 16) {
        this.process(buffer.slice(0, 16));
        buffer = buffer.slice(16);
      }
    });
  }

  process(msg) {
    const type = msg.readUInt16LE(0);
    const code = msg.readUInt16LE(2);
    const value = msg.readUInt16LE(4);

    if (type !== EV_KEY) return;
    if (value !== 1) return;

    if (KEY_MAP[code]) this.emit(KEY_MAP[code]);
  }

  end() {
    this.fd.destroy();
  }
}