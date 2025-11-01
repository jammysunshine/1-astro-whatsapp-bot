/**
 * Main MessageCoordinator - Clean entry point for all WhatsApp message processing.
 * Uses Strategy pattern to delegate to specialized processors based on message type.
 * This replaces the monolithic messageProcessor.js with a maintainable architecture.
 */
class MessageCoordinator {
  constructor({
    logger,
    textProcessor,
    interactiveProcessor,
    mediaProcessor,
    userModel,
    conversationEngine,
    messageSender,
    registry
  }) {
    this.logger = logger;
    this.textProcessor = textProcessor;
    this.interactiveProcessor = interactiveProcessor;
    this.mediaProcessor = mediaProcessor;
    this.userModel = userModel;
    this.conversationEngine = conversationEngine;
    this.messageSender = messageSender;
    this.registry = registry; // ActionRegistry is now injected
  }

  /**
   * No longer needs an explicit initialize method for dependencies,
   * as they are all injected via the constructor.
   * This method can be removed or repurposed if needed for other internal setup.
   */
  async initialize() {
    this.logger.info('🎯 MessageCoordinator initialized via dependency injection');
    return this;
  }

  /**
   * Main entry point for processing incoming WhatsApp messages
   * @param {Object} message - WhatsApp webhook message
   * @param {Object} value - Full WhatsApp webhook value
   * @returns {Promise<void>}
   */
  async processIncomingMessage(message, value) {
    const { from, id, timestamp, type } = message;
    const phoneNumber = from;

    try {
      this.logger.info(
        `📞 Processing message from ${phoneNumber} (Type: ${type})`
      );

      // 1. Validate message structure
      if (!(await this.validateMessage(message, phoneNumber))) {
        return;
      }

      // 2. Get or create user
      let user = await this.userModel.getUserByPhone(phoneNumber);
      if (!user) {
        this.logger.info(`🆕 New user detected: ${phoneNumber}`);
        user = await this.userModel.createUser(phoneNumber);
      }

      // 3. Check if user needs onboarding
      if (!(await this.handleUserOnboarding(message, user, phoneNumber))) {
        return;
      }

      // 4. Route to appropriate processor based on message type
      await this.routeToProcessor(message, user, phoneNumber);

      // 5. Update user interaction timestamp
      await this.updateUserInteraction(user, phoneNumber);
    } catch (error) {
      await this.handleGlobalError(phoneNumber, error, message);
    }
  }

  /**
   * Validate incoming message and environment
   * @param {Object} message - WhatsApp message
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<boolean>} True if valid, throws if invalid
   */
  async validateMessage(message, phoneNumber) {
    // Basic message structure validation
    if (!message || !phoneNumber) {
      this.logger.warn('⚠️ Invalid message structure received');
      return false;
    }

    // Validate WhatsApp environment variables
    if (!this.validateEnvironment()) {
      this.logger.error('❌ Missing required WhatsApp environment variables');
      return false;
    }

    return true;
  }

  /**
   * Validate required environment variables
   * @returns {boolean} True if all required vars are present
   */
  validateEnvironment() {
    return !!(
      process.env.W1_WHATSAPP_ACCESS_TOKEN &&
      process.env.W1_WHATSAPP_PHONE_NUMBER_ID
    );
  }

  /**
   * Handle user onboarding for new or incomplete profiles
   * @param {Object} message - WhatsApp message
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<boolean>} True if should continue processing, false if onboarding handled
   */
  async handleUserOnboarding(message, user, phoneNumber) {
    // New users: always start onboarding
    if (user.isNew || !user.profileComplete) {
      this.logger.info(
        `🆕 Starting onboarding for ${phoneNumber} (New: ${user.isNew}, Complete: ${user.profileComplete})`
      );
      await this.conversationEngine.processFlowMessage(message, user, 'onboarding');
      return false; // Stop further processing, onboarding handles everything
    }

    return true; // Continue with normal message processing
  }

