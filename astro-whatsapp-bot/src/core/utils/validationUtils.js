/**
 * Validation utilities for astrology services
 */

/**
 * Validate geographic coordinates
 * @param {number} latitude - Latitude in degrees
 * @param {number} longitude - Longitude in degrees
 * @returns {boolean} True if valid
 */
function validateCoordinates(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
}

/**
 * Validate date and time
 * @param {string|Date} dateTime - Date/time to validate
 * @returns {boolean} True if valid
 */
function validateDateTime(dateTime) {
  if (!dateTime) {
    return false;
  }

  const date = new Date(dateTime);
  return !isNaN(date.getTime());
}

module.exports = {
  validateCoordinates,
  validateDateTime
};