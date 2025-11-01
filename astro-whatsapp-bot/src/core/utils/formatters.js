/**
 * Formatting utilities for astrology services
 */

/**
 * Format degree value with proper astrological notation
 * @param {number} degrees - Degrees value
 * @param {number} minutes - Minutes value (optional)
 * @param {number} seconds - Seconds value (optional)
 * @returns {string} Formatted degree string
 */
function formatDegree(degrees, minutes = 0, seconds = 0) {
  const sign = degrees >= 0 ? '' : '-';
  const absDegrees = Math.abs(degrees);
  const deg = Math.floor(absDegrees);
  const min = Math.floor((absDegrees - deg) * 60);
  const sec = Math.round(((absDegrees - deg) * 60 - min) * 60);

  if (seconds > 0 || sec > 0) {
    return `${sign}${deg}°${min}'${sec}"`;
  } else if (minutes > 0 || min > 0) {
    return `${sign}${deg}°${min}'`;
  } else {
    return `${sign}${deg}°`;
  }
}

/**
 * Format time in HH:MM format
 * @param {Date|string} time - Time to format
 * @returns {string} Formatted time string
 */
function formatTime(time) {
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format zodiac sign name
 * @param {number} longitude - Longitude in degrees
 * @returns {string} Zodiac sign name
 */
function formatZodiacSign(longitude) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const signIndex = Math.floor(longitude / 30) % 12;
  return signs[signIndex];
}

module.exports = {
  formatDegree,
  formatTime,
  formatZodiacSign
};
