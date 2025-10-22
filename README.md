# Traffik-Lab
 
This project retrieves nearby public transportation stations using the SL (Stockholm Public Transport) API and an external GPS device connected to a Raspberry Pi. It determines the user’s location, finds the closest station, and continuously fetches real-time departure data for that station. Data is then displayed on an 8 x 8 LED display on the Raspberry Pi. 

This was done as a project for a Data-Driven Information Visualization course.

## Features:
- GPS Integration: Connects to an external GPS device via SerialPort
- Station Finder: Fetches all available stations from the SL API
- Distance Calculation: Uses the Haversine formula to compute the nearest station
- Live Departures: Updates departures every 30 seconds

## Technologies Used:
- JavaScript (ES Modules)
- HTML for debugging purposes
- SL/TraffikLab APIs for public transport data
---
## Installation
1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/gps-station-finder.git
   cd gps-station-finder

2. **Install dependences**
   ```bash
   npm install serialport @serialport/parser-readline

