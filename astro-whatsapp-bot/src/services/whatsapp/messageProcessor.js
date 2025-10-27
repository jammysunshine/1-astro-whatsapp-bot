const logger = require('../../utils/logger');
const { sendMessage, sendListMessage } = require('./messageSender');
const { generateAstrologyResponse } = require('../astrology/astrologyEngine');
const translationService = require('../i18n/TranslationService');
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
const { getFlow } = require('../../conversation/flowLoader');
const { generateTarotReading } = require('../astrology/tarotReader');
const { generatePalmistryAnalysis } = require('../astrology/palmistryReader');
const kabbalisticReader = require('../astrology/kabbalisticReader');
const mayanReader = require('../astrology/mayanReader');
const celticReader = require('../astrology/celticReader');
const ichingReader = require('../astrology/ichingReader');
const { generateAstrocartography } = require('../astrology/astrocartographyReader');
const AgeHarmonicAstrologyReader = require('../astrology/ageHarmonicAstrology');
const numerologyService = require('../astrology/numerologyService');
const { VedicNumerology } = require('../astrology/vedicNumerology');
const { AyurvedicAstrology } = require('../astrology/ayurvedicAstrology');
const vedicNumerology = new VedicNumerology();
const ayurvedicAstrology = new AyurvedicAstrology();
const ageHarmonicReader = new AgeHarmonicAstrologyReader();

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

