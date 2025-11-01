const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure (for now)

/**
 * PanchangService - Vedic daily calendar service
 *
 * Provides Hindu daily calendar (Panchang) calculations including tithi, nakshatra, yoga, karana,
 * and auspicious timing with Swiss Ephemeris integration for astronomical precision.
 */
class PanchangService extends ServiceTemplate {
  constructor() {
    super('PanchangCalculator');
    this.calculatorPath = '../calculators/PanchangCalculator';
    this.serviceName = 'PanchangService';
    logger.info('PanchangService initialized');
  }

  async lpanchangCalculation(dateData) {
    try {
      // Get comprehensive panchang analysis
      const panchang = await this.calculator.generatePanchang(dateData);
      return panchang;
    } catch (error) {
      logger.error('PanchangService calculation error:', error);
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
        longitude: locationData.longitude || 77.209,
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
        panchang,
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
        date,
        time: '12:00', // Noon for general calculations
        latitude: locationData.latitude || 28.6139,
        longitude: locationData.longitude || 77.209,
        timezone: locationData.timezone || 5.5
      };

      const panchang = await this.calculator.generatePanchang(dateData);

      return {
        panchang,
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
  validate(dateData) {
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
  formatResult(result) {
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
        calculationMethod:
          'Hindu daily calendar with Swiss Ephemeris precision',
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
      name: this.serviceName,
      version: '1.0.0',
      category: 'vedic',
      methods: ['execute', 'getTodaysPanchang', 'getPanchangForDate'],
      dependencies: ['Panchang']
    };
  }
  async getHealthStatus() {
    try {
      const baseHealth = await super.getHealthStatus();
      return {
        ...baseHealth,
        features: {
          // Add service-specific features here
        },
        supportedAnalyses: [
          // Add supported analyses here
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = PanchangService;
