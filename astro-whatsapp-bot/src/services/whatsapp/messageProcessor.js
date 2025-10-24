const logger = require('../../utils/logger');
const { sendMessage } = require('./messageSender');
const { getUserByPhone, createUser, addBirthDetails, updateUserProfile, getUserSession, setUserSession, deleteUserSession } = require('../../models/userModel');
const { generateAstrologyResponse } = require('../astrology/astrologyEngine');
const { processFlowMessage } = require('../../conversation/conversationEngine');
const { getMenu } = require('../../conversation/menuLoader');
const paymentService = require('../payment/paymentService');
const vedicCalculator = require('../astrology/vedicCalculator');

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
      await processFlowMessage(message, user, 'onboarding');
      return; // Exit after processing onboarding step
    }

    // Process different message types for existing and complete users
    switch (type) {
    case 'text':
      await processTextMessage(message, user);
      break;
    case 'interactive':
      await processInteractiveMessage(message, user);
      break;
    case 'button':
      await processButtonMessage(message, user);
      break;
    case 'image':
    case 'video':
    case 'audio':
    case 'document':
      await processMediaMessage(message, user);
      break;
    default:
      logger.warn(`⚠️ Unsupported message type: ${type}`);
      await sendUnsupportedMessageTypeResponse(phoneNumber);
    }

    // Update user's last interaction timestamp
    user.lastInteraction = new Date();
    await updateUserProfile(phoneNumber, { lastInteraction: user.lastInteraction });
  } catch (error) {
    logger.error(`❌ Error processing message from ${phoneNumber}:`, error);
    await sendErrorMessage(phoneNumber, error.message);
  }
};

/**
 * Process text messages
 * @param {Object} message - Text message object
 * @param {Object} user - User object
 */
const processTextMessage = async(message, user) => {
  const { from, text } = message;
  const phoneNumber = from;
  const messageText = text.body;

  logger.info(`💬 Text message from ${phoneNumber}: ${messageText}`);

  // Check for compatibility requests with birth dates
  const compatibilityMatch = messageText.match(/(\d{2}\/\d{2}\/\d{4})/);
  if (compatibilityMatch && (messageText.toLowerCase().includes('compatibility') || messageText.toLowerCase().includes('match'))) {
    await handleCompatibilityRequest(phoneNumber, user, compatibilityMatch[1]);
    return;
  }

  // Check for subscription requests
  if (messageText.toLowerCase().includes('subscribe') || messageText.toLowerCase().includes('upgrade')) {
    if (messageText.toLowerCase().includes('essential')) {
      await handleSubscriptionRequest(phoneNumber, user, 'essential');
    } else if (messageText.toLowerCase().includes('premium')) {
      await handleSubscriptionRequest(phoneNumber, user, 'premium');
    } else {
      await sendMessage(phoneNumber, '💳 *Subscription Plans*\n\nWhich plan would you like to subscribe to?\n\n⭐ *Essential* - ₹230/month\n💎 *Premium* - ₹299/month\n\nJust reply with "Essential" or "Premium"!');
    }
    return;
  }

  // Generate astrology response based on user input
  const response = await generateAstrologyResponse(messageText, user);

  // If a specific response isn't generated, offer an interactive menu
  if (!response || response.startsWith('Thank you for your message')) {
    const mainMenu = getMenu('main_menu');
    if (mainMenu) {
      const buttons = mainMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(phoneNumber, { type: 'button', body: mainMenu.body, buttons }, 'interactive');
    } else {
      logger.warn('⚠️ Main menu configuration not found.');
      await sendMessage(phoneNumber, 'I\'m sorry, I\'m having trouble loading the menu options. Please try again later.');
    }
  } else {
    // Send response back to user
    await sendMessage(phoneNumber, response);
  }
};

/**
 * Process interactive messages (buttons, lists, etc.)
 * @param {Object} message - Interactive message object
 * @param {Object} user - User object
 */
