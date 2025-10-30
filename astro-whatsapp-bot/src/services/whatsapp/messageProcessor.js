const logger = require('../../utils/logger');
const { sendMessage } = require('./messageSender');
const translationService = require('../i18n/TranslationService');
const { processFlowMessage } = require('../../conversation/conversationEngine');
const { getTranslatedMenu } = require('../../conversation/menuLoader');
const {
  getUserByPhone,
  createUser,
  incrementCompatibilityChecks
} = require('../../models/userModel');

// Import all action classes
const BirthChartAction = require('../whatsapp/actions/astrology/BirthChartAction');
// Add other actions as they exist/ are restored
// const CompatibilityAction = require('../whatsapp/actions/astrology/CompatibilityAction');
// const DailyHoroscopeAction = require('../whatsapp/actions/astrology/DailyHoroscopeAction');
// etc.

/**
 * Message Router - Routes incoming messages to appropriate action handlers
 * Integrates with the new modular architecture
 */
class MessageRouter {
  constructor() {
    this.actionMap = this.buildActionMap();
  }

  /**
   * Build mapping of action IDs to action classes
   */
  buildActionMap() {
    return {
      show_birth_chart: BirthChartAction,
      get_daily_horoscope: null, // TODO: Add when action exists
      initiate_compatibility_flow: null // TODO: Add when action exists
      // Add more mappings as actions are restored
    };
  }

  /**
   * Route message to appropriate action
   * @param {string} actionId - Action identifier
   * @param {Object} phoneNumber - User phone number
   * @param {Object} user - User object
   * @param {Object} message - Original message
   */
  async routeToAction(actionId, phoneNumber, user, message) {
    const ActionClass = this.actionMap[actionId];

    if (!ActionClass) {
      logger.warn(`No action class found for actionId: ${actionId}`);
      const userLanguage = user?.preferredLanguage || translationService.detectLanguage(phoneNumber);
      await sendMessage(
        phoneNumber,
        `Sorry, this feature (${actionId}) is currently being updated. Please try again later.`,
        'text'
      );
      return null;
    }

    try {
      // Create action instance with required dependencies
      const action = new ActionClass({
        logger,
        sendMessage,
        getUserLanguage: () => user?.preferredLanguage || translationService.detectLanguage(phoneNumber),
        phoneNumber,
        user
      });

      // Bind user to action instance (emulating the old pattern)
      action.user = user;
      action.phoneNumber = phoneNumber;

      // Execute the action
      const result = await action.execute();

      return result;
    } catch (error) {
      logger.error(`Error executing action ${actionId}:`, error);
      await sendMessage(
        phoneNumber,
        'Sorry, there was an error processing your request. Please try again.',
        'text'
      );
      return { success: false, reason: 'execution_error' };
    }
  }

  /**
   * Parse message content to determine intended action
   * @param {Object} message - WhatsApp message object
   * @param {Object} user - User object
   */
  parseActionFromMessage(message, user) {
    const { type, text, button, interactive } = message;

    // Handle different message types
    switch (type) {
    case 'text':
      return this.parseTextMessage(text?.body || '', user);

    case 'interactive':
      return this.parseInteractiveMessage(interactive, user);

    case 'button':
      return this.parseButtonMessage(button, user);

    default:
      return null;
    }
  }

  /**
   * Parse text message for action keywords
   */
  parseTextMessage(text, user) {
    const lowerText = text.toLowerCase().trim();

    // Simple keyword mapping - expand as needed
    if (lowerText.includes('birth chart') || lowerText.includes('kundli') || lowerText === 'birth') {
      return 'show_birth_chart';
    }

    if (lowerText.includes('horoscope') || lowerText.includes('daily') || lowerText === '1') {
      return 'get_daily_horoscope';
    }

    if (lowerText.includes('compatibility') || lowerText.includes('match') || lowerText === '3') {
      return 'initiate_compatibility_flow';
    }

    // If no specific action detected, return null to use fallback
    return null;
  }

  /**
   * Parse interactive message (buttons/lists)
   */
  parseInteractiveMessage(interactive, user) {
    if (interactive?.button_reply?.id) {
      return interactive.button_reply.id;
    }

    if (interactive?.list_reply?.id) {
      return interactive.list_reply.id;
    }

    return null;
  }

  /**
   * Parse button message
   */
  parseButtonMessage(button, user) {
    if (button?.payload) {
      return button.payload;
    }

    return null;
  }
}

