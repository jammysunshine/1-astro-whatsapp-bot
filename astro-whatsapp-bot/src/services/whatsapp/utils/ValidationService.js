const logger = require('../../../utils/logger');
const { sendMessage } = require('../messageSender');
const translationService = require('../../i18n/TranslationService');

/**
 * Centralized validation utilities for the WhatsApp astrology bot.
 * Handles user profile validation, message validation, and other common validation logic.
 */
class ValidationService {
  /**
   * Validate user profile for service requirements
   * @param {Object} user - User object
   * @param {string} phoneNumber - User's phone number
   * @param {string} serviceName - Name of the service requiring validation
   * @returns {Promise<boolean>} True if profile is complete, false if incomplete
   */
  static async validateUserProfile(user, phoneNumber, serviceName) {
    if (!user || !user.birthDate || !user.birthTime || !user.birthPlace) {
      const profilePrompt = `👤 *Profile Required*\n\nTo provide accurate ${serviceName}, I need your birth details:\n\n📅 *Birth Date* (DDMMYY or DDMMYYYY format)\n🕐 *Birth Time* (HHMM format - 24hr)\n📍 *Birth Place* (City, Country)\n\n*Example:*\n150690, 1430, Mumbai, India\n\nSend your birth details in this format, or use the Settings menu to update your profile permanently.`;

      await sendMessage(phoneNumber, profilePrompt, 'text');
      return false;
    }
    return true;
  }

  /**
   * Validate WhatsApp message structure
   * @param {Object} message - WhatsApp message object
   * @param {string} phoneNumber - Sender's phone number
   * @returns {boolean} True if message is valid
   */
  static validateMessage(message, phoneNumber) {
    if (!message || !phoneNumber) {
      logger.warn('⚠️ Invalid message structure received');
      return false;
    }

    if (
      ![
        'text',
        'interactive',
        'button',
        'image',
        'video',
        'audio',
        'document'
      ].includes(message.type)
    ) {
      logger.warn(`⚠️ Unsupported message type: ${message.type}`);
      return false;
    }

    return true;
  }

  /**
   * Validate birth data format
   * @param {string} birthDate - Birth date string
   * @param {string} birthTime - Birth time string
   * @param {string} birthPlace - Birth place string
   * @returns {Object} Validation result with isValid boolean and error message
   */
  static validateBirthData(birthDate, birthTime, birthPlace) {
    const result = { isValid: true, errors: [] };

    // Validate birth date (DDMMYY or DDMMYYYY format)
    if (!birthDate || !/^\d{6,8}$/.test(birthDate.replace(/\D/g, ''))) {
      result.isValid = false;
      result.errors.push('Invalid birth date format. Use DDMMYY or DDMMYYYY.');
    }

    // Validate birth time (HHMM format)
    if (birthTime && !/^\d{4}$/.test(birthTime.replace(/\D/g, ''))) {
      result.isValid = false;
      result.errors.push(
        'Invalid birth time format. Use HHMM (24-hour format).'
      );
    }

    // Validate birth place
    if (!birthPlace || birthPlace.trim().length < 3) {
      result.isValid = false;
      result.errors.push(
        'Birth place is required and should be at least 3 characters.'
      );
    }

    result.errorMessage = result.errors.join(' ');
    return result;
  }

  /**
   * Validate subscription limits
   * @param {Object} user - User object
   * @param {string} feature - Feature to check limits for
   * @returns {Object} Limit validation result
   */
  static validateSubscriptionLimits(user, feature) {
    const paymentService = require('../../../payment/paymentService');
    const benefits = paymentService.getSubscriptionBenefits(user);

    return {
      isAllowed: benefits.isAllowed,
      remaining: benefits.remaining,
      plan: benefits.plan,
      upgradeRequired: !benefits.isAllowed
    };
  }

  /**
   * Detect and validate user language preference
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number for detection fallback
   * @returns {string} Validated language code
   */
  static getValidatedLanguage(user, phoneNumber) {
    const supportedLanguages = [
      'en',
      'hi',
      'ar',
      'es',
      'fr',
      'ta',
      'te',
      'bn',
      'mr',
      'gu',
      'de',
      'it',
      'pt',
      'ru',
      'zh'
    ];

    if (
      user &&
      user.preferredLanguage &&
      supportedLanguages.includes(user.preferredLanguage)
    ) {
      return user.preferredLanguage;
    }

    const detected = translationService.detectLanguage(phoneNumber);
    return supportedLanguages.includes(detected) ? detected : 'en';
  }

  /**
   * Validate WhatsApp webhook payload
   * @param {Object} payload - Webhook payload
   * @returns {boolean} True if payload is valid
   */
  static validateWebhookPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      logger.warn('⚠️ Invalid webhook payload received');
      return false;
    }

    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      logger.warn('⚠️ Invalid webhook object type');
      return false;
    }

    if (!Array.isArray(payload.entry) || payload.entry.length === 0) {
      logger.warn('⚠️ No entries in webhook payload');
      return false;
    }

    return true;
  }
}

module.exports = { ValidationService };
