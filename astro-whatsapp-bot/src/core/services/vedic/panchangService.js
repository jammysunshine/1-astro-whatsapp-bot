/**
 * Panchang Service
 *
 * Provides Hindu daily calendar (Panchang) calculations including tithi, nakshatra, yoga, karana,
 * and auspicious timing with Swiss Ephemeris integration for astronomical precision.
 */

const { Panchang } = require('../../../services/astrology/panchang');
const logger = require('../../../../utils/logger');

class PanchangService {
  constructor() {
    this.calculator = new Panchang();
    logger.info('PanchangService initialized');
  }

  /**
   * Execute complete Panchang calculation for a date
   * @param {Object} dateData - Date and location data
   * @returns {Promise<Object>} Complete panchang analysis
   */
  async execute(dateData) {
    try {
      this._validateInput(dateData);

      // Get comprehensive panchang analysis
      const panchang = await this.calculator.generatePanchang(dateData);

      // Format result for service consumption
      return this._formatResult(panchang);

    } catch (error) {
      logger.error('PanchangService error:', error);
      throw new Error(`Panchang calculation failed: ${error.message}`);
    }
  }

  /**
   * Get today's panchang (for handler compatibility)
   * @param {Object} locationData - Location and timezone data
   * @returns {Promise<Object>} Today's panchang data
   */
  async getTodaysPanchang(locationData = {}) {
    try {
      const today = new Date();
      const dateData = {
        date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
        time: `${today.getHours()}:${today.getMinutes()}`,
        latitude: locationData.latitude || 28.6139, // Default Delhi
        longitude: locationData.longitude || 77.2090,
        timezone: locationData.timezone || 5.5 // IST
      };

      const panchang = await this.calculator.generatePanchang(dateData);

      if (panchang.error) {
        return {
          error: true,
          message: 'Unable to generate panchang for today'
        };
      }

      return {
        panchang: panchang,
        summary: panchang.summary,
        error: false
      };

    } catch (error) {
      logger.error('PanchangService getTodaysPanchang error:', error);
      return {
        error: true,
        message: 'Error generating daily panchang'
      };
    }
  }

  /**
   * Get panchang for specific date
   * @param {string} date - Date in DD/MM/YYYY format
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} Panchang for specific date
   */
  async getPanchangForDate(date, locationData = {}) {
    try {
      if (!date) {
        throw new Error('Date is required');
      }

      const dateData = {
        date: date,
        time: '12:00', // Noon for general calculations
        latitude: locationData.latitude || 28.6139,
        longitude: locationData.longitude || 77.2090,
        timezone: locationData.timezone || 5.5
      };

      const panchang = await this.calculator.generatePanchang(dateData);

      return {
        panchang: panchang,
        error: panchang.error || false
      };

    } catch (error) {
      logger.error('PanchangService getPanchangForDate error:', error);
      return {
        error: true,
        message: 'Error generating panchang for specified date'
      };
    }
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(input) {
    if (!input) {
      throw new Error('Date data is required');
    }

    if (!input.date) {
      throw new Error('Date is required');
    }

    // Optional validations
    if (input.latitude && (input.latitude < -90 || input.latitude > 90)) {
      throw new Error('Invalid latitude');
    }

    if (input.longitude && (input.longitude < -180 || input.longitude > 180)) {
      throw new Error('Invalid longitude');
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Panchang calculation failed'
      };
    }

    return {
      success: true,
      panchang: result,
      metadata: {
        system: 'Panchang',
        calculationMethod: 'Hindu daily calendar with Swiss Ephemeris precision',
        elements: ['Tithi', 'Nakshatra', 'Yoga', 'Karana', 'Sunrise/Sunset'],
        tradition: 'Vedic Hindu calendar system'
      }
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'PanchangService',
      description: 'Hindu daily calendar calculations with Swiss Ephemeris precision',
      version: '1.0.0',
      dependencies: ['Panchang'],
      category: 'vedic',
      methods: ['execute', 'getTodaysPanchang', 'getPanchangForDate']
    };
  }
}

module.exports = PanchangService;