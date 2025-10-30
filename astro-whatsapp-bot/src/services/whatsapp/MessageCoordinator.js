const logger = require('../../utils/logger');
const TextMessageProcessor = require('./processors/TextMessageProcessor');
const InteractiveMessageProcessor = require('./processors/InteractiveMessageProcessor');
const MediaMessageProcessor = require('./processors/MediaMessageProcessor');
const { ValidationService } = require('./utils/ValidationService');
const { getUserByPhone, createUser, updateUserProfile } = require('../../models/userModel');
const { processFlowMessage } = require('../../conversation/conversationEngine');

/**
 * Main MessageCoordinator - Clean entry point for all WhatsApp message processing.
 * Uses Strategy pattern to delegate to specialized processors based on message type.
 * This replaces the monolithic messageProcessor.js with a maintainable architecture.
 */
class MessageCoordinator {
  constructor() {
    this.logger = logger;
    this.initialized = false;
  }

  /**
   * Initialize the coordinator with registry and processors
   */
  async initialize() {
    if (this.initialized) { return this; }

    try {
      // Import and initialize registry asynchronously
      const createInitializedRegistry = require('./ActionRegistryInitializer');
      this.registry = await createInitializedRegistry();

      // Create processors
      this.textProcessor = new TextMessageProcessor(this.registry);
      this.interactiveProcessor = new InteractiveMessageProcessor(this.registry);
      this.mediaProcessor = new MediaMessageProcessor();

      this.initialized = true;
      this.logger.info('🎯 MessageCoordinator initialized with new action architecture');
      return this;
    } catch (error) {
      this.logger.error('❌ Failed to initialize MessageCoordinator:', error);
      throw error;
    }
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
      this.logger.info(`📞 Processing message from ${phoneNumber} (Type: ${type})`);

      // 1. Validate message structure
      if (!(await this.validateMessage(message, phoneNumber))) {
        return;
      }

      // 2. Get or create user
      let user = await getUserByPhone(phoneNumber);
      if (!user) {
        this.logger.info(`🆕 New user detected: ${phoneNumber}`);
        user = await createUser(phoneNumber);
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
    return !!(process.env.W1_WHATSAPP_ACCESS_TOKEN &&
             process.env.W1_WHATSAPP_PHONE_NUMBER_ID);
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
      this.logger.info(`🆕 Starting onboarding for ${phoneNumber} (New: ${user.isNew}, Complete: ${user.profileComplete})`);
      await processFlowMessage(message, user, 'onboarding');
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
      await this.interactiveProcessor.processButtonMessage(message, user, phoneNumber);
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
      await updateUserProfile(phoneNumber, {
        lastInteraction: user.lastInteraction
      });
    } catch (error) {
      this.logger.error(`Error updating interaction timestamp for ${phoneNumber}:`, error);
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
    const errorMsg = error.response?.data?.error?.message ||
                    error.response?.data?.message ||
                    error.message ||
                    'Unknown error occurred';

    this.logger.error(`❌ Global error processing message from ${phoneNumber}: ${errorMsg}`);

    try {
      // Send error notification to user
      const { sendMessage } = require('./messageSender');
      await sendMessage(
        phoneNumber,
        '❌ Sorry, I encountered an unexpected error. Our team has been notified. Please try again in a few moments.',
        'text'
      );

      // Could also send error details to admin/logging system here
    } catch (sendError) {
      this.logger.error('❌ Failed to send error message to user:', sendError.message);
    }
  }

  /**
   * Send unsupported message type response
   * @param {string} phoneNumber - Phone number
   */
  async sendUnsupportedMessageTypeResponse(phoneNumber) {
    try {
      const { sendMessage } = require('./messageSender');
      await sendMessage(
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
    const coordinator = new MessageCoordinator();
    coordinatorInstance = await coordinator.initialize();
  }
  return coordinatorInstance;
}

// Export both the class and the factory function
module.exports = {
  MessageCoordinator,
  getMessageCoordinator,
  // For backwards compatibility, export a promise that resolves to the singleton
  initialize: getMessageCoordinator
};
