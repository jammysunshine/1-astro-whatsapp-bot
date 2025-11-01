const ServiceTemplate = require('../ServiceTemplate');
const logger = require('../../utils/logger');

// Import calculator from legacy structure

/**
 * NadiAstrologyService - Specialized service for traditional Nadi astrology readings
 *
 * Provides traditional Nadi astrology analysis based on birth nakshatra, pada, and nadi system.
 * Nadi astrology is an ancient Tamil astrological system that uses palm leaf manuscripts to
 * provide highly personalized readings and predictions based on birth details.
 */
class NadiAstrologyService extends ServiceTemplate {
  constructor(services) {
    super('nadiAstrologyService');

    this.serviceName = 'NadiAstrologyService';
    logger.info('NadiAstrologyService initialized');
  }

  async lnadiAstrologyCalculation(birthData) {
    try {
      // Validate input
      this._validateInput(birthData);

      // Calculate Nadi reading
      const nadiReading = this.calculator.calculateNadiReading(birthData);

      // Add service metadata
      nadiReading.serviceMetadata = {
        serviceName: this.serviceName,
        calculationType: 'Nadi Astrology Reading',
        timestamp: new Date().toISOString(),
        tradition: 'Ancient Tamil Nadi Astrology',
        methodology: 'Birth nakshatra, pada, and nadi system analysis'
      };

      return nadiReading;
    } catch (error) {
      logger.error('NadiAstrologyService calculation error:', error);
      throw new Error(`Nadi astrology reading failed: ${error.message}`);
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
        message: 'Nadi astrology reading failed'
      };
    }

    return {
      success: true,
      data: result,
      summary: this._generateNadiSummary(result),
      metadata: {
        system: 'Nadi Astrology Reading',
        calculationMethod: 'Traditional Tamil Nadi system with birth nakshatra analysis',
        elements: ['Birth Nakshatra', 'Nadi System', 'Current Dasha', 'Predictions', 'Compatibility'],
        tradition: 'Ancient Tamil Nadi astrology with palm leaf manuscript tradition'
      }
    };
  }

  /**
   * Generate Nadi astrology summary
   * @private
   * @param {Object} result - Nadi reading result
   * @returns {string} Summary text
   */
  _generateNadiSummary(result) {
    let summary = '🍃 *Nadi Astrology Reading*\n\n';

    if (result.birthNakshatra && result.birthNakshatra.name !== 'Unknown') {
      summary += `*Birth Nakshatra:* ${result.birthNakshatra.name}\n`;
      summary += `*Ruling Planet:* ${result.birthNakshatra.rulingPlanet}\n`;
      summary += `*Pada:* ${result.birthNakshatra.pada || 'Unknown'}\n\n`;
    }

    if (result.nadiSystem) {
      summary += `*Nadi System:* ${result.nadiSystem.name}\n`;
      summary += `*Characteristics:* ${result.nadiSystem.characteristics}\n\n`;
    }

    if (result.currentDasha && result.currentDasha.planet !== 'Unknown') {
      summary += `*Current Dasha:* ${result.currentDasha.planet}\n`;
      summary += `*Duration:* ${result.currentDasha.duration} years\n`;
      summary += `*Remaining:* ${result.currentDasha.remaining} years\n\n`;
    }

    summary += '*Predictions:*\n';
    if (result.predictions) {
      if (result.predictions.personality) {
        summary += `• Personality: ${result.predictions.personality.substring(0, 50)}...\n`;
      }
      if (result.predictions.career) {
        summary += `• Career: ${result.predictions.career.substring(0, 50)}...\n`;
      }
      if (result.predictions.relationships) {
        summary += `• Relationships: ${result.predictions.relationships.substring(0, 50)}...\n`;
      }
    }

    return summary;
  }

  /**
   * Validate input parameters
   * @param {Object} input - Input data to validate
   * @private
   */
  _validateInput(birthData) {
    if (!birthData) {
      throw new Error('Birth data is required for Nadi astrology reading');
    }

    if (!birthData.birthDate) {
      throw new Error('Birth date is required for Nadi astrology reading');
    }

    if (!birthData.birthTime) {
      throw new Error('Birth time is required for Nadi astrology reading');
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
      methods: ['execute', 'lnadiAstrologyCalculation', 'formatResult'],
      dependencies: ['NadiCalculator']
    };
  }

  /**
   * Get service-specific help
   * @returns {string} Help information
   */
  getHelp() {
    return `
🍃 **Nadi Astrology Service**

**Purpose:** Provides traditional Nadi astrology reading based on ancient Tamil palm leaf manuscripts and birth nakshatra analysis

**Required Inputs:**
• Birth date (DD/MM/YYYY)
• Birth time (HH:MM)
• Birth place (city, state/country)

**Analysis Includes:**

**🍃 Birth Nakshatra Analysis:**
• Nakshatra (birth star) determination
• Ruling planet and deity association
• Pada (quarter) calculation
• Nakshatra characteristics and nature
• Birth nakshatra significance

**🌀 Nadi System Determination:**
• Adi Nadi (beginning)
• Madhya Nadi (middle)
• Antya Nadi (end)
• Nadi system characteristics
• Life purpose and destiny path
• Spiritual development focus

**⏱️ Current Dasha Analysis:**
• Current planetary period (dasha)
• Duration and remaining time
• Dasha characteristics and influence
• Career and life phase guidance
• Opportunities and challenges

**🔮 Detailed Predictions:**
• Personality traits and tendencies
• Career path and professional guidance
• Relationship patterns and compatibility
• Health focus areas and wellness
• Financial prospects and management
• Spiritual growth and development

**🤝 Compatibility Analysis:**
• Compatible nakshatras and signs
• Best match characteristics
• Relationship advice and guidance
• Partnership harmony factors
• Marital prospects and timing

**Example Usage:**
"Nadi astrology reading for birth date 15/06/1990, time 06:45, place New Delhi"
"Traditional Nadi reading with complete birth details"
"Analyze Nadi system for 22/03/1985 at 14:30 in Chennai"

**Output Format:**
Comprehensive Nadi astrology reading with birth nakshatra, nadi system, current dasha, predictions, and compatibility analysis
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

module.exports = NadiAstrologyService;
