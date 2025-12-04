import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import GPS from "gps";

/**
 * Converts a time string to a Date object.
 * @param {string} timeStr ISO-formatted time string
 * @returns {Date}
 */
export function parseTime(timeStr) {
  return new Date(timeStr);
}

/**
 * Uses the Haversine formula to calculate the distance between two geographic points.
 * @param {float} lat1 Latitude of first point
 * @param {float} lon1 Longitude of first point
 * @param {float} lat2 Latitude of second point
 * @param {float} lon2 Longitude of second point
 * @return Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;
  const toRadians = (angle) => angle * (Math.PI / 180);

  // distances between lats and lons as radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = earthRadius * c; // distance in km
  return d;
}

/**
 * Auto-detect GPS serial ports.
 */
async function detectGPSPort() {
  const ports = await SerialPort.list();

  const gpsPatterns = [
    /ttyACM\d+/,
    /ttyUSB\d+/,
    /ttyAMA\d+/,
    /serial/i,
    /usbserial/i,
    /cu\.usb/i,
  ];

  for (const port of ports) {
    if (gpsPatterns.some((p) => p.test(port.path))) {
      console.log("Possible GPS device detected:", port.path);
      return port.path;
    }
  }

  console.warn("No GPS-like serial port found");
  return null;
}

/**
 * Reads location from an attached USB GPS receiver.
 */
export async function getLocationFromPort() {
  const portPath = await detectGPSPort();
  if (!portPath) throw new Error("No GPS serial port detected");

  return new Promise((resolve, reject) => {
    // open port to check for fix
    let port;
    try {
      port = new SerialPort({ path: portPath, baudRate: 9600 });
    } catch (err) {
      return reject(
        new Error(`Failed to open GPS port ${portPath}: ${err.message}`)
      );
    }

    const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
    const gps = new GPS();

    // Times out after 5s if no fix is acquired from GPS
    const timeout = setTimeout(() => {
      port.close();
      reject(new Error("GPS timeout: no fix acquired"));
    }, 5000);

    // Handles errors when opening the serial port
    port.on("error", (err) => {
      clearTimeout(timeout); // prevents timeout from firing later
      port.close();
      reject(new Error(`SerialPort error: ${err.message}`));
    });

    // Handles GPS data
    gps.on("data", (data) => {
      if (data.type === "GGA" && data.lat && data.lon) {
        clearTimeout(timeout); // GPS fix acquired, cancel the timeout
        console.log("GPS location:", { lat: data.lat, lon: data.lon });
        port.close(); // stop reading after first fix
        resolve({ lat: data.lat, lon: data.lon });
      }
    });

    // Feed serial data to the GPS parser
    parser.on("data", (line) => {
      try {
        gps.update(line);
      } catch (err) {
        console.error("GPS parse error:", err.message);
      }
    });
  });
}

/**Gets location from Pi's IP address */
export async function getLocationFromIP() {
  try {
    const res = await fetch("https://ipapi.co/json/"); //API retrieves location using ip
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json(); //return as obj

    const lat = parseFloat(data.latitude);
    const lon = parseFloat(data.longitude);
    
    console.log("IP-based location:", { lat, lon });
    return { lat, lon };
  } catch (error) {
    console.error("Failed to get location via IP:", error);
    // fallback to a default location if this doesnt work.
    return { lat: 59.343697, lon: 18.081395 }; // DIS coords
  }
}
