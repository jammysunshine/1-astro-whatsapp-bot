const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const { ASTROLOGY_CONFIG } = require('../config/ActionConfig');

/**
 * AstrologyAction - Base class for all astrology-related actions
 * Provides shared validation, error handling, and response formatting
 * for astrology services like birth charts, horoscopes, etc.
 */
class AstrologyAction extends BaseAction {
  /**
   * Unified validation method for astrology services
   * @param {string} displayName - Human-readable service name
   * @param {string} subscriptionType - Subscription feature type
   * @returns {Promise<Object>} Validation result
   */
  async validateProfileAndLimits(displayName, subscriptionType) {
    // Profile validation
    if (!(await this.validateUserProfile(displayName))) {
      await this.sendIncompleteProfileNotification(displayName);
      return { success: false, reason: 'incomplete_profile' };
    }

    // Subscription limits check
    const limitsCheck = this.checkSubscriptionLimits(subscriptionType);
    if (!limitsCheck.isAllowed) {
      await this.sendUpgradePrompt(limitsCheck);
      return { success: false, reason: 'subscription_limit' };
    }

    return { success: true };
  }

  /**
   * Unified astrology response building
   * @param {string} content - Formatted astrology content
   * @param {Array} actionButtons - Action buttons configuration
   */
  async buildAstrologyResponse(content, actionButtons) {
    try {
      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        content,
        actionButtons,
        this.getUserLanguage()
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending astrology response:', error);
      // Fallback to simple text message
      await sendMessage(this.phoneNumber, content, 'text');
    }
  }

  /**
   * Unified incomplete profile notification
   * @param {string} serviceName - Name of the astrology service
   */
  async sendIncompleteProfileNotification(serviceName) {
    const config = ASTROLOGY_CONFIG[this.constructor.actionId];
    const profilePrompt = config?.errorMessages?.incomplete ||
      `👤 *Complete Your Profile First*\n\nTo access ${serviceName}, please complete your birth profile with date, time, and place.\n\nUse the Settings menu to update your information.`;

    await sendMessage(this.phoneNumber, profilePrompt, 'text');
  }

  /**
   * Unified subscription upgrade prompt
   * @param {Object} limitsCheck - Subscription limits check result
   */
  async sendUpgradePrompt(limitsCheck) {
    const config = ASTROLOGY_CONFIG[this.constructor.actionId];
    const upgradeMessage = config?.errorMessages?.limitReached ||
      `⭐ *Premium Astrology Available*\n\nYou've reached your limit for astrology insights in the ${limitsCheck.plan || 'current'} plan.\n\nUpgrade to Premium for unlimited personalized readings!`;

    await sendMessage(this.phoneNumber, upgradeMessage, 'text');
  }

  /**
   * Unified execution error handling
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const config = ASTROLOGY_CONFIG[this.constructor.actionId];
    const errorMessage = `Sorry, I encountered an issue generating your ${config?.displayName || 'astrology reading'}. Please try again in a moment.`;

    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Check subscription limits
   * @param {string} featureType - Type of feature being checked
   * @returns {Object} Limits check result
   */
  checkSubscriptionLimits(featureType) {
    try {
      // Placeholder for actual subscription checking
      // This should be replaced with actual subscription service call
      return {
        isAllowed: true,
        plan: 'free',
        limits: { used: 0, limit: 10 }
      };
    } catch (error) {
      this.logger.warn('Error checking subscription limits:', error);
      return { isAllowed: true }; // Allow by default on error
    }
  }

  /**
   * Get action-specific configuration
   * @returns {Object} Action configuration
   */
  getActionConfig() {
    return ASTROLOGY_CONFIG[this.constructor.actionId] || {};
  }

  /**
   * Enhanced logging for astrology actions
   * @param {string} phase - Execution phase
   * @param {string} message - Log message
   * @param {Object} data - Additional log data
   */
  logAstrologyExecution(phase, message, data = {}) {
    this.logger.info(`🔮 ${this.getActionName()} [${phase}]: ${message}`, {
      userId: this.user?._id,
      phoneNumber: this.phoneNumber,
      ...data
    });
  }

  /**
   * Sanitize name for display (remove harmful characters)
   * @param {string} name - Name to sanitize
   * @returns {string} Sanitized name safe for display
   */
  sanitizeName(name) {
    if (!name) return 'Unknown';
    // Remove potentially harmful characters
    return name.replace(/[<>'"&]/g, '').substring(0, 50);
  }
}

module.exports = AstrologyAction;