const processInteractiveMessage = async(message, user) => {
  const { from, interactive } = message;
  const phoneNumber = from;
  const { type } = interactive;

  logger.info(`🖱️ Interactive message from ${phoneNumber} (Type: ${type})`);

  switch (type) {
  case 'button_reply':
    const { button_reply } = interactive;
    const { id: buttonId, title } = button_reply;
    logger.info(`🟢 Button reply from ${phoneNumber}: ${title} (${buttonId})`);
    // Process button reply
    await processButtonReply(phoneNumber, buttonId, title, user);
    break;
  case 'list_reply':
    const { list_reply } = interactive;
    const { id: listId, title: listTitle, description } = list_reply;
    logger.info(`📋 List reply from ${phoneNumber}: ${listTitle} (${listId})`);
    // Process list reply
    await processListReply(phoneNumber, listId, listTitle, description, user);
    break;
  default:
    logger.warn(`⚠️ Unsupported interactive type: ${type}`);
    await sendUnsupportedInteractiveTypeResponse(phoneNumber);
  }
};

/**
 * Process button messages
 * @param {Object} message - Button message object
 * @param {Object} user - User object
 */
const processButtonMessage = async(message, user) => {
  const { from, button } = message;
  const phoneNumber = from;
  const { payload, text } = button;

  logger.info(`🔘 Button message from ${phoneNumber}: ${text} (${payload})`);

  // Process button payload
  await processButtonPayload(phoneNumber, payload, text, user);
};

/**
 * Process media messages
 * @param {Object} message - Media message object
 * @param {Object} user - User object
 */
const processMediaMessage = async(message, user) => {
  const { from, type, [type]: media } = message;
  const phoneNumber = from;
  const { id, caption } = media;

  logger.info(`📸 Media message from ${phoneNumber}: ${type} (${id})`);

  // Send acknowledgment for media message
  await sendMediaAcknowledgment(phoneNumber, type, caption);
};

/**
 * Process button reply
 * @param {string} phoneNumber - User's phone number
 * @param {string} buttonId - Button ID
 * @param {string} title - Button title
 * @param {Object} user - User object
 */
const processButtonReply = async(phoneNumber, buttonId, title, user) => {
  const mainMenu = getMenu('main_menu');
  if (mainMenu) {
    const button = mainMenu.buttons.find(btn => btn.id === buttonId);
    if (button && button.action) {
      await executeMenuAction(phoneNumber, user, button.action);
    } else {
      logger.warn(`⚠️ No action defined for button ID: ${buttonId}`);
      await sendMessage(phoneNumber, `You selected: ${title}. I'm not sure how to process that yet.`);
    }
  } else {
    logger.warn('⚠️ Main menu configuration not found when processing button reply.');
    await sendMessage(phoneNumber, `You selected: ${title}. I'm having trouble processing your request.`);
  }
};

/**
 * Executes an action based on menu selection.
 * @param {string} phoneNumber - User's phone number.
 * @param {Object} user - User object.
 * @param {string} action - The action to execute (e.g., 'get_daily_horoscope').
 */
