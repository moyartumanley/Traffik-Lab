import { uiState } from "../ui/uiState.js";

export function isLockedStatus() {
  return uiState.animationLock;
}

export function lock() {
  uiState.animationLock = true;
}

export function unlock() {
  uiState.animationLock = false;
}
