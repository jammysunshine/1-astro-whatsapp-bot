const logger = require('../../../utils/logger');

/**
 * Extract partner birth data from user message
 * @param {string} message - User message
 * @returns {Object|null} Partner data or null if not found
 */
const extractPartnerData = message => {
  const lowerMessage = message.toLowerCase();

  // Check if message contains birth date pattern
  const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (!dateMatch) {
    return null;
  }

  const birthDate = dateMatch[1];

  // Extract name if provided
  let name = 'Partner';
  const nameMatch = message.match(/(?:name:?\s*|partner:?\s*)([A-Za-z\s]+)/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // Extract birth time if provided
  let birthTime = '12:00';
  const timeMatch = message.match(/(\d{1,2}:\d{2})/);
  if (timeMatch) {
    birthTime = timeMatch[1];
  }

  // Extract birth place if provided
  let birthPlace = 'Delhi, India';
  const placeMatch = message.match(
    /(?:place:?\s*|birthplace:?\s*|born in:?\s*)([A-Za-z\s,]+)/i
  );
  if (placeMatch) {
    birthPlace = placeMatch[1].trim();
  } else {
    // Try to extract place from remaining text
    const placePatterns = message.split(birthDate)[1];
    if (placePatterns) {
      const placeWords = placePatterns.match(/([A-Za-z\s,]+)/);
      if (placeWords && placeWords[1].trim().length > 2) {
        birthPlace = placeWords[1].trim();
      }
    }
  }

  return {
    name,
    birthDate,
    birthTime,
    birthPlace
  };
};

/**
 * Improved intent recognition using regex patterns for better accuracy
 * @param {string} message - The user message
 * @param {Array<string|RegExp>} patterns - Array of patterns to match
 * @returns {boolean} True if any pattern matches
 */
const matchesIntent = (message, patterns) =>
  patterns.some(pattern => {
    const lowerMessage = message.toLowerCase();
    if (typeof pattern === 'string') {
      return lowerMessage.includes(pattern.toLowerCase());
    }
    return pattern.test(lowerMessage);
  });

/**
 * Validate birth data completeness
 * @param {string} birthDate - Birth date
 * @param {string} birthTime - Birth time
 * @param {string} birthPlace - Birth place
 * @returns {Object} Validation result
 */
const validateBirthData = (birthDate, birthTime, birthPlace) => {
  const errors = [];

  if (!birthDate) {
    errors.push('Birth date is required');
  } else {
    let day;
    let month;
    let year;
    let isValidDate = false;

    // Try DDMMYY format
    const shortDateRegex = /^(\d{2})(\d{2})(\d{2})$/;
    const shortMatch = birthDate.match(shortDateRegex);
    if (shortMatch) {
      [, day, month] = shortMatch.map(Number);
      const yy = parseInt(shortMatch[3]);
      year = yy < new Date().getFullYear() % 100 ? 2000 + yy : 1900 + yy; // Simple heuristic for 2-digit year
      const date = new Date(year, month - 1, day);
      if (
        date <= new Date() &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        isValidDate = true;
      }
    }

    // Try DDMMYYYY format
    const longDateRegex = /^(\d{2})(\d{2})(\d{4})$/;
    const longMatch = birthDate.match(longDateRegex);
    if (!isValidDate && longMatch) {
      [, day, month, year] = longMatch.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date <= new Date() &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        isValidDate = true;
      }
    }

    // Try YYYY-MM-DD format
    const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = birthDate.match(isoDateRegex);
    if (!isValidDate && isoMatch) {
      [, year, month, day] = isoMatch.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date <= new Date() &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        isValidDate = true;
      }
    }

    if (!isValidDate) {
      errors.push(
        'Birth date must be a valid date in DDMMYY, DDMMYYYY or YYYY-MM-DD format, and not a future date.'
      );
    }
  }

  if (!birthTime) {
    errors.push('Birth time is recommended for accurate calculations');
  } else if (!/^([01]?[0-9]|2[0-3])[0-5][0-9]$/.test(birthTime)) {
    errors.push('Birth time must be in HHMM (24-hour) format');
  }

  if (!birthPlace) {
    errors.push('Birth place is required for accurate calculations');
  }

  return {
    isValid: errors.length === 0,
    message:
      errors.length > 0 ?
        `Please provide: ${errors.join(', ')}` :
        'Birth data is valid'
  };
};

logger.info('Module: intentUtils loaded successfully.');

module.exports = {
  extractPartnerData,
  matchesIntent,
  validateBirthData
};
