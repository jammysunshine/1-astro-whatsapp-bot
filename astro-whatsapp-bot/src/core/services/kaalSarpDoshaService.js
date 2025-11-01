const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

/**
 * KaalSarpDoshaService - Specialized service for analyzing Kaal Sarp Dosha
 *
 * Provides comprehensive analysis of Kaal Sarp Dosha, a significant planetary formation in Vedic astrology
 * where all planets are positioned between Rahu and Ketu, creating challenging karmic influences.
 * The service analyzes the type, strength, effects, and remedies for Kaal Sarp Dosha.
 */
class KaalSarpDoshaService extends ServiceTemplate {
  constructor(services) {
    super('KaalSarpDoshaCalculator');
    this.calculatorPath = '../calculators/KaalSarpDoshaCalculator';
    // Initialize calculator with services if provided
    if (services) {
      this.calculator.setServices(services);
    }

    this.serviceName = 'KaalSarpDoshaService';
    logger.info('KaalSarpDoshaService initialized');
  }

  async lkaalSarpDoshaCalculation(birthData) {
    try {
      // Validate input
      this._validateInput(birthData);

      // Generate Kaal Sarp Dosha analysis
      const kaalSarpAnalysis = await this.calculator.generateKaalSarpDosha(birthData);

      // Add service metadata
      kaalSarpAnalysis.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Kaal Sarp Dosha Analysis',
        timestamp: new Date().toISOString(),
        tradition: 'Vedic Hindu Astrology',
        methodology: 'Rahu-Ketu planetary positioning analysis'
      };

      return kaalSarpAnalysis;
    } catch (error) {
      logger.error('KaalSarpDoshaService calculation error:', error);
      throw new Error(`Kaal Sarp Dosha analysis failed: ${error.message}`);
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
        message: 'Kaal Sarp Dosha analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Kaal Sarp Dosha analysis completed',
      metadata: {
        system: 'Kaal Sarp Dosha Analysis',
        calculationMethod: 'Vedic planetary positioning with Rahu-Ketu axis analysis',
        elements: ['Dosha Presence', 'Type Analysis', 'Strength Assessment', 'Effects', 'Remedies', 'Exceptions'],
        tradition: 'Vedic Hindu astrology with Kaal Sarp Dosha principles'
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
      throw new Error('Birth data is required for Kaal Sarp Dosha analysis');
    }

    if (!birthData.birthDate) {
      throw new Error('Birth date is required for Kaal Sarp Dosha analysis');
    }

    if (!birthData.birthTime) {
      throw new Error('Birth time is required for Kaal Sarp Dosha analysis');
    }

    if (!birthData.birthPlace) {
      throw new Error('Birth place is required for Kaal Sarp Dosha analysis');
    }

    // Validate date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(birthData.birthDate)) {
      throw new Error('Birth date must be in DD/MM/YYYY format');
    }

    // Validate time format
    const timeRegex = /^\d{1,2}:\d{1,2}$/;
    if (!timeRegex.test(birthData.birthTime)) {
      throw new Error('Birth time must be in HH:MM format');
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
      methods: ['execute', 'lkaalSarpDoshaCalculation', 'formatResult'],
      dependencies: ['KaalSarpDoshaCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🐍 **Kaal Sarp Dosha Service**

**Purpose:** Provides comprehensive analysis of Kaal Sarp Dosha, a significant planetary formation in Vedic astrology where all planets are positioned between Rahu and Ketu

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, state/country)

**Analysis Includes:**

**🐍 Dosha Detection:**
• Presence of Kaal Sarp Dosha in birth chart
• Type of Kaal Sarp (Anant, Kulik, Vasuki, etc.)
• Planetary positioning between Rahu and Ketu
• Dosha strength assessment (Mild to Very Strong)

**📊 Detailed Analysis:**
• Rahu and Ketu positions
• Planets hemmed between Rahu-Ketu axis
• Dosha strength level and percentage
• Directional influences (East, South, West, North)

**⚡ Effects Assessment:**
• General life challenges and obstacles
• Specific effects based on Kaal Sarp type
• Career, marriage, health, and financial impacts
• Timing of challenges throughout life stages

**🛡️ Remedial Measures:**
• General remedial practices
• Type-specific remedies and pujas
• Lifestyle recommendations
• Strengthening measures based on dosha strength

**✨ Exception Analysis:**
• Cancellation factors that nullify dosha effects
• Partial cancellation conditions
• Strengthening planetary influences
• Favorable planetary positions

**🔮 Predictions:**
• Overall life predictions with dosha influence
• Career advancement possibilities
• Marriage and relationship timing
• Health considerations and precautions
• Financial stability and growth potential
• Spiritual development opportunities

**Example Usage:**
"Kaal Sarp Dosha analysis for birth date 15/06/1990, time 06:45, place New Delhi"
"Check if I have Kaal Sarp Dosha with complete birth details"
"Analyze Kaal Sarp Dosha effects and remedies for 22/03/1985 at 14:30 in Mumbai"

**Output Format:**
Comprehensive Kaal Sarp Dosha report with type analysis, strength assessment, effects, remedies, exceptions, and predictions
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

module.exports = KaalSarpDoshaService;
