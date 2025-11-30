export const animationCancel = {
    isCancelled: false,
};

/**
 * Resets the cancellation flag before starting a new animation.
 */
export function resetCancellation() {
    animationCancel.isCancelled = false;
}

/**
 * Sets cancellation flag.
 */
export function setCancellation() {
    animationCancel.isCancelled = true;
}