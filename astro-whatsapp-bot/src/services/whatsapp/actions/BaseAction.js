const logger = require('../../../../src/utils/logger');
const translationService = require('../../../../src/services/i18n/TranslationService');
const paymentService = require('../../../../src/services/payment/paymentService');

/**
 * Base class for all menu actions in the astrology bot.
 * Provides common functionality for validation, user language detection,
 * and response formatting.
 */
class BaseAction {
  /**
   * @param {Object} user - User object
   * @param {string} phoneNumber - User's phone number
   * @param {Object} data - Additional action data
   */
  constructor(user, phoneNumber, data = {}) {
    this.user = user;
    this.phoneNumber = phoneNumber;
    this.data = data;
    this.logger = logger;
  }

  /**
   * Get user's preferred language
   * @returns {string} Language code
   */
  getUserLanguage() {
    if (this.user && this.user.preferredLanguage) {
      return this.user.preferredLanguage;
    }
    return translationService.detectLanguage(this.phoneNumber);
  }

  /**
   * Validate user profile for service requirements
   * @param {string} serviceName - Name of the service requiring validation
   * @returns {boolean} True if profile is complete, false if incomplete
   */
  async validateUserProfile(serviceName) {
    const { validateUserProfile } = require('../utils/ValidationService');
    return await validateUserProfile(this.user, this.phoneNumber, serviceName);
  }

  /**
   * Get translated button title
   * @param {string} key - Translation key
   * @param {string} fallback - Fallback text
   * @returns {string} Translated button title
   */
  getButtonTitle(key, fallback = '') {
    const { getButtonTitle } = require('../utils/ResponseBuilder');
    return getButtonTitle(key, this.getUserLanguage(), fallback);
  }

  /**
   * Send a message to the user
   * @param {string|Object} content - Message content
   * @param {string} type - Message type ('text'|'interactive')
   * @param {Object} options - Additional options
   * @param {string} language - Language code (optional)
   */
  async sendMessage(content, type = 'text', options = {}, language = null) {
    const { sendMessage } = require('../messageSender');
    await sendMessage(
      this.phoneNumber,
      content,
      type,
      options,
      language || this.getUserLanguage()
    );
  }

  /**
   * Check subscription status and limits
   * @param {string} feature - Feature to check
   * @returns {Object} Subscription benefits
   */
  checkSubscription(feature) {
    return paymentService.getSubscriptionBenefits(this.user);
  }

  /**
   * Execute the action
   * Must be implemented by subclasses
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    throw new Error('execute() method must be implemented by subclass');
  }

  /**
   * Get action name for logging
   * @returns {string}
   */
  getActionName() {
    return this.constructor.name;
  }

  /**
   * Log action execution
   * @param {Object} result - Execution result
   */
  logExecution(result) {
    logger.info(`🔧 Executed ${this.getActionName()} for ${this.phoneNumber}:`,
      result ? 'success' : 'no response');
  }
}

module.exports = BaseAction;
