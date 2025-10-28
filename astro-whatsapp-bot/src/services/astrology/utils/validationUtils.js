const logger = require('../../../utils/logger');

/**
 * Utility functions for validating and formatting date/time inputs
 */

/**
 * Validates and formats birth date in various input formats
 * @param {string} birthDate - Raw birth date string
 * @returns {Object} { isValid: boolean, formattedDate: string, error: string }
 */
const validateAndFormatBirthDate = (birthDate) => {
  if (!birthDate || typeof birthDate !== 'string') {
    return { 
      isValid: false, 
      formattedDate: null, 
      error: 'Birth date is required and must be a string' 
    };
  }

  let formattedDate = null;
  let error = null;

  try {
    if (birthDate.match(/^(\d{2})(\d{2})(\d{2})$/)) { // DDMMYY
      const [_, day, month, year] = birthDate.match(/^(\d{2})(\d{2})(\d{2})$/);
      const numericDay = parseInt(day, 10);
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);
      
      // Validate date ranges
      if (numericDay >= 1 && numericDay <= 31 && numericMonth >= 1 && numericMonth <= 12) {
        formattedDate = `${day}/${month}/${(numericYear < new Date().getFullYear() % 100) ? 2000 + numericYear : 1900 + numericYear}`;
      } else {
        error = 'Invalid date values';
      }
    } else if (birthDate.match(/^(\d{2})(\d{2})(\d{4})$/)) { // DDMMYYYY
      const [_, day, month, year] = birthDate.match(/^(\d{2})(\d{2})(\d{4})$/);
      const numericDay = parseInt(day, 10);
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);
      
      // Validate date ranges
      if (numericDay >= 1 && numericDay <= 31 && numericMonth >= 1 && numericMonth <= 12 && numericYear >= 1900) {
        formattedDate = `${day}/${month}/${year}`;
      } else {
        error = 'Invalid date values';
      }
    } else if (birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)) { // YYYY-MM-DD
      const [_, year, month, day] = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const numericDay = parseInt(day, 10);
      const numericMonth = parseInt(month, 10);
      const numericYear = parseInt(year, 10);
      
      // Validate date ranges
      if (numericDay >= 1 && numericDay <= 31 && numericMonth >= 1 && numericMonth <= 12 && numericYear >= 1900) {
        formattedDate = `${day}/${month}/${year}`;
      } else {
        error = 'Invalid date values';
      }
    } else {
      error = 'Invalid date format';
    }
  } catch (err) {
    error = `Error parsing date: ${err.message}`;
  }

  return {
    isValid: !!formattedDate,
    formattedDate,
    error
  };
};

/**
 * Validates and formats birth time in various input formats
 * @param {string} birthTime - Raw birth time string
 * @returns {Object} { isValid: boolean, formattedTime: string, error: string }
 */
const validateAndFormatBirthTime = (birthTime) => {
  if (!birthTime) {
    // Default to 12:00 if no time provided
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

  let formattedTime = null;
  let error = null;

  try {
    if (birthTime.match(/^(\d{2})(\d{2})$/)) { // HHMM
      const [_, hour, minute] = birthTime.match(/^(\d{2})(\d{2})$/);
      const numericHour = parseInt(hour, 10);
      const numericMinute = parseInt(minute, 10);
      
      // Validate time ranges
      if (numericHour >= 0 && numericHour <= 23 && numericMinute >= 0 && numericMinute <= 59) {
        formattedTime = `${hour}:${minute}`;
      } else {
        error = 'Invalid time values (hour: 0-23, minute: 0-59)';
      }
    } else if (birthTime.match(/^(\d{1,2}):(\d{2})$/)) { // H:MM or HH:MM
      const [_, hour, minute] = birthTime.match(/^(\d{1,2}):(\d{2})$/);
      const numericHour = parseInt(hour, 10);
      const numericMinute = parseInt(minute, 10);
      
      // Validate time ranges
      if (numericHour >= 0 && numericHour <= 23 && numericMinute >= 0 && numericMinute <= 59) {
        formattedTime = `${hour.padStart(2, '0')}:${minute}`;
      } else {
        error = 'Invalid time values (hour: 0-23, minute: 0-59)';
      }
    } else {
      error = 'Invalid time format';
    }
  } catch (err) {
    error = `Error parsing time: ${err.message}`;
  }

  return {
    isValid: !!formattedTime,
    formattedTime,
    error
  };
};

module.exports = {
  validateAndFormatBirthDate,
  validateAndFormatBirthTime
};