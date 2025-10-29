const logger = require('../../../utils/logger');

/**
 * Utility functions for validating and formatting date/time inputs
 * Provides consistent validation across all astrology handlers
 */

/**
 * Validates and formats birth date in various input formats
 * @param {string} birthDate - Raw birth date string
 * @returns {Object} { isValid: boolean, formattedDate: string, error: string }
 */
const validateAndFormatBirthDate = birthDate => {
  if (!birthDate || typeof birthDate !== 'string') {
    return {
      isValid: false,
      formattedDate: null,
      error: 'Birth date is required and must be a string'
    };
  }

  // Limit input length to prevent abuse
  if (birthDate.length > 20) {
    return {
      isValid: false,
      formattedDate: null,
      error: 'Birth date is too long'
    };
  }

  // Sanitize input - remove potentially harmful characters
  const sanitizedDate = birthDate.replace(/[<>'"`]/g, '').trim();

  if (sanitizedDate !== birthDate) {
    logger.warn('⚠️ Sanitized potentially harmful characters from birth date input');
  }

  let formattedDate = null;
  let error = null;

  try {
    if (sanitizedDate.match(/^(\d{2})(\d{2})(\d{2})$/)) { // DDMMYY
      const [_, day, month, year] = sanitizedDate.match(/^(\d{2})(\d{2})(\d{2})$/);
      const numericDay = parseInt(day, 10);
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);

      // Validate date ranges
      if (numericDay >= 1 && numericDay <= 31 && numericMonth >= 1 && numericMonth <= 12) {
        const fullYear = (numericYear < new Date().getFullYear() % 100) ? 2000 + numericYear : 1900 + numericYear;
        formattedDate = `${day}/${month}/${fullYear}`;
      } else {
        error = 'Invalid date values';
      }
    } else if (sanitizedDate.match(/^(\d{2})(\d{2})(\d{4})$/)) { // DDMMYYYY
      const [_, day, month, year] = sanitizedDate.match(/^(\d{2})(\d{2})(\d{4})$/);
      const numericDay = parseInt(day, 10);
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);

      // Validate date ranges
      if (numericDay >= 1 && numericDay <= 31 && numericMonth >= 1 && numericMonth <= 12 && numericYear >= 1900 && numericYear <= new Date().getFullYear()) {
        formattedDate = `${day}/${month}/${year}`;
      } else {
        error = 'Invalid date values';
      }
    } else if (sanitizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)) { // YYYY-MM-DD
      const [_, year, month, day] = sanitizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const numericDay = parseInt(day, 10);
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);

      // Validate date ranges
      if (numericDay >= 1 && numericDay <= 31 && numericMonth >= 1 && numericMonth <= 12 && numericYear >= 1900 && numericYear <= new Date().getFullYear()) {
        formattedDate = `${day}/${month}/${year}`;
      } else {
        error = 'Invalid date values';
      }
    } else {
      error = 'Unsupported date format. Please use DDMMYY, DDMMYYYY, or YYYY-MM-DD';
    }
  } catch (err) {
    error = 'Error processing birth date';
    logger.error('Error validating birth date:', err);
  }

  return {
    isValid: !!formattedDate,
    formattedDate,
    error
  };
};

/**
 * Validates and formats birth time
 * @param {string} birthTime - Raw birth time string
 * @returns {Object} { isValid: boolean, formattedTime: string, error: string }
 */
const validateAndFormatBirthTime = birthTime => {
  if (!birthTime) {
    // Default to noon if no time provided
    return {
      isValid: true,
      formattedTime: '12:00',
      error: null
    };
  }

  if (typeof birthTime !== 'string') {
    return {
      isValid: false,
      formattedTime: null,
      error: 'Birth time must be a string'
    };
  }

  // Limit input length to prevent abuse
  if (birthTime.length > 10) {
    return {
      isValid: false,
      formattedTime: null,
      error: 'Birth time is too long'
    };
  }

  // Sanitize input - remove potentially harmful characters
  const sanitizedTime = birthTime.replace(/[<>'"`]/g, '').trim();

  if (sanitizedTime !== birthTime) {
    logger.warn('⚠️ Sanitized potentially harmful characters from birth time input');
  }

  let formattedTime = null;
  let error = null;

  try {
    if (sanitizedTime.match(/^(\d{2})(\d{2})$/)) { // HHMM
      const [_, hour, minute] = sanitizedTime.match(/^(\d{2})(\d{2})$/);
      const numericHour = parseInt(hour, 10);
      const numericMinute = parseInt(minute, 10);

      // Validate time ranges
      if (numericHour >= 0 && numericHour <= 23 && numericMinute >= 0 && numericMinute <= 59) {
        formattedTime = `${hour}:${minute}`;
      } else {
        error = 'Invalid time values (hour: 0-23, minute: 0-59)';
      }
    } else if (sanitizedTime.match(/^(\d{1,2}):(\d{2})$/)) { // H:MM or HH:MM
      const [_, hour, minute] = sanitizedTime.match(/^(\d{1,2}):(\d{2})$/);
      const numericHour = parseInt(hour, 10);
      const numericMinute = parseInt(minute, 10);

      // Validate time ranges
      if (numericHour >= 0 && numericHour <= 23 && numericMinute >= 0 && numericMinute <= 59) {
        formattedTime = `${hour.padStart(2, '0')}:${minute}`;
      } else {
        error = 'Invalid time values (hour: 0-23, minute: 0-59)';
      }
    } else {
      error = 'Unsupported time format. Please use HHMM or HH:MM';
    }
  } catch (err) {
    error = 'Error processing birth time';
    logger.error('Error validating birth time:', err);
  }

  return {
    isValid: !!formattedTime,
    formattedTime,
    error
  };
};

/**
 * Validates birth place
 * @param {string} birthPlace - Raw birth place string
 * @returns {Object} { isValid: boolean, formattedPlace: string, error: string }
 */
const validateAndFormatBirthPlace = birthPlace => {
  if (!birthPlace) {
    // Default to Delhi, India if no place provided
    return {
      isValid: true,
      formattedPlace: 'Delhi, India',
      error: null
    };
  }

  if (typeof birthPlace !== 'string') {
    return {
      isValid: false,
      formattedPlace: null,
      error: 'Birth place must be a string'
    };
  }

  // Limit input length to prevent abuse
  if (birthPlace.length > 100) {
    return {
      isValid: false,
      formattedPlace: null,
      error: 'Birth place is too long (max 100 characters)'
    };
  }

  // Sanitize input - remove potentially harmful characters but allow common punctuation
  const sanitizedPlace = birthPlace.replace(/[<>'"`]/g, '').trim();

  if (sanitizedPlace !== birthPlace) {
    logger.warn('⚠️ Sanitized potentially harmful characters from birth place input');
  }

  // Ensure we have something meaningful
  if (sanitizedPlace.length < 2) {
    return {
      isValid: false,
      formattedPlace: null,
      error: 'Birth place is too short'
    };
  }

  return {
    isValid: true,
    formattedPlace: sanitizedPlace,
    error: null
  };
};

module.exports = {
  validateAndFormatBirthDate,
  validateAndFormatBirthTime,
  validateAndFormatBirthPlace
};
