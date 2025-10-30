const AstrologyAction = require('../base/AstrologyAction');
const vedicCalculator = require('../../../services/astrology/vedic/VedicCalculator');
const { AstrologyFormatterFactory } = require('../factories/AstrologyFormatterFactory');

/**
 * CompatibilityAction - Analyzes synastry between two people for relationship compatibility.
 * Uses AstrologyAction base class for unified validation and response handling.
 * Direct infrastructure usage with no facade patterns.
 */
class CompatibilityAction extends AstrologyAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'start_couple_compatibility_flow';
  }

  /**
   * Execute the compatibility action using clean infrastructure
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logAstrologyExecution('start', 'Initiating compatibility flow');

      // Unified profile validation from base class
      const validation = await this.validateProfileAndLimits('Compatibility Analysis', 'compatibility_couple');
      if (!validation.success) {
        return validation;
      }

      // Send initial compatibility prompt using base class messaging
      const promptContent = this.getCompatibilityPromptMessage();
      await this.sendDirectMessage(promptContent);

      this.logAstrologyExecution('complete', 'Compatibility flow initiated successfully');
      return {
        success: true,
        type: 'compatibility_flow_start',
        initiated: true
      };
    } catch (error) {
      this.logger.error('Error in CompatibilityAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Get compatibility prompt message
   * @returns {string} Formatted prompt message
   */
  getCompatibilityPromptMessage() {
    return '🤝 *Synastry Compatibility Analysis*\n\nTo analyze compatibility between you and another person, I need their birth details:\n\n📅 *Birth Date* (DDMMYY format)\n🕐 *Birth Time* (HHMM 24hr format)\n📍 *Birth Place* (City, Country)\n\n*Examples:*\n150690\n1430\nMumbai, India\n\nSend their birth details to analyze your relationship compatibility!';
  }

  /**
   * Send direct message using base class
   * @param {string} content - Message content
   */
  async sendDirectMessage(content) {
    const { sendMessage } = require('../../messageSender');
    await sendMessage(this.phoneNumber, content, 'text');
  }

  /**
   * Validate partner birth data format
   * @param {Object} partnerData - Partner's birth data
   * @returns {boolean} True if valid
   */
  validatePartnerData(partnerData) {
    return partnerData &&
           partnerData.birthDate &&
           partnerData.birthTime &&
           partnerData.birthPlace;
  }

  /**
   * Calculate compatibility between two charts
   * @param {Object} partnerData - Partner's birth data
   * @returns {Promise<Object>} Compatibility analysis result
   */
  async calculateCompatibility(partnerData) {
    try {
      // Validate user has birth data
      if (!this.user) {
        throw new Error('User data not available for compatibility analysis');
      }
      
      if (!this.user.birthDate || !this.user.birthTime || !this.user.birthPlace) {
        throw new Error('User must complete birth profile with date, time, and place for compatibility analysis');
      }

      if (!this.validatePartnerData(partnerData)) {
        throw new Error('Invalid partner birth data provided');
      }

      const compatibility = await vedicCalculator.checkCompatibility(
        {
          birthDate: this.user.birthDate,
          birthTime: this.user.birthTime,
          birthPlace: this.user.birthPlace
        },
        partnerData
      );

      return compatibility;
    } catch (error) {
      this.logger.error('Error calculating compatibility:', error);
      throw error;
    }
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze relationship compatibility through synastry charts',
      keywords: ['compatibility', 'synastry', 'relationship', 'match', 'partner'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 300000, // 5 minutes between compatibility analyses
      maxUsage: 10 // Per month for free users
    };
  }
}

module.exports = CompatibilityAction;
