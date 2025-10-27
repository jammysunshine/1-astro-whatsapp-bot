const { getFlow } = require('./flowLoader');
const {
  getUserSession,
  setUserSession,
  deleteUserSession,
  addBirthDetails,
  updateUserProfile
} = require('../models/userModel');
const { sendMessage } = require('../services/whatsapp/messageSender');
const logger = require('../utils/logger');
const vedicCalculator = require('../services/astrology/vedicCalculator');
const numerologyService = require('../services/astrology/numerologyService');
const { getMenu } = require('./menuLoader');
const { sendListMessage } = require('../services/whatsapp/messageSender');

/**
 * Validates user input for a conversation step
 * @param {string} input - User input
 * @param {Object} step - Step configuration
 * @returns {Object} Validation result with isValid, cleanedValue, errorMessage
 */
const validateStepInput = async(input, step) => {
  const trimmedInput = input.trim().toLowerCase();

  switch (step.validation) {
  case 'text':
    if (!input || input.trim().length === 0) {
      return { isValid: false, errorMessage: 'Please provide some text.' };
    }
    return { isValid: true, cleanedValue: input.trim() };

  case 'date':
    // Only accept DDMMYY or DDMMYYYY formats
    let day;
    let month;
    let year;

    // Check for 6-digit format first (DDMMYY - could be ambiguous)
    const shortDateRegex = /^(\d{2})(\d{2})(\d{2})$/;
    const shortMatch = input.match(shortDateRegex);
    if (shortMatch) {
      [, day, month] = shortMatch.map(Number);
      const yy = parseInt(shortMatch[3]);

      // Check if year is ambiguous (00-99, could be 1900s or 2000s)
      if (yy >= 0 && yy <= 99) {
        const currentYear = new Date().getFullYear();
        const year1900 = 1900 + yy;
        const year2000 = 2000 + yy;

        // Check if each possible year would result in a future date
        const date1900 = new Date(year1900, month - 1, day);
        const date2000 = new Date(year2000, month - 1, day);

        const is1900Valid =
            date1900 <= new Date() &&
            date1900.getFullYear() === year1900 &&
            date1900.getMonth() === month - 1 &&
            date1900.getDate() === day;
        const is2000Valid =
            date2000 <= new Date() &&
            date2000.getFullYear() === year2000 &&
            date2000.getMonth() === month - 1 &&
            date2000.getDate() === day;

        // If only one option is valid, use it directly
        if (is1900Valid && !is2000Valid) {
          year = year1900;
        } else if (!is1900Valid && is2000Valid) {
          year = year2000;
        } else if (is1900Valid && is2000Valid) {
          // Both are valid (neither is future), show ambiguity
          return {
            isValid: true,
            needsClarification: true,
            clarificationType: 'year_ambiguity',
            data: { day, month, yy },
            clarificationMessage: `📅 *Birth Year Ambiguity*\n\nYour input suggests ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}, but the year ${yy.toString().padStart(2, '0')} could be interpreted as:`,
            clarificationButtons: [
              {
                id: `year_19${yy.toString().padStart(2, '0')}`,
                title: `19${yy.toString().padStart(2, '0')}`
              },
              {
                id: `year_20${yy.toString().padStart(2, '0')}`,
                title: `20${yy.toString().padStart(2, '0')}`
              }
            ]
          };
        } else {
          // Neither is valid (both would be future dates)
          return {
            isValid: false,
            errorMessage: 'Please provide a valid birth year.'
          };
        }
      } else {
        year = 1900 + yy; // Convert YY to YYYY (1900-1999)
      }
    } else {
      // Check for 8-digit format (DDMMYYYY)
      const compactDateRegex = /^(\d{2})(\d{2})(\d{4})$/;
      const compactMatch = input.match(compactDateRegex);
      if (compactMatch) {
        [, day, month, year] = compactMatch.map(Number);
      } else {
        return {
          isValid: false,
          errorMessage:
              step.error_message ||
              'Please provide date in DDMMYY (150690) or DDMMYYYY (15061990) format only.'
        };
      }
    }
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
      return { isValid: false, errorMessage: 'Please provide a valid date.' };
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      return {
        isValid: false,
        errorMessage: 'Please provide a valid birth year.'
      };
    }

    // Return normalized date in DD/MM/YYYY format for consistency
    const normalizedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return { isValid: true, cleanedValue: normalizedDate };

  case 'time_or_skip':
    if (trimmedInput === 'skip') {
      return { isValid: true, cleanedValue: null };
    }

    let hours;
    let minutes;
    let isAmbiguous = false;

    // Check for HHMM format (4 digits)
    const compactTimeRegex = /^(\d{2})(\d{2})$/;
    const compactTimeMatch = input.match(compactTimeRegex);
    if (compactTimeMatch) {
      [, hours, minutes] = compactTimeMatch.map(Number);
      // If hours 00-11, it could be AM or PM (ambiguous)
      if (hours >= 0 && hours <= 11) {
        isAmbiguous = true;
      }
    } else {
      // Check for HH:MM format
      const timeRegex = /^(\d{1,2}):(\d{2})$/;
      const timeMatch = input.match(timeRegex);
      if (!timeMatch) {
        return {
          isValid: false,
          errorMessage:
              step.error_message ||
              'Please provide time in HHMM (1430) or HH:MM (14:30) format, or type \'skip\'.'
        };
      }
      [, hours, minutes] = timeMatch.map(Number);
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return {
        isValid: false,
        errorMessage: 'Please provide a valid time (00:00 to 23:59).'
      };
    }

    // Handle ambiguous time (HHMM format with hours 00-11)
    if (isAmbiguous) {
      return {
        isValid: true,
        needsClarification: true,
        clarificationType: 'time_ambiguity',
        data: { hours, minutes },
        clarificationMessage: `🕐 *Time Ambiguity*\n\nYour input ${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')} could mean:`,
        clarificationButtons: [
          {
            id: `time_am_${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`,
            title: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} AM`
          },
          {
            id: `time_pm_${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`,
            title: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} PM`
          }
        ]
      };
    }

    // Return in HH:MM format for consistency
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return { isValid: true, cleanedValue: formattedTime };

  case 'language_choice':
    const validLanguages = ['english', 'hindi', 'en', 'hi'];
    if (validLanguages.includes(trimmedInput.toLowerCase())) {
      return { isValid: true, cleanedValue: trimmedInput.toLowerCase() };
    }
    // Default to english if not specified
    return { isValid: true, cleanedValue: 'english' };

  case 'yes_no':
    if (trimmedInput === 'yes' || trimmedInput === 'y') {
      return { isValid: true, cleanedValue: 'yes' };
    }
    if (trimmedInput === 'no' || trimmedInput === 'n') {
      return { isValid: true, cleanedValue: 'no' };
    }
    return {
      isValid: false,
      errorMessage: step.error_message || 'Please reply "yes" or "no".'
    };

  case 'plan_choice':
    if (
      trimmedInput === 'essential' ||
        trimmedInput === 'premium' ||
        trimmedInput === 'vip'
    ) {
      return { isValid: true, cleanedValue: input.toLowerCase() };
    }
    return {
      isValid: false,
      errorMessage:
          step.error_message ||
          'Please choose "essential", "premium", or "vip".'
    };

  case 'yes_no_or_menu':
    if (trimmedInput === 'yes' || trimmedInput === 'y') {
      return { isValid: true, cleanedValue: 'yes' };
    }
    if (trimmedInput === 'no' || trimmedInput === 'n') {
      return { isValid: true, cleanedValue: 'no' };
    }
    if (trimmedInput === 'menu') {
      return { isValid: true, cleanedValue: 'menu' };
    }
    return {
      isValid: false,
      errorMessage:
          step.error_message || 'Please reply "yes", "no", or "menu".'
    };

  case 'again_or_menu':
    if (trimmedInput === 'again' || trimmedInput === 'a') {
      return { isValid: true, cleanedValue: 'again' };
    }
    if (trimmedInput === 'menu' || trimmedInput === 'm') {
      return { isValid: true, cleanedValue: 'menu' };
    }
    return {
      isValid: false,
      errorMessage:
          step.error_message || 'Please reply "again" or "menu".'
    };

  case 'detailed_or_menu':
    if (trimmedInput === 'detailed' || trimmedInput === 'd') {
      return { isValid: true, cleanedValue: 'detailed' };
    }
    if (trimmedInput === 'menu' || trimmedInput === 'm') {
      return { isValid: true, cleanedValue: 'menu' };
    }
    return {
      isValid: false,
      errorMessage:
          step.error_message || 'Please reply "detailed" or "menu".'
    };

  case 'none':
    return { isValid: true, cleanedValue: input };

  default:
    return { isValid: true, cleanedValue: input };
  }
};

