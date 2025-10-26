const logger = require('../../utils/logger');
const { sendMessage, sendListMessage } = require('./messageSender');
const { generateAstrologyResponse } = require('../astrology/astrologyEngine');
const { processFlowMessage } = require('../../conversation/conversationEngine');
const { getMenu } = require('../../conversation/menuLoader');
const paymentService = require('../payment/paymentService');
const vedicCalculator = require('../astrology/vedicCalculator');
const {
  getUserByPhone,
  createUser,
  updateUserProfile,
  getUserSession,
  deleteUserSession,
  incrementCompatibilityChecks
} = require('../../models/userModel');
const { getFlow, executeFlowAction } = require('../../conversation/conversationEngine');
const { generateTarotReading } = require('../astrology/tarotReader');
const { generatePalmistryAnalysis } = require('../astrology/palmistryReader');
const { generateKabbalisticChart } = require('../astrology/kabbalisticReader');
const { generateMayanChart } = require('../astrology/mayanReader');
const { generateCelticChart } = require('../astrology/celticReader');
const { generateIChingReading } = require('../astrology/ichingReader');
const { generateAstrocartography } = require('../astrology/astrocartographyReader');
const numerologyService = require('../astrology/numerologyService');

// Mapping for list reply IDs to actions
const listActionMapping = {
  btn_daily_horoscope: 'get_daily_horoscope',
  btn_birth_chart: 'show_birth_chart',
  btn_compatibility: 'initiate_compatibility_flow',
  btn_tarot: 'get_tarot_reading',
  btn_iching: 'get_iching_reading',
  btn_palmistry: 'get_palmistry_analysis',
  btn_nadi: 'show_nadi_flow',
  btn_kabbalistic: 'get_kabbalistic_analysis',
  btn_mayan: 'get_mayan_analysis',
  btn_celtic: 'get_celtic_analysis',
  btn_horary: 'get_horary_reading',
  btn_chinese: 'show_chinese_flow',
  btn_numerology: 'get_numerology_report',
  btn_astrocartography: 'get_astrocartography_analysis'
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
        await processInteractiveMessage(message, user);
        return;
      }
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
    await updateUserProfile(phoneNumber, {
      lastInteraction: user.lastInteraction
    });
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
  if (
    compatibilityMatch &&
    (messageText.toLowerCase().includes('compatibility') ||
      messageText.toLowerCase().includes('match'))
  ) {
    await handleCompatibilityRequest(phoneNumber, user, compatibilityMatch[1]);
    return;
  }

  // Check for subscription requests
  if (
    messageText.toLowerCase().includes('subscribe') ||
    messageText.toLowerCase().includes('upgrade')
  ) {
    if (messageText.toLowerCase().includes('essential')) {
      await handleSubscriptionRequest(phoneNumber, user, 'essential');
    } else if (messageText.toLowerCase().includes('premium')) {
      await handleSubscriptionRequest(phoneNumber, user, 'premium');
    } else {
      await sendMessage(
        phoneNumber,
        '💳 *Subscription Plans*\n\nWhich plan would you like to subscribe to?\n\n⭐ *Essential* - ₹230/month\n💎 *Premium* - ₹299/month\n\nJust reply with "Essential" or "Premium"!'
      );
    }
    return;
  }

  // Check for numerology report request
  if (messageText.toLowerCase() === 'numerology report') {
    await processFlowMessage(message, user, 'numerology_flow');
    return;
  }

  // Check for menu keywords and redirect to menu actions
  const lowerMessage = messageText.toLowerCase();
  if (lowerMessage.includes('horoscope') || lowerMessage.includes('daily')) {
    await executeMenuAction(phoneNumber, user, 'get_daily_horoscope');
    return;
  } else if (lowerMessage.includes('chart') || lowerMessage.includes('birth')) {
    await executeMenuAction(phoneNumber, user, 'show_user_profile');
    return;
  } else if (
    lowerMessage.includes('compatibility') ||
    lowerMessage.includes('match')
  ) {
    await executeMenuAction(phoneNumber, user, 'initiate_compatibility_flow');
    return;
  } else if (
    lowerMessage.includes('subscription') ||
    lowerMessage.includes('plan')
  ) {
    await executeMenuAction(phoneNumber, user, 'show_subscription_plans');
    return;
  }

  // Generate astrology response based on user input
  const response = await generateAstrologyResponse(messageText, user);

  // Always send responses with interactive buttons for better user experience
  const mainMenu = getMenu('main_menu');
  if (mainMenu) {
    const buttons = mainMenu.buttons.map(button => ({
      type: 'reply',
      reply: { id: button.id, title: button.title }
    }));

    // Combine the response with the menu body
    const combinedBody = response ?
      `${response}\n\n${mainMenu.body}` :
      mainMenu.body;

    await sendMessage(
      phoneNumber,
      { type: 'button', body: combinedBody, buttons },
      'interactive'
    );
  } else {
    logger.warn('⚠️ Main menu configuration not found.');
    // Fallback to sending response without buttons if menu fails
    await sendMessage(
      phoneNumber,
      response ||
        'I\'m sorry, I\'m having trouble loading the menu options. Please try again later.'
    );
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
    logger.info(
      `🟢 Button reply from ${phoneNumber}: ${title} (${buttonId})`
    );
    // Process button reply
    await processButtonReply(phoneNumber, buttonId, title, user);
    break;
  case 'list_reply':
    const { list_reply } = interactive;
    const { id: listId, title: listTitle, description } = list_reply;
    logger.info(
      `📋 List reply from ${phoneNumber}: ${listTitle} (${listId})`
    );
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
  // Handle clarification buttons specially (they start with 'year_' or 'time_')
  if (buttonId.startsWith('year_') || buttonId.startsWith('time_')) {
    // Get user session to determine current flow

    const session = await getUserSession(phoneNumber);

    // Extract the resolved value from button ID
    let resolvedValue;
    if (buttonId.startsWith('year_')) {
      resolvedValue = buttonId.split('_')[1]; // e.g., '1990' from 'year_1990'
    } else if (buttonId.startsWith('time_')) {
      const parts = buttonId.split('_');
      const period = parts[1]; // 'am' or 'pm'
      const timeStr = parts[2]; // e.g., '0230'
      const hours24 =
        period === 'pm' && parseInt(timeStr.substring(0, 2)) !== 12 ?
          parseInt(timeStr.substring(0, 2)) + 12 :
          period === 'am' && parseInt(timeStr.substring(0, 2)) === 12 ?
            0 :
            parseInt(timeStr.substring(0, 2));
      resolvedValue = `${hours24.toString().padStart(2, '0')}:${timeStr.substring(2)}`;
    }

    // Process the resolved value as if it was text input
    const currentFlow =
      session?.currentFlow && session.currentFlow !== 'undefined' ?
        session.currentFlow :
        'onboarding';
    await processFlowMessage(
      { type: 'text', text: { body: resolvedValue } },
      user,
      currentFlow
    );
    return;
  }

  // Check if user has active conversation session
  const { getUserSession } = require('../../models/userModel');
  const session = await getUserSession(phoneNumber);

  if (
    session &&
    session.currentFlow &&
    session.currentFlow !== 'undefined' &&
    session.currentFlow !== undefined
  ) {
    // Process as flow button reply
    await processFlowButtonReply(phoneNumber, buttonId, user, session);
  } else {
    // Process as main menu button reply
    const mainMenu = getMenu('main_menu');
    if (mainMenu) {
      const button = mainMenu.buttons.find(btn => btn.id === buttonId);
      if (button && button.action) {
        logger.info(
          `🎯 Executing main menu action: ${button.action} for button ${buttonId}`
        );
        try {
          await executeMenuAction(phoneNumber, user, button.action);
          logger.info(
            `✅ Main menu action ${button.action} completed successfully`
          );
        } catch (error) {
          logger.error(
            `❌ Error executing main menu action ${button.action}:`,
            error
          );
          await sendMessage(
            phoneNumber,
            'Sorry, I encountered an error processing your request. Please try again.'
          );
        }
      } else {
        logger.warn(
          `⚠️ No action defined for button ID: ${buttonId} in main menu`
        );
        await sendMessage(
          phoneNumber,
          `You selected: ${title}. I'm not sure how to process that yet.`
        );
      }
    } else {
      logger.warn(
        '⚠️ Main menu configuration not found when processing button reply.'
      );
      await sendMessage(
        phoneNumber,
        `You selected: ${title}. I'm having trouble processing your request.`
      );
    }
  }
};

