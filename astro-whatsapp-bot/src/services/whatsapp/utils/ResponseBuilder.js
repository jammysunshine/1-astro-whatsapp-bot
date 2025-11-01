const translationService = require('../../i18n/TranslationService');
const logger = require('../../../utils/logger');

/**
 * Centralized utilities for building consistent WhatsApp responses.
 * Handles message formatting, button creation, and menu construction.
 */
class ResponseBuilder {
  /**
   * Get translated button title with fallback
   * @param {string} key - Translation key
   * @param {string} language - Language code
   * @param {string} fallback - Fallback text
   * @returns {string} Translated button title
   */
  static getButtonTitle(key, language, fallback = '') {
    try {
      const translated = translationService.translate(key, language);
      return translated && typeof translated === 'string' ?
        translated :
        fallback;
    } catch (error) {
      logger.warn(`⚠️ Translation failed for key: ${key}`, error.message);
      return fallback;
    }
  }

  /**
   * Get translated content with fallback
   * @param {string} key - Translation key
   * @param {string} language - Language code
   * @param {string} fallback - Fallback text
   * @returns {string} Translated content
   */
  static getTranslatedContent(key, language, fallback = '') {
    try {
      const translated = translationService.translate(key, language);
      return translated && typeof translated === 'string' ?
        translated :
        fallback;
    } catch (error) {
      logger.warn(`⚠️ Translation failed for key: ${key}`, error.message);
      return fallback;
    }
  }

  /**
   * Build an interactive button message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} body - Message body text
   * @param {Array} buttons - Array of button objects
   * @param {string} language - Language code
   * @returns {Object} Interactive message object
   */
  static buildInteractiveButtonMessage(
    phoneNumber,
    body,
    buttons,
    language = 'en'
  ) {
    return {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map(button => ({
            type: 'reply',
            reply: {
              id: button.id,
              title: this.getTranslatedContent(
                button.titleKey,
                language,
                button.title
              )
            }
          }))
        }
      }
    };
  }

  /**
   * Build an interactive list message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} body - Message body text
   * @param {string} buttonText - Button text
   * @param {Array} sections - Array of section objects
   * @param {string} language - Language code
   * @returns {Object} Interactive message object
   */
  static buildInteractiveListMessage(
    phoneNumber,
    body,
    buttonText,
    sections,
    language = 'en'
  ) {
    return {
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: body },
        action: {
          button: this.getTranslatedContent(buttonText, language, buttonText),
          sections: sections.map(section => ({
            title: this.getTranslatedContent(
              section.titleKey,
              language,
              section.title
            ),
            rows: section.rows.map(row => ({
              id: row.id,
              title: this.getTranslatedContent(
                row.titleKey,
                language,
                row.title
              ),
              description: row.description ?
                this.getTranslatedContent(
                  row.descriptionKey,
                  language,
                  row.description
                ) :
                undefined
            }))
          }))
        }
      }
    };
  }

  /**
   * Build a simple text message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} text - Message text
   * @returns {Object} Text message object
   */
  static buildTextMessage(phoneNumber, text) {
    return {
      to: phoneNumber,
      type: 'text',
      text: { body: text }
    };
  }

  /**
   * Build an error response message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} errorKey - Error translation key
   * @param {string} language - Language code
   * @param {Object} params - Template parameters
   * @returns {Object} Error message object
   */
  static buildErrorMessage(
    phoneNumber,
    errorKey,
    language = 'en',
    params = {}
  ) {
    try {
      const errorMessage =
        translationService.translate(errorKey, language) ||
        'An unexpected error occurred. Please try again later.';
      return this.buildTextMessage(phoneNumber, errorMessage);
    } catch (error) {
      logger.warn(`⚠️ Error building error message: ${error.message}`);
      return this.buildTextMessage(
        phoneNumber,
        `An error occurred: ${params.details || 'Unknown error'}. Please try again.`
      );
    }
  }

  /**
   * Build a success response message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} successKey - Success translation key
   * @param {string} language - Language code
   * @returns {Object} Success message object
   */
  static buildSuccessMessage(phoneNumber, successKey, language = 'en') {
    const successMessage = this.getTranslatedContent(
      successKey,
      language,
      'Operation completed successfully!'
    );
    return this.buildTextMessage(phoneNumber, successMessage);
  }

  /**
   * Format astrological reading response
   * @param {Object} reading - Reading data
   * @returns {string} Formatted reading text
   */
  static formatAstrologicalReading(reading) {
    let response = '';

    if (reading.title) {
      response += `*${reading.title}*\n\n`;
    }

    if (reading.summary) {
      response += `${reading.summary}\n\n`;
    }

    if (reading.details && Array.isArray(reading.details)) {
      reading.details.forEach(detail => {
        response += `• ${detail}\n`;
      });
      response += '\n';
    }

    if (reading.advice) {
      response += `*Advice:* ${reading.advice}\n\n`;
    }

    if (reading.disclaimer) {
      response += `*${reading.disclaimer}*\n`;
    }

    return response;
  }

  /**
   * Build navigation buttons for menus
   * @param {string} language - Language code
   * @returns {Array} Navigation button array
   */
  static getNavigationButtons(language = 'en') {
    return [
      {
        id: 'back',
        titleKey: 'buttons.back',
        title: '⬅️ Back'
      },
      {
        id: 'main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      },
      {
        id: 'help',
        titleKey: 'buttons.help',
        title: '❓ Help'
      }
    ];
  }

  /**
   * Validate message construction
   * @param {Object} message - Message object to validate
   * @returns {Object} Validation result
   */
  static validateMessage(message) {
    const result = { isValid: true, errors: [] };

    if (!message || typeof message !== 'object') {
      result.isValid = false;
      result.errors.push('Message must be an object');
      return result;
    }

    if (!message.to || typeof message.to !== 'string') {
      result.isValid = false;
      result.errors.push('Message must have a valid "to" field');
    }

    const validTypes = [
      'text',
      'interactive',
      'image',
      'video',
      'audio',
      'document'
    ];
    if (!message.type || !validTypes.includes(message.type)) {
      result.isValid = false;
      result.errors.push(
        `Message type must be one of: ${validTypes.join(', ')}`
      );
    }

    // Interactive message specific validation
    if (message.type === 'interactive') {
      if (!message.interactive || typeof message.interactive !== 'object') {
        result.isValid = false;
        result.errors.push(
          'Interactive message must have an "interactive" field'
        );
      } else if (
        !message.interactive.type ||
        !['button', 'list', 'product', 'product_list'].includes(
          message.interactive.type
        )
      ) {
        result.isValid = false;
        result.errors.push(
          'Interactive message type must be button, list, product, or product_list'
        );
      }
    }

    result.errorMessage = result.errors.join('; ');
    return result;
  }
}

module.exports = { ResponseBuilder };