const executeMenuAction = async(phoneNumber, user, action) => {
  let response = null;
  switch (action) {
  case 'get_daily_horoscope':
    if (!user.birthDate) {
      response = 'I\'d love to give you a personalized daily horoscope! Please complete your profile first by providing your birth date.';
    } else {
      // Start daily horoscope conversation flow
      const flowStarted = await processFlowMessage({ type: 'text', text: { body: 'start' } }, user, 'daily_horoscope');
      if (flowStarted) {
        return null; // Flow started, don't send additional response
      } else {
        response = 'Sorry, I couldn\'t start the horoscope flow right now.';
      }
    }
    break;
  case 'initiate_compatibility_flow':
    if (!user.birthDate) {
      response = 'I need your birth details first. Please complete the onboarding process.';
    } else {
      // Start compatibility conversation flow
      const flowStarted = await processFlowMessage({ type: 'text', text: { body: 'start' } }, user, 'compatibility');
      if (flowStarted) {
        return null; // Flow started, don't send additional response
      } else {
        response = 'Sorry, I couldn\'t start the compatibility flow right now.';
      }
    }
    break;
  case 'show_user_profile':
    const subscriptionStatus = paymentService.getSubscriptionStatus(user);
    response = `📋 *Your Profile*\n\nName: ${user.name || 'Not set'}\nBirth Date: ${user.birthDate || 'Not set'}\nBirth Time: ${user.birthTime || 'Not set'}\nBirth Place: ${user.birthPlace || 'Not set'}\n\n💳 *Subscription*\nPlan: ${subscriptionStatus.planName}\nStatus: ${subscriptionStatus.isActive ? 'Active' : 'Inactive'}\n${subscriptionStatus.expiryDate ? `Expires: ${new Date(subscriptionStatus.expiryDate).toDateString()}` : ''}\n\n⭐ Loyalty Points: ${user.loyaltyPoints || 0}\n\nWhat would you like to update or explore?`;
    break;
  case 'show_subscription_plans':
    // Start subscription plans conversation flow
    const flowStarted = await processFlowMessage({ type: 'text', text: { body: 'start' } }, user, 'subscription_plans');
    if (flowStarted) {
      return null; // Flow started, don't send additional response
    } else {
      response = 'Sorry, I couldn\'t start the subscription flow right now.';
    }
    break;
  case 'upgrade_to_essential':
    try {
      const result = await paymentService.processSubscription(phoneNumber, 'essential');
      response = result.message;
    } catch (error) {
      response = '❌ Sorry, I couldn\'t process your subscription right now. Please try again later or contact support.';
    }
    break;
  case 'upgrade_to_premium':
    try {
      const result = await paymentService.processSubscription(phoneNumber, 'premium');
      response = result.message;
    } catch (error) {
      response = '❌ Sorry, I couldn\'t process your subscription right now. Please try again later or contact support.';
    }
    break;
  default:
    logger.warn(`⚠️ Unknown menu action: ${action}`);
    response = `I'm sorry, I don't know how to perform the action: ${action} yet.`;
    break;
  }
  if (response) {
    await sendMessage(phoneNumber, response);
  }
};

/**
 * Process list reply
 * @param {string} phoneNumber - User's phone number
 * @param {string} listId - List ID
 * @param {string} title - List title
 * @param {string} description - List description
 * @param {Object} user - User object
 */
const processListReply = async(phoneNumber, listId, title, description, user) => {
  // Generate response based on list selection
  const response = `You selected: ${title}\nDescription: ${description}\n\nI'll process your request shortly!`;
  await sendMessage(phoneNumber, response);
};

/**
 * Process button payload
 * @param {string} phoneNumber - User's phone number
 * @param {string} payload - Button payload
 * @param {string} text - Button text
 * @param {Object} user - User object
 */
const processButtonPayload = async(phoneNumber, payload, text, user) => {
  // Generate response based on button payload
  const response = `Button pressed: ${text}\nPayload: ${payload}\n\nI'll process your request shortly!`;
  await sendMessage(phoneNumber, response);
};

/**
 * Send unsupported message type response
 * @param {string} phoneNumber - User's phone number
 */
const sendUnsupportedMessageTypeResponse = async phoneNumber => {
  const response = 'I\'m sorry, I don\'t support that type of message yet. Please send a text message with your question!';
  await sendMessage(phoneNumber, response);
};

/**
 * Send unsupported interactive type response
 * @param {string} phoneNumber - User's phone number
 */
const sendUnsupportedInteractiveTypeResponse = async phoneNumber => {
  const response = 'I\'m sorry, I don\'t support that type of interactive message yet. Please try sending a text message!';
  await sendMessage(phoneNumber, response);
};

/**
 * Send media acknowledgment
 * @param {string} phoneNumber - User's phone number
 * @param {string} type - Media type
 * @param {string} caption - Media caption
 */