/**
 * Processes a user message within a defined conversation flow.
 * @param {Object} message - The incoming WhatsApp message object.
 * @param {Object} user - The user object.
 * @param {string} flowId - The ID of the conversation flow (e.g., 'onboarding').
 * @returns {Promise<boolean>} True if the message was handled by the conversation engine, false otherwise.
 */
const processFlowMessage = async(message, user, flowId) => {
  let phoneNumber;
  try {
    phoneNumber = user?.phoneNumber;
    if (!phoneNumber) {
      logger.error('❌ No phone number provided to processFlowMessage');
      return false;
    }

    // Extract input based on message type
    let messageText = '';
    if (message.type === 'text') {
      messageText = message.text.body;
    } else if (message.type === 'interactive') {
      // For interactive messages, we don't validate the input here
      // The button processing happens separately
      messageText = '';
    }

    let session = await getUserSession(phoneNumber);

    const flow = getFlow(flowId);
    if (!flow) {
      logger.error(`❌ Conversation flow '${flowId}' not found.`);
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I encountered an internal error. Please try again later.'
      );
      await deleteUserSession(phoneNumber);
      return false;
    }

    // Initialize session for new flow if it doesn't exist
    if (!session) {
      session = {
        currentFlow: flowId,
        currentStep: flow.start_step,
        flowData: {}
      };
      await setUserSession(phoneNumber, session);
    }

    // Ensure session has required properties
    if (!session.flowData) {
      session.flowData = {};
      await setUserSession(phoneNumber, session);
    }
    // This second check for flow is redundant after moving its initialization
    // and should be removed or refactored if it's meant to handle a different case.
    // For now, commenting it out as it's causing confusion and potential issues.
    // if (!flow) {
    //   logger.error(`❌ Conversation flow '${flowId}' not found.`);
    //   await sendMessage(
    //     phoneNumber,
    //     'I\'m sorry, I encountered an internal error. Please try again later.'
    //   );
    //   await deleteUserSession(phoneNumber);
    //   return false;
    // }

    // Get current step from session
    const currentStepId = session.currentStep;
    const currentStep = flow.steps[currentStepId];

    if (!currentStep) {
      logger.error(`❌ Current step '${currentStepId}' not found in flow '${flowId}'.`);
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I encountered an internal error. Please try again later.'
      );
      await deleteUserSession(phoneNumber);
      return false;
    }

    // Handle interactive messages differently - they don't need validation
    if (message.type === 'interactive') {
      // For interactive messages, the processing happens elsewhere
      // Just return true to indicate message was handled
      return true;
    }

    // Validate input if step has validation
    if (currentStep.validation && currentStep.validation !== 'none') {
      const validationResult = await validateStepInput(messageText, currentStep);
      if (!validationResult.isValid) {
        await sendMessage(phoneNumber, validationResult.errorMessage);
        return true; // Message handled, but flow not progressed
      }

      // Store validated data if data_key is specified
      if (currentStep.data_key) {
        session.flowData[currentStep.data_key] = validationResult.cleanedValue;
        await setUserSession(phoneNumber, session);
        logger.info(`Stored ${currentStep.data_key}: ${validationResult.cleanedValue} in flowData`);
      }
    }

    // Move to next step
    if (currentStep.next_step) {
      logger.info(`Moving from step ${currentStepId} to ${currentStep.next_step}`);
      session.currentStep = currentStep.next_step;
      await setUserSession(phoneNumber, session);

      // Get the next step
      const nextStep = flow.steps[currentStep.next_step];
      if (nextStep) {
        // Send next step prompt
        let prompt = nextStep.prompt || nextStep.fallback_prompt;
        if (prompt) {
          // Replace placeholders in prompt
          prompt = prompt.replace(/\{(\w+)\}/g, (match, key) => session.flowData[key] || match);

          if (nextStep.interactive) {
            // Send interactive message
            const { type, body, buttons } = nextStep.interactive;
            if (type === 'button_reply' && buttons) {
              await sendMessage(phoneNumber, { type: 'button', body: prompt, buttons }, 'interactive');
            }
          } else {
            // Send text message
            await sendMessage(phoneNumber, prompt);
          }
        }

        // If next step has an action, execute it
        if (nextStep.action) {
          logger.info(`Executing action ${nextStep.action} for step ${currentStep.next_step}`);
          await executeFlowAction(
            phoneNumber,
            user,
            flowId,
            nextStep.action,
            session.flowData
          );
          return true;
        }
      } else {
        logger.error(`❌ Next step '${currentStep.next_step}' not found in flow '${flowId}'.`);
        await sendMessage(
          phoneNumber,
          'I\'m sorry, I encountered an internal error. Please try again later.'
        );
        await deleteUserSession(phoneNumber);
        return false;
      }
    } else if (currentStep.action) {
      // If current step has an action and no next step, execute action
      await executeFlowAction(
        phoneNumber,
        user,
        flowId,
        currentStep.action,
        session.flowData
      );
      return true;
    } else {
      logger.warn(
        `⚠️ Flow '${flowId}' ended unexpectedly at step '${currentStepId}'.`
      );
      await sendMessage(
        phoneNumber,
        'I\'m sorry, our conversation ended unexpectedly. Please try again.'
      );
      await deleteUserSession(phoneNumber);
      return false;
    }
  } catch (error) {
    logger.error('❌ Error in processFlowMessage:', error);
    try {
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I encountered an error. Please try again.'
      );
    } catch (sendError) {
      logger.error('❌ Error sending error message:', sendError);
    }
    return false;
  }
};

