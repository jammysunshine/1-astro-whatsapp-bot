const logger = require('../../../utils/logger');

/**
 * EnhancedNadiReader - Orchestrator for Nadi Astrology
 * Migrated from NadiReader.js: coordinates between NadiCompatibility and other modules
 * Adds user-ready response formatting, maintains orchestration pattern
 */
class EnhancedNadiReader {
  constructor() {
    this.logger = logger;
  }

  /**
   * Orchestrate complete Nadi astrology analysis
   * Migrated from NadiReader.js - maintains orchestration pattern
   * @param {string} birthDate
   * @param {string} birthTime
   * @param {string} birthPlace
   * @returns {Object} Complete coordinated analysis
   */
  calculateCompleteNadiReading(birthDate, birthTime, birthPlace) {
    try {
      // Import NadiCompatibility dynamically to avoid circular dependencies
      const { NadiCompatibility } = require('./NadiCompatibility');
      const nadiCompatibility = new NadiCompatibility();

      // 1. Use enhanced NadiCompatibility for complete reading
      const reading = nadiCompatibility.calculateCompleteNadiReading({
        birthDate,
        birthTime,
        birthPlace
      });

      // 2. Add additional processing from other modules (simplified for migration)
      reading.enhancedFeatures = this._addEnhancedFeatures(reading);

      return reading;
    } catch (error) {
      this.logger.error('Enhanced Nadi coordination error:', error);
      return { error: 'Coordinator unable to assemble reading' };
    }
  }

  /**
   * Assemble user-ready Nadi astrology response
   * Migrated from NadiReader.js - user-ready response formatting
   * @param {Object} user
   * @returns {Object} Formatted final response
   */
  generateNadiReading(user) {
    try {
      if (!user.birthDate) {
        return this._formatBirthDataRequiredError();
      }

      const reading = this.calculateCompleteNadiReading(
        user.birthDate,
        user.birthTime || '12:00',
        user.birthPlace || 'Unknown'
      );

      return this._formatNadiReadingResponse(user, reading);
    } catch (error) {
      this.logger.error('Enhanced Nadi assembly error:', error);
      return this._formatErrorResponse('Assembly failed');
    }
  }

  /**
   * Generate compatibility analysis between two people
   * @param {Object} person1 - First person data
   * @param {Object} person2 - Second person data
   * @returns {Object} Compatibility analysis
   */
  generateCompatibilityAnalysis(person1, person2) {
    try {
      const { NadiCompatibility } = require('./NadiCompatibility');
      const nadiCompatibility = new NadiCompatibility();

      // Calculate nakshatras for both people
      const nakshatra1 = nadiCompatibility.calculateBirthNakshatra(
        person1.birthDate,
        person1.birthTime
      );
      const nakshatra2 = nadiCompatibility.calculateBirthNakshatra(
        person2.birthDate,
        person2.birthTime
      );

      // Generate compatibility analysis
      const compatibility = nadiCompatibility.analyzeNakshatraCompatibility(
        nakshatra1.name,
        nakshatra2.name
      );

      const dynamics = nadiCompatibility.generateRelationshipDynamics(
        nakshatra1.name,
        nakshatra2.name
      );

      return {
        person1: {
          name: person1.name || 'Person 1',
          nakshatra: nakshatra1,
          birthData: { birthDate: person1.birthDate, birthTime: person1.birthTime }
        },
        person2: {
          name: person2.name || 'Person 2',
          nakshatra: nakshatra2,
          birthData: { birthDate: person2.birthDate, birthTime: person2.birthTime }
        },
        compatibility,
        dynamics,
        summary: this._formatCompatibilitySummary(compatibility, dynamics)
      };
    } catch (error) {
      this.logger.error('Compatibility analysis error:', error);
      return { error: 'Unable to generate compatibility analysis' };
    }
  }