// Mapping for list reply IDs to actions
const listActionMapping = {
  btn_daily_horoscope: 'get_daily_horoscope',
  btn_birth_chart: 'show_birth_chart',
  btn_compatibility: 'initiate_compatibility_flow',
  btn_synastry: 'get_synastry_analysis',
  btn_lunar_return: 'get_lunar_return',
  btn_tarot: 'get_tarot_reading',
  btn_iching: 'get_iching_reading',
  btn_palmistry: 'get_palmistry_analysis',
  btn_nadi: 'show_nadi_flow',
  btn_kabbalistic: 'get_kabbalistic_analysis',
  btn_mayan: 'get_mayan_analysis',
  btn_celtic: 'get_celtic_analysis',
  btn_horary: 'get_horary_reading',
  btn_electional: 'get_electional_astrology',
  btn_chinese: 'show_chinese_flow',
  btn_numerology: 'get_numerology_report',
  btn_astrocartography: 'get_astrocartography_analysis',
  btn_mundane_astrology: 'get_mundane_astrology_analysis',
  btn_hellenistic_astrology: 'get_hellenistic_astrology_analysis',
  btn_asteroids: 'get_asteroid_analysis',
  btn_fixed_stars: 'get_fixed_stars_analysis',
  btn_medical_astrology: 'get_medical_astrology_analysis',
  btn_financial_astrology: 'get_financial_astrology_analysis',
  btn_harmonic_astrology: 'get_harmonic_astrology_analysis',
  btn_career_astrology: 'get_career_astrology_analysis',
  btn_solar_return: 'get_solar_return_analysis',
  btn_event_astrology: 'get_event_astrology_analysis',
  btn_future_self: 'get_future_self_analysis',
  btn_group_astrology: 'get_group_astrology_analysis',
  btn_hindu_astrology: 'get_hindu_astrology_analysis',
  btn_prashna_astrology: 'get_prashna_astrology_analysis',
  btn_ashtakavarga: 'get_ashtakavarga_analysis',
  btn_kaal_sarp: 'get_kaal_sarp_analysis',
  btn_sade_sati: 'get_sade_sati_analysis',
  btn_vedic_remedies: 'get_vedic_remedies_info',
  btn_islamic: 'get_islamic_astrology_info',
  btn_vimshottari_dasha: 'get_vimshottari_dasha_analysis',
  btn_jaimini_astrology: 'get_jaimini_astrology_analysis',
  btn_hindu_festivals: 'get_hindu_festivals_info',
  btn_vedic_numerology: 'get_vedic_numerology_analysis',
  btn_ayurvedic_astrology: 'get_ayurvedic_astrology_analysis',
  btn_varga_charts: 'get_varga_charts_analysis',
  btn_shadbala: 'get_shadbala_analysis',
  btn_muhurta: 'get_muhurta_analysis',
  btn_panchang: 'get_panchang_analysis',
  btn_progressions: 'get_secondary_progressions',
  btn_solar_arc: 'get_solar_arc_directions',
  // New menu buttons
  btn_transits: 'get_current_transits',
  btn_vedic_birth_chart: 'get_hindu_astrology_analysis',
  btn_marriage_matching: 'get_synastry_analysis',
  btn_chinese_bazi: 'show_chinese_flow',
  btn_language_settings: 'show_language_settings_menu',
  btn_user_profile: 'show_user_profile_menu',
  btn_subscription: 'show_subscription_plans',
  btn_help: 'show_help_support',
  btn_update_birth_date: 'start_profile_flow',
  btn_update_birth_time: 'start_profile_flow',
  btn_update_birth_place: 'start_profile_flow',
  btn_update_name: 'start_profile_flow',
  btn_view_birth_chart: 'show_birth_chart',
  btn_recent_readings: 'show_recent_readings',
  btn_favorite_services: 'show_favorite_services',
  horoscope_menu: 'show_main_menu'
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

  // Check for language change requests
  if (
    messageText.toLowerCase().includes('language') ||
     messageText.toLowerCase().includes('lang') ||
     messageText.toLowerCase().includes('idioma') ||
     messageText.toLowerCase().includes('sprache') ||
     messageText.toLowerCase().includes('lingua')
  ) {
    await executeMenuAction(phoneNumber, user, 'show_language_menu');
    return;
  }

  // Check for comprehensive menu requests
  if (
    messageText.toLowerCase().includes('all services') ||
     messageText.toLowerCase().includes('comprehensive') ||
     messageText.toLowerCase().includes('full menu') ||
     messageText.toLowerCase().includes('complete')
  ) {
    await executeMenuAction(phoneNumber, user, 'show_comprehensive_menu');
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
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'subscription.plans.prompt',
        'text',
        {},
        userLanguage
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
  if (lowerMessage.includes('horoscope') || lowerMessage.includes('daily') || lowerMessage === '1') {
    await executeMenuAction(phoneNumber, user, 'get_daily_horoscope');
    return;
  } else if (lowerMessage.includes('chart') || lowerMessage.includes('birth') || lowerMessage === '2') {
    await executeMenuAction(phoneNumber, user, 'show_birth_chart');
    return;
  } else if (
    lowerMessage.includes('compatibility') ||
     lowerMessage.includes('match') ||
     lowerMessage === '3'
  ) {
    await executeMenuAction(phoneNumber, user, 'initiate_compatibility_flow');
    return;
  } else if (
    lowerMessage.includes('tarot') ||
     lowerMessage === '4'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_tarot_reading');
    return;
  } else if (
    lowerMessage.includes('iching') ||
     lowerMessage.includes('i ching') ||
     lowerMessage === '5'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_iching_reading');
    return;
  } else if (
    lowerMessage.includes('palmistry') ||
    lowerMessage.includes('palm') ||
     lowerMessage === '6'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_palmistry_analysis');
    return;
  } else if (
    lowerMessage.includes('nadi') ||
     lowerMessage === '7'
  ) {
    await executeMenuAction(phoneNumber, user, 'show_nadi_flow');
    return;
  } else if (
    lowerMessage.includes('kabbalistic') ||
     lowerMessage === '8'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_kabbalistic_analysis');
    return;
  } else if (
    lowerMessage.includes('mayan') ||
     lowerMessage === '9'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_mayan_analysis');
    return;
  } else if (
    lowerMessage.includes('celtic') ||
     lowerMessage === '10'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_celtic_analysis');
    return;
  } else if (
    lowerMessage.includes('horary') ||
     lowerMessage === '11'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_horary_reading');
    return;
  } else if (
    lowerMessage.includes('chinese') ||
     lowerMessage.includes('bazi') ||
     lowerMessage === '12'
  ) {
    await executeMenuAction(phoneNumber, user, 'show_chinese_flow');
    return;
  } else if (
    lowerMessage.includes('numerology') ||
     lowerMessage === '13'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_numerology_analysis');
    return;
  } else if (
    lowerMessage.includes('astrocartography') ||
     lowerMessage === '14'
  ) {
    await executeMenuAction(phoneNumber, user, 'get_astrocartography_analysis');
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
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      response ||
        translationService.translate('messages.errors.generic_error', userLanguage)
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
  // Handle special buttons
  if (buttonId === 'horoscope_again') {
    await executeMenuAction(phoneNumber, user, 'get_daily_horoscope');
    return;
  }

  if (buttonId === 'horoscope_menu') {
    await executeMenuAction(phoneNumber, user, 'show_main_menu');
    return;
  }

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
          const userLanguage = getUserLanguage(user, phoneNumber);
          await sendMessage(
            phoneNumber,
            'messages.errors.menu_action_error',
            'text',
            {},
            userLanguage
          );
        }
      } else {
        logger.warn(
          `⚠️ No action defined for button ID: ${buttonId} in main menu`
        );
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'messages.errors.main_menu_error',
          'text',
          { title },
          userLanguage
        );
      }
    } else {
      logger.warn(
        '⚠️ Main menu configuration not found when processing button reply.'
      );
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.errors.button_error',
        'text',
        { title },
        userLanguage
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
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.errors.flow_error',
      'text',
      {},
      userLanguage
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
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.errors.clarification_error',
        'text',
        {},
        userLanguage
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
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.birth_chart.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'horoscope_menu', title: translationService.translate('buttons.back_main', userLanguage) || '🏠 Main Menu' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    } else {
      try {
        const horoscopeData = await vedicCalculator.generateDailyHoroscope({
          birthDate: user.birthDate,
          birthTime: user.birthTime,
          birthPlace: user.birthPlace
        });
        const sunSign = await vedicCalculator.calculateSunSign(user.birthDate);

        const userLanguage = getUserLanguage(user, phoneNumber);

        const body = `${translationService.translate('messages.daily_horoscope.title', userLanguage, { sunSign })
        }\n\n${translationService.translate('messages.daily_horoscope.general', userLanguage, { general: horoscopeData.general })
        }\n\n${translationService.translate('messages.daily_horoscope.lucky_color', userLanguage, { color: horoscopeData.luckyColor })
        }\n${translationService.translate('messages.daily_horoscope.lucky_number', userLanguage, { number: horoscopeData.luckyNumber })
        }\n${translationService.translate('messages.daily_horoscope.love', userLanguage, { advice: horoscopeData.love })
        }\n${translationService.translate('messages.daily_horoscope.career', userLanguage, { advice: horoscopeData.career })
        }\n${translationService.translate('messages.daily_horoscope.finance', userLanguage, { advice: horoscopeData.finance })
        }\n${translationService.translate('messages.daily_horoscope.health', userLanguage, { advice: horoscopeData.health })
        }${translationService.translate('messages.daily_horoscope.next', userLanguage)}`;

        const buttons = [
          { type: 'reply', reply: { id: 'get_daily_horoscope', title: translationService.translate('buttons.another_reading', userLanguage) || '🔄 Another Reading' } },
          { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.back_main', userLanguage) || '🏠 Main Menu' } }
        ];

        await sendMessage(phoneNumber, { type: 'button', body, buttons }, 'interactive');

        // Send main menu
        const menu = getMenu('main_menu');
        if (menu) {
          const menuButtons = menu.buttons.map(button => ({
            type: 'reply',
            reply: { id: button.id, title: button.title }
          }));
          await sendMessage(
            phoneNumber,
            { type: 'button', body: menu.body, buttons: menuButtons },
            'interactive'
          );
        }

        return null; // Handled, don't send additional response
      } catch (error) {
        logger.error('Error generating daily horoscope:', error);
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'messages.daily_horoscope.error',
          'text',
          {},
          userLanguage
        );
        return null;
      }
    }
    break;
  case 'initiate_compatibility_flow': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.compatibility.analysis_prompt',
      'text',
      {},
      userLanguage
    );
    return null;
  }
  case 'get_hindu_astrology_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.hindu_astrology.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.hindu_astrology.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_prashna_astrology_analysis': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.prashna_astrology.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'get_horary_reading', title: translationService.translate('buttons.ask_question', userLanguage) || '❓ Ask a Question' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_ashtakavarga_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.ashtakavarga.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.ashtakavarga.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_kaal_sarp_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.kaal_sarp.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.kaal_sarp.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_sade_sati_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.sade_sati.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.sade_sati.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_vedic_remedies_info': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.vedic_remedies.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_islamic_astrology_info': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.islamic_astrology.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_more_traditions_menu', title: translationService.translate('buttons.more_traditions', userLanguage) || '🌍 More Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_vimshottari_dasha_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.vimshottari_dasha.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.vimshottari_dasha.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_jaimini_astrology_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.jaimini_astrology.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.jaimini_astrology.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_hindu_festivals_info': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.hindu_festivals.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'get_panchang_analysis', title: translationService.translate('buttons.get_panchang', userLanguage) || '📅 Get Panchang' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_vedic_numerology_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.vedic_numerology.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    try {
      const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);
      if (vedicAnalysis.error) {
        const userLanguage = getUserLanguage(user, phoneNumber);
        const body = vedicAnalysis.error;
        const buttons = [
          { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
          { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
        ];
        await sendMessage(
          phoneNumber,
          { type: 'button', body, buttons },
          'interactive'
        );
      } else {
        const body = vedicAnalysis.summary;
        const buttons = [
          { type: 'reply', reply: { id: 'get_numerology_report', title: translationService.translate('buttons.more_numerology', userLanguage) || '🔢 More Numerology' } },
          { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
          { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
        ];
        await sendMessage(
          phoneNumber,
          { type: 'button', body, buttons },
          'interactive'
        );
      }
    } catch (error) {
      logger.error('Error generating Vedic numerology analysis:', error);
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.vedic_numerology.error', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'get_vedic_numerology_analysis', title: translationService.translate('buttons.try_again', userLanguage) || '🔄 Try Again' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
    }
    return null;
  }
  case 'get_ayurvedic_astrology_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.ayurvedic_astrology.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    try {
      const ayurvedicAnalysis = ayurvedicAstrology.analyzeAyurvedicConstitution({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });
      if (ayurvedicAnalysis.error) {
        const userLanguage = getUserLanguage(user, phoneNumber);
        const body = ayurvedicAnalysis.error;
        const buttons = [
          { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
          { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
        ];
        await sendMessage(
          phoneNumber,
          { type: 'button', body, buttons },
          'interactive'
        );
      } else {
        const body = ayurvedicAnalysis.summary;
        const buttons = [
          { type: 'reply', reply: { id: 'get_medical_astrology_analysis', title: translationService.translate('buttons.medical_astrology', userLanguage) || '🏥 Medical Astrology' } },
          { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
          { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
        ];
        await sendMessage(
          phoneNumber,
          { type: 'button', body, buttons },
          'interactive'
        );
      }
    } catch (error) {
      logger.error('Error generating Ayurvedic astrology analysis:', error);
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.ayurvedic_astrology.error', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'get_ayurvedic_astrology_analysis', title: translationService.translate('buttons.try_again', userLanguage) || '🔄 Try Again' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
    }
    return null;
  }
  case 'get_varga_charts_analysis': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.varga_charts.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.varga_charts.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_shadbala_analysis':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.astrology_services.shadbala.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.shadbala.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'show_birth_chart', title: translationService.translate('buttons.get_birth_chart', userLanguage) || '📊 Get Birth Chart' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  case 'get_muhurta_analysis': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.muhurta.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'get_electional_astrology', title: translationService.translate('buttons.get_electional', userLanguage) || '📅 Get Electional' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_panchang_analysis': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const body = translationService.translate('messages.astrology_services.panchang.description', userLanguage);
    const buttons = [
      { type: 'reply', reply: { id: 'get_daily_horoscope', title: translationService.translate('buttons.daily_horoscope', userLanguage) || '🌟 Daily Horoscope' } },
      { type: 'reply', reply: { id: 'show_traditions_menu', title: translationService.translate('buttons.back_traditions', userLanguage) || '🌳 Back to Traditions' } },
      { type: 'reply', reply: { id: 'show_main_menu', title: translationService.translate('buttons.main_menu', userLanguage) || '🏠 Main Menu' } }
    ];
    await sendMessage(
      phoneNumber,
      { type: 'button', body, buttons },
      'interactive'
    );
    return null;
  }
  case 'get_secondary_progressions':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.secondary_progressions.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    response = generateAstrologyResponse('progressions', user);
    break;
  case 'get_solar_arc_directions':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.solar_arc_directions.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    response = generateAstrologyResponse('solar arc', user);
    break;
  case 'get_solar_return_analysis':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.solar_return.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    response = generateAstrologyResponse('solar return', user);
    break;
  case 'get_synastry_analysis':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.synastry.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    // Check if partner data is provided in the message
    const partnerDataMatch = messageText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (partnerDataMatch) {
      // Partner data provided, let astrologyEngine handle it
      response = generateAstrologyResponse(messageText, user);
    } else {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.synastry.partner_prompt',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    break;
  case 'get_lunar_return':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.lunar_return.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    response = generateAstrologyResponse('lunar return', user);
    break;
  case 'get_current_transits':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      const body = translationService.translate('messages.birth_chart.incomplete_profile', userLanguage);
      const buttons = [
        { type: 'reply', reply: { id: 'start_profile_flow', title: translationService.translate('buttons.update_profile', userLanguage) || '📝 Update Profile' } },
        { type: 'reply', reply: { id: 'show_western_astrology_menu', title: translationService.translate('buttons.back_western', userLanguage) || '🌍 Back to Western' } }
      ];
      await sendMessage(
        phoneNumber,
        { type: 'button', body, buttons },
        'interactive'
      );
      return null;
    }
    response = generateAstrologyResponse('current transits', user);
    break;
  case 'show_core_readings_menu': {
    const coreReadingsMenu = getMenu('core_readings_menu');
    if (coreReadingsMenu) {
      const buttons = coreReadingsMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: coreReadingsMenu.body, buttons },
        'interactive'
      );
    }
    return null;
  }
  case 'show_divination_menu': {
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
  }
  case 'show_traditions_menu': {
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
  }
  case 'show_more_options_menu': {
    const moreOptionsMenu = getMenu('more_options_menu');
    if (moreOptionsMenu) {
      await sendMessage(
        phoneNumber,
        moreOptionsMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'show_western_astrology_menu': {
    const westernMenu = getMenu('western_astrology_menu');
    if (westernMenu) {
      await sendMessage(
        phoneNumber,
        westernMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'show_vedic_astrology_menu': {
    const vedicMenu = getMenu('vedic_astrology_menu');
    if (vedicMenu) {
      await sendMessage(
        phoneNumber,
        vedicMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'show_advanced_services_menu': {
    const advancedMenu = getMenu('advanced_services_menu');
    if (advancedMenu) {
      await sendMessage(
        phoneNumber,
        advancedMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'show_language_settings_menu': {
    const languageMenu = getMenu('language_settings_menu');
    if (languageMenu) {
      await sendMessage(
        phoneNumber,
        languageMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'show_user_profile_menu': {
    const profileMenu = getMenu('user_profile_menu');
    if (profileMenu) {
      await sendMessage(
        phoneNumber,
        profileMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'show_more_traditions_menu': {
    const moreTraditionsMenu = getMenu('more_traditions_menu');
    if (moreTraditionsMenu) {
      const buttons = moreTraditionsMenu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(
        phoneNumber,
        { type: 'button', body: moreTraditionsMenu.body, buttons },
        'interactive'
      );
    }
    return null;
  }
  case 'show_birth_chart': {
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.birth_chart.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    // Start birth chart flow
    await processFlowMessage({ body: 'birth chart' }, user, null);
    return null;
  }
  case 'show_language_menu': {
    const languageMenu = getMenu('language_menu');
    if (languageMenu) {
      await sendMessage(
        phoneNumber,
        languageMenu,
        'interactive'
      );
    }
    return null;
  }
  case 'set_language_en': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'en' });
    await sendMessage(phoneNumber, translationService.translate('messages.language.set_english', 'en'), 'text');
    return null;
  }
  case 'set_language_hi': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'hi' });
    await sendMessage(phoneNumber, translationService.translate('messages.language.set_hindi', 'hi'), 'text');
    return null;
  }
  case 'set_language_ar': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'ar' });
    await sendMessage(phoneNumber, '✅ تم تعيين اللغة إلى العربية! 🇸🇦', 'text');
    return null;
  }
  case 'set_language_es': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'es' });
    await sendMessage(phoneNumber, '✅ ¡Idioma establecido en español! 🇪🇸', 'text');
    return null;
  }
  case 'set_language_fr': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'fr' });
    await sendMessage(phoneNumber, '✅ Langue définie en français! 🇫🇷', 'text');
    return null;
  }
  case 'set_language_ta': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'ta' });
    await sendMessage(phoneNumber, '✅ மொழி தமிழில் அமைக்கப்பட்டது! 🇮🇳', 'text');
    return null;
  }
  case 'set_language_te': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'te' });
    await sendMessage(phoneNumber, '✅ భాష తెలుగులో సెట్ చేయబడింది! 🇮🇳', 'text');
    return null;
  }
  case 'set_language_bn': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'bn' });
    await sendMessage(phoneNumber, '✅ ভাষা বাংলায় সেট করা হয়েছে! 🇮🇳', 'text');
    return null;
  }
  case 'set_language_mr': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'mr' });
    await sendMessage(phoneNumber, '✅ भाषा मराठीमध्ये सेट केली! 🇮🇳', 'text');
    return null;
  }
  case 'set_language_gu': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'gu' });
    await sendMessage(phoneNumber, '✅ ભાષા ગુજરાતીમાં સેટ કરી! 🇮🇳', 'text');
    return null;
  }
  case 'set_language_de': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'de' });
    await sendMessage(phoneNumber, '✅ Sprache auf Deutsch eingestellt! 🇩🇪', 'text');
    return null;
  }
  case 'set_language_it': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'it' });
    await sendMessage(phoneNumber, '✅ Lingua impostata in italiano! 🇮🇹', 'text');
    return null;
  }
  case 'set_language_pt': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'pt' });
    await sendMessage(phoneNumber, '✅ Idioma definido para português! 🇵🇹', 'text');
    return null;
  }
  case 'set_language_ru': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'ru' });
    await sendMessage(phoneNumber, '✅ Язык установлен на русский! 🇷🇺', 'text');
    return null;
  }
  case 'set_language_zh': {
    await updateUserProfile(phoneNumber, { preferredLanguage: 'zh' });
    await sendMessage(phoneNumber, '✅ 语言设置为中文! 🇨🇳', 'text');
    return null;
  }
  case 'start_profile_flow': {
    // Start the onboarding flow for profile update
    await processFlowMessage({ body: 'update profile' }, user, null);
    return null;
  }
  case 'horoscope_again': {
    // Same as get_daily_horoscope
    await executeMenuAction(phoneNumber, user, 'get_daily_horoscope');
    return null;
  }
  case 'horoscope_menu': {
    // Same as show_main_menu
    await executeMenuAction(phoneNumber, user, 'show_main_menu');
    return null;
  }
  case 'tarot_detailed': {
    // Provide a more detailed tarot reading
    const detailedBody = '🔮 *Detailed Tarot Reading*\n\nPast: The Fool - New beginnings\nPresent: The Magician - Manifestation\nFuture: The High Priestess - Intuition\n\nThis spread suggests you\'re entering a phase of new opportunities where your inner wisdom will guide you to manifest your desires.';
    const detailedButtons = [
      { type: 'reply', reply: { id: 'get_tarot_reading', title: '🔄 New Reading' } },
      { type: 'reply', reply: { id: 'tarot_menu', title: '🏠 Main Menu' } }
    ];
    await sendMessage(phoneNumber, { type: 'button', body: detailedBody, buttons: detailedButtons }, 'interactive');
    return null;
  }
  case 'tarot_another': {
    // Same as get_tarot_reading
    await executeMenuAction(phoneNumber, user, 'get_tarot_reading');
    return null;
  }
  case 'tarot_menu': {
    // Same as show_main_menu
    await executeMenuAction(phoneNumber, user, 'show_main_menu');
    return null;
  }
  case 'show_nadi_flow':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.nadi_flow.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    } else {
      const flowStarted = await processFlowMessage(
        { type: 'text', text: { body: 'start' } },
        user,
        'nadi_flow'
      );
      if (flowStarted) {
        return null;
      } else {
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'Sorry, I couldn\'t start the Nadi analysis right now.',
          'text',
          {},
          userLanguage
        );
        return null;
      }
    }
  case 'show_chinese_flow':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.chinese_flow.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    } else {
      const flowStarted = await processFlowMessage(
        { type: 'text', text: { body: 'start' } },
        user,
        'chinese_flow'
      );
      if (flowStarted) {
        return null;
      } else {
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'Sorry, I couldn\'t start the Chinese analysis right now.',
          'text',
          {},
          userLanguage
        );
        return null;
      }
    }
  case 'get_numerology_analysis':
    if (!user.birthDate || !user.name) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.numerology.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    } else {
      try {
        const report = numerologyService.getNumerologyReport(
          user.birthDate,
          user.name
        );
        const userLanguage = getUserLanguage(user, phoneNumber);
        const response = `${translationService.translate('messages.numerology_report.title', userLanguage)}\n\n${
          translationService.translate('messages.numerology_report.life_path', userLanguage, { number: report.lifePath.number })} - ${report.lifePath.interpretation}\n\n${
          translationService.translate('messages.numerology_report.expression', userLanguage, { number: report.expression.number })} - ${report.expression.interpretation}\n\n${
          translationService.translate('messages.numerology_report.soul_urge', userLanguage, { number: report.soulUrge.number })} - ${report.soulUrge.interpretation
        }\n\n${translationService.translate('messages.numerology_report.question', userLanguage)}`;
        await sendMessage(phoneNumber, response);
        return null;
      } catch (error) {
        logger.error('Error getting numerology analysis:', error);
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'messages.astrology_services.numerology.error',
          'text',
          {},
          userLanguage
        );
        return null;
      }
    }
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
  case 'get_tarot_reading':
    const tarotBody = '🔮 *Tarot Reading*\n\nCurrent Situation: The Fool\n\nThis card represents new beginnings and adventures. You\'re at the start of a journey filled with potential.\n\nAdvice: Trust in the universe and take that leap of faith.';
    const tarotButtons = [
      { type: 'reply', reply: { id: 'tarot_detailed', title: '🔍 Detailed Reading' } },
      { type: 'reply', reply: { id: 'tarot_another', title: '🔄 Another Card' } },
      { type: 'reply', reply: { id: 'tarot_menu', title: '🏠 Main Menu' } }
    ];
    await sendMessage(phoneNumber, { type: 'button', body: tarotBody, buttons: tarotButtons }, 'interactive');
    return null;
  case 'get_palmistry_analysis':
    await processFlowMessage(message, user, 'palmistry_flow');
    return null;
  case 'get_iching_reading':
    await processFlowMessage(message, user, 'iching_flow');
    return null;
  case 'get_horary_reading':
    await processFlowMessage(message, user, 'horary_flow');
    return null;
  case 'get_kabbalistic_analysis':
    await processFlowMessage(message, user, 'kabbalistic_flow');
    return null;
  case 'get_mayan_analysis':
    await processFlowMessage(message, user, 'mayan_flow');
    return null;
  case 'get_numerology_report':
    response = '🔢 *Numerology Analysis*\n\n*Life Path:* 5\n\nAs a Life Path 5, you\'re adventurous, freedom-loving, and adaptable. You thrive on change and new experiences.\n\n*Expression:* 8\n\nYour name vibrates with power, success, and material abundance.\n\n*Soul Urge:* 3\n\nYour heart desires creativity, self-expression, and social connection.\n\nWhat aspect of numerology interests you most?';
    break;
  case 'show_subscription_plans': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const response = {
      type: 'interactive',
      body: translationService.translate('messages.subscription_plans.title', userLanguage),
      buttons: [
        { type: 'reply', reply: { id: 'sub_essential', title: translationService.translate('messages.subscription_plans.essential', userLanguage) } },
        { type: 'reply', reply: { id: 'sub_premium', title: translationService.translate('messages.subscription_plans.premium', userLanguage) } }
      ]
    };
    await sendMessage(phoneNumber, response, 'interactive');
    return null;
  }
  case 'show_comprehensive_menu': {
    const comprehensiveMenu = getMenu('comprehensive_menu');
    if (comprehensiveMenu) {
      // Format the comprehensive menu for list message
      const listMessage = {
        type: 'list',
        body: comprehensiveMenu.body,
        buttonText: comprehensiveMenu.buttonText || 'Choose Service', // Default if not provided
        sections: comprehensiveMenu.sections
      };
      await sendMessage(phoneNumber, listMessage, 'interactive');
    } else {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.comprehensive_menu.not_found',
        'text',
        {},
        userLanguage
      );
    }
    return null;
  }
  case 'show_subscription_plans': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const response = {
      type: 'interactive',
      body: translationService.translate('messages.subscription_plans.title', userLanguage),
      buttons: [
        { type: 'reply', reply: { id: 'sub_essential', title: translationService.translate('messages.subscription_plans.essential', userLanguage) } },
        { type: 'reply', reply: { id: 'sub_premium', title: translationService.translate('messages.subscription_plans.premium', userLanguage) } }
      ]
    };
    await sendMessage(phoneNumber, response, 'interactive');
    return null;
  }
  case 'show_help_support': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const helpMessage = '🆘 *Help & Support*\n\nNeed assistance? Here are some quick options:\n\n• Type "menu" to return to main menu\n• Type "language" to change language\n• Contact support for technical issues\n\nAvailable commands:\n• "horoscope" - Daily horoscope\n• "kundli" - Vedic birth chart\n• "tarot" - Tarot reading\n• "compatibility" - Relationship analysis\n\nFor more help, visit our website or contact support.';
    await sendMessage(phoneNumber, helpMessage);
    return null;
  }
  case 'show_recent_readings': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const recentMessage = `📋 *Recent Readings*\n\nYour recent astrology consultations:\n\n• Daily Horoscope - ${new Date().toLocaleDateString()}\n• Vedic Birth Chart - ${new Date(Date.now() - 86400000).toLocaleDateString()}\n\nMore detailed history coming soon!`;
    await sendMessage(phoneNumber, recentMessage);
    return null;
  }
  case 'show_favorite_services': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const favoritesMessage = '⭐ *Favorite Services*\n\nYour most used services:\n\n1. Daily Horoscope 🌟\n2. Vedic Birth Chart 🕉️\n3. Compatibility Analysis 💕\n\nSet your preferences in profile settings!';
    await sendMessage(phoneNumber, favoritesMessage);
    return null;
  }
  case 'get_relationship_compatibility': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.astrology_services.relationship_compatibility.description',
      'text',
      {},
      userLanguage
    );
    return null;
  }
  case 'get_astrocartography_analysis':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.astrocartography.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    try {
      const astrocartographyData = await generateAstrocartography({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (astrocartographyData.error) {
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'messages.astrology_services.astrocartography.error',
          'text',
          { error: astrocartographyData.error },
          userLanguage
        );
      } else {
        const userLanguage = getUserLanguage(user, phoneNumber);
        const response = `${translationService.translate('messages.astrology_services.astrocartography.title', userLanguage)}\n\n${
          astrocartographyData.astrocartographyDescription}\n\n${
          translationService.translate('messages.astrology_services.astrocartography.key_lines', userLanguage)}\n${
          astrocartographyData.relocationGuidance.map(line => `• ${line}`).join('\n')}\n\n${
          translationService.translate('messages.astrology_services.astrocartography.recommended_locations', userLanguage)}\n${
          astrocartographyData.locationAdvice.map(loc => `• ${loc}`).join('\n')}\n\n${
          translationService.translate('messages.astrology_services.astrocartography.relocate_prompt', userLanguage)}`;
        await sendMessage(phoneNumber, response);
      }
    } catch (error) {
      logger.error('Error generating astrocartography:', error);
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I couldn\'t generate your astrocartography analysis right now. Please try again later.',
        'text',
        {},
        userLanguage
      );
    }
    return null;
  case 'get_harmonic_astrology_analysis':
    if (!user.birthDate) {
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.astrology_services.harmonic_astrology.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return null;
    }
    try {
      const harmonicData = await ageHarmonicReader.generateAgeHarmonicAnalysis({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });

      if (harmonicData.error) {
        const userLanguage = getUserLanguage(user, phoneNumber);
        await sendMessage(
          phoneNumber,
          'messages.astrology_services.harmonic_astrology.error',
          'text',
          { error: harmonicData.error },
          userLanguage
        );
      } else {
        const userLanguage = getUserLanguage(user, phoneNumber);
        const response = `${translationService.translate('messages.astrology_services.harmonic_astrology.title', userLanguage)}\n\n${
          translationService.translate('messages.astrology_services.harmonic_astrology.current_age', userLanguage, { age: harmonicData.currentAge })}\n${
          translationService.translate('messages.astrology_services.harmonic_astrology.life_stage', userLanguage, { stage: harmonicData.currentStage })}\n\n${
          translationService.translate('messages.astrology_services.harmonic_astrology.key_periods', userLanguage)}\n${
          harmonicData.harmonicPeriods.map(period => `• ${period}`).join('\n')}\n\n${
          translationService.translate('messages.astrology_services.harmonic_astrology.developmental_themes', userLanguage)}\n${
          harmonicData.developmentalThemes.map(theme => `• ${theme}`).join('\n')}\n\n${
          translationService.translate('messages.astrology_services.harmonic_astrology.next_transition', userLanguage, { transition: harmonicData.nextTransition })}`;
        await sendMessage(phoneNumber, response);
      }
    } catch (error) {
      logger.error('Error generating age harmonic analysis:', error);
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I couldn\'t generate your age harmonic analysis right now. Please try again later.',
        'text',
        {},
        userLanguage
      );
    }
    return null;
  default: {
    logger.warn(`⚠️ Unknown menu action: ${action}`);
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.errors.unknown_action',
      'text',
      { action },
      userLanguage
    );
    return null;
  }
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
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.errors.list_reply',
      'text',
      { title, description },
      userLanguage
    );
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
  const userLanguage = getUserLanguage(user, phoneNumber);
  const response = `Button pressed: ${text}\nPayload: ${payload}\n\nI'll process your request shortly!`;
  await sendMessage(phoneNumber, response);
};

