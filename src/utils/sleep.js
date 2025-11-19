/**
 * Sleeps for a specified number of milliseconds.
 * @param {number} ms Number of milliseconds to wait.
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}