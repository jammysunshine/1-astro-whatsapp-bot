/**
 * BirthData - Model for validating and processing birth data
 * Ensures all required birth information is present and valid
 */

class BirthData {
  constructor(data) {
    this.data = { ...data };

    // Required fields
    this.requiredFields = ['birthDate', 'birthTime', 'birthPlace'];

    // Optional fields with defaults
    this.optionalFields = {
      latitude: null,
      longitude: null,
      timezone: 'UTC',
      name: '',
      gender: 'unknown'
    };
  }

  /**
   * Validate that all required birth data is present
   * @throws {Error} If required data is missing or invalid
   */
  validate() {
    // Check required fields
    for (const field of this.requiredFields) {
      if (!this.data[field] || this.data[field].toString().trim() === '') {
        throw new Error(`Required field '${field}' is missing or empty`);
      }
    }

    // Validate birth date format (DD/MM/YYYY)
    if (!this.isValidDateFormat(this.data.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate birth time format (HH:MM)
    if (!this.isValidTimeFormat(this.data.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    // Validate birth place
    if (
      !this.data.birthPlace ||
      this.data.birthPlace.toString().trim() === ''
    ) {
      throw new Error('Birth place is required');
    }

    // Validate date range (not in future, not too far in past)
    if (!this.isValidDateRange(this.data.birthDate)) {
      throw new Error(
        'Birth date must be realistic (not in future, not before 1800)'
      );
    }

    return true;
  }

  /**
   * Check if date is in valid DD/MM/YYYY format
   * @param {string} dateStr - Date string
   * @returns {boolean} True if valid format
   */
  isValidDateFormat(dateStr) {
    if (typeof dateStr !== 'string') {
      return false;
    }

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
    return dateRegex.test(dateStr);
  }

  /**
   * Check if time is in valid HH:MM format
   * @param {string} timeStr - Time string
   * @returns {boolean} True if valid format
   */
  isValidTimeFormat(timeStr) {
    if (typeof timeStr !== 'string') {
      return false;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
  }

  /**
   * Check if date is within reasonable range
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {boolean} True if date is reasonable
   */
  isValidDateRange(dateStr) {
    try {
      const parts = dateStr.split('/');
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
      const year = parseInt(parts[2]);

      const birthDate = new Date(year, month, day);
      const now = new Date();

      // Check if valid date
      if (
        birthDate.getFullYear() !== year ||
        birthDate.getMonth() !== month ||
        birthDate.getDate() !== day
      ) {
        return false;
      }

      // Check if in past and reasonable
      if (birthDate > now) {
        return false; // Future dates not allowed
      }

      if (year < 1800) {
        return false; // Too far in past
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Process and normalize the birth data
   * @returns {Object} Normalized birth data
   */
  normalize() {
    const normalized = {
      ...this.data
    };

    // Add defaults for optional fields
    for (const [field, defaultValue] of Object.entries(this.optionalFields)) {
      if (!normalized[field]) {
        normalized[field] = defaultValue;
      }
    }

    // Convert string values to appropriate types where needed
    if (normalized.latitude) {
      normalized.latitude = parseFloat(normalized.latitude);
    }
    if (normalized.longitude) {
      normalized.longitude = parseFloat(normalized.longitude);
    }

    return normalized;
  }

  /**
   * Get complete processed birth data
   * @returns {Object} Complete birth data object
   */
  getData() {
    this.validate();
    return this.normalize();
  }

  /**
   * Get raw data without validation
   * @returns {Object} Raw birth data
   */
  getRawData() {
    return { ...this.data };
  }

  /**
   * Set a field value
   * @param {string} key - Field name
   * @param {*} value - Field value
   */
  set(key, value) {
    this.data[key] = value;
  }

  /**
   * Get a field value
   * @param {string} key - Field name
   * @returns {*} Field value
   */
  get(key) {
    return this.data[key];
  }
}

module.exports = { BirthData };