const sendMediaAcknowledgment = async(phoneNumber, type, caption) => {
  const response = `Thank you for sending that ${type}${caption ? ` with caption: "${caption}"` : ''}! I'll process it shortly.`;
  await sendMessage(phoneNumber, response);
};

/**
 * Send error message to user
 * @param {string} phoneNumber - User's phone number
 * @param {string} errorMessage - Error message
 */
const sendErrorMessage = async(phoneNumber, errorMessage) => {
  const response = 'I\'m sorry, I encountered an error processing your message. Please try again later!';
  await sendMessage(phoneNumber, response);
  logger.error(`❌ Error sent to ${phoneNumber}: ${errorMessage}`);
};

/**
 * Handle compatibility request with birth date
 * @param {string} phoneNumber - User's phone number
 * @param {Object} user - User object
 * @param {string} otherBirthDate - Other person's birth date
 */
const handleCompatibilityRequest = async(phoneNumber, user, otherBirthDate) => {
  try {
    if (!user.birthDate) {
      await sendMessage(phoneNumber, 'I need your birth date first to check compatibility. Please complete your profile by providing your birth details.');
      return;
    }

    const userSign = vedicCalculator.calculateSunSign(user.birthDate);
    const otherSign = vedicCalculator.calculateSunSign(otherBirthDate);

    const compatibility = vedicCalculator.checkCompatibility(userSign, otherSign);

    let response = `💕 *Compatibility Analysis*\n\n*Your Sign:* ${userSign}\n*Their Sign:* ${otherSign}\n\n*Compatibility:* ${compatibility.compatibility}\n\n${compatibility.description}`;

    // Check subscription limits
    const benefits = paymentService.getSubscriptionBenefits(user);
    if (benefits.maxCompatibilityChecks !== Infinity && user.compatibilityChecks >= benefits.maxCompatibilityChecks) {
      response += `\n\n⚠️ *Compatibility Check Limit Reached*\n\nYou've used ${user.compatibilityChecks} of your ${benefits.maxCompatibilityChecks} free compatibility checks. Upgrade to Premium for unlimited compatibility analysis!`;
    }

    await sendMessage(phoneNumber, response);

    // Increment compatibility check counter
    await require('../../models/userModel').incrementCompatibilityChecks(phoneNumber);
  } catch (error) {
    logger.error('Error handling compatibility request:', error);
    await sendMessage(phoneNumber, 'I\'m sorry, I couldn\'t process the compatibility request right now. Please try again later.');
  }
};

/**
 * Handle subscription request
 * @param {string} phoneNumber - User's phone number
 * @param {Object} user - User object
 * @param {string} planId - Subscription plan ID
 */
const handleSubscriptionRequest = async(phoneNumber, user, planId) => {
  try {
    const result = await paymentService.processSubscription(phoneNumber, planId);
    await sendMessage(phoneNumber, result.message);

    // Send welcome message based on plan
    const plan = paymentService.getPlan(planId);
    let welcomeMessage = `\n\n🎉 *Welcome to ${plan.name}!*\n\nYour new features:\n`;
    plan.features.forEach(feature => {
      welcomeMessage += `• ${feature}\n`;
    });
    welcomeMessage += '\nWhat would you like to explore first?';

    await sendMessage(phoneNumber, welcomeMessage);
  } catch (error) {
    logger.error('Error handling subscription request:', error);
    await sendMessage(phoneNumber, '❌ Sorry, I couldn\'t process your subscription right now. Please try again later or contact support.');
  }
};

module.exports = {
  processIncomingMessage,
  processTextMessage,
  processInteractiveMessage,
  processButtonMessage,
  processMediaMessage,
  processButtonReply,
  processListReply,
  processButtonPayload,
  sendUnsupportedMessageTypeResponse,
  sendUnsupportedInteractiveTypeResponse,
  sendMediaAcknowledgment,
  sendErrorMessage,
  handleCompatibilityRequest,
  handleSubscriptionRequest
};
