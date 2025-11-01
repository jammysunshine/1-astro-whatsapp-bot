const logger = require('../../utils/logger');
const ServiceTemplate = require('./ServiceTemplate');

class HellenisticAstrologyService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.calculatorPath = './calculators/ChartGenerator';
    this.serviceName = 'HellenisticAstrologyService';
    this.calculatorPath = './calculators/hellenisticAstrologyReader'; // Assuming this path for the main calculator
    logger.info('HellenisticAstrologyService initialized');
  }

  /**
   * Main service execution method
   * @param {Object} birthData - User birth data and parameters
   * @returns {Promise<Object>} Service result
   */
  async processCalculation(birthData) {
    try {
      // Input validation
      this._validateInput(birthData);

      // Get Hellenistic astrology data
      const result = await this.getHellenisticAstrologyData(birthData);

      // Format and return result
      return this._formatResult(result);
    } catch (error) {
      logger.error('HellenisticAstrologyService error:', error);
      throw new Error(
        `Hellenistic astrology analysis failed: ${error.message}`
      );
    }
  }

  /**
   * Get Hellenistic astrology analysis data
   * @param {Object} birthData - Birth data
   * @returns {Promise<Object>} Hellenistic astrology data
   */
  async getHellenisticAstrologyData(birthData) {
    try {
      return await this.reader.generateHellenisticAnalysis(birthData);
    } catch (error) {
      logger.error('Error getting Hellenistic astrology data:', error);
      throw error;
    }
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  validate(input) {
    if (!input) {
      throw new Error('Input data is required');
    }

    if (!input.birthDate) {
      throw new Error(
        'Birth date is required for Hellenistic astrology analysis'
      );
    }

    if (!input.birthTime) {
      throw new Error(
        'Birth time is required for Hellenistic astrology analysis'
      );
    }

    if (!input.birthPlace) {
      throw new Error(
        'Birth place is required for Hellenistic astrology analysis'
      );
    }

    // Validate birth date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(input.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate birth time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(input.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
    }
  }

  /**
   * Format result for presentation
   * @param {Object} result - Raw Hellenistic astrology result
   * @returns {Object} Formatted result
   * @private
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Unable to generate Hellenistic astrology analysis',
        data: result
      };
    }

    return {
      success: true,
      message: 'Hellenistic astrology analysis completed successfully',
      data: {
        name: result.name,
        sect: result.sect,
        planetaryPositions: result.planetaryPositions,
        arabicParts: result.arabicParts,
        essentialDignities: result.essentialDignities,
        hellenisticAspects: result.hellenisticAspects,
        triplicityAnalysis: result.triplicityAnalysis,
        interpretation: result.interpretation,
        techniques: result.techniques,
        disclaimer: result.disclaimer
      }
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'HellenisticAstrologyService',
      description:
        'Ancient Greek astrological techniques including essential dignities, Arabic parts (lots), sect analysis, and triplicities',
      version: '1.0.0',
      dependencies: ['hellenisticAstrologyReader'],
      category: 'vedic'
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

module.exports = HellenisticAstrologyService;
