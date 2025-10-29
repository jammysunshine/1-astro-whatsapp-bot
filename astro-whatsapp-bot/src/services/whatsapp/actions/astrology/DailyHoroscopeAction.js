const BaseAction = require('../BaseAction');
const generateAstrologyResponse = require('../../../../services/astrology/astrologyEngine');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * DailyHoroscopeAction - Generates and sends daily horoscope readings.
 * Demonstrates the atomic action pattern in the new architecture.
 */
class DailyHoroscopeAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'get_daily_horoscope';
  }

  /**
   * Execute the daily horoscope action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Generating daily horoscope');

      // Validate user profile
      if (!(await this.validateUserProfile('Daily Horoscope'))) {
        this.sendIncompleteProfileNotification();
        return { success: false, reason: 'incomplete_profile' };
      }

      // Check subscription limits
      const limitsCheck = this.checkSubscriptionLimits('horoscope_daily');
      if (!limitsCheck.isAllowed) {
        await this.sendUpgradePrompt(limitsCheck);
        return { success: false, reason: 'subscription_limit' };
      }

      // Generate horoscope using AI/astrology engine
      const horoscopeResponse = await this.generateHoroscope();

      // Send the horoscope response
      await this.sendHoroscopeResponse(horoscopeResponse);

      this.logExecution('complete', 'Daily horoscope sent successfully');
      return {
        success: true,
        type: 'horoscope',
        responseLength: horoscopeResponse.length
      };
    } catch (error) {
      this.logger.error('Error in DailyHoroscopeAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Generate personalized horoscope content
   * @returns {Promise<string>} Horoscope text
   */
  async generateHoroscope() {
    try {
      // Use the astrology engine to generate personalized daily horoscope
      const rawResponse = await generateAstrologyResponse('daily horoscope', this.user);

      if (typeof rawResponse === 'string' && rawResponse.length > 0) {
        return this.formatHoroscopeResponse(rawResponse);
      }

      // Fallback if astrology engine fails
      return this.generateFallbackHoroscope();
    } catch (error) {
      this.logger.warn('Astrology engine failed, using fallback:', error.message);
      return this.generateFallbackHoroscope();
    }
  }

  /**
   * Format the horoscope response with proper structure and emojis
   * @param {string} rawResponse - Raw astrology response
   * @returns {string} Formatted response
   */
  formatHoroscopeResponse(rawResponse) {
    const userLanguage = this.getUserLanguage();

    // Add astrology-themed formatting
    let formattedResponse = `☀️ *Daily Horoscope for ${this.user.name || 'You'}*\n`;
    formattedResponse += `📅 ${new Date().toLocaleDateString(userLanguage, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n\n`;

    // Process and enhance the raw response
    formattedResponse += this.enhanceHoroscopeText(rawResponse);

    // Add daily guidance section
    formattedResponse += '\n\n🌟 *Daily Guidance:*\n';
    formattedResponse += this.generateDailyGuidance();

    return formattedResponse;
  }

  /**
   * Enhance horoscope text with better formatting
   * @param {string} text - Raw horoscope text
   * @returns {string} Enhanced text
   */
  enhanceHoroscopeText(text) {
    // Add relevant emojis based on content
    let enhanced = text;

    // Common enhancements
    enhanced = enhanced.replace(/\b(lucky|fortunate|blessed)\b/gi, '🍀 $&');
    enhanced = enhanced.replace(/\b(challenges?|difficulties?)\b/gi, '⚠️ $&');
    enhanced = enhanced.replace(/\b(love|romance|relationship)\b/gi, '💕 $&');
    enhanced = enhanced.replace(/\b(career|work|job)\b/gi, '💼 $&');
    enhanced = enhanced.replace(/\b(money|wealth|finance)\b/gi, '💰 $&');
    enhanced = enhanced.replace(/\b(health|wellness)\b/gi, '🏥 $&');

    return enhanced;
  }

  /**
   * Generate daily guidance section
   * @returns {string} Daily guidance text
   */
  generateDailyGuidance() {
    const guidance = [
      'Trust your intuition today',
      'Stay open to unexpected opportunities',
      'Focus on what brings you joy',
      'Be patient with yourself and others',
      'Take time for self-reflection',
      'Express gratitude for what you have',
      'Embrace change as growth'
    ];

    const randomGuidance = guidance[Math.floor(Math.random() * guidance.length)];
    return `• ${randomGuidance}\n• Find balance between action and rest\n• Remember: every day brings new possibilities`;
  }

  /**
   * Generate fallback horoscope when main engine fails
   * @returns {string} Fallback horoscope text
   */
  generateFallbackHoroscope() {
    const userLanguage = this.getUserLanguage();
    const fallbackMessage = translationService.translate(
      'messages.horoscope.fallback',
      userLanguage
    ) || 'Today brings opportunities for growth and new experiences. Trust your instincts and stay open to the possibilities around you.';

    return `☀️ *Daily Horoscope*\n\n${fallbackMessage}\n\n🌟 *Daily Wisdom:* "The stars align for those willing to embrace change."`;
  }

  /**
   * Send the horoscope response to the user
   * @param {string} horoscopeText - Formatted horoscope text
   */
  async sendHoroscopeResponse(horoscopeText) {
    try {
      const userLanguage = this.getUserLanguage();

      // Build interactive message with navigation buttons
      const message = ResponseBuilder.buildInteractiveButtonMessage(
        this.phoneNumber,
        horoscopeText,
        this.getHoroscopeActionButtons(),
        userLanguage
      );

      await sendMessage(
        message.to,
        message.interactive,
        'interactive'
      );
    } catch (error) {
      this.logger.error('Error sending horoscope response:', error);
      // Fallback to simple text message
      await sendMessage(this.phoneNumber, horoscopeText, 'text');
    }
  }

  /**
   * Get action buttons for horoscope response
   * @returns {Array} Button configuration array
   */
  getHoroscopeActionButtons() {
    return [
      {
        id: 'horoscope_again',
        titleKey: 'buttons.another_horoscope',
        title: '🔄 Another Reading'
      },
      {
        id: 'get_current_transits',
        titleKey: 'buttons.current_transits',
        title: '🌌 Transits'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];
  }

  /**
   * Send notification for incomplete profile
   */
  async sendIncompleteProfileNotification() {
    const profilePrompt = '👤 *Complete Your Profile First*\n\nTo receive personalized daily horoscopes, please complete your birth profile with date, time, and place.';
    await sendMessage(this.phoneNumber, profilePrompt, 'text');
  }

  /**
   * Send subscription upgrade prompt
   * @param {Object} limitsCheck - Subscription limits check result
   */
  async sendUpgradePrompt(limitsCheck) {
    const userLanguage = this.getUserLanguage();
    const upgradeMessage = translationService.translate(
      'messages.subscription.upgrade_prompt',
      userLanguage,
      {
        feature: 'Daily Horoscopes',
        current: limitsCheck.plan
      }
    ) || `You've reached your daily horoscope limit for the ${limitsCheck.plan} plan.\n\nUpgrade to Premium for unlimited astrological insights!`;

    await sendMessage(this.phoneNumber, upgradeMessage, 'text');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = 'Sorry, I encountered an issue generating your daily horoscope. Please try again in a moment.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Generate and send daily horoscope readings',
      keywords: ['horoscope', 'daily', 'stars', 'prediction'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 300000 // 5 minutes between requests
    };
  }
}

module.exports = DailyHoroscopeAction;
