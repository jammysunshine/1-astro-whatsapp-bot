/**
 * Ayurvedic Astrology Service
 *
 * Provides Ayurvedic constitution analysis linking Vedic astrology with Ayurvedic health principles
 * Determines dominant doshas (Vata/Pitta/Kapha) and provides personalized health guidance.
 */

const logger = require('../../utils/logger');
const ServiceTemplate = require('./ServiceTemplate');

class AyurvedicAstrologyService extends ServiceTemplate {
  constructor() {
    super('ChartGenerator');
    this.calculatorPath = './calculators/ChartGenerator';
    this.serviceName = 'AyurvedicAstrologyService';
    logger.info('AyurvedicAstrologyService initialized');
  }

  /**
   * Execute complete Ayurvedic constitution analysis
   * @param {Object} birthData - User birth data
   * @returns {Promise<Object>} Complete Ayurvedic analysis
   */
  async processCalculation(birthData) {
    try {
      this._validateInput(birthData);

      // Get comprehensive Ayurvedic analysis
      const analysis = this.calculator.analyzeAyurvedicConstitution(birthData);

      // Format result for service consumption
      return this._formatResult(analysis);
    } catch (error) {
      logger.error('AyurvedicAstrologyService error:', error);
      throw new Error(
        `Ayurvedic constitution analysis failed: ${error.message}`
      );
    }
  }

  /**
   * Get Ayurvedic constitution (for handler compatibility)
   * @param {Object} birthData - User birth data
   * @returns {Promise<Object>} Constitution analysis
   */
  async getConstitution(birthData) {
    try {
      this._validateInput(birthData);

      const analysis = this.calculator.analyzeAyurvedicConstitution(birthData);

      // Extract constitution information
      const primaryDosha = analysis.constitutions.primary;
      const constitution = this.calculator.constitutions[primaryDosha];

      return {
        description: `Your primary constitution is **${constitution.name}**\n\n${constitution.traits}\n\n*Physical:* ${constitution.physical}\n*Mental:* ${constitution.mental}`,
        doshaBreakdown: this._formatDoshaBreakdown(analysis.constitutions),
        error: false
      };
    } catch (error) {
      logger.error('AyurvedicAstrologyService getConstitution error:', error);
      return {
        error: true,
        message: 'Unable to determine Ayurvedic constitution'
      };
    }
  }

  /**
   * Get health recommendations (for handler compatibility)
   * @param {Object} birthData - User birth data
   * @returns {Promise<Object>} Health recommendations
   */
  async getRecommendations(birthData) {
    try {
      this._validateInput(birthData);

      const analysis = this.calculator.analyzeAyurvedicConstitution(birthData);

      // Generate recommendations
      const recommendations = this.calculator.getHealthRecommendations(
        analysis.constitutions,
        analysis.planetaryHealth
      );

      return {
        health: recommendations.health.join('\n• '),
        diet: recommendations.diet.join('\n• '),
        lifestyle: recommendations.lifestyle.join('\n• '),
        error: false
      };
    } catch (error) {
      logger.error(
        'AyurvedicAstrologyService getRecommendations error:',
        error
      );
      return {
        error: true,
        message: 'Unable to generate health recommendations'
      };
    }
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  validate(input) {
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
  formatResult(result) {
    return {
      success: true,
      analysis: result,
      metadata: {
        system: 'Ayurvedic Astrology',
        calculationMethod:
          'Vedic astrology integrated with Ayurvedic health principles',
        doshas: ['Vata', 'Pitta', 'Kapha'],
        focus: 'Holistic health through constitutional awareness'
      }
    };
  }

  /**
   * Format dosha breakdown for display
   * @param {Object} constitutions - Constitution data
   * @returns {string} Formatted breakdown
   * @private
   */
  _formatDoshaBreakdown(constitutions) {
    const doshas = ['vata', 'pitta', 'kapha'];
    let breakdown = '';

    doshas.forEach(dosha => {
      const percentage = constitutions[dosha] || 0;
      const name = dosha.charAt(0).toUpperCase() + dosha.slice(1);
      breakdown += `• ${name}: ${percentage}%\n`;
    });

    return breakdown.trim();
  }

  /**
   * Get service metadata
   * @returns {Object} Service information
   */
  getMetadata() {
    return {
      name: 'AyurvedicAstrologyService',
      description:
        'Ayurvedic constitution analysis linking Vedic astrology with Ayurvedic health principles',
      version: '1.0.0',
      dependencies: ['AyurvedicAstrology'],
      category: 'vedic',
      methods: ['execute', 'getConstitution', 'getRecommendations']
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

module.exports = AyurvedicAstrologyService;
