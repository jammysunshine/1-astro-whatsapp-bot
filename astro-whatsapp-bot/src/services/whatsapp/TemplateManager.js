const logger = require('../../utils/logger');
const translationService = require('../i18n/TranslationService');
const { whatsappAPI } = require('./WhatsAppAPI');

/**
 * TemplateManager - Interactive message templates and formatting
 * Handles buttons, lists, templates, and message structure validation
 */
class TemplateManager {
  constructor() {
    this.logger = logger;
    this.translationService = translationService;
    this.whatsappAPI = whatsappAPI;
  }

  /**
   * Send interactive message with buttons
   * @param {string} phoneNumber - Recipient's phone number
   * @param {string} body - Main message body
   * @param {Array} buttons - Array of button objects
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async sendInteractiveButtons(phoneNumber, body, buttons, options = {}) {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: { buttons: buttons.slice(0, 3) }, // WhatsApp allows max 3 buttons
        ...(options.header && { header: this.formatHeader(options.header) }),
        ...(options.footer && { footer: { text: options.footer } })
      }
    };

    try {
      const response = await this.whatsappAPI.makeRequest('/messages', payload);
      this.logger.info(`🖱️ Interactive message sent successfully to ${phoneNumber}: ${response.messages[0].id}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Error sending interactive message to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Send list message for menu options
   * @param {string} phoneNumber - Recipient's phone number
   * @param {string} body - Main message body
   * @param {string} buttonText - Text for list button
   * @param {Array} sections - Menu sections
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async sendListMessage(phoneNumber, body, buttonText, sections, options = {}) {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: body },
        action: {
          button: buttonText,
          sections: sections.slice(0, 10) // WhatsApp allows max 10 sections
        },
        ...(options.header && { header: this.formatHeader(options.header) }),
        ...(options.footer && { footer: { text: options.footer } })
      }
    };

    try {
      const response = await this.whatsappAPI.makeRequest('/messages', payload);
      const messageId = response?.messages?.[0]?.id;
      this.logger.info(`📋 List message sent successfully to ${phoneNumber}: ${messageId || 'unknown'}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Error sending list message to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Send approved template message
   * @param {string} phoneNumber - Recipient's phone number
   * @param {string} templateName - Name of template
   * @param {string} languageCode - Language code
   * @param {Array} components - Template components
   * @returns {Promise<Object>} API response
   */
  async sendTemplateMessage(phoneNumber, templateName, languageCode = 'en', components = []) {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    };

    try {
      const response = await this.whatsappAPI.makeRequest('/messages', payload);
      this.logger.info(`📝 Template message sent successfully to ${phoneNumber}: ${response.messages[0].id}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Error sending template message to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Build interactive button message from configuration
   * @param {string} phoneNumber - Recipient phone number
   * @param {Object} message - Message configuration
   * @param {Array} buttons - Button configuration array
   * @param {string} language - Language code
   * @returns {Promise<Object>} API response
   */
  async buildInteractiveButtonMessage(phoneNumber, message, buttons, language = 'en') {
    // Translate body text
    let bodyText = message;
    if (typeof message === 'string' && message.includes('.') && !message.includes(' ')) {
      bodyText = await this.translationService.translate(message, language);
    }

    // Ensure body meets WhatsApp limits
    if (typeof bodyText === 'string' && bodyText.length > 4096) {
      bodyText = bodyText.substring(0, 4096);
    }

    // Format buttons for WhatsApp
    const whatsappButtons = buttons.map(button => ({
      type: 'reply',
      reply: {
        id: button.id || button.reply?.id,
        title: button.title || button.reply?.title
      }
    }));

    return await this.sendInteractiveButtons(phoneNumber, bodyText, whatsappButtons, {});
  }

  /**
   * Format header for WhatsApp messages
   * @param {string|Object} header - Header content
   * @returns {Object} Formatted header
   */
  formatHeader(header) {
    if (typeof header === 'string') {
      return {
        type: 'text',
        text: header.length > 60 ? header.substring(0, 60) : header
      };
    }

    if (typeof header === 'object' && header.type) {
      return header;
    }

    return null;
  }

  /**
   * Validate message structure for WhatsApp API
   * @param {Object} message - Message to validate
   * @param {string} type - Message type
   * @returns {Object} Validation result
   */
  validateMessageStructure(message, type) {
    const errors = [];
    const warnings = [];

    switch (type) {
    case 'interactive':
      if (!message.type) {
        errors.push('Interactive message missing type');
      }

      if (type === 'button' && (!message.buttons || message.buttons.length > 3)) {
        errors.push('Button messages must have 1-3 buttons');
      }

      if (type === 'list' && (!message.sections || message.sections.length === 0)) {
        errors.push('List messages must have at least one section');
      }
      break;

    case 'template':
      if (!message.templateName) {
        errors.push('Template message missing template name');
      }
      break;

    case 'media':
      if (!message.mediaType || !message.mediaId) {
        errors.push('Media message missing type or ID');
      }
      break;
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Sanitize text for WhatsApp API compliance
   * @param {string} text - Text to sanitize
   * @param {number} maxLength - Maximum length
   * @returns {string} Sanitized text
   */
  sanitizeText(text, maxLength = 4096) {
    if (typeof text !== 'string') {
      return String(text || '').substring(0, maxLength);
    }

    // Remove or replace problematic characters
    const sanitized = text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')
      .substring(0, maxLength);

    return sanitized;
  }

  /**
   * Health check for TemplateManager
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      return {
        healthy: true,
        whatsappAPI: this.whatsappAPI.healthCheck(),
        translationService: !!this.translationService,
        version: '1.0.0',
        capabilities: ['Interactive Buttons', 'List Messages', 'Templates', 'Message Validation'],
        status: 'Operational'
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { TemplateManager };