/**
 * Send unsupported message type response
 * @param {string} phoneNumber - User's phone number
 */
const sendUnsupportedMessageTypeResponse = async phoneNumber => {
  // We need user context for language detection, but this function doesn't have it
  // For now, use default language or detect from phone number
  const userLanguage = translationService.detectLanguage(phoneNumber);
  await sendMessage(
    phoneNumber,
    'messages.errors.unsupported_message_type',
    'text',
    {},
    userLanguage
  );
};

/**
 * Send unsupported interactive type response
 * @param {string} phoneNumber - User's phone number
 */
const sendUnsupportedInteractiveTypeResponse = async phoneNumber => {
  const userLanguage = translationService.detectLanguage(phoneNumber);
  await sendMessage(
    phoneNumber,
    'messages.errors.unsupported_interactive_type',
    'text',
    {},
    userLanguage
  );
};

/**
 * Send media acknowledgment
 * @param {string} phoneNumber - User's phone number
 * @param {string} type - Media type
 * @param {string} caption - Media caption
 */
const sendMediaAcknowledgment = async(phoneNumber, type, caption) => {
  const userLanguage = translationService.detectLanguage(phoneNumber);
  const captionText = caption ? ` with caption: "${caption}"` : '';
  await sendMessage(
    phoneNumber,
    'messages.errors.media_acknowledgment',
    'text',
    { type, caption: captionText },
    userLanguage
  );
};

