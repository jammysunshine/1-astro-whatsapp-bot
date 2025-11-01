/**
 * Vedic Numerology Service
 *
 * Provides Vedic numerology analysis using the traditional Chani system
 * based on Sanskrit alphabet and Vedic principles for name and birth number calculations.
 */

const logger = require('../../../utils/logger');

class VedicNumerologyService {
  constructor() {
    this.calculator = new VedicNumerology();
    logger.info('VedicNumerologyService initialized');
  }

  /**
   * Execute complete Vedic numerology analysis
   * @param {Object} data - Name and birth data
   * @returns {Promise<Object>} Complete numerology analysis
   */
  async execute(data) {
    try {
      this._validateInput(data);

      // Get comprehensive numerology analysis
      const analysis = this.calculator.getVedicNumerologyAnalysis(data.birthDate, data.name);

      // Format result for service consumption
      return this._formatResult(analysis);
    } catch (error) {
      logger.error('VedicNumerologyService error:', error);
      throw new Error(`Vedic numerology analysis failed: ${error.message}`);
    }
  }

  /**
   * Calculate name number (for handler compatibility)
   * @param {string} name - Person's name
   * @returns {Promise<Object>} Name number analysis
   */
  async calculateNameNumber(name) {
    try {
      if (!name) {
        throw new Error('Name is required');
      }

      const nameNumber = this.calculator.calculateVedicNameNumber(name);
      const interpretation = this.calculator.vedicInterpretations[nameNumber] || {};

      return {
        primaryNumber: nameNumber,
        primaryMeaning: interpretation.qualities || 'Unique vibrational pattern',
        compoundNumber: nameNumber, // Simplified for compatibility
        compoundMeaning: interpretation.qualities || 'Unique vibrational pattern',
        karmicPath: interpretation.strengths || 'Personal growth and self-discovery',
        error: false
      };
    } catch (error) {
      logger.error('VedicNumerologyService calculateNameNumber error:', error);
      return {
        error: true,
        message: 'Unable to calculate name number'
      };
    }
  }

  /**
   * Get numerology analysis for birth date and name
   * @param {Object} data - Birth date and name data
   * @returns {Promise<Object>} Complete numerology analysis
   */
  async getAnalysis(data) {
    try {
      this._validateInput(data);

      const analysis = this.calculator.getVedicNumerologyAnalysis(data.birthDate, data.name);

      return {
        analysis,
        summary: this._generateSummary(analysis),
        error: false
      };
    } catch (error) {
      logger.error('VedicNumerologyService getAnalysis error:', error);
      return {
        error: true,
        message: 'Unable to generate numerology analysis'
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
      throw new Error('Input data is required');
    }

    if (!input.name && !input.birthDate) {
      throw new Error('Either name or birth date is required');
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   * @private
   */
  _formatResult(result) {
    return {
      success: true,
      analysis: result,
      metadata: {
        system: 'Vedic Numerology',
        calculationMethod: 'Chani system based on Sanskrit alphabet and Vedic principles',
        numbers: ['Birth Number', 'Name Number', 'Destiny Number', 'Compound Numbers'],
        tradition: 'Traditional Indian numerology'
      }
    };
  }

  /**
   * Generate summary for analysis
   * @param {Object} analysis - Full analysis data
   * @returns {string} Formatted summary
   * @private
   */
  _generateSummary(analysis) {
    let summary = '🔢 *Vedic Numerology Analysis*\n\n';

    if (analysis.birthNumber) {
      summary += `*Birth Number:* ${analysis.birthNumber}\n`;
      summary += `*Birth Meaning:* ${analysis.birthInterpretation || 'Your inherent nature'}\n\n`;
    }

    if (analysis.nameNumber) {
      summary += `*Name Number:* ${analysis.nameNumber}\n`;
      summary += `*Name Meaning:* ${analysis.nameInterpretation || 'Your expression in the world'}\n\n`;
    }

    if (analysis.destinyNumber) {
      summary += `*Destiny Number:* ${analysis.destinyNumber}\n`;
      summary += `*Destiny Meaning:* ${analysis.destinyInterpretation || 'Your life purpose'}\n\n`;
    }

    summary += '*🕉️ Vedic Wisdom:* Numbers are vibrations that connect us to cosmic energies.';

    return summary;
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'VedicNumerologyService',
      description: 'Vedic numerology analysis using the traditional Chani system',
      version: '1.0.0',
      dependencies: ['VedicNumerology'],
      category: 'vedic',
      methods: ['execute', 'calculateNameNumber', 'getAnalysis']
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

module.exports = VedicNumerologyService;