// Create singleton instance
const messageRouter = new MessageRouter();

/**
 * Get user's preferred language with fallback detection
 * @param {Object} user - User object
 * @param {string} phoneNumber - Phone number for detection
 * @returns {string} Language code
 */
const getUserLanguage = (user, phoneNumber) => {
  if (user && user.preferredLanguage) {
    return user.preferredLanguage;
  }
  return translationService.detectLanguage(phoneNumber);
};

/**
 * Process incoming WhatsApp message and generate appropriate response
 * @param {Object} message - WhatsApp message object
 * @param {Object} value - WhatsApp webhook value object
 */
const processIncomingMessage = async(message, value) => {
  const { from, id, timestamp, type } = message;
  const phoneNumber = from;

  try {
    logger.info(`📞 Processing message from ${phoneNumber} (Type: ${type})`);

    // Validate message structure
    if (!message || !from) {
      logger.warn('⚠️ Invalid message structure received');
      return;
    }

    // Validate required environment variables
    if (
      !process.env.W1_WHATSAPP_ACCESS_TOKEN ||
      !process.env.W1_WHATSAPP_PHONE_NUMBER_ID
    ) {
      logger.error('❌ Missing required WhatsApp environment variables');
      return;
    }

    // Get or create user
    let user = await getUserByPhone(phoneNumber);
    if (!user) {
      logger.info(`🆕 New user detected: ${phoneNumber}`);
      user = await createUser(phoneNumber);
      // Immediately start onboarding for new users using the modular engine
      await processFlowMessage(message, user, 'onboarding');
      return; // Exit after starting onboarding
    }

    // If user profile is not complete, continue onboarding flow using the modular engine
    if (!user.profileComplete) {
      // For interactive messages during onboarding, handle them specially
      if (type === 'interactive') {
        // TODO: Handle interactive onboarding
      }
      await processFlowMessage(message, user, 'onboarding');
      return; // Exit after processing onboarding step
    }

    // Try to route to a specific action based on message content
    const actionId = messageRouter.parseActionFromMessage(message, user);

    if (actionId) {
      await messageRouter.routeToAction(actionId, phoneNumber, user, message);
    } else {
      // Fallback to generic response if no specific action found
      await handleFallbackMessage(message, user, phoneNumber);
    }

    // Update user's last interaction timestamp
    user.lastInteraction = new Date();
    await user.save();
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    logger.error(`❌ Error processing message from ${phoneNumber}: ${errorMsg}`);
    await sendMessage(
      phoneNumber,
      'Sorry, there was an error processing your message. Please try again.',
      'text'
    );
  }
};

/**
 * Handle messages that don't map to specific actions (fallback)
 */
const handleFallbackMessage = async(message, user, phoneNumber) => {
  const userLanguage = getUserLanguage(user, phoneNumber);

  // Send main menu as fallback
  const mainMenu = await getTranslatedMenu('main_menu', userLanguage);
  if (mainMenu) {
    await sendMessage(phoneNumber, mainMenu, 'interactive');
  } else {
    await sendMessage(
      phoneNumber,
      'Welcome! Please use the menu options to explore our astrology services.',
      'text'
    );
  }
};

/**
 * Legacy function for backward compatibility
 * @param {Object} message - WhatsApp message object
 */
const processTextMessage = async(message, user) => {
  // This is handled by the router now
  await processIncomingMessage(message, {});
};


/**
 * Legacy function for backward compatibility
 * @param {Object} message - WhatsApp message object
 */
const processInteractiveMessage = async(message, user) => {
  // This is handled by the router now
  await processIncomingMessage(message, {});
};

/**
 * Legacy function for backward compatibility
 */
const processButtonMessage = async(message, user) => {
  await processIncomingMessage(message, {});
};

/**
 * Legacy function for backward compatibility
 */
const processMediaMessage = async(message, user) => {
  await processIncomingMessage(message, {});
};

/**
 * Legacy function for backward compatibility
 */
const processButtonReply = async(phoneNumber, buttonId, title, user) => {
  // Route button replies to actions
  await messageRouter.routeToAction(buttonId, phoneNumber, user, null);
};

module.exports = {
  processIncomingMessage,
  processTextMessage,
  processInteractiveMessage,
  processButtonMessage,
  processMediaMessage,
  processButtonReply,
  messageRouter,
  MessageRouter
};