  /**
   * Generate compatibility analysis from user messages
   * @param {string} partnerNakshatra - Partner's nakshatra
   * @param {Object} user - User object
   * @returns {Object} Compatibility response
   */
  generateCompatibilityForUser(partnerNakshatra, user) {
    try {
      if (!user.birthDate) {
        return '👤 I need your birth details for compatibility analysis.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)';
      }

      const { NadiCompatibility } = require('./NadiCompatibility');
      const nadiCompatibility = new NadiCompatibility();

      // Calculate user's nakshatra
      const userNakshatra = nadiCompatibility.calculateBirthNakshatra(
        user.birthDate,
        user.birthTime
      );

      // Generate compatibility
      const compatibility = nadiCompatibility.analyzeNakshatraCompatibility(
        userNakshatra.name,
        partnerNakshatra
      );

      return this._formatCompatibilityResponse(
        userNakshatra.name,
        partnerNakshatra,
        compatibility
      );
    } catch (error) {
      this.logger.error('User compatibility error:', error);
      return '❌ Error generating compatibility analysis.';
    }
  }

  // ================= PRIVATE FORMATTING METHODS =================

  /**
   * Format birth data required error message
   * @returns {string} Formatted error message
   */
  _formatBirthDataRequiredError() {
    return '⭐ *Nadi Astrology Analysis*\n\n👤 I need your birth details for complete Nadi reading.\n\nSend format: DDMMYY or DDMMYYYY\nExample: 150691 (June 15, 1991)\n\nNadi astrology includes birth nakshatra, dasha periods, and life predictions based on ancient Vedic wisdom.';
  }

  /**
   * Format error response
   * @param {string} errorMsg - Error message
   * @returns {string} Formatted error response
   */
  _formatErrorResponse(errorMsg) {
    return `❌ *Nadi Reading Error*\n\n${errorMsg}\n\nPlease try again or contact support if the problem persists.`;
  }

  /**
   * Format complete Nadi reading response
   * @param {Object} user - User object
   * @param {Object} reading - Reading data
   * @returns {string} Formatted response
   */
  _formatNadiReadingResponse(user, reading) {
    if (reading.error) {
      return this._formatErrorResponse(reading.error);
    }

    let response = '⭐ *Complete Nadi Astrology Reading*\n\n';

    // Birth information
    if (reading.birthNakshatra) {
      response += `🪐 *Birth Nakshatra:* ${reading.birthNakshatra.name}\n`;
      response += `🌟 *Quality:* ${reading.birthNakshatra.characteristics}\n`;
      response += `🙏 *Deity:* ${reading.birthNakshatra.deity}\n`;
      response += `⚡ *Ruling Planet:* ${reading.birthNakshatra.rulingPlanet}\n\n`;
    }

    // Nadi system
    if (reading.nadiSystem) {
      response += `🕉️ *Nadi System:* ${reading.nadiSystem.name}\n`;
      response += `🏆 *Characteristics:* ${reading.nadiSystem.characteristics}\n`;
      response += `🎯 *Life Purpose:* ${reading.nadiSystem.lifePurpose}\n\n`;
    }

    // Current dasha
    if (reading.currentDasha && !reading.currentDasha.error) {
      response += `⏰ *Current Dasha:* ${reading.currentDasha.planet}\n`;
      response += `⏳ *Remaining:* ${reading.currentDasha.remaining} years\n`;
      response += `💫 *Influence:* ${reading.currentDasha.influence}\n\n`;
    }

    // Predictions
    if (reading.predictions) {
      response += `🔮 *Life Insights:*\n\n`;

      Object.entries(reading.predictions).forEach(([category, prediction]) => {
        const categoryIcon = {
          personality: '👤',
          career: '💼',
          relationships: '❤️',
          health: '🏥',
          finance: '💰',
          spiritual: '🧘'
        }[category] || '📝';

        response += `${categoryIcon} *${category.charAt(0).toUpperCase() + category.slice(1)}:* ${prediction}\n\n`;
      });
    }

    // Compatibility information
    if (reading.compatibility) {
      const compat = reading.compatibility;
      response += `💑 *Relationship Compatibility:*\n`;
      response += ` (${compat.compatibleSigns?.length || 0} compatible signs)\n`;
    }

    // Enhanced features
    if (reading.enhancedFeatures) {
      response += `${reading.enhancedFeatures}`;
    }

    response += `\n🕉️ *Ancient Vedic wisdom through Nadi astrology reveals your life's cosmic blueprint.*`;

    return response;
  }

