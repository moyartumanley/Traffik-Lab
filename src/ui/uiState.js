/** Shared state object between UI, joystick feedback, departure data, and animations */
export const uiState = {
  stopIndex: 0,
  departureIndex: 0,
  nearestStations: [],
  departures: [],
  animationLock: false
};
