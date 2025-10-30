const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../../services/astrology/vedic/VedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * CompatibilityAction - Analyzes synastry between two people for relationship compatibility.
 * Provides insights into romantic, business, or friendship compatibility.
 */
class CompatibilityAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'initiate_compatibility_flow';
  }

  /**
   * Execute the compatibility action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Initiating compatibility flow');

      // Validate user profile
      if (!(await this.validateUserProfile('Compatibility Analysis'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Check subscription limits for compatibility analysis
      const limitsCheck = this.checkSubscriptionLimits('compatibility');
      if (!limitsCheck.isAllowed && this.user.compatibilityChecks >= limitsCheck.remaining) {
        await this.sendUpgradeMessage(limitsCheck);
        return { success: false, reason: 'subscription_limit_reached' };
      }

      // Send initial compatibility prompt
      await this.sendCompatibilityPrompt();

      this.logExecution('complete', 'Compatibility flow initiated');
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
   * Send initial compatibility analysis prompt
   */
  async sendCompatibilityPrompt() {
    const userLanguage = this.getUserLanguage();
    const promptMessage = translationService.translate('messages.compatibility.prompt', userLanguage) ||
      '🤝 *Synastry Compatibility Analysis*\n\nTo analyze compatibility between you and another person, I need their birth details:\n\n📅 *Birth Date* (DDMMYY format)\n🕐 *Birth Time* (HHMM 24hr format)\n📍 *Birth Place* (City, Country)\n\n*Examples:*\n150690\n1430\nMumbai, India\n\nSend their birth details to analyze your relationship compatibility!';

    await sendMessage(this.phoneNumber, promptMessage, 'text');
  }

  /**
   * Calculate compatibility between two charts
   * @param {Object} partnerData - Partner's birth data
   * @returns {Promise<Object>} Compatibility analysis result
   */
  async calculateCompatibility(partnerData) {
    try {
      // Validate partner data
      if (!this.validatePartnerData(partnerData)) {
        throw new Error('Invalid partner birth data provided');
      }

      const compatibility = await vedicCalculator.checkCompatibility(
        // User's data
        {
          birthDate: this.user.birthDate,
          birthTime: this.user.birthTime,
          birthPlace: this.user.birthPlace
        },
        // Partner's data
        partnerData
      );

      return compatibility;
    } catch (error) {
      this.logger.error('Error calculating compatibility:', error);
      throw error;
    }
  }

  /**
   * Send formatted compatibility analysis
   * @param {Object} compatibilityResult - Analysis result
   * @param {Object} partnerInfo - Partner information
   */
  async sendCompatibilityResult(compatibilityResult, partnerInfo) {
    try {
      const formattedAnalysis = this.formatCompatibilityAnalysis(compatibilityResult, partnerInfo);
      const userLanguage = this.getUserLanguage();

      // Create interactive continuation buttons
      const buttons = [
        {
          id: 'get_more_compatibility_details',
          titleKey: 'buttons.more_details',
          title: '📊 More Details'
        },
        {
          id: 'get_relationship_advice',
          titleKey: 'buttons.advice',
          title: '💡 Advice'
        },
        {
          id: 'show_main_menu',
          titleKey: 'buttons.main_menu',
          title: '🏠 Main Menu'
        }
      ];

      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        formattedAnalysis,
        buttons,
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );

      // Update compatibility counter
      await this.incrementCompatibilityCount();
    } catch (error) {
      this.logger.error('Error sending compatibility result:', error);
      await this.handleExecutionError(error);
    }
  }

  /**
   * Format compatibility analysis into readable text
   * @param {Object} compatibility - Raw compatibility data
   * @param {Object} partnerInfo - Partner information
   * @returns {string} Formatted analysis
   */
  formatCompatibilityAnalysis(compatibility, partnerInfo) {
    let analysis = `💕 *Synastry Analysis: ${this.user.name} & ${partnerInfo.name || 'Partner'}*\n\n`;

    // Overall compatibility score
    const score = compatibility.overallScore || compatibility.compatibility || 'Unknown';
    analysis += `🎯 *Overall Compatibility:* ${score}\n\n`;

    // Key aspects
    if (compatibility.keyAspects && compatibility.keyAspects.length > 0) {
      analysis += '*Key Aspects:*\n';
      compatibility.keyAspects.slice(0, 5).forEach(aspect => {
        analysis += `• ${aspect.description}\n`;
      });
      analysis += '\n';
    }

    // Strengths
    if (compatibility.strengths && compatibility.strengths.length > 0) {
      analysis += '*💪 Strengths:*\n';
      compatibility.strengths.slice(0, 3).forEach(strength => {
        analysis += `• ${strength}\n`;
      });
      analysis += '\n';
    }

    // Challenges
    if (compatibility.challenges && compatibility.challenges.length > 0) {
      analysis += '*⚠️ Areas for Growth:*\n';
      compatibility.challenges.slice(0, 2).forEach(challenge => {
        analysis += `• ${challenge}\n`;
      });
      analysis += '\n';
    }

    // Advice
    if (compatibility.advice) {
      analysis += `*💫 Relationship Wisdom:*\n${compatibility.advice}\n\n`;
    }

    analysis += '*Synastry reveals the cosmic dance between souls. Remember, all relationships bring opportunities for growth and learning.*';

    return analysis;
  }

  /**
   * Send message for incomplete profile
   */
  async sendIncompleteProfileMessage() {
    const message = '👤 *Profile Required for Compatibility*\n\nTo use compatibility analysis, you need a complete birth profile.\n\n📝 Use "Settings" from the main menu to update your profile, or send your birth details in this format:\n\nBirth Date (DDMMYY): 150690\nBirth Time (HHMM): 1430\nBirth Place: Mumbai, India';

    await sendMessage(this.phoneNumber, message, 'text');
  }

  /**
   * Send subscription upgrade message
   * @param {Object} limitsCheck - Subscription limits info
   */
  async sendUpgradeMessage(limitsCheck) {
    const upgradeMessage = `⭐ *Premium Compatibility Analysis*\n\nYou've used ${limitsCheck.used || 0} of your monthly ${limitsCheck.plan} limit.\n\nUpgrade to Premium for unlimited synastry analysis and detailed relationship insights!`;
    await sendMessage(this.phoneNumber, upgradeMessage, 'text');
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
   * Increment the compatibility check counter for user
   */
  async incrementCompatibilityCount() {
    try {
      // This would update the user's compatibilityChecks counter
      // Implementation depends on user model structure
      this.logger.info(`Compatibility check recorded for user ${this.phoneNumber}`);
    } catch (error) {
      this.logger.error('Error updating compatibility counter:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error processing your compatibility analysis. Please try again or contact support if the problem persists.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
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