  /**
   * Format compatibility response
   * @param {string} userNakshatra - User's nakshatra
   * @param {string} partnerNakshatra - Partner's nakshatra
   * @param {Object} compatibility - Compatibility data
   * @returns {string} Formatted compatibility response
   */
  _formatCompatibilityResponse(userNakshatra, partnerNakshatra, compatibility) {
    let response = '💑 *Nadi Compatibility Analysis*\n\n';
    response += `You (${userNakshatra}) + Partner (${partnerNakshatra})\n\n`;

    response += `🎯 *Compatibility:* ${compatibility.compatibility}\n`;
    response += `📝 *Summary:* ${compatibility.message}\n\n`;

    if (compatibility.strengths && compatibility.strengths.length > 0) {
      response += `✅ *Strengths:*\n`;
      compatibility.strengths.forEach(strength => {
        response += `• ${strength}\n`;
      });
      response += '\n';
    }

    if (compatibility.challenges && compatibility.challenges.length > 0) {
      response += `⚠️ *Challenges to Address:*\n`;
      compatibility.challenges.forEach(challenge => {
        response += `• ${challenge}\n`;
      });
      response += '\n';
    }

    response += `🕉️ *Nadi compatibility reflects energetic harmony between birth nakshatras.*`;

    return response;
  }

  /**
   * Format compatibility summary
   * @param {Object} compatibility - Compatibility data
   * @param {Object} dynamics - Dynamics data
   * @returns {string} Formatted summary
   */
  _formatCompatibilitySummary(compatibility, dynamics) {
    let summary = '';

    if (compatibility.compatible) {
      summary += `✓ Strong compatibility foundation with ${compatibility.compatibility} match. `;
    } else {
      summary += `⚠️ Requires careful consideration and remedial measures. `;
    }

    if (dynamics.communication) {
      summary += `Communication: ${dynamics.communication.toLowerCase()}.`;
    }

    return summary;
  }

  /**
   * Add enhanced features to reading
   * @param {Object} reading - Base reading
   * @returns {string} Enhanced features text
   */
  _addEnhancedFeatures(reading) {
    let features = '\n\n🆕 *Enhanced Analysis Features:*\n';

    // Add timing insights
    if (reading.currentDasha) {
      features += `• Current planetary cycle insights\n`;
    }

    // Add predictive elements
    if (reading.predictions) {
      features += `• Detailed life area predictions\n`;
    }

    // Add compatibility insights
    if (reading.compatibility) {
      features += `• Relationship compatibility patterns\n`;
    }

    return features + '\n';
  }

  /**
   * Health check for EnhancedNadiReader
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      healthy: true,
      version: '1.0.0',
      name: 'EnhancedNadiReader',
      functionalities: [
        'Complete Nadi Reading Coordination',
        'Compatibility Analysis Orchestration',
        'User-Ready Response Formatting',
        'Multi-Module Integration'
      ],
      status: 'Operational - Enhanced Orchestrator'
    };
  }
}

// Export class for better compatibility
module.exports = { EnhancedNadiReader };

// Also export singleton instance for legacy usage
const enhancedNadiReader = new EnhancedNadiReader();
module.exports.generateNadiReading = user =>
  enhancedNadiReader.generateNadiReading(user);
module.exports.generateCompatibilityForUser = (partnerNakshatra, user) =>
  enhancedNadiReader.generateCompatibilityForUser(partnerNakshatra, user);