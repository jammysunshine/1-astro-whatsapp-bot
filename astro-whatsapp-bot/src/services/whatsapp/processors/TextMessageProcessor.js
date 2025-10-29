const BaseMessageProcessor = require('./BaseMessageProcessor');
const logger = require('../../../../src/utils/logger');
const KeywordMapper = require('../KeywordMapper');
const { ValidationService } = require('../utils/ValidationService');
const generateAstrologyResponse = require('../../../../src/services/astrology/astrologyEngine');
const translationService = require('../../../../src/services/i18n/TranslationService');
const paymentService = require('../../../../src/services/payment/paymentService');
const { getFlow } = require('../../../../src/conversation/flowLoader');
const { processFlowMessage } = require('../../../../src/conversation/conversationEngine');

/**
 * Specialized processor for handling text messages in the astrology bot.
 * Uses intelligent keyword mapping and contextual analysis for routing messages to appropriate actions.
 */
class TextMessageProcessor extends BaseMessageProcessor {
  constructor(actionRegistry = null) {
    super();
    this.actionRegistry = actionRegistry;
    this.keywordMapper = new KeywordMapper();
    this.keywordMapper.initialize();
    this.logger = logger;
  }

  /**
   * Process incoming text message
   * @param {Object} message - WhatsApp message object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Sender's phone number
   * @returns {Promise<void>}
   */
  async process(message, user, phoneNumber) {
    try {
      const { text } = message;
      const messageText = text?.body || '';

      this.logger.info(`📝 Processing text message from ${phoneNumber}: "${messageText}"`);

      // Validate user and message
      if (!ValidationService.validateMessage(message, phoneNumber)) {
        this.logger.warn('⚠️ Invalid message structure');
        return;
      }

      // Retrieve user session information
      const session = await this.getUserSession(phoneNumber);

      // Check if user is in an active conversation flow
      if (this.isUserInFlow(session)) {
        await this.handleFlowMessage(message, user, session);
        return;
      }

      // Process user with complete profile
      if (user.profileComplete) {
        await this.processCompleteUserMessage(messageText, user, phoneNumber);
      } else {
        // Profile incomplete - redirect to onboarding
        await processFlowMessage(message, user, 'onboarding');
      }

    } catch (error) {
      this.logger.error(`❌ Error processing text message from ${phoneNumber}:`, error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process message for user with complete profile
   * @param {string} messageText - Message text
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processCompleteUserMessage(messageText, user, phoneNumber) {
    // Check for numbered menu actions (legacy support)
    const numberedAction = this.getNumberedMenuAction(phoneNumber, messageText);
    if (numberedAction) {
      await this.executeAction(numberedAction, user, phoneNumber);
      return;
    }

    // Check for compatibility requests with birth dates
    const compatibilityMatch = this.matchCompatibilityRequest(messageText);
    if (compatibilityMatch) {
      await this.handleCompatibilityRequest(phoneNumber, user, compatibilityMatch[1]);
      return;
    }

    // Check for subscription requests
    if (this.isSubscriptionRequest(messageText)) {
      await this.handleSubscriptionRequest(phoneNumber, user, messageText);
      return;
    }

    // Check for numerology report request
    if (messageText.toLowerCase() === 'numerology report') {
      await processFlowMessage({ body: 'numerology_flow' }, user, 'numerology_flow');
      return;
    }

    // Try keyword-based action resolution
    const actionId = this.keywordMapper.getActionIdForText(messageText, {
      user,
      language: user.preferredLanguage || 'en'
    });

    if (actionId) {
      await this.executeAction(actionId, user, phoneNumber);
      return;
    }

    // Fallback to general astrology response
    await this.handleFallbackResponse(messageText, user, phoneNumber);
  }

  /**
   * Execute an action using the action registry
   * @param {string} actionId - Action identifier
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async executeAction(actionId, user, phoneNumber) {
    try {
      if (this.actionRegistry) {
        // Use new action registry system
        await this.actionRegistry.executeAction(actionId, user, phoneNumber);
      } else {
        // Fallback to legacy processing (for compatibility during migration)
        await this.executeLegacyAction(actionId, user, phoneNumber);
      }
    } catch (error) {
      this.logger.error(`❌ Error executing action ${actionId}:`, error);
      const userLanguage = user.preferredLanguage || 'en';
      await this.sendErrorResponse(phoneNumber, 'action_execution_error', userLanguage);
    }
  }

  /**
   * Legacy action execution for backwards compatibility
   * @param {string} actionId - Action identifier
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async executeLegacyAction(actionId, user, phoneNumber) {
    // This would implement the old switch-case logic
    // For now, just log that the new registry is preferred
    this.logger.warn(`⚠️ Using legacy action execution for ${actionId} - please migrate to ActionRegistry`);
    await this.sendErrorResponse(phoneNumber, 'action_not_available', user.preferredLanguage || 'en');
  }

  /**
   * Get numbered menu action from legacy system
   * @param {string} phoneNumber - Phone number
   * @param {string} messageText - Message text
   * @returns {string|null} Action identifier or null
   */
  getNumberedMenuAction(phoneNumber, messageText) {
    // This would interface with the legacy numbered menu system
    // For now, return null to use new system
    return null;
  }

  /**
   * Match compatibility request pattern
   * @param {string} messageText - Message text
   * @returns {Array|null} Match array or null
   */
  matchCompatibilityRequest(messageText) {
    return messageText.match(/(\d{2}\/\d{2}\/\d{4})/);
  }

  /**
   * Handle compatibility analysis request
   * @param {string} phoneNumber - Phone number
   * @param {Object} user - User object
   * @param {string} partnerBirthDate - Partner's birth date
   */
  async handleCompatibilityRequest(phoneNumber, user, partnerBirthDate) {
    try {
      if (!user.birthDate) {
        const userLanguage = user.preferredLanguage || 'en';
        await this.sendErrorResponse(phoneNumber, 'incomplete_profile_for_compatibility', userLanguage);
        return;
      }

      // Validate subscription limits
      const canProceed = await this.checkSubscriptionLimits(user, 'compatibility');
      if (!canProceed) {
        await this.sendErrorResponse(phoneNumber, 'compatibility_limit_reached', user.preferredLanguage || 'en');
        return;
      }

      // Start compatibility flow
      const mockMessage = {
        type: 'text',
        text: { body: partnerBirthDate },
        compatibilityMode: true
      };

      await processFlowMessage(mockMessage, user, 'compatibility_flow');
    } catch (error) {
      this.logger.error('Error handling compatibility request:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Check if message is a subscription request
   * @param {string} messageText - Message text
   * @returns {boolean} True if subscription request
   */
  isSubscriptionRequest(messageText) {
    const lowerText = messageText.toLowerCase();
    return lowerText.includes('subscribe') || lowerText.includes('upgrade');
  }

  /**
   * Handle subscription request
   * @param {string} phoneNumber - Phone number
   * @param {Object} user - User object
   * @param {string} messageText - Original message text
   */
  async handleSubscriptionRequest(phoneNumber, user, messageText) {
    let planId = 'essential'; // default

    if (messageText.toLowerCase().includes('premium')) {
      planId = 'premium';
    }

    // Start subscription flow instead of direct processing
    const mockMessage = { body: `subscribe_${planId}` };
    await processFlowMessage(mockMessage, user, 'subscription_flow');
  }

  /**
   * Handle fallback response when no specific action matches
   * @param {string} messageText - Original message text
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async handleFallbackResponse(messageText, user, phoneNumber) {
    try {
      const response = await generateAstrologyResponse(messageText, user);
      const userLanguage = user.preferredLanguage || 'en';

      if (response && typeof response === 'string') {
        // Send response with menu
        const { sendMessage } = require('../messageSender');
        await this.sendTextWithMenu(phoneNumber, response, userLanguage);
      } else {
        await this.sendTextWithMenu(phoneNumber,
          translationService.translate('messages.fallback.unknown_request', userLanguage) ||
          'I\'m not sure how to help with that. Please try our main menu for available services.',
          userLanguage
        );
      }
    } catch (error) {
      this.logger.error('Error generating fallback response:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Send text message with interactive menu
   * @param {string} phoneNumber - Phone number
   * @param {string} text - Message text
   * @param {string} language - Language code
   */
  async sendTextWithMenu(phoneNumber, text, language) {
    const { sendMessage } = require('../messageSender');
    const { ResponseBuilder } = require('../utils/ResponseBuilder');

    try {
      const menu = await this.getMainMenu(language);
      if (menu && menu.type === 'button') {
        const combinedText = text + '\n\n' + menu.body;
        await sendMessage(phoneNumber, { type: 'button', body: combinedText, buttons: menu.buttons }, 'interactive');
      } else {
        await sendMessage(phoneNumber, text, 'text');
        if (menu) {
          await sendMessage(phoneNumber, menu, 'interactive');
        }
      }
    } catch (error) {
      this.logger.error('Error sending text with menu:', error);
      await sendMessage(phoneNumber, text, 'text');
    }
  }

  /**
   * Get formatted main menu
   * @param {string} language - Language code
   * @returns {Object|null} Menu data or null
   */
  async getMainMenu(language) {
    try {
      // Check if menuLoader exists in different possible locations
      let menuLoader;
      try {
        menuLoader = require('../../../../src/conversation/menuLoader');
      } catch (e) {
        try {
          menuLoader = require('../../../../conversation/menuLoader');
        } catch (e2) {
          this.logger.error('Menu loader not found:', e2.message);
          return null;
        }
      }
      const { getTranslatedMenu } = menuLoader;
      return await getTranslatedMenu('main_menu', language);
    } catch (error) {
      this.logger.error('Error getting main menu:', error);
      return null;
    }
  }

  /**
   * Get user session information
   * @param {string} phoneNumber - Phone number
   * @returns {Object|null} Session data or null
   */
  async getUserSession(phoneNumber) {
    try {
      const { getUserSession } = require('../../../../src/models/userModel');
      return await getUserSession(phoneNumber);
    } catch (error) {
      this.logger.error('Error getting user session:', error);
      return null;
    }
  }

  /**
   * Check if user is currently in a conversation flow
   * @param {Object} session - User session
   * @returns {boolean} True if in flow
   */
  isUserInFlow(session) {
    return session &&
           session.currentFlow &&
           session.currentFlow !== 'undefined' &&
           session.currentFlow !== undefined;
  }

  /**
   * Handle message within conversation flow context
   * @param {Object} message - WhatsApp message
   * @param {Object} user - User object
   * @param {Object} session - User session
   */
  async handleFlowMessage(message, user, session) {
    await processFlowMessage(message, user, session.currentFlow);
  }

  /**
   * Check subscription limits
   * @param {Object} user - User object
   * @param {string} feature - Feature to check
   * @returns {boolean} True if allowed
   */
  async checkSubscriptionLimits(user, feature) {
    try {
      const benefits = paymentService.getSubscriptionBenefits(user);
      if (feature === 'compatibility') {
        return benefits.maxCompatibilityChecks === -1 ||
               (user.compatibilityChecks || 0) < benefits.maxCompatibilityChecks;
      }
      return true; // Default allow
    } catch (error) {
      this.logger.error('Error checking subscription limits:', error);
      return true; // Default allow on error
    }
  }

  /**
   * Handle processing errors consistently
   * @param {string} phoneNumber - Phone number
   * @param {Error} error - Error object
   */
  async handleProcessingError(phoneNumber, error) {
    try {
      const { sendMessage } = require('../messageSender');
      await sendMessage(
        phoneNumber,
        '❌ Sorry, I encountered an error processing your message. Please try again.',
        'text'
      );
      this.logger.error('❌ Error sent to user:', error.message);
    } catch (sendError) {
      this.logger.error('❌ Error sending error message to user:', sendError.message);
    }
  }

  /**
   * Send error response message
   * @param {string} phoneNumber - Phone number
   * @param {string} errorKey - Translation key
   * @param {string} language - Language code
   */
  async sendErrorResponse(phoneNumber, errorKey, language) {
    try {
      const { ResponseBuilder } = require('../utils/ResponseBuilder');
      const errorMessage = ResponseBuilder.buildErrorMessage(phoneNumber, errorKey, language);
      const { sendMessage } = require('../messageSender');
      await sendMessage(phoneNumber, errorMessage, 'interactive');
    } catch (error) {
      this.logger.error('Error sending error response:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }
}

module.exports = TextMessageProcessor;