  /**
   * Route message to appropriate specialized processor
   * @param {Object} message - WhatsApp message
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async routeToProcessor(message, user, phoneNumber) {
    const { type } = message;

    switch (type) {
    case 'text':
      await this.textProcessor.process(message, user, phoneNumber);
      break;

    case 'interactive':
      await this.interactiveProcessor.process(message, user, phoneNumber);
      break;

    case 'button':
      // Button messages handled by InteractiveMessageProcessor
      await this.interactiveProcessor.processButtonMessage(
        message,
        user,
        phoneNumber
      );
      break;

    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      await this.mediaProcessor.process(message, user, phoneNumber);
      break;

    default:
      this.logger.warn(`⚠️ Unsupported message type: ${type}`);
      await this.sendUnsupportedMessageTypeResponse(phoneNumber);
    }
  }

  /**
   * Update user's last interaction timestamp
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async updateUserInteraction(user, phoneNumber) {
    try {
      user.lastInteraction = new Date();
      await this.userModel.updateUserProfile(phoneNumber, {
        lastInteraction: user.lastInteraction
      });
    } catch (error) {
      this.logger.error(
        `Error updating interaction timestamp for ${phoneNumber}:`,
        error
      );
      // Non-critical error, don't throw
    }
  }

  /**
   * Handle global errors in message processing
   * @param {string} phoneNumber - Phone number
   * @param {Error} error - Error object
   * @param {Object} message - Original message
   */
  async handleGlobalError(phoneNumber, error, message) {
    const errorMsg =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Unknown error occurred';

    this.logger.error(
      `❌ Global error processing message from ${phoneNumber}: ${errorMsg}`
    );

    try {
      // Send error notification to user
      await this.messageSender.sendMessage(
        phoneNumber,
        '❌ Sorry, I encountered an unexpected error. Our team has been notified. Please try again in a few moments.',
        'text'
      );

      // Could also send error details to admin/logging system here
    } catch (sendError) {
      this.logger.error(
        '❌ Failed to send error message to user:',
        sendError.message
      );
    }
  }

  /**
   * Send unsupported message type response
   * @param {string} phoneNumber - Phone number
   */
  async sendUnsupportedMessageTypeResponse(phoneNumber) {
    try {
      await this.messageSender.sendMessage(
        phoneNumber,
        '🤔 Sorry, I don\'t support that message type yet. Please send text messages or use the interactive buttons.',
        'text'
      );
    } catch (error) {
      this.logger.error('Error sending unsupported type response:', error);
    }
  }

  /**
   * Get coordinator statistics for monitoring
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      processors: {
        text: this.textProcessor.constructor.name,
        interactive: this.interactiveProcessor.constructor.name,
        media: this.mediaProcessor.constructor.name
      },
      registry: this.registry.getStats(),
      initialized: true
    };
  }

  /**
   * Health check for the coordinator
   * @returns {Object} Health status
   */
  healthCheck() {
    try {
      const registryValid = this.registry.validate();
      const processorsReady = !!(
        this.textProcessor &&
        this.interactiveProcessor &&
        this.mediaProcessor
      );

      return {
        healthy: registryValid.isValid && processorsReady,
        registry: registryValid,
        processors: {
          text: !!this.textProcessor,
          interactive: !!this.interactiveProcessor,
          media: !!this.mediaProcessor
        }
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// Create and export asynchronously initialized singleton
let coordinatorInstance = null;

async function getMessageCoordinator() {
  if (!coordinatorInstance) {
    // Assemble dependencies here
    const logger = require('../../core/utils/logger'); // Updated path
    const TextMessageProcessor = require('./processors/TextMessageProcessor');
    const InteractiveMessageProcessor = require('./processors/InteractiveMessageProcessor');
    const MediaMessageProcessor = require('./processors/MediaMessageProcessor');
    const userModel = require('../../models/userModel'); // Import entire module
    const conversationEngine = require('../../conversation/conversationEngine'); // Import entire module
    const messageSender = require('./messageSender'); // Import entire module
    const createInitializedRegistry = require('./ActionRegistryInitializer'); // Dynamic require

    const registry = await createInitializedRegistry();

    const textProcessor = new TextMessageProcessor(registry);
    const interactiveProcessor = new InteractiveMessageProcessor(registry);
    const mediaProcessor = new MediaMessageProcessor();

    const coordinator = new MessageCoordinator({
      logger,
      textProcessor,
      interactiveProcessor,
      mediaProcessor,
      userModel,
      conversationEngine,
      messageSender,
      registry
    });
    coordinatorInstance = await coordinator.initialize(); // Call initialize for any internal setup
  }
  return coordinatorInstance;
}

// Export both the class and the factory function
module.exports = {
  MessageCoordinator,
  getMessageCoordinator,
  // For convenience, export a direct process function
  processIncomingMessage: async (message, value) => {
    const coordinator = await getMessageCoordinator();
    return coordinator.processIncomingMessage(message, value);
  },
  // For backwards compatibility, export a promise that resolves to the singleton
  initialize: getMessageCoordinator
};
