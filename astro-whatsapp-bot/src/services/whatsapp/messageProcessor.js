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
const { getFlow } = require('../../conversation/flowLoader');
const { generateTarotReading } = require('../astrology/tarotReader');
const { generatePalmistryAnalysis } = require('../astrology/palmistryReader');
const kabbalisticReader = require('../astrology/kabbalisticReader');
const mayanReader = require('../astrology/mayanReader');
const celticReader = require('../astrology/celticReader');
const ichingReader = require('../astrology/ichingReader');
const { generateAstrocartography } = require('../astrology/astrocartographyReader');
const numerologyService = require('../astrology/numerologyService');
const { VedicNumerology } = require('../services/astrology/vedicNumerology');
const { AyurvedicAstrology } = require('../services/astrology/ayurvedicAstrology');
const vedicNumerology = new VedicNumerology();
const ayurvedicAstrology = new AyurvedicAstrology();

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
  btn_solar_arc: 'get_solar_arc_directions'
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
  // Handle special buttons
  if (buttonId === 'horoscope_again') {
    await executeMenuAction(phoneNumber, user, 'get_daily_horoscope');
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
      try {
        const horoscopeData = await vedicCalculator.generateDailyHoroscope(
          user.birthDate
        );
        const sunSign = vedicCalculator.calculateSunSign(user.birthDate);

        const body = `🔮 *Your Daily Horoscope*\n\n${sunSign} - ${horoscopeData.general}\n\n💫 *Lucky Color:* ${horoscopeData.luckyColor}\n🎯 *Lucky Number:* ${horoscopeData.luckyNumber}\n💝 *Love:* ${horoscopeData.love}\n💼 *Career:* ${horoscopeData.career}\n💰 *Finance:* ${horoscopeData.finance}\n🏥 *Health:* ${horoscopeData.health}\n\nWhat would you like to explore next?`;

        const buttons = [
          { type: 'reply', reply: { id: 'horoscope_again', title: '🔄 Another Reading' } },
          { type: 'reply', reply: { id: 'horoscope_menu', title: '🏠 Main Menu' } }
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
        response = 'I\'m sorry, I couldn\'t generate your horoscope right now. Please try again later.';
      }
    }
    break;
  case 'get_hindu_astrology_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Hindu Vedic astrology analysis.';
      break;
    }
    response = '🕉️ *Hindu Vedic Astrology*\n\nDiscover your traditional Vedic Kundli and sacred astrological wisdom!\n\n*Available Services:*\n\n📊 *Complete Kundli* - Full birth chart with 12 houses, planetary positions, and Vedic interpretations\n\n💕 *Marriage Compatibility* - Traditional 36-point Guna matching system\n\n🏠 *Lagna Analysis* - Detailed Ascendant interpretation\n\n🔮 *Manglik Dosha* - Mars placement analysis and remedies\n\n🪐 *Bhava Analysis* - House-by-house life area interpretations\n\n🌟 *Yoga Formations* - Special planetary combinations and their effects\n\n*To get started:*\n1. Send "kundli" for your complete birth chart\n2. Send "marriage matching" to check compatibility with a partner\n3. Send "lagna analysis" for detailed Ascendant reading\n4. Send "manglik check" to analyze Mars placement\n\nWhat aspect of Vedic astrology interests you?';
    break;
  case 'get_prashna_astrology_analysis':
    response = '🕉️ *Prashna (Horary) Astrology*\n\nGet answers to your specific questions using the ancient art of Prashna astrology!\n\n*How Prashna Works:*\n• Predictions based on planetary positions at the exact moment you ask your question\n• No birth details required - just ask your question now!\n• Provides timing and guidance for specific queries\n\n*Perfect for questions about:*\n• Marriage and relationships\n• Career and job prospects\n• Financial matters\n• Health concerns\n• Education and studies\n\n*Simply ask your question now!*\n\nExample: "Will I get married this year?" or "When will I find a new job?"\n\nWhat question is on your mind? 🔮';
    break;
  case 'get_ashtakavarga_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Ashtakavarga analysis.';
      break;
    }
    response = '🕉️ *Ashtakavarga (8-Fold Strength Analysis)*\n\nAshtakavarga reveals the 8-fold strength of planets across all 12 houses!\n\n*What You\'ll Discover:*\n• Planetary strength distribution (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)\n• Bindu (dot) system showing favorable periods\n• Trikona Shodhana - triangle reduction analysis\n• Ekadhipatya - sole lordship of houses\n• Favorable and challenging life areas\n\n*Benefits:*\n• Identify strongest planetary periods for important decisions\n• Understand planetary power distribution in your chart\n• Time activities based on planetary strength\n• Gain deeper insights into life patterns\n\nSend "ashtakavarga" to get your detailed analysis! 🔮';
    break;
  case 'get_kaal_sarp_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Kaal Sarp Dosha analysis.';
      break;
    }
    response = '🐍 *Kaal Sarp Dosha Analysis*\n\nKaal Sarp Dosha occurs when all planets are positioned between Rahu and Ketu in your birth chart!\n\n*What You\'ll Discover:*\n• Whether Kaal Sarp Dosha is present in your chart\n• Specific type of Kaal Sarp Dosha (12 different types)\n• Severity and strength of the dosha\n• Planets trapped between Rahu-Ketu axis\n• Life areas most affected\n• Detailed effects and challenges\n• Comprehensive remedial measures\n\n*12 Types of Kaal Sarp Dosha:*\n🐍 Anant, Kulik, Vasuki, Shankhpal, Padma, Mahapadma\n🐍 Takshak, Karkotak, Shankhchud, Ghatak, Vishdhar, Sheshnag\n\n*Benefits of Analysis:*\n• Understand life challenges and their astrological cause\n• Learn specific remedies to mitigate dosha effects\n• Gain insights into karmic patterns and life lessons\n• Receive guidance for spiritual growth and protection\n\n*Common Remedies Include:*\n• Mantras and prayers to Rahu and Ketu\n• Gemstone recommendations\n• Charitable activities and donations\n• Specific pujas and rituals\n• Yantra installations\n• Fasting and spiritual practices\n\nSend "kaal sarp dosha" to get your detailed analysis and remedies! 🕉️';
    break;
  case 'get_sade_sati_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Sade Sati analysis.';
      break;
    }
    response = '🪐 *Sade Sati Analysis - Saturn\'s 7.5 Year Transit*\n\nSade Sati is Saturn\'s significant 7.5-year transit through the 12th, 1st, and 2nd houses from your Moon sign!\n\n*What You\'ll Discover:*\n• Current Sade Sati status and phase\n• When your Sade Sati began/will begin\n• Duration and remaining time\n• Specific effects based on your Moon sign\n• Life areas most affected\n• Detailed challenges and opportunities\n• Comprehensive remedial measures\n\n*3 Phases of Sade Sati:*\n🌅 *Rising Phase* (12th house) - Foundation building, preparation\n🏔️ *Peak Phase* (1st house) - Maximum intensity, major life changes\n🌇 *Setting Phase* (2nd house) - Resolution, new beginnings\n\n*Benefits of Analysis:*\n• Understand current life challenges through Saturn\'s lens\n• Prepare for upcoming Sade Sati periods\n• Learn specific remedies to navigate difficulties\n• Gain insights into karmic lessons and growth\n• Receive guidance for spiritual development\n\n*Common Remedies Include:*\n• Saturday fasting and prayers to Lord Shani\n• Blue sapphire (Neelam) gemstone therapy\n• Charitable donations (especially on Saturdays)\n• Chanting "Om Sham Shanicharaya Namaha"\n• Oil donations and sesame seed charities\n• Specific pujas and temple visits\n• Wearing iron rings and protective yantras\n\nSend "sade sati" to get your detailed Saturn transit analysis and remedies! 🕉️';
    break;
  case 'get_vedic_remedies_info':
    response = '🕉️ *Vedic Remedies - Ancient Astrological Solutions*\n\nDiscover comprehensive remedies to harmonize planetary influences and overcome astrological challenges!\n\n*🪐 Planetary Remedies:*\n• **Gemstones** - Ruby, Pearl, Coral, Emerald, Sapphire, etc.\n• **Mantras** - Beej mantras, planetary chants, stotras\n• **Charities** - Donations aligned with planetary energies\n\n*📿 Available Remedies For:*\n• Sun (Surya) - Leadership, health, authority\n• Moon (Chandra) - Emotions, mind, family\n• Mars (Mangal) - Courage, property, marriage\n• Mercury (Budha) - Intelligence, communication, business\n• Jupiter (Guru) - Wisdom, prosperity, spirituality\n• Venus (Shukra) - Love, beauty, luxury\n• Saturn (Shani) - Discipline, longevity, career\n• Rahu - Foreign success, unconventional paths\n• Ketu - Spiritual liberation, detachment\n\n*⚠️ Dosha-Specific Remedies:*\n• Kaal Sarp Dosha - Rahu-Ketu axis remedies\n• Manglik Dosha - Mars placement remedies\n• Pitru Dosha - Ancestral remedies\n• Sade Sati - Saturn transit remedies\n\n*🙏 Advanced Practices:*\n• Navagraha Puja - All planets worship\n• Special pujas for specific doshas\n• Yantra installations for protection\n• Fasting and spiritual disciplines\n\n*Examples of Requests:*\n• "remedies for sun" - Sun-related gemstones and mantras\n• "gemstones for saturn" - Blue Sapphire details\n• "mantras for venus" - Venus mantras and practices\n• "remedies for kaal sarp dosha" - Complete Kaal Sarp remedies\n\n*Benefits:*\n• Mitigate planetary afflictions\n• Enhance positive planetary influences\n• Spiritual growth and protection\n• Harmonize life energies\n• Overcome karmic challenges\n\nWhat remedies would you like to explore? Send your request to get personalized guidance! 🕉️';
    break;
  case 'get_islamic_astrology_info':
    response = '🕌 *Islamic Astrology - Ilm-e-Nujum & Taqdeer*\n\nDiscover your divine destiny through Islamic astrological wisdom! Based on Quranic principles and prophetic traditions.\n\n*Ilm-e-Nujum (Islamic Numerology):*\n• Abjad system analysis (Arabic letter values)\n• Divine qualities revealed through names\n• Spiritual guidance and life purpose\n• Connection to 99 names of Allah\n\n*Taqdeer (Destiny Analysis):*\n• Lunar mansion influences at birth (28 Manazil)\n• Islamic planetary guidance and wisdom\n• Life path according to divine will\n• Spiritual, worldly, and relationship destiny\n• Prayer times and auspicious Islamic periods\n\n*Key Features:*\n• Abjad letter values (Alif=1, Ba=2, etc.)\n• 28 Lunar Mansions (Manazil al-Qamar)\n• Islamic planetary influences\n• Taqdeer destiny categories\n• Prayer time guidance\n• Ramadan and Hajj period insights\n\n*Examples of Requests:*\n• "ilm e nujum for Ahmad" - Islamic numerology analysis\n• "taqdeer analysis" - Complete destiny analysis\n• "islamic astrology" - General Islamic guidance\n• "abjad for Fatima" - Name numerology\n\n*Islamic Principles:*\n• All destiny is from Allah (SWT)\n• Free will within divine framework\n• Prayer and good deeds shape destiny\n• Knowledge serves faith and submission\n\nWhat aspect of Islamic astrology would you like to explore? Send your request to begin your spiritual journey! 🕉️';
    break;
  case 'get_vimshottari_dasha_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Vimshottari Dasha analysis.';
      break;
    }
    response = '🕉️ *Vimshottari Dasha - Planetary Periods & Life Predictions*\n\nVimshottari Dasha is the most important predictive technique in Vedic astrology, showing planetary periods that influence your life journey!\n\n*What You\'ll Discover:*\n• Current Dasha (major period) and Bhukti (sub-period)\n• Duration and progress of current planetary influence\n• Life areas affected by current planetary energies\n• Upcoming Dasha periods and their influences\n• Favorable and challenging periods ahead\n• Remedies to enhance positive influences\n\n*Complete Analysis Includes:*\n🪐 *Current Planetary Period* - Which planet\'s energy is dominant now\n⏰ *Time Calculations* - When periods begin and end\n📊 *Progress Tracking* - How far into current period you are\n🔮 *Future Preview* - Next 5 Dasha periods overview\n🙏 *Remedial Measures* - Mantras, charities, and spiritual practices\n\n*Planetary Periods (120-year cycle):*\n• Sun (6 years) - Leadership, authority, health\n• Moon (10 years) - Emotions, family, intuition\n• Mars (7 years) - Energy, courage, property\n• Rahu (18 years) - Ambition, foreign, transformation\n• Jupiter (16 years) - Wisdom, prosperity, spirituality\n• Saturn (19 years) - Discipline, hard work, longevity\n• Mercury (17 years) - Intelligence, communication, business\n• Ketu (7 years) - Spirituality, detachment, liberation\n• Venus (20 years) - Love, luxury, artistic talents\n\n*Benefits of Dasha Analysis:*\n• Understand current life challenges and opportunities\n• Plan important life events during favorable periods\n• Prepare for upcoming changes and transitions\n• Enhance positive planetary influences\n• Mitigate challenging planetary effects\n\nSend "vimshottari dasha" or "dasha analysis" to get your complete planetary periods analysis! 🔮';
    break;
  case 'get_jaimini_astrology_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Jaimini Astrology analysis.';
      break;
    }
    response = '🕉️ *Jaimini Astrology - Alternative Vedic System*\n\nJaimini Astrology, founded by Maharishi Jaimini, offers a different perspective from traditional Parasara system!\n\n*What You\'ll Discover:*\n• **Jaimini Karakas** - 8 significators (Atma, Amatya, Bhratru, etc.)\n• **Special Aspects** - Different aspect system (3°, 5°, 7°, 9°, 10°, 12°)\n• **Argalas** - Supports and obstructions in life\n• **Alternative Predictions** - Different predictive techniques\n• **Karakas Analysis** - Soul purpose, career, relationships, health\n\n*Complete Analysis Includes:*\n🏆 *Atma Karaka* - Soul significator and life purpose\n💼 *Amatya Karaka* - Career and professional success\n👨‍👩‍👧‍👦 *Bhratru Karaka* - Siblings and friendships\n👩 *Matru Karaka* - Mother and nurturing relationships\n👨 *Pitru Karaka* - Father and authority figures\n👶 *Putra Karaka* - Children and creative expression\n💑 *Gnati Karaka* - Spouse and marriage\n🏥 *Dara Karaka* - Health and longevity\n\n*Jaimini Aspects (Different from Parasara):*\n• 3° (Trine) - Harmony and natural support\n• 5° (Quintile) - Creativity and children\n• 7° (Sextile) - Partnerships and marriage\n• 9° (Square) - Challenges and dynamic action\n• 10° (Decile) - Career and social status\n• 12° (Opposition) - Balance and relationships\n\n*Benefits of Jaimini System:*\n• Alternative perspective on your chart\n• Different insights from traditional astrology\n• Specialized significators for life areas\n• Enhanced predictive accuracy\n• Deeper understanding of life purpose\n\n*Perfect For:*\n• Those seeking alternative astrological insights\n• Understanding soul purpose and life mission\n• Career and relationship guidance\n• Health and longevity analysis\n• Spiritual growth and self-realization\n\nSend "jaimini astrology" or "karakas" to get your complete Jaimini analysis! 🔮';
    break;
  case 'get_hindu_festivals_info':
    response = '🕉️ *Hindu Festivals & Auspicious Calendar*\n\nExplore India\'s rich festival heritage and discover auspicious timings for your activities!\n\n*🪔 Major Hindu Festivals:*\n• **Diwali** - Festival of Lights, Lakshmi Puja, prosperity & new beginnings\n• **Holi** - Festival of Colors, spring celebration, renewal & joy\n• **Durga Puja** - Goddess worship, divine power, spiritual purification\n• **Maha Shivaratri** - Lord Shiva\'s night, spiritual awakening, meditation\n• **Raksha Bandhan** - Brother-sister bond, protection, family harmony\n• **Ganesh Chaturthi** - Lord Ganesha, obstacle removal, wisdom\n• **Navaratri** - Nine nights of Goddess, purification, cultural celebration\n• **Krishna Janmashtami** - Lord Krishna\'s birth, devotion, divine love\n• **Ram Navami** - Lord Rama\'s birth, righteousness, ethical living\n• **Hanuman Jayanti** - Lord Hanuman, strength, courage, devotion\n\n*⏰ Auspicious Timings (Muhurtas):*\n• **Abhijit Muhurta** - Most auspicious (11:30 AM - 12:30 PM daily)\n• **Brahma Muhurta** - Spiritual practices (1.5 hours before sunrise)\n• **Rahu Kalam** - Avoid important work (varies by weekday)\n• **Yamagandam** - Challenging period (varies by weekday)\n\n*📅 Festival Information Available:*\n• Detailed significance and rituals for each festival\n• Regional variations and modern celebration tips\n• Auspicious activities for different festivals\n• Upcoming festival calendar (next 30 days)\n• Festival-specific timings and muhurtas\n\n*Examples of Requests:*\n• "festivals for 2024-10-28" - Check Diwali festivals\n• "festival about holi" - Detailed Holi information\n• "upcoming festivals" - Next 30 days calendar\n• "auspicious timings" - Daily muhurta guidance\n• "hindu calendar" - General festival overview\n\n*🌟 Festival Significance:*\n• Cultural preservation and community bonding\n• Spiritual growth and divine connection\n• Seasonal celebrations and agricultural cycles\n• Family traditions and social harmony\n• Auspicious beginnings and prosperity\n\nWhat festival or auspicious timing information interests you? Send your request to explore the divine calendar! 🕉️';
    break;
  case 'get_vedic_numerology_analysis':
    if (!user.birthDate) {
      response = 'I need your birth date and name for Vedic numerology analysis.';
      break;
    }
    try {
      const vedicAnalysis = vedicNumerology.getVedicNumerologyAnalysis(user.birthDate, user.name);
      if (vedicAnalysis.error) {
        response = `❌ ${vedicAnalysis.error}`;
      } else {
        response = vedicAnalysis.summary;
      }
    } catch (error) {
      logger.error('Error generating Vedic numerology analysis:', error);
      response = '❌ Sorry, I couldn\'t generate your Vedic numerology analysis right now. Please try again later.';
    }
    break;
  case 'get_ayurvedic_astrology_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Ayurvedic astrology analysis.';
      break;
    }
    try {
      const ayurvedicAnalysis = ayurvedicAstrology.analyzeAyurvedicConstitution({
        birthDate: user.birthDate,
        birthTime: user.birthTime || '12:00',
        birthPlace: user.birthPlace || 'Delhi'
      });
      if (ayurvedicAnalysis.error) {
        response = `❌ ${ayurvedicAnalysis.error}`;
      } else {
        response = ayurvedicAnalysis.summary;
      }
    } catch (error) {
      logger.error('Error generating Ayurvedic astrology analysis:', error);
      response = '❌ Sorry, I couldn\'t generate your Ayurvedic astrology analysis right now. Please try again later.';
    }
    break;
  case 'get_varga_charts_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Varga Charts analysis.';
      break;
    }
    response = '🕉️ *Varga (Divisional) Charts*\n\nVarga charts provide specialized analysis for different aspects of your life!\n\n*Complete Varga Chart Analysis Includes:*\n\n🕉️ *D-9 Navamsa* - Marriage, spouse, spiritual life, children\n💼 *D-10 Dashamsa* - Career, profession, authority, reputation\n👨‍👩‍👧‍👦 *D-12 Dwadasamsa* - Parents, ancestry, spiritual heritage\n🏠 *D-16 Shodasamsa* - Vehicles, pleasures, material comforts\n📚 *D-24 Chaturvimsamsa* - Education, learning, intelligence\n⚕️ *D-30 Trimsamsa* - Health challenges, misfortunes, obstacles\n\n*What You\'ll Learn:*\n• Specialized planetary positions for each life area\n• Strength of different aspects of your life\n• Areas needing attention and improvement\n• Favorable periods for specific activities\n• Deeper understanding beyond the main birth chart\n\n*Benefits:*\n• Comprehensive life analysis across all areas\n• Targeted guidance for specific life challenges\n• Understanding of hidden strengths and weaknesses\n• Spiritual growth and self-improvement insights\n\nSend "varga charts" to get your complete divisional analysis! 🔮';
    break;
  case 'get_shadbala_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for Shadbala analysis.';
      break;
    }
    response = '🕉️ *Shadbala (6-Fold Planetary Strength)*\n\nShadbala provides the most precise measurement of planetary power in Vedic astrology!\n\n*Complete 6-Fold Analysis Includes:*\n\n🏛️ *Sthana Bala* - Positional strength (exaltation, house placement, sign relationships)\n🧭 *Dig Bala* - Directional strength (planetary directions and orientations)\n⏰ *Kala Bala* - Temporal strength (time-based influences and cycles)\n⚡ *Chesta Bala* - Motivational strength (planetary speed and retrograde motion)\n🌿 *Naisargika Bala* - Natural strength (innate planetary power and hierarchy)\n👁️ *Drik Bala* - Aspect strength (benefic and malefic planetary influences)\n\n*What You\'ll Discover:*\n• Precise strength percentage for each planet (0-100%)\n• Detailed breakdown of all 6 strength components\n• Planetary strength rankings and hierarchy\n• Strongest and weakest planetary periods\n• Recommendations for optimal timing\n• Areas where planetary power can be enhanced\n\n*Benefits:*\n• Know exactly when planets are strongest in your life\n• Time important decisions during peak planetary strength\n• Understand planetary power distribution in your chart\n• Identify periods of maximum opportunity\n• Get guidance on strengthening weak planets\n\n*Advanced Insights:*\n• Beyond basic dignity (exalted, own sign, etc.)\n• Comprehensive strength measurement\n• Predictive power for life events\n• Spiritual growth through planetary understanding\n\nSend "shadbala" to get your complete planetary strength analysis! 🔮';
    break;
  case 'get_muhurta_analysis':
    response = '🕉️ *Muhurta (Electional Astrology) - Auspicious Timing*\n\nMuhurta helps you choose the most auspicious time for important life events!\n\n*Available for:*\n💒 *Weddings & Marriages*\n💼 *Business Launches & New Ventures*\n🏠 *House Warming & Home Ceremonies*\n📚 *Education & Study Beginnings*\n🛐 *Religious Ceremonies & Pujas*\n🎯 *Any Important Life Event*\n\n*What Muhurta Provides:*\n\n🕐 *Top 5 Auspicious Timings* on your preferred date\n📅 *Alternative Dates* if preferred date isn\'t ideal\n🌓 *Panchaka Dosha Analysis* (5 defects to avoid)\n⭐ *Abhijit Muhurta* (most auspicious time of day)\n🪐 *Planetary Considerations* for your event type\n📊 *Detailed Scoring* and reasoning\n\n*How to Request:*\n\nSend your request in this format:\n```\nMuhurta for [event type] on [DD/MM/YYYY] in [City, Country]\n```\n\n*Examples:*\n• "Muhurta for wedding on 15/06/2024 in Mumbai, India"\n• "Auspicious time for business launch on 01/07/2024 in Delhi, India"\n• "House warming muhurta on 20/08/2024 in Bangalore, India"\n\n*Benefits:*\n• Maximize success potential of important events\n• Align with cosmic energies and planetary influences\n• Follow ancient Vedic wisdom for timing\n• Minimize obstacles and challenges\n• Ensure harmony and prosperity\n\nWhat event are you planning? I\'ll find the perfect auspicious time for you! 🕉️';
    break;
  case 'get_panchang_analysis':
    response = '🕉️ *Panchang (Hindu Almanac) - Daily Guidance*\n\nPanchang provides traditional Hindu calendar information and daily guidance for spiritual and cultural activities!\n\n*Complete Panchang Includes:*\n\n🌓 *Tithi* - Lunar day with Shukla/Krishna Paksha\n⭐ *Nakshatra* - 27 Lunar constellations\n🪐 *Yoga* - 27 Planetary combinations\n⚡ *Karana* - 11 Half lunar days\n\n🌅 *Sunrise & Sunset* - Local timings for your location\n🌙 *Moon Phase* - Current lunar phase\n📅 *Weekday* - Day of the week\n\n*Inauspicious Periods:*\n😈 *Rahukalam* - Rahu\'s period (avoid important work)\n👹 *Gulikakalam* - Most inauspicious time\n⚠️ *Yamagandam* - Generally inauspicious\n\n⭐ *Abhijit Muhurta* - Most auspicious time of day\n\n*Daily Activity Guidance:*\n✅ *Recommended Activities* - Auspicious for the day\n❌ *Activities to Avoid* - Based on planetary influences\n📊 *Overall Day Rating* - Auspicious/Neutral/Inauspicious\n\n*How to Request:*\n\nSend your request in this format:\n```\nPanchang for [DD/MM/YYYY] in [City, Country]\n```\n\n*Examples:*\n• "Panchang for 15/06/2024 in Mumbai, India"\n• "Daily Panchang for today in Delhi"\n• "Hindu Almanac for Bangalore"\n\n*Perfect for:*\n• Planning religious ceremonies and pujas\n• Choosing auspicious dates for events\n• Daily spiritual practice guidance\n• Understanding cultural and festival timings\n• Avoiding inauspicious periods\n• Wedding and ceremony planning\n\n*Benefits:*\n• Follow traditional Hindu calendar wisdom\n• Plan activities according to cosmic influences\n• Avoid inauspicious times and periods\n• Maximize success of important undertakings\n• Cultural and spiritual awareness\n• Daily guidance for harmonious living\n\nWhat date and location would you like the Panchang for? 🕉️';
    break;
  case 'get_synastry_analysis':
    if (!user.birthDate) {
      response = 'I need your complete birth details for synastry analysis.';
      break;
    }
    // Check if partner data is provided in the message
    const partnerDataMatch = messageText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (partnerDataMatch) {
      // Partner data provided, let astrologyEngine handle it
      response = generateAstrologyResponse(messageText, user);
    } else {
      response = '💕 *Synastry Analysis*\n\nTo perform a detailed relationship astrology analysis, please provide your partner\'s birth details:\n\n• Birth date (DD/MM/YYYY)\n• Birth time (HH:MM) - optional\n• Birth place (City, Country)\n\nExample: 25/12/1985, 09:15, London, UK\n\nThis will compare your charts and reveal:\n• Planetary aspects between you\n• Composite relationship chart\n• Romantic compatibility\n• Communication dynamics\n• Long-term potential';
    }
    break;
  case 'get_lunar_return':
    if (!user.birthDate) {
      response = 'I need your complete birth details for lunar return analysis.';
      break;
    }
    response = generateAstrologyResponse('lunar return', user);
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
    const comprehensiveResponse = '🌟 *Complete Astrology Services*\n\nChoose from our full range of personalized readings:\n\n*Core Services:*\n1. 📅 Daily Horoscope\n2. 📊 Full Birth Chart\n3. 💕 Compatibility\n4. 💞 Synastry Analysis\n\n*Divination Systems:*\n5. 🔮 Tarot Reading\n6. 🏮 I Ching Oracle\n7. 🤲 Palmistry\n\n*Ancient Traditions:*\n8. 📜 Nadi Astrology\n9. 🌳 Kabbalistic\n10. 🏛️ Mayan Calendar\n11. 🍃 Celtic Wisdom\n\n*Advanced Services:*\n12. ❓ Horary Question\n13. 📅 Electional Astrology\n14. 🐉 Chinese BaZi\n15. 🔢 Numerology\n16. 🌍 Astrocartography\n17. 🪐 Asteroid Analysis\n18. ⭐ Fixed Stars\n19. 🏥 Medical Astrology\n20. 💰 Financial Astrology\n21. 🔮 Harmonic Astrology\n22. 💼 Career Astrology\n\n*Predictive Astrology:*\n23. 🔮 Secondary Progressions\n24. ☀️ Solar Arc Directions\n\nReply with the number or service name to get started!';
    await sendMessage(phoneNumber, comprehensiveResponse);
    return null;
  case 'initiate_compatibility_flow':
    if (!user.birthDate) {
      response = 'I need your complete birth details for compatibility analysis. Please provide your birth date, time, and place first.';
      break;
    }
    response = '💕 *Relationship Compatibility Analysis*\n\nI can analyze compatibility between you and a partner using multiple astrological systems!\n\n*Available Compatibility Types:*\n\n🕉️ *Hindu Vedic Marriage Matching* - Traditional 36-point Guna system\n💞 *Western Synastry* - Planetary aspects and composite charts\n🔮 *General Compatibility* - Sun sign and basic chart comparison\n\n*To check compatibility:*\n\nProvide your partner\'s birth details in this format:\n```\nName: [Partner Name]\nBirth: DD/MM/YYYY, HH:MM\nPlace: [City, Country]\n```\n\nExample:\n```\nName: Sarah Johnson\nBirth: 15/06/1990, 14:30\nPlace: New York, USA\n```\n\nOr send "vedic marriage" for traditional Hindu compatibility, or "synastry" for Western relationship astrology.\n\nWhat type of compatibility analysis interests you?';
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