/**
 * Process button reply for conversation flows
 * @param {string} phoneNumber - User's phone number
 * @param {string} buttonId - Button ID
 * @param {Object} user - User object
 * @param {Object} session - User session
 */
const processFlowButtonReply = async(phoneNumber, buttonId, user, session) => {
  const flow = getFlow(session.currentFlow);
  if (!flow) {
    logger.error(`❌ Flow '${session.currentFlow}' not found for button reply`);
    // Clear the invalid session and fall back to main menu processing
    const { deleteUserSession } = require('../../models/userModel');
    await deleteUserSession(phoneNumber);
    await sendMessage(
      phoneNumber,
      'I\'m sorry, I encountered an error. Let\'s start over.'
    );
    return;
  }

  // Handle clarification buttons specially (they start with 'year_' or 'time_')
  if (buttonId.startsWith('year_') || buttonId.startsWith('time_')) {
    // Extract the resolved value from button ID
    let resolvedValue;
    if (buttonId.startsWith('year_')) {
      resolvedValue = buttonId.split('_')[1]; // e.g., '1990' from 'year_1990'
    } else if (buttonId.startsWith('time_')) {
      const parts = buttonId.split('_');
      const period = parts[1]; // 'am' or 'pm'
      const timeStr = parts[2]; // e.g., '0230'
      const hours24 =
        period === 'pm' && parseInt(timeStr.substring(0, 2)) !== 12 ?
          parseInt(timeStr.substring(0, 2)) + 12 :
          period === 'am' && parseInt(timeStr.substring(0, 2)) === 12 ?
            0 :
            parseInt(timeStr.substring(0, 2));
      resolvedValue = `${hours24.toString().padStart(2, '0')}:${timeStr.substring(2)}`;
    }

    // Process the resolved value as text input
    const mockMessage = { type: 'text', text: { body: resolvedValue } };
    await processFlowMessage(mockMessage, user, session.currentFlow);
    return;
  }

  const currentStep = flow.steps[session.currentStep];
  if (!currentStep || !currentStep.interactive) {
    logger.warn(
      `⚠️ Current step '${session.currentStep}' not interactive for button reply, clearing session to allow menu interactions (v2)`
    );
    // Clear the session and send main menu
    const { deleteUserSession } = require('../../models/userModel');
    await deleteUserSession(phoneNumber);
    const mainMenu = getMenu('main_menu');
    if (mainMenu) {
      const buttons = mainMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: mainMenu.body, buttons },
        'interactive'
      );
    } else {
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I encountered an error. Please try again.'
      );
    }
    return;
  }

  // Map button ID to value using button_mappings
  const mappedValue = currentStep.interactive.button_mappings?.[buttonId];
  if (!mappedValue) {
    logger.warn(`⚠️ No mapping found for button ID: ${buttonId}`);
    await sendMessage(
      phoneNumber,
      'I\'m sorry, I didn\'t understand that selection. Please try again.'
    );
    return;
  }

  // Process the mapped value as text input
  const mockMessage = { type: 'text', text: { body: mappedValue } };
  await processFlowMessage(mockMessage, user, session.currentFlow);
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
      response =
          'I\'d love to give you a personalized daily horoscope! Please complete your profile first by providing your birth date.';
    } else {
      // Start daily horoscope conversation flow
      const flowStarted = await processFlowMessage(
        { type: 'text', text: { body: 'start' } },
        user,
        'daily_horoscope'
      );
      if (flowStarted) {
        return null; // Flow started, don't send additional response
      } else {
        response = 'Sorry, I couldn\'t start the horoscope flow right now.';
      }
    }
    break;
  case 'initiate_compatibility_flow':
    if (!user.birthDate) {
      response =
          'I need your birth details first. Please complete the onboarding process.';
    } else {
      // Start compatibility conversation flow
      const flowStarted = await processFlowMessage(
        { type: 'text', text: { body: 'start' } },
        user,
        'compatibility'
      );
      if (flowStarted) {
        return null; // Flow started, don't send additional response
      } else {
        response =
            'Sorry, I couldn\'t start the compatibility flow right now.';
      }
    }
    break;
  case 'show_user_profile':
    const subscriptionStatus = paymentService.getSubscriptionStatus(user);
    response = `📋 *Your Profile*\n\nName: ${user.name || 'Not set'}\nBirth Date: ${user.birthDate || 'Not set'}\nBirth Time: ${user.birthTime || 'Not set'}\nBirth Place: ${user.birthPlace || 'Not set'}\n\n💳 *Subscription*\nPlan: ${subscriptionStatus.planName}\nStatus: ${subscriptionStatus.isActive ? 'Active' : 'Inactive'}\n${subscriptionStatus.expiryDate ? `Expires: ${new Date(subscriptionStatus.expiryDate).toDateString()}` : ''}\n\n⭐ Loyalty Points: ${user.loyaltyPoints || 0}\n\nWhat would you like to explore next?`;

    await sendMessage(phoneNumber, response);

    // Send main menu
    const menu = getMenu('main_menu');
    if (menu) {
      const buttons = menu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: menu.body, buttons },
        'interactive'
      );
    }
    return null; // Handled, don't send additional response
    break;
  case 'show_birth_chart':
    try {
      const chartData = vedicCalculator.generateCompleteVedicAnalysis({
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace,
        name: user.name
      });

      await sendMessage(phoneNumber, chartData.comprehensiveDescription);

      // Send main menu
      const menu = getMenu('main_menu');
      if (menu) {
        const buttons = menu.buttons.map(button => ({
          type: 'reply',
          reply: { id: button.id, title: button.title }
        }));
        await sendMessage(
          phoneNumber,
          { type: 'button', body: menu.body, buttons },
          'interactive'
        );
      }
      return null; // Handled, don't send additional response
    } catch (error) {
      logger.error('Error showing birth chart:', error);
      response =
          'I\'m having trouble generating your birth chart right now. Please try again later.';
      await sendMessage(phoneNumber, response);
    }
    return null; // Handled, don't send additional response
    break;
  case 'show_subscription_plans':
    // Start subscription plans conversation flow
    const flowStarted = await processFlowMessage(
      { type: 'text', text: { body: 'start' } },
      user,
      'subscription_plans'
    );
    if (flowStarted) {
      return null; // Flow started, don't send additional response
    } else {
      response = 'Sorry, I couldn\'t start the subscription flow right now.';
    }
    break;
  case 'upgrade_to_essential':
    try {
      const region = paymentService.detectRegion(phoneNumber);
      const result = await paymentService.processSubscription(
        phoneNumber,
        'essential',
        region,
        'card'
      );
      response = result.message;
    } catch (error) {
      response =
          '❌ Sorry, I couldn\'t process your subscription right now. Please try again later or contact support.';
    }
    break;
  case 'upgrade_to_premium':
    try {
      const region = paymentService.detectRegion(phoneNumber);
      const result = await paymentService.processSubscription(
        phoneNumber,
        'premium',
        region,
        'card'
      );
      response = result.message;
    } catch (error) {
      response =
          '❌ Sorry, I couldn\'t process your subscription right now. Please try again later or contact support.';
    }
    break;
  case 'get_tarot_reading':
    try {
      const reading = generateTarotReading('single');
      response = `🔮 *Tarot Reading*\n\n${reading.cards[0].name}\n${reading.cards[0].meaning}\n\n*Advice:* ${reading.cards[0].advice || 'Trust your intuition'}`;
    } catch (error) {
      logger.error('Error getting tarot reading:', error);
      response =
          'I\'m having trouble connecting with the tarot cards right now.';
    }
    break;
  case 'get_palmistry_analysis':
    try {
      const analysis = generatePalmistryAnalysis();
      response = `🤲 *Palmistry Analysis*\n\n*Hand Type:* ${analysis.handType}\n*Personality:* ${analysis.personality}\n\n*Life Path:* ${analysis.lifePath}`;
    } catch (error) {
      logger.error('Error getting palmistry analysis:', error);
      response = 'I\'m having trouble reading the palm lines right now.';
    }
    break;
  case 'get_kabbalistic_analysis':
    if (!user.birthDate) {
      response = 'I need your birth date for Kabbalistic analysis.';
      break;
    }
    try {
      const analysis = generateKabbalisticChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });
      response = `${analysis.kabbalisticDescription.substring(0, 1000)}...`; // Truncate for WhatsApp
    } catch (error) {
      logger.error('Error getting Kabbalistic analysis:', error);
      response =
          'I\'m having trouble connecting with the Tree of Life energies.';
    }
    break;
  case 'get_mayan_analysis':
    if (!user.birthDate) {
      response = 'I need your birth date for Mayan calendar analysis.';
      break;
    }
    try {
      const analysis = generateMayanChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });
      response = `${analysis.mayanDescription.substring(0, 1000)}...`; // Truncate for WhatsApp
    } catch (error) {
      logger.error('Error getting Mayan analysis:', error);
      response =
          'I\'m having trouble connecting with the Mayan calendar energies.';
    }
    break;
  case 'get_celtic_analysis':
    if (!user.birthDate) {
      response = 'I need your birth date for Celtic tree sign analysis.';
      break;
    }
    try {
      const analysis = generateCelticChart({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        name: user.name
      });
      response = `${analysis.celticDescription.substring(0, 1000)}...`; // Truncate for WhatsApp
    } catch (error) {
      logger.error('Error getting Celtic analysis:', error);
      response =
          'I\'m having trouble connecting with the Celtic forest energies.';
    }
    break;
  case 'get_iching_reading':
    try {
      const reading = generateIChingReading();
      response = `🔮 *I Ching Reading*\n\n*Hexagram:* ${reading.primaryHexagram.number} - ${reading.primaryHexagram.name}\n\n*Judgment:* ${reading.primaryHexagram.judgment.substring(0, 200)}...`;
    } catch (error) {
      logger.error('Error getting I Ching reading:', error);
      response = 'I\'m having trouble consulting the I Ching oracle.';
    }
    break;
  case 'get_astrocartography_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for astrocartography.';
      break;
    }
    try {
      const analysis = generateAstrocartography({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'London, UK',
        name: user.name
      });
      response = `${analysis.astrocartographyDescription.substring(0, 1000)}...`; // Truncate for WhatsApp
    } catch (error) {
      logger.error('Error getting astrocartography analysis:', error);
      response = 'I\'m having trouble mapping the planetary lines.';
    }
    break;
  case 'get_horary_reading':
    response =
        'For horary astrology, please ask a specific question like "Horary: When will I find a job?" or "Horary: Will my relationship work out?"';
    break;
  case 'show_divination_menu':
    const divinationMenu = getMenu('divination_menu');
    if (divinationMenu) {
      const buttons = divinationMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: divinationMenu.body, buttons },
        'interactive'
      );
    }
    return null;
  case 'show_traditions_menu':
    const traditionsMenu = getMenu('traditions_menu');
    if (traditionsMenu) {
      const buttons = traditionsMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: traditionsMenu.body, buttons },
        'interactive'
      );
    }
    return null;
  case 'show_nadi_flow':
    if (!user.birthDate) {
      response =
          'For Nadi astrology, I need your complete birth details first.';
    } else {
      const flowStarted = await processFlowMessage(
        { type: 'text', text: { body: 'start' } },
        user,
        'nadi_flow'
      );
      if (flowStarted) {
        return null;
      } else {
        response = 'Sorry, I couldn\'t start the Nadi analysis right now.';
      }
    }
    break;
  case 'show_chinese_flow':
    if (!user.birthDate) {
      response =
          'For Chinese BaZi analysis, I need your birth details first.';
    } else {
      const flowStarted = await processFlowMessage(
        { type: 'text', text: { body: 'start' } },
        user,
        'chinese_flow'
      );
      if (flowStarted) {
        return null;
      } else {
        response = 'Sorry, I couldn\'t start the Chinese analysis right now.';
      }
    }
    break;
  case 'get_numerology_analysis':
    if (!user.birthDate || !user.name) {
      response =
          'For numerology analysis, I need your full name and birth date.';
    } else {
      try {
        const report = numerologyService.getNumerologyReport(
          user.birthDate,
          user.name
        );
        response = '🔢 *Numerology Analysis*\n\n';
        response += `*Life Path:* ${report.lifePath.number} - ${report.lifePath.interpretation}\n\n`;
        response += `*Expression:* ${report.expression.number} - ${report.expression.interpretation}\n\n`;
        response += `*Soul Urge:* ${report.soulUrge.number} - ${report.soulUrge.interpretation}`;
      } catch (error) {
        logger.error('Error getting numerology analysis:', error);
        response =
            'I\'m having trouble calculating your numerology right now.';
      }
    }
    break;
  case 'show_main_menu':
    const mainMenu = getMenu('main_menu');
    if (mainMenu) {
      const buttons = mainMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: mainMenu.body, buttons },
        'interactive'
      );
    }
    return null;
  case 'show_comprehensive_menu':
    const comprehensiveMenu = getMenu('comprehensive_menu');
    if (comprehensiveMenu) {
      await sendListMessage(
        phoneNumber,
        comprehensiveMenu.body,
        'Select Service',
        comprehensiveMenu.sections
      );
    }
    return null;
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
const processListReply = async(
  phoneNumber,
  listId,
  title,
  description,
  user
) => {
  logger.info(`📋 Processing list reply: ${listId} - ${title}`);

  // Find the action from the mapping
  const action = listActionMapping[listId];

  if (action) {
    await executeMenuAction(phoneNumber, user, action);
  } else {
    // Fallback response
    const response = `You selected: ${title}\nDescription: ${description}\n\nI'll process your request shortly!`;
    await sendMessage(phoneNumber, response);
  }
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
  const response =
    'I\'m sorry, I don\'t support that type of message yet. Please send a text message with your question!';
  await sendMessage(phoneNumber, response);
};

