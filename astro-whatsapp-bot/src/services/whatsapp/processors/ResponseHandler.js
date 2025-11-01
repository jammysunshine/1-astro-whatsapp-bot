const logger = require('../../../utils/logger');
const CalculationsCoordinator = require('../../../core/services/calculators/CalculationsCoordinator');
const translationService = require('../../../services/i18n/TranslationService');

/**
 * ResponseHandler - Handles message responses and fallback scenarios
 * Manages fallback responses, error messages, and menu formatting
 */
class ResponseHandler {
  constructor() {
    this.logger = logger;
  }

  /**
   * Determine message type based on content
   * @param {string} messageText - Message text
   * @returns {string} Message type
   */
  determineMessageType(messageText) {
    const lowerText = messageText.toLowerCase();
    
    if (lowerText.includes('horoscope') || lowerText.includes('today') || lowerText.includes('daily')) {
      return 'daily_horoscope';
    }
    
    return 'general';
  }

  /**
   * Handle fallback response when no specific action matches
   * @param {string} messageText - Original message text
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async handleFallbackResponse(messageText, user, phoneNumber) {
    try {
      let response = null;
      const userLanguage = user.preferredLanguage || 'en';

      // Try to generate a response using CalculationsCoordinator for astrology-related queries
      if (user && user.birthDate && user.birthTime && user.birthPlace) {
        try {
          const calculationsCoordinator = new CalculationsCoordinator();
          
          // Generate a response based on the user's birth data and the message content
          const messageType = this.determineMessageType(messageText);
          
          switch (messageType) {
            case 'daily_horoscope':
              // Use the DailyHoroscopeCalculator directly
              const DailyHoroscopeCalculator = require('../../../core/services/calculators/DailyHoroscopeCalculator');
              const dailyHoroscopeCalculator = new DailyHoroscopeCalculator();
              // Set services if needed
              dailyHoroscopeCalculator.setServices({});
              response = await dailyHoroscopeCalculator.generateDailyHoroscope({
                birthDate: user.birthDate,
                birthTime: user.birthTime,
                birthPlace: user.birthPlace,
                name: user.name
              });
              break;
              
            default:
              // Fall back to general astrology engine
              const generateAstrologyResponse = require('../../../services/astrology/astrologyEngine');
              response = await generateAstrologyResponse(messageText, user);
          }
        } catch (calculationError) {
          this.logger.warn('CalculationsCoordinator failed, using fallback engine:', calculationError.message);
          // Fall back to the original astrology engine
          const generateAstrologyResponse = require('../../../services/astrology/astrologyEngine');
          response = await generateAstrologyResponse(messageText, user);
        }
      } else {
        // Fall back to the original astrology engine for users without birth data
        const generateAstrologyResponse = require('../../../services/astrology/astrologyEngine');
        response = await generateAstrologyResponse(messageText, user);
      }

      if (response && (typeof response === 'string' || response.content)) {
        const responseText = typeof response === 'string' ? response : response.content;
        // Send response with menu
        const { sendMessage } = require('../messageSender');
        await this.sendTextWithMenu(phoneNumber, responseText, userLanguage);
      } else {
        await this.sendTextWithMenu(
          phoneNumber,
          translationService.translate(
            'messages.fallback.unknown_request',
            userLanguage
          ) ||
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

    try {
      const menu = await this.getMainMenu(language);
      if (menu && menu.type === 'button') {
        const combinedText = `${text}\n\n${menu.body}`;
        await sendMessage(
          phoneNumber,
          { type: 'button', body: combinedText, buttons: menu.buttons },
          'interactive'
        );
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
      const menuLoader = require('../../../conversation/menuLoader');
      const { getTranslatedMenu } = menuLoader;
      return await getTranslatedMenu('main_menu', language);
    } catch (error) {
      this.logger.error('Error getting main menu:', error);
      return null;
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
      const errorMessage = ResponseBuilder.buildErrorMessage(
        phoneNumber,
        errorKey,
        language
      );
      const { sendMessage } = require('../messageSender');
      await sendMessage(phoneNumber, errorMessage, 'interactive');
    } catch (error) {
      this.logger.error('Error sending error response:', error);
      await this.handleProcessingError(phoneNumber, error);
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
      this.logger.error(
        '❌ Error sending error message to user:',
        sendError.message
      );
    }
  }
}

module.exports = { ResponseHandler };
