# SL Departure Display for Sense HAT:

This project turns a Raspberry Pi with an 8x8 senseHat screen into a real-time public transport departure board for the Stockholm Public Transport (SL) system. It uses an external GPS or IP location to find the nearest stations and displays live departure times on 8x8 LED matrix.

## Features:

* **Real-time Data:** Fetches live departure information from the SL API.
* **Automatic Location:** Uses connected GPS sensor (`/dev/ttyACM0`) as the primary source, falling back to **IP geolocation** for city-level location when GPS fails.
* **Location Update:** Periodically checks if the device has moved more than 0.5 km and automatically updates the list of nearest stations.
* **Persistent Operation:** Uses **systemd service** to ensure autostart on boot and auto-restart on crash.
* **Interaction:** Stop navigation and departure selection via the SenseHAT Joystick.
* **Animated Feedback:** Plays a line-specific transit animation followed by a scrolling text display for the selected departure.

---

## System Prerequisites

You must have the following hardware and software installed and configured on your Raspberry Pi.

### Hardware Requirements
* **Raspberry Pi** (Model 3B+ or newer recommended).
* **SenseHAT** module
* **External GPS device** (required for accurate, moving location data).

### Software Dependencies
1.  **Node.js (v18 or higher)** installed on your Raspberry Pi.
2.  **npm** (Node Package Manager).

---

## Setup and Installation

Project uses standard Node.js convention (`npm start`) and the Linux service manager (`systemd`).

### 1. Clone the Repository

Clone repo into the target user's home directory (`/home/pi`). 

```bash
git clone [https://github.com/moyartumanley/Traffik-Lab.git](https://github.com/moyartumanley/Traffik-Lab.git)
cd Traffik-Lab
```

### 2. Dependencies
Install required Node.js modules as defined in `package.json`
```bash
npm install
```

### 3. Systemd Service Config (OPTIONAL)
Resource: (https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html)

If you want the application to auto-restart, it has to be configured as a systemd unit.

#### Creating the service unit file
Ensuring you have admin privileges, create the service definition file.

```bash
sudo nano /etc/systemd/system/sl-display.service
```

Then insert the following config. `WorkingDirectory` param must reflect the project's cloned path. Save and exit.

```
[Unit]
Description=SL Departure Display Daemon
After=network.target

[Service]
User=pi
Group=pi
WorkingDirectory=/home/pi/Traffik-Lab
ExecStart=/usr/bin/npm start

Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### Activate service
Reload `systemd` daemon
```bash
sudo systemctl daemon-reload
```

Enable the service to ensure autostart on system boot
```bash
sudo systemctl enable sl-display.service
```

Initiate the service daemon
```bash
sudo systemctl start sl-display.service
```

## How To Use:
### Explanation of Screen Visuals:
* **Stop Selection (Bottom Row):** Each light represents one of the 8 nearest stations. Stations are ordered left to right in order of distance from the user's location.
* **Departure Selection (Rows 1-7):** This shows up to **7 upcoming departures** for the stop currently selected in the bottom row.

### Color Cues:
| What It Looks Like | What It Means |
| :--- | :--- |
| **Bright LED** | This is the item you have currently selected. |
| **Dim LED** | This is a real stop or departure, but it is currently unselected. |
| **Color** | The color of the LED tells you the color of the transit line. |

### Joystick Controls
The joystick lets you select a specific stop and departure.

| Joystick Command | What It Does | User Intent |
| :--- | :--- | :--- |
| **Left & Right** | **Change Stops:** Selects a different station. | Use this to choose which of the 8 nearby stops you want to look at. |
| **Up & Down** | **Change Departures:** Selects a different departure time or line. | Use this to pick the exact train or bus you want to check. |
| **Enter (Press Joystick)** | **Show Details:** Shows more information about selected departure | Use this to see the full information (**Destination**, **Line Number**, and **estimated time left**) scroll across the screen. |

### Notes:
* **When you change stops (left/right):** The departure selection automatically jumps back to the **first (earliest) departure** for that new stop.
* **During Animation:** When you press enter, the screen will flash a quick animation (like a moving train). During this animation and the scrolling text, the monitor is busy and will ignore all joystick movements. Wait for the screen to return to the grid before moving the joystick again.