/**
 * Send unsupported interactive type response
 * @param {string} phoneNumber - User's phone number
 */
const sendUnsupportedInteractiveTypeResponse = async phoneNumber => {
  const response =
    'I\'m sorry, I don\'t support that type of interactive message yet. Please try sending a text message!';
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
  const response =
    'I\'m sorry, I encountered an error processing your message. Please try again later!';
  await sendMessage(phoneNumber, response);
  logger.error(`❌ Error sent to ${phoneNumber}: ${errorMessage}`);
};

/**
 * Handle compatibility request with birth date
 * @param {string} phoneNumber - User's phone number
 * @param {Object} user - User object
 * @param {string} otherBirthDate - Other person's birth date
 */
const handleCompatibilityRequest = async(
  phoneNumber,
  user,
  otherBirthDate
) => {
  try {
    if (!user.birthDate) {
      await sendMessage(
        phoneNumber,
        'I need your birth date first to check compatibility. Please complete your profile by providing your birth details.'
      );
      return;
    }

    const userSign = vedicCalculator.calculateSunSign(user.birthDate);
    const otherSign = vedicCalculator.calculateSunSign(otherBirthDate);

    const compatibility = vedicCalculator.checkCompatibility(
      userSign,
      otherSign
    );

    let response = `💕 *Compatibility Analysis*\n\n*Your Sign:* ${userSign}\n*Their Sign:* ${otherSign}\n\n*Compatibility:* ${compatibility.compatibility}\n\n${compatibility.description}`;

    // Check subscription limits
    const benefits = paymentService.getSubscriptionBenefits(user);
    if (
      benefits.maxCompatibilityChecks !== Infinity &&
      user.compatibilityChecks >= benefits.maxCompatibilityChecks
    ) {
      response += `\n\n⚠️ *Compatibility Check Limit Reached*\n\nYou've used ${user.compatibilityChecks} of your ${benefits.maxCompatibilityChecks} free compatibility checks. Upgrade to Premium for unlimited compatibility analysis!`;
    }

    await sendMessage(phoneNumber, response);

    // Increment compatibility check counter
    await incrementCompatibilityChecks(phoneNumber);
  } catch (error) {
    logger.error('Error handling compatibility request:', error);
    await sendMessage(
      phoneNumber,
      'I\'m sorry, I couldn\'t process the compatibility request right now. Please try again later.'
    );
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
    const region = paymentService.detectRegion(phoneNumber);
    const result = await paymentService.processSubscription(
      phoneNumber,
      planId,
      region,
      'card'
    );
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
    await sendMessage(
      phoneNumber,
      '❌ Sorry, I couldn\'t process your subscription right now. Please try again later or contact support.'
    );
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
