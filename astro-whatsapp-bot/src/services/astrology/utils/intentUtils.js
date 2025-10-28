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
  if (!dateMatch) { return null; }

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
  const placeMatch = message.match(/(?:place:?\s*|birthplace:?\s*|born in:?\s*)([A-Za-z\s,]+)/i);
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
const matchesIntent = (message, patterns) => patterns.some(pattern => {
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
  } else if (!/^(\d{2})(\d{2})(\d{2}(\d{2})?)$/.test(birthDate)) {
    errors.push('Birth date must be in DDMMYY or DDMMYYYY format');
  }

  if (!birthTime) {
    errors.push('Birth time is recommended for accurate calculations');
  }

  if (!birthPlace) {
    errors.push('Birth place is required for accurate calculations');
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? `Please provide: ${errors.join(', ')}` : 'Birth data is valid'
  };
};

logger.info('Module: intentUtils loaded successfully.');

module.exports = {
  extractPartnerData,
  matchesIntent,
  validateBirthData
};
