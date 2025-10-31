/**
 * Ashtakavarga Service
 *
 * Provides Vedic 64-point beneficial influence analysis using authentic Ashtakavarga calculations
 * with Swiss Ephemeris integration for precise planetary strength assessment.
 */

const { AshtakavargaCalculator } = require('../../../services/astrology/calculators/AshtakavargaCalculator');
const logger = require('../../../../utils/logger');

class AshtakavargaService {
  constructor() {
    this.calculator = new AshtakavargaCalculator();
    logger.info('AshtakavargaService initialized');
  }

  /**
   * Execute complete Ashtakavarga analysis
   * @param {Object} birthData - User birth data
   * @returns {Promise<Object>} Complete 64-point analysis
   */
  async execute(birthData) {
    try {
      this._validateInput(birthData);

      // Set services if available (for geocoding, etc.)
      if (global.vedicCore?.geocodingService) {
        this.calculator.setServices(null, global.vedicCore.geocodingService);
      }

      // Get comprehensive Ashtakavarga analysis
      const analysis = await this.calculator.calculateAshtakavarga(birthData);

      // Format result for service consumption
      return this._formatResult(analysis);

    } catch (error) {
      logger.error('AshtakavargaService error:', error);
      throw new Error(`Ashtakavarga analysis failed: ${error.message}`);
    }
  }

  /**
   * Get Ashtakavarga summary (for handler compatibility)
   * @param {Object} birthData - User birth data
   * @returns {Promise<Object>} Ashtakavarga summary
   */
  async getAnalysis(birthData) {
    try {
      this._validateInput(birthData);

      const analysis = await this.calculator.calculateAshtakavarga(birthData);

      if (analysis.error) {
        return {
          error: true,
          message: 'Unable to calculate Ashtakavarga analysis'
        };
      }

      // Generate summary using calculator's method
      const summary = this.calculator._generateAshtakavargaSummary(analysis.analysis);

      return {
        analysis: analysis.analysis,
        summary: summary,
        error: false
      };

    } catch (error) {
      logger.error('AshtakavargaService getAnalysis error:', error);
      return {
        error: true,
        message: 'Error calculating Ashtakavarga analysis'
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
      throw new Error('Birth data is required');
    }

    if (!input.birthDate) {
      throw new Error('Birth date is required');
    }

    if (!input.birthTime) {
      throw new Error('Birth time is required');
    }

    if (!input.birthPlace) {
      throw new Error('Birth place is required');
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
        message: 'Ashtakavarga calculation failed'
      };
    }

    return {
      success: true,
      analysis: result.analysis,
      metadata: {
        system: 'Ashtakavarga',
        calculationMethod: 'Vedic 64-point beneficial influence system',
        planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
        maxPoints: 64
      }
    };
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'AshtakavargaService',
      description: 'Vedic 64-point beneficial influence analysis with Swiss Ephemeris precision',
      version: '1.0.0',
      dependencies: ['AshtakavargaCalculator'],
      category: 'vedic',
      methods: ['execute', 'getAnalysis']
    };
  }
}

module.exports = AshtakavargaService;