/**
 * Send error message to user
 * @param {string} phoneNumber - User's phone number
 * @param {string} errorMessage - Error message
 */
const sendErrorMessage = async(phoneNumber, errorMessage) => {
  const userLanguage = translationService.detectLanguage(phoneNumber);
  await sendMessage(
    phoneNumber,
    'messages.errors.generic_error',
    'text',
    {},
    userLanguage
  );
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
      const userLanguage = getUserLanguage(user, phoneNumber);
      await sendMessage(
        phoneNumber,
        'messages.compatibility.incomplete_profile',
        'text',
        {},
        userLanguage
      );
      return;
    }

    const userSign = vedicCalculator.calculateSunSign(user.birthDate);
    const otherSign = vedicCalculator.calculateSunSign(otherBirthDate);

    const compatibility = vedicCalculator.checkCompatibility(
      userSign,
      otherSign
    );

    const userLanguage = getUserLanguage(user, phoneNumber);
    let response = `💕 *Compatibility Analysis*\n\n*Your Sign:* ${userSign}\n*Their Sign:* ${otherSign}\n\n*Compatibility:* ${compatibility.compatibility}\n\n${compatibility.description}`;

    // Check subscription limits
    const benefits = paymentService.getSubscriptionBenefits(user);
    if (
      benefits.maxCompatibilityChecks !== Infinity &&
      user.compatibilityChecks >= benefits.maxCompatibilityChecks
    ) {
      response += `\n\n${translationService.translate('messages.compatibility.limit_reached', userLanguage, {
        used: user.compatibilityChecks,
        limit: benefits.maxCompatibilityChecks
      })}`;
    }

    await sendMessage(phoneNumber, response);

    // Increment compatibility check counter
    await incrementCompatibilityChecks(phoneNumber);
  } catch (error) {
    logger.error('Error handling compatibility request:', error);
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.compatibility.error',
      'text',
      {},
      userLanguage
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
    const userLanguage = getUserLanguage(user, phoneNumber);
    const welcomeMessage = `\n\n${translationService.translate('messages.errors.welcome_message', userLanguage, {
      plan: plan.name,
      features: plan.features.map(feature => `• ${feature}`).join('\n')
    })}`;

    await sendMessage(phoneNumber, welcomeMessage);
  } catch (error) {
    logger.error('Error handling subscription request:', error);
    const userLanguage = getUserLanguage(user, phoneNumber);
    await sendMessage(
      phoneNumber,
      'messages.errors.subscription_error',
      'text',
      {},
      userLanguage
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
