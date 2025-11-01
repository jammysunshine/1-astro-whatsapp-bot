const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

/**
 * SadeSatiService - Specialized service for analyzing Sade Sati periods
 *
 * Provides comprehensive analysis of Sade Sati, Saturn's 7.5-year transit cycle through
 * the 12 houses from the Moon's position. The service analyzes current and upcoming
 * Sade Sati phases, effects, remedies, and personalized predictions based on lunar sign.
 */
class SadeSatiService extends ServiceTemplate {
  constructor(services) {
    super('SadeSatiCalculator');
    this.calculatorPath = '../calculators/SadeSatiCalculator';
    // Initialize calculator with services if provided
    if (services) {
      this.calculator.setServices(services);
    }

    this.serviceName = 'SadeSatiService';
    logger.info('SadeSatiService initialized');
  }

  async lsadeSatiCalculation(birthData) {
    try {
      // Validate input
      this._validateInput(birthData);

      // Generate Sade Sati analysis
      const sadeSatiAnalysis =
        await this.calculator.generateSadeSatiAnalysis(birthData);

      // Add service metadata
      sadeSatiAnalysis.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Sade Sati Analysis',
        timestamp: new Date().toISOString(),
        tradition: 'Vedic Hindu Astrology',
        methodology: 'Saturn\'s 7.5-year transit cycle analysis'
      };

      return sadeSatiAnalysis;
    } catch (error) {
      logger.error('SadeSatiService calculation error:', error);
      throw new Error(`Sade Sati analysis failed: ${error.message}`);
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
        message: 'Sade Sati analysis failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: result.summary || 'Sade Sati analysis completed',
      metadata: {
        system: 'Sade Sati Analysis',
        calculationMethod:
          'Saturn\'s 7.5-year transit cycle with Moon-based house positioning',
        elements: [
          'Current Status',
          'Upcoming Periods',
          'Past Analysis',
          'Relief Periods',
          'Predictions',
          'Remedies'
        ],
        tradition: 'Vedic Hindu astrology with Sade Sati principles'
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
      throw new Error('Birth data is required for Sade Sati analysis');
    }

    if (!birthData.birthDate) {
      throw new Error('Birth date is required for Sade Sati analysis');
    }

    if (!birthData.birthTime) {
      throw new Error('Birth time is required for Sade Sati analysis');
    }

    if (!birthData.birthPlace) {
      throw new Error('Birth place is required for Sade Sati analysis');
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
      methods: ['execute', 'lsadeSatiCalculation', 'formatResult'],
      dependencies: ['SadeSatiCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🪐 **Sade Sati Service**

**Purpose:** Provides comprehensive analysis of Sade Sati, Saturn's 7.5-year transit cycle through the 12 houses from the Moon's position in Vedic astrology

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, state/country)

**Analysis Includes:**

**🪐 Sade Sati Phases:**
• Rising Phase (2.5 years) - Before Saturn conjuncts Moon
• Peak Phase (2.5 years) - Saturn conjuncts Moon
• Descending Phase (2.5 years) - After Saturn leaves Moon's sign

**📊 Current Status:**
• Whether currently in Sade Sati
• Current phase and progression
• Remaining duration and days left
• Phase-specific effects and intensity
• Progress percentage through current phase

**🔮 Upcoming Periods:**
• Next 3-5 Sade Sati periods with dates
• Duration of each period
• Specific effects for each phase
• Intensity levels
• Preparation recommendations

**📜 Past Analysis:**
• Previous Sade Sati periods experienced
• Lessons learned from past periods
• Lingering effects from completed periods
• Cumulative impact assessment
• Growth through challenges

**🧘 Relief Periods:**
• Periods without Sade Sati influence
• Duration of relief phases
• Characteristics and opportunities
• Building strength during relief periods
• Preparing for upcoming challenges

**🌙 Lunar Sign Predictions:**
• Moon sign-specific challenges
• Most challenging Sade Sati phases
• Recommended remedies based on Moon sign
• Overall impact assessment
• Personalized guidance

**🛡️ Remedial Measures:**
• Daily practices and mantras
• Weekly rituals and offerings
• Monthly donations and ceremonies
• General remedial approaches
• Emergency measures for difficult times
• Status-specific remedies
• Moon sign-specific remedies

**Example Usage:**
"Sade Sati analysis for birth date 15/06/1990, time 06:45, place New Delhi"
"Check if I am currently in Sade Sati with complete birth details"
"When is my next Sade Sati period and how to prepare?"

**Output Format:**
Comprehensive Sade Sati report with current status, upcoming periods, past analysis, relief periods, predictions, and remedies
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

module.exports = SadeSatiService;
