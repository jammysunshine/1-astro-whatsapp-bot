/**
 * Formatting utilities for output formatting
 */

/**
 * Formats degree values for display
 * @param {number} degree - Degree value
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted degree string
 */
function formatDegree(degree, decimals = 2) {
  if (typeof degree !== 'number' || isNaN(degree)) {
    return '0.00°';
  }

  return `${degree.toFixed(decimals)}°`;
}

/**
 * Formats time for display
 * @param {string|Date} time - Time to format
 * @returns {string} Formatted time string
 */
function formatTime(time) {
  if (!time) {
    return '00:00';
  }

  if (time instanceof Date) {
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  }

  if (typeof time === 'string' && time.includes(':')) {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
  }

  return time;
}

/**
 * Formats zodiac sign names
 * @param {string} sign - Zodiac sign name
 * @returns {string} Formatted sign name
 */
function formatZodiac(sign) {
  if (!sign) return 'Unknown';

  const formattedSigns = {
    'aries': 'Aries ♈',
    'taurus': 'Taurus ♉',
    'gemini': 'Gemini ♊',
    'cancer': 'Cancer ♋',
    'leo': 'Leo ♌',
    'virgo': 'Virgo ♍',
    'libra': 'Libra ♎',
    'scorpio': 'Scorpio ♏',
    'sagittarius': 'Sagittarius ♐',
    'capricorn': 'Capricorn ♑',
    'aquarius': 'Aquarius ♒',
    'pisces': 'Pisces ♓'
  };

  return formattedSigns[sign.toLowerCase()] || sign;
}

module.exports = {
  formatDegree,
  formatTime,
  formatZodiac
};