const ServiceTemplate = require('./ServiceTemplate');
const logger = require('../../utils/logger');


/**
 * LifePatternsService - Service for generating life patterns based on astrological data
 *
 * Provides analysis of recurring life themes, patterns, and cycles based on sun sign
 * and other astrological factors, offering insights into personality tendencies,
 * life themes, and growth opportunities.
 */
class LifePatternsService extends ServiceTemplate {
  constructor() {
    super('LifePatternsCalculator');
    this.serviceName = 'LifePatternsService';
    this.calculatorPath = './calculators/LifePatternsCalculator';
    logger.info('LifePatternsService initialized');
  }

  async processCalculation(birthData) {
    try {
      // Validate input
      this._validateInput(birthData);

      // Generate life patterns
      const result =
        await this.calculator.generateLifePatternsFromBirthData(birthData);

      // Add service metadata
      result.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Life Patterns Analysis',
        timestamp: new Date().toISOString(),
        sunSign: birthData.sunSign,
        analysisDepth: 'comprehensive'
      };

      return result;
    } catch (error) {
      logger.error('LifePatternsService calculation error:', error);
      throw new Error(`Life patterns analysis failed: ${error.message}`);
    }
  }

  /**
   * Format result for service consumption
   * @param {Object} result - Raw calculator result
   * @returns {Object} Formatted result
   */
  formatResult(result) {
    if (result.error) {
      return {
        success: false,
        error: result.error,
        message: 'Life patterns analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Life patterns analysis completed',
      metadata: {
        system: 'Life Patterns Analysis',
        calculationMethod:
          'Astrological life pattern analysis based on sun sign',
        elements: [
          'Life Patterns',
          'Core Themes',
          'Growth Areas',
          'Timing Insights'
        ],
        tradition: 'Vedic astrological pattern analysis'
      }
    };
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for life patterns analysis');
    }
    const validatedData = new BirthData(birthData);
    validatedData.validate();

    if (!birthData.sunSign) {
      throw new Error('Sun sign is required for life patterns analysis');
    }

    // Validate sun sign
    const validSunSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    if (!validSunSigns.includes(birthData.sunSign)) {
      throw new Error(`Invalid sun sign: ${birthData.sunSign}. Valid signs are: ${validSunSigns.join(', ')}`);
    }
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
      methods: [
        'execute',
        'llifePatternsCalculation',
        'formatResult',
        'getLifePatterns'
      ],
      dependencies: ['LifePatternsCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🔄 **Life Patterns Service**

**Purpose:** Provides analysis of recurring life themes, patterns, and cycles based on astrological data, offering insights into personality tendencies, life themes, and growth opportunities

**Required Input:**
• Sun sign (Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces)

**Analysis Includes:**

**🔄 Core Life Patterns:**
• Natural tendencies and behavioral patterns
• Inherent strengths and capabilities
• Characteristics and temperamental traits

**🎭 Life Themes:**
• Recurring themes in life experiences
• Major life focus areas
• Characteristic approaches to situations

**🌱 Growth Areas:**
• Areas for personal development
• Challenges to overcome
• Skills to cultivate

**⏳ Timing Insights:**
• Optimal timing for life activities
• Seasonal patterns and opportunities
• Cyclical rhythms for growth

**Example Usage:**
"Life patterns for Aries"
"Analyze life patterns for Leo"
"Life themes for Taurus"
"Understanding patterns for Cancer"

**Output Format:**
Comprehensive report with core patterns, life themes, growth areas, timing insights, and summary
    `.trim();
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

module.exports = LifePatternsService;
