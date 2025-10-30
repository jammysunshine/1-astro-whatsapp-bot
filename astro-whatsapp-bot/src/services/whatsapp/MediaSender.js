const logger = require('../../utils/logger');
const { whatsappAPI } = require('./WhatsAppAPI');

/**
 * MediaSender - WhatsApp media message handling
 * Manages image, video, audio, document, and voice messages
 */
class MediaSender {
  constructor() {
    this.logger = logger;
    this.whatsappAPI = whatsappAPI;
  }

  /**
   * Send text message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async sendTextMessage(phoneNumber, message, options = {}) {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: this.sanitizeMessage(message, 4096),
        ...(options.previewUrl === true && { preview_url: true })
      },
      ...(options.context && { context: options.context }),
      ...(options.recipientType && { recipient_type: options.recipientType })
    };

    try {
      const response = await this.whatsappAPI.makeRequest('/messages', payload);
      this.logger.info(`📤 Text message sent successfully to ${phoneNumber}: ${response.messages[0].id}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Error sending text message to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Send media message (image, video, audio, document)
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} mediaType - Media type (image/video/audio/document)
   * @param {string} mediaId - Media ID or URL
   * @param {string} caption - Media caption
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async sendMediaMessage(phoneNumber, mediaType, mediaId, caption = '', options = {}) {
    if (!['image', 'video', 'audio', 'document'].includes(mediaType)) {
      throw new Error(`Invalid media type: ${mediaType}`);
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      type: mediaType,
      [mediaType]: {
        id: mediaId,
        caption: this.sanitizeMessage(caption, 1024)
      }
    };

    // Add filename for documents
    if (options.filename && mediaType === 'document') {
      payload.document.filename = options.filename;
    }

    try {
      const response = await this.whatsappAPI.makeRequest('/messages', payload);
      this.logger.info(`📷 ${mediaType} message sent successfully to ${phoneNumber}: ${response.messages[0].id}`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Error sending ${mediaType} message to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Send image message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} imageId - Image media ID
   * @param {string} caption - Image caption
   * @returns {Promise<Object>} API response
   */
  async sendImage(phoneNumber, imageId, caption = '') {
    return this.sendMediaMessage(phoneNumber, 'image', imageId, caption);
  }

  /**
   * Send video message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} videoId - Video media ID
   * @param {string} caption - Video caption
   * @returns {Promise<Object>} API response
   */
  async sendVideo(phoneNumber, videoId, caption = '') {
    return this.sendMediaMessage(phoneNumber, 'video', videoId, caption);
  }

  /**
   * Send audio message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} audioId - Audio media ID
   * @returns {Promise<Object>} API response
   */
  async sendAudio(phoneNumber, audioId) {
    return this.sendMediaMessage(phoneNumber, 'audio', audioId);
  }

  /**
   * Send voice message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} voiceId - Voice media ID
   * @returns {Promise<Object>} API response
   */
  async sendVoice(phoneNumber, voiceId) {
    return this.sendAudio(phoneNumber, voiceId);
  }

  /**
   * Send document message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} documentId - Document media ID
   * @param {string} caption - Document caption
   * @param {string} filename - Document filename
   * @returns {Promise<Object>} API response
   */
  async sendDocument(phoneNumber, documentId, caption = '', filename = null) {
    const options = filename ? { filename } : {};
    return this.sendMediaMessage(phoneNumber, 'document', documentId, caption, options);
  }

  /**
   * Universal message sender wrapper
   * @param {string} phoneNumber - Recipient phone number
   * @param {*} message - Message content
   * @param {string} messageType - Message type
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async sendMessage(phoneNumber, message, messageType = 'text', options = {}) {
    // Input validation
    if (message === null || message === undefined) {
      this.logger.error(`❌ Message content is null/undefined for ${phoneNumber}`);
      throw new Error('Message content cannot be null or undefined');
    }

    switch (messageType) {
      case 'text':
        if (typeof message === 'string' && message.trim().length === 0) {
          this.logger.error(`❌ Message content is empty for ${phoneNumber}`);
          throw new Error('Message content cannot be empty');
        }
        return this.sendTextMessage(phoneNumber, message, options);

      case 'media':
        return this.sendMediaMessage(
          phoneNumber,
          message.mediaType,
          message.mediaId,
          message.caption || '',
          options
        );

      default:
        // Translate message if it's a resource key
        let messageText = message;
        if (typeof message === 'string' && message.includes('.') && !message.includes(' ')) {
          // Would need access to translation service
          messageText = message; // Placeholder for now
        }

        return this.sendTextMessage(phoneNumber, messageText, options);
    }
  }

  /**
   * Sanitize message text for WhatsApp API compliance
   * @param {string} text - Text to sanitize
   * @param {number} maxLength - Maximum allowed length
   * @returns {string} Sanitized text
   */
  sanitizeMessage(text, maxLength = 4096) {
    if (typeof text !== 'string') {
      return String(text || '').substring(0, maxLength);
    }

    // Clean up line endings and truncate
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .substring(0, maxLength);
  }

  /**
   * Health check for MediaSender
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      return {
        healthy: true,
        whatsappAPI: this.whatsappAPI.healthCheck(),
        supportedMediaTypes: ['text', 'image', 'video', 'audio', 'document'],
        version: '1.0.0',
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

module.exports = { MediaSender };