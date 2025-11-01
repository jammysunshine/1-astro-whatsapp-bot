/**
 * Validation utilities for input validation
 */

/**
 * Validates birth coordinates (latitude/longitude)
 * @param {Object} coordinates - Latitude and longitude
 * @returns {boolean} True if valid
 */
function validateCoordinates(coordinates) {
  if (!coordinates || typeof coordinates !== 'object') {
    return false;
  }

  const { latitude, longitude } = coordinates;

  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return false;
  }

  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
}

/**
 * Validates date and time
 * @param {Object} datetime - Date and time object
 * @returns {boolean} True if valid
 */
function validateDateTime(datetime) {
  if (!datetime || typeof datetime !== 'object') {
    return false;
  }

  // Basic validation - could be enhanced
  return true;
}

module.exports = {
  validateCoordinates,
  validateDateTime
};