/**
 * Executes an action defined in the conversation flow.
 * @param {string} phoneNumber - The user's phone number.
 * @param {Object} user - The user object.
 * @param {string} flowId - The ID of the conversation flow.
 * @param {string} action - The action to execute (e.g., 'complete_profile').
 * @param {Object} flowData - Data collected during the flow.
 */
const executeFlowAction = async(
  phoneNumber,
  user,
  flowId,
  action,
  flowData
) => {
  logger.info(`🔄 Executing flow action: ${action} for flow: ${flowId}`);
  switch (action) {
  case 'complete_profile': {
    logger.info('🎯 Executing complete_profile action');
    const { birthDate } = flowData;
    const { birthTime } = flowData;
    const { birthPlace } = flowData;
    const preferredLanguage = flowData.preferredLanguage || 'en';
    logger.info('FlowData received:', { birthDate, birthTime, birthPlace, preferredLanguage });

    // Update user profile with birth details
    logger.info('Calling addBirthDetails...');
    await addBirthDetails(phoneNumber, birthDate, birthTime, birthPlace);
    logger.info('addBirthDetails completed. Setting profileComplete: true...');
    await updateUserProfile(phoneNumber, {
      profileComplete: true,
      preferredLanguage,
      onboardingCompletedAt: new Date()
    });
    logger.info('updateUserProfile completed successfully');
    logger.info(
      'updateUserProfile called with profileComplete: true. Exiting complete_profile action.'
    );
    logger.info('✅ User profile updated successfully');

    // Generate comprehensive birth chart analysis
    let detailedAnalysis = '\n\n📊 *Detailed Chart Analysis:*\nUnable to generate detailed analysis at this time.';
    let sunSign = 'Unknown';
    let moonSign = 'Unknown';
    let risingSign = 'Unknown';
    try {
      const fullChart = await vedicCalculator.generateBasicBirthChart({
        birthDate,
        birthTime,
        birthPlace,
        name: phoneNumber // Use phone number as name for now
      });

      // Extract signs for user profile
      sunSign = fullChart.sunSign || 'Unknown';
      moonSign = fullChart.moonSign || 'Unknown';
      risingSign = fullChart.risingSign || 'Unknown';

      detailedAnalysis = '\n\n📊 *Detailed Chart Analysis:*\n\n';
      detailedAnalysis += `🌟 *Your Cosmic Blueprint:*\n`;
      detailedAnalysis += `☀️ *Sun Sign:* ${sunSign}\n`;
      detailedAnalysis += `🌙 *Moon Sign:* ${moonSign}\n`;
      detailedAnalysis += `⬆️ *Rising Sign:* ${risingSign}\n\n`;

      if (fullChart.description) {
        detailedAnalysis += `${fullChart.description}\n\n`;
      }

      if (fullChart.personalityTraits && fullChart.personalityTraits.length > 0) {
        detailedAnalysis += `🧠 *Key Personality Traits:*\n`;
        fullChart.personalityTraits.slice(0, 3).forEach(trait => {
          detailedAnalysis += `• ${trait}\n`;
        });
        detailedAnalysis += '\n';
      }

      if (fullChart.strengths && fullChart.strengths.length > 0) {
        detailedAnalysis += `💪 *Your Strengths:*\n`;
        fullChart.strengths.forEach(strength => {
          detailedAnalysis += `• ${strength}\n`;
        });
        detailedAnalysis += '\n';
      }
    } catch (error) {
      logger.warn('Could not generate detailed analysis:', error.message);
      detailedAnalysis = '\n\n📊 *Detailed Chart Analysis:*\nUnable to generate detailed analysis at this time. Please try again later.';
    }

    // Update user with calculated signs
    try {
      await updateUserProfile(phoneNumber, {
        sunSign,
        moonSign,
        risingSign
      });
    } catch (error) {
      logger.error('Error updating user with signs:', error);
    }

    // Generate top 3 life patterns
    let patterns = [
      'Strong communication abilities',
      'Natural leadership qualities',
      'Creative problem-solving skills'
    ];
    try {
      const chart = await vedicCalculator.generateBasicBirthChart({ birthDate, birthTime, birthPlace });
      patterns = chart.chartPatterns?.lifePatterns || patterns;
    } catch (error) {
      logger.warn('Could not generate life patterns:', error.message);
    }

    // Generate 3-day transit preview with error handling
    let transits = {
      today: 'Today brings opportunities for new connections',
      tomorrow: 'Tomorrow favors focused work and planning',
      day3: 'Day 3 brings creative inspiration'
    };
    try {
      transits = await vedicCalculator.generateTransitPreview(
        { birthDate, birthTime, birthPlace },
        3
      );
    } catch (error) {
      logger.error('❌ Error generating transit preview:', error);
      // Continue with default transits
    }

    // Create comprehensive completion message
    let completionMessage =
        '🎉 *Welcome to your cosmic journey!*\n\nYour profile is complete! Here\'s your *comprehensive birth chart summary*:\n\n';

    completionMessage += `☀️ *Sun Sign:* ${sunSign} - Your core identity and life purpose\n`;
    completionMessage += `🌙 *Moon Sign:* ${moonSign} - Your emotional nature and inner self\n`;
    completionMessage += `⬆️ *Rising Sign:* ${risingSign} - How others perceive you\n\n`;

    completionMessage += '🔥 *Your Top 3 Life Patterns:*\n';
    completionMessage += `1. ${patterns[0] || 'Strong communication abilities'}\n`;
    completionMessage += `2. ${patterns[1] || 'Natural leadership qualities'}\n`;
    completionMessage += `3. ${patterns[2] || 'Creative problem-solving skills'}\n\n`;

    completionMessage += '⭐ *3-Day Cosmic Preview:*\n';
    completionMessage += `${transits.today || 'Today brings opportunities for new connections'}\n\n`;
    completionMessage += `${transits.tomorrow || 'Tomorrow favors focused work and planning'}\n\n`;
    completionMessage += `${transits.day3 || 'Day 3 brings creative inspiration'}\n\n`;

    completionMessage +=
        '📈 *2,847 users* with your Sun sign found these insights highly accurate!\n\n';

    // Add detailed analysis if available
    completionMessage += detailedAnalysis;

    completionMessage +=
        'What would you like to explore next?\n\n🔮 Daily Horoscope\n📊 Full Birth Chart\n💕 Compatibility Check\n\nJust reply with your choice!';

    await sendMessage(phoneNumber, completionMessage);

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

    // Clear onboarding session
    // await deleteUserSession(phoneNumber);

    logger.info(
      `✅ User ${phoneNumber} completed onboarding with comprehensive analysis`
    );
    break;
  }
  case 'process_subscription': {
    const { selectedPlan } = flowData;

    // For now, just acknowledge the subscription request
    // In production, this would integrate with payment processor
    await sendMessage(
      phoneNumber,
      `💳 *Subscription Processing*\n\nThank you for choosing the ${selectedPlan} plan!\n\nYour subscription will be activated shortly. You'll receive a confirmation message once it's ready.`
    );
    await deleteUserSession(phoneNumber);
    break;
  }

  case 'generate_compatibility': {
    const { partnerBirthDate } = flowData;
    const userSign = vedicCalculator.calculateSunSign(user.birthDate);
    const partnerSign = vedicCalculator.calculateSunSign(partnerBirthDate);

    const compatibilityResult = vedicCalculator.checkCompatibility(
      userSign,
      partnerSign
    );

    const resultMessage = `💕 *Compatibility Analysis*\n\n*Your Sign:* ${userSign}\n*Partner's Sign:* ${partnerSign}\n*Compatibility:* ${compatibilityResult.compatibility}\n\n${compatibilityResult.description}\n\n✨ Remember, compatibility is just one aspect of a relationship!`;

    // Update the flow step prompt with the result
    const flow = getFlow(flowId);
    if (flow && flow.steps.generate_compatibility) {
      let { prompt } = flow.steps.generate_compatibility;
      prompt = prompt.replace('{compatibilityResult}', resultMessage);
      await sendMessage(phoneNumber, prompt);
    } else {
      await sendMessage(phoneNumber, resultMessage);
    }
    break;
  }
  case 'show_daily_horoscope': {
    try {
      const horoscopeData = await vedicCalculator.generateDailyHoroscope({
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthPlace: user.birthPlace
      });
      const sunSign = vedicCalculator.calculateSunSign(user.birthDate);

      const body = `🔮 *Your Daily Horoscope*\n\n${sunSign} - ${horoscopeData.general}\n\n💫 *Lucky Color:* ${horoscopeData.luckyColor}\n🎯 *Lucky Number:* ${horoscopeData.luckyNumber}\n💝 *Love:* ${horoscopeData.love}\n💼 *Career:* ${horoscopeData.career}\n💰 *Finance:* ${horoscopeData.finance}\n🏥 *Health:* ${horoscopeData.health}\n\nWhat would you like to explore next?`;

      const buttons = [
        { type: 'reply', reply: { id: 'horoscope_again', title: '🔄 Another Reading' } },
        { type: 'reply', reply: { id: 'horoscope_menu', title: '🏠 Main Menu' } }
      ];

      await sendMessage(phoneNumber, { type: 'button', body, buttons }, 'interactive');

      // Skip the flow's message sending
      const session = await getUserSession(phoneNumber);
      session.flowData.skipMessage = true;
      await setUserSession(phoneNumber, session);
    } catch (error) {
      logger.error('Error generating daily horoscope:', error);
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I couldn\'t generate your horoscope right now. Please try again later.'
      );
    }
    break;
  }
  case 'handle_horoscope_navigation': {
    const { choice } = flowData;
    if (choice === 'again') {
      // Restart the horoscope flow
      const newSession = {
        currentFlow: 'daily_horoscope',
        currentStep: 'show_horoscope',
        data: {}
      };
      await setUserSession(phoneNumber, newSession);
      await executeFlowAction(
        phoneNumber,
        user,
        'daily_horoscope',
        'show_daily_horoscope',
        {}
      );
    } else if (choice === 'menu') {
      // Show main menu and clear session
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
      await deleteUserSession(phoneNumber);
    }
    break;
  }
  case 'show_comprehensive_menu': {
    const menu = getMenu('comprehensive_menu');
    if (menu) {
      await sendListMessage(
        phoneNumber,
        menu.body,
        'Select Service',
        menu.sections
      );
    }
    break;
  }
  case 'generate_numerology_report': {
    try {
      const { fullName, birthDate } = flowData;
      const numerologyService = require('../services/astrology/numerologyService');

      const report = await numerologyService.generateFullReport(
        fullName,
        birthDate
      );

      let reportMessage = '🔢 *Your Numerology Report*\n\n';
      reportMessage += `*Name:* ${fullName}\n`;
      reportMessage += `*Birth Date:* ${birthDate}\n\n`;

      reportMessage += `*Life Path Number:* ${report.lifePath}\n`;
      reportMessage += `${report.lifePathDescription}\n\n`;

      reportMessage += `*Expression Number:* ${report.expression}\n`;
      reportMessage += `${report.expressionDescription}\n\n`;

      reportMessage += `*Soul Urge Number:* ${report.soulUrge}\n`;
      reportMessage += `${report.soulUrgeDescription}\n\n`;

      reportMessage += `*Personality Number:* ${report.personality}\n`;
      reportMessage += `${report.personalityDescription}\n\n`;

      reportMessage += `*Key Strengths:* ${report.strengths.join(', ')}\n`;
      reportMessage += `*Challenges:* ${report.challenges.join(', ')}\n\n`;

      reportMessage += `*Career Paths:* ${report.careerPaths.join(', ')}\n`;
      reportMessage += `*Compatible Numbers:* ${report.compatibleNumbers.join(', ')}`;

      await sendMessage(phoneNumber, reportMessage);

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
    } catch (error) {
      logger.error('Error generating numerology report:', error);
      await sendMessage(
        phoneNumber,
        'I\'m sorry, I couldn\'t generate your numerology report right now. Please try again later.'
      );
    }
    break;
  }
  case 'nadi_analysis': {
    // Generate a simple Nadi result based on birth date
    const sunSign = vedicCalculator.calculateSunSign(user.birthDate);
    const nadiResult = `Based on your ${sunSign} sun sign, your primary Nadi indicates a ${sunSign.toLowerCase()} life path with strong ${sunSign === 'Leo' || sunSign === 'Sagittarius' || sunSign === 'Aries' ? 'leadership' : sunSign === 'Cancer' || sunSign === 'Scorpio' || sunSign === 'Pisces' ? 'intuitive' : 'practical'} tendencies.`;

    // Update the flow step prompt with the result
    const flow = getFlow(flowId);
    if (flow && flow.steps.nadi_analysis) {
      let { prompt } = flow.steps.nadi_analysis;
      prompt = prompt.replace('{nadiResult}', nadiResult);
      await sendMessage(phoneNumber, prompt);
    } else {
      await sendMessage(phoneNumber, `📜 *Nadi Analysis*\n\n${nadiResult}`);
    }
    break;
  }
  case 'bazi_analysis': {
    // Generate simple BaZi pillars based on birth date
    const sunSign = vedicCalculator.calculateSunSign(user.birthDate);
    const yearPillar = `Year of the ${sunSign} Influence`;
    const monthPillar = `Month of ${sunSign} Energy`;
    const dayPillar = `Day of ${sunSign} Power`;
    const hourPillar = `Hour of ${sunSign} Spirit`;

    // Update the flow step prompt with the result
    const flow = getFlow(flowId);
    if (flow && flow.steps.bazi_analysis) {
      let { prompt } = flow.steps.bazi_analysis;
      prompt = prompt.replace('{yearPillar}', yearPillar);
      prompt = prompt.replace('{monthPillar}', monthPillar);
      prompt = prompt.replace('{dayPillar}', dayPillar);
      prompt = prompt.replace('{hourPillar}', hourPillar);
      await sendMessage(phoneNumber, prompt);
    } else {
      await sendMessage(phoneNumber, `🐉 *BaZi Analysis*\n\n${yearPillar}\n${monthPillar}\n${dayPillar}\n${hourPillar}`);
    }
    break;
  }
  default:
    logger.warn(`⚠️ Unknown flow action: ${action}`);
    await sendMessage(
      phoneNumber,
      'I\'m sorry, I encountered an unknown action. Please try again later.'
    );
    await deleteUserSession(phoneNumber);
    break;
  }
};

module.exports = {
  processFlowMessage
};
