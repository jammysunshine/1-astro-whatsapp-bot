const BaseMessageProcessor = require('./BaseMessageProcessor');
const logger = require('../../../../src/utils/logger');
const { ValidationService } = require('../utils/ValidationService');
const translationService = require('../../../../src/services/i18n/TranslationService');

/**
 * Specialized processor for handling media messages in the astrology bot.
 * Handles images, videos, audio, and document files for palmistry, photo reading, etc.
 */
class MediaMessageProcessor extends BaseMessageProcessor {
  constructor() {
    super();
    this.logger = logger;
    this.supportedTypes = ['image', 'video', 'audio', 'document'];
  }

  /**
   * Process incoming media message
   * @param {Object} message - WhatsApp message object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Sender's phone number
   * @returns {Promise<void>}
   */
  async process(message, user, phoneNumber) {
    try {
      const { type } = message;
      const media = message[type]; // Get media object

      this.logger.info(`📸 Processing ${type} media message from ${phoneNumber}`);

      // Validate message structure
      if (!ValidationService.validateMessage(message, phoneNumber)) {
        this.logger.warn('⚠️ Invalid media message structure');
        return;
      }

      // Validate supported media type
      if (!this.supportedTypes.includes(type)) {
        await this.sendUnsupportedMediaTypeResponse(phoneNumber, type);
        return;
      }

      // Process based on media type
      switch (type) {
      case 'image':
        await this.processImageMessage(media, user, phoneNumber);
        break;
      case 'video':
        await this.processVideoMessage(media, user, phoneNumber);
        break;
      case 'audio':
        await this.processAudioMessage(media, user, phoneNumber);
        break;
      case 'document':
        await this.processDocumentMessage(media, user, phoneNumber);
        break;
      default:
        await this.sendUnsupportedMediaTypeResponse(phoneNumber, type);
      }

    } catch (error) {
      this.logger.error(`❌ Error processing media message from ${phoneNumber}:`, error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process image message (primarily for palmistry)
   * @param {Object} image - Image media object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processImageMessage(image, user, phoneNumber) {
    try {
      const { id, caption, mime_type } = image;

      this.logger.info(`🖼️ Processing image from ${phoneNumber}: ${id} (${mime_type})`);

      // Check if this is a palmistry request
      if (this.isPalmistryRequest(caption)) {
        await this.handlePalmistryRequest(image, user, phoneNumber);
        return;
      }

      // Check if this is a birth chart request (kundli visualization)
      if (this.isKundliRequest(caption)) {
        await this.handleKundliRequest(image, user, phoneNumber);
        return;
      }

      // Check if this is for photo reading/analysis
      if (this.isPhotoReadingRequest(caption)) {
        await this.handlePhotoReadingRequest(image, user, phoneNumber);
        return;
      }

      // Generic image acknowledgment
      await this.sendImageAcknowledgment(phoneNumber, 'accepted');

    } catch (error) {
      this.logger.error('Error processing image message:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process video message
   * @param {Object} video - Video media object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processVideoMessage(video, user, phoneNumber) {
    try {
      const { id, caption, mime_type } = video;

      this.logger.info(`🎥 Processing video from ${phoneNumber}: ${id} (${mime_type})`);

      // Videos are less common, send acknowledgment
      const userLanguage = user.preferredLanguage || 'en';
      const message = translationService.translate(
        'messages.media.video_received',
        userLanguage,
        { id }
      ) || `Thank you for sharing a video (${id}). Video analysis is not yet available.`;

      await this.sendAcknowledgment(phoneNumber, message);

    } catch (error) {
      this.logger.error('Error processing video message:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process audio message
   * @param {Object} audio - Audio media object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processAudioMessage(audio, user, phoneNumber) {
    try {
      const { id, caption, mime_type } = audio;

      this.logger.info(`🔊 Processing audio from ${phoneNumber}: ${id} (${mime_type})`);

      // Audio messages for voice readings or dictation
      const userLanguage = user.preferredLanguage || 'en';
      const message = translationService.translate(
        'messages.media.audio_received',
        userLanguage,
        { id }
      ) || `Thank you for sharing an audio message (${id}). Voice analysis is not yet available.`;

      await this.sendAcknowledgment(phoneNumber, message);

    } catch (error) {
      this.logger.error('Error processing audio message:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process document message
   * @param {Object} document - Document media object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processDocumentMessage(document, user, phoneNumber) {
    try {
      const { id, caption, filename, mime_type } = document;

      this.logger.info(`📄 Processing document from ${phoneNumber}: ${filename || id} (${mime_type})`);

      // Check if this is a chart or data file
      if (this.isChartFile(mime_type, filename)) {
        await this.handleChartFileUpload(document, user, phoneNumber);
        return;
      }

      // Generic document acknowledgment
      const userLanguage = user.preferredLanguage || 'en';
      const message = translationService.translate(
        'messages.media.document_received',
        userLanguage,
        { filename: filename || id }
      ) || `Thank you for sharing a document (${filename || id}). Document analysis is not yet available.`;

      await this.sendAcknowledgment(phoneNumber, message);

    } catch (error) {
      this.logger.error('Error processing document message:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Handle palmistry request from image
   * @param {Object} image - Image object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async handlePalmistryRequest(image, user, phoneNumber) {
    try {
      // Validate user profile
      if (!(await ValidationService.validateUserProfile(
        user, phoneNumber, 'Palmistry Analysis'
      ))) {
        return;
      }

      // In a real implementation, we would:
      // 1. Download the image from WhatsApp
      // 2. Send it to an AI vision service or palmistry expert
      // 3. Process the palmistry analysis

      const userLanguage = user.preferredLanguage || 'en';

      // For now, provide a placeholder response
      const palmistryMessage = translationService.translate(
        'messages.palmistry.image_received',
        userLanguage,
        { id: image.id }
      ) || `✋ Thank you for sharing your palm image! Palmistry analysis for image ${image.id} is being prepared.\n\nThis ancient art reveals insights about:\n• Life purpose and destiny\n• Health indicators\n• Relationship patterns\n• Career tendencies\n\nYour personalized palm reading will be available soon!`;

      await this.sendAcknowledgment(phoneNumber, palmistryMessage);

    } catch (error) {
      this.logger.error('Error handling palmistry request:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Handle kundli/birth chart image request
   * @param {Object} image - Image object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async handleKundliRequest(image, user, phoneNumber) {
    try {
      const userLanguage = user.preferredLanguage || 'en';
      const message = translationService.translate(
        'messages.chart.image_received',
        userLanguage,
        { id: image.id }
      ) || `🕉️ Thank you for sharing your birth chart image (${image.id}). Visual chart analysis is not yet available.\n\nFor textual birth chart readings, please use the "Birth Chart" option from the main menu.`;

      await this.sendAcknowledgment(phoneNumber, message);

    } catch (error) {
      this.logger.error('Error handling kundli request:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Handle photo reading request
   * @param {Object} image - Image object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async handlePhotoReadingRequest(image, user, phoneNumber) {
    try {
      const userLanguage = user.preferredLanguage || 'en';
      const message = translationService.translate(
        'messages.photo_reading.received',
        userLanguage,
        { id: image.id }
      ) || `🔮 Thank you for sharing your photo (${image.id}). Photo analysis and aura reading services are not yet available.\n\nFor other divination methods, please try Tarot, I Ching, or Palmistry from the main menu.`;

      await this.sendAcknowledgment(phoneNumber, message);

    } catch (error) {
      this.logger.error('Error handling photo reading request:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Handle chart file upload
   * @param {Object} document - Document object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async handleChartFileUpload(document, user, phoneNumber) {
    try {
      const userLanguage = user.preferredLanguage || 'en';
      const message = translationService.translate(
        'messages.chart_file.received',
        userLanguage,
        { filename: document.filename }
      ) || `📊 Thank you for uploading your chart file (${document.filename}). Chart file analysis is not yet available.\n\nPlease use our built-in birth chart generator for personalized readings.`;

      await this.sendAcknowledgment(phoneNumber, message);

    } catch (error) {
      this.logger.error('Error handling chart file upload:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Check if image is for palmistry
   * @param {string} caption - Image caption
   * @returns {boolean} True if palmistry request
   */
  isPalmistryRequest(caption) {
    if (!caption) return false;
    const palmistryKeywords = ['palm', 'hand', 'palmistry', 'palm reading', 'hand reading'];
    const lowerCaption = caption.toLowerCase();
    return palmistryKeywords.some(keyword => lowerCaption.includes(keyword));
  }

  /**
   * Check if image is for kundli/birth chart
   * @param {string} caption - Image caption
   * @returns {boolean} True if kundli request
   */
  isKundliRequest(caption) {
    if (!caption) return false;
    const kundliKeywords = ['kundli', 'chart', 'birth chart', 'natal chart', 'horoscope'];
    const lowerCaption = caption.toLowerCase();
    return kundliKeywords.some(keyword => lowerCaption.includes(keyword));
  }

  /**
   * Check if image is for photo reading
   * @param {string} caption - Image caption
   * @returns {boolean} True if photo reading request
   */
  isPhotoReadingRequest(caption) {
    if (!caption) return false;
    const photoKeywords = ['photo reading', 'photo analysis', 'aura', 'energy', 'vibe'];
    const lowerCaption = caption.toLowerCase();
    return photoKeywords.some(keyword => lowerCaption.includes(keyword));
  }

  /**
   * Check if document is a chart file
   * @param {string} mimeType - MIME type
   * @param {string} filename - Filename
   * @returns {boolean} True if chart file
   */
  isChartFile(mimeType, filename) {
    if (!mimeType && !filename) return false;

    const chartExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.svg'];
    const chartMimes = ['application/pdf', 'image/png', 'image/jpeg'];

    const fileName = filename || '';
    const mime = mimeType || '';

    return chartExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) ||
           chartMimes.includes(mime);
  }

  /**
   * Send image acknowledgment
   * @param {string} phoneNumber - Phone number
   * @param {string} status - Acknowledgment status
   */
  async sendImageAcknowledgment(phoneNumber, status) {
    const userLanguage = 'en'; // Default for error messages
    const message = translationService.translate(
      `messages.media.image_${status}`,
      userLanguage
    ) || `Thank you for sharing an image. Status: ${status}`;

    await this.sendAcknowledgment(phoneNumber, message);
  }

  /**
   * Send unsupported media type response
   * @param {string} phoneNumber - Phone number
   * @param {string} mediaType - Unsupported media type
   */
  async sendUnsupportedMediaTypeResponse(phoneNumber, mediaType) {
    const userLanguage = 'en';
    const message = translationService.translate(
      'messages.media.unsupported_type',
      userLanguage,
      { type: mediaType }
    ) || `Sorry, ${mediaType} files are not yet supported. Please send text messages or use the main menu options.`;

    await this.sendAcknowledgment(phoneNumber, message);
  }

  /**
   * Send acknowledgment message
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Message text
   */
  async sendAcknowledgment(phoneNumber, message) {
    try {
      const { sendMessage } = require('../messageSender');
      await sendMessage(phoneNumber, message, 'text');
    } catch (error) {
      this.logger.error('Error sending acknowledgment:', error);
    }
  }

  /**
   * Handle processing errors
   * @param {string} phoneNumber - Phone number
   * @param {Error} error - Error object
   */
  async handleProcessingError(phoneNumber, error) {
    try {
      const { sendMessage } = require('../messageSender');
      await sendMessage(
        phoneNumber,
        '❌ Sorry, I encountered an error processing your media file. Please try again.',
        'text'
      );
      this.logger.error('❌ Error sent to user:', error.message);
    } catch (sendError) {
      this.logger.error('❌ Error sending error message:', sendError.message);
    }
  }
}

module.exports = MediaMessageProcessor;