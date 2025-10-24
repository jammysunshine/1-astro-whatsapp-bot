const { getFlow } = require('./flowLoader');
const { getUserSession, setUserSession, deleteUserSession, addBirthDetails, updateUserProfile } = require('../models/userModel');
const { sendMessage } = require('../services/whatsapp/messageSender');
const logger = require('../utils/logger');
const vedicCalculator = require('../services/astrology/vedicCalculator');
const paymentService = require('../services/payment/paymentService');

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
    // DD/MM/YYYY format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = input.match(dateRegex);
    if (!match) {
      return { isValid: false, errorMessage: step.error_message || 'Please provide date in DD/MM/YYYY format.' };
    }

    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return { isValid: false, errorMessage: 'Please provide a valid date.' };
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      return { isValid: false, errorMessage: 'Please provide a valid birth year.' };
    }

    return { isValid: true, cleanedValue: input };

  case 'time_or_skip':
    if (trimmedInput === 'skip') {
      return { isValid: true, cleanedValue: null };
    }

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const timeMatch = input.match(timeRegex);

  case 'language_choice':
    const validLanguages = ['english', 'hindi', 'en', 'hi'];
    if (validLanguages.includes(trimmedInput.toLowerCase())) {
      return { isValid: true, cleanedValue: trimmedInput.toLowerCase() };
    }
    // Default to english if not specified
    return { isValid: true, cleanedValue: 'english' };
    if (!timeMatch) {
      return { isValid: false, errorMessage: step.error_message || 'Please provide time in HH:MM format or "skip".' };
    }

    const [, hours, minutes] = timeMatch.map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return { isValid: false, errorMessage: 'Please provide a valid time (00:00 to 23:59).' };
    }

    return { isValid: true, cleanedValue: input };

  case 'yes_no':
    if (trimmedInput === 'yes' || trimmedInput === 'y') {
      return { isValid: true, cleanedValue: 'yes' };
    }
    if (trimmedInput === 'no' || trimmedInput === 'n') {
      return { isValid: true, cleanedValue: 'no' };
    }
    return { isValid: false, errorMessage: step.error_message || 'Please reply "yes" or "no".' };

  case 'plan_choice':
    if (trimmedInput === 'essential' || trimmedInput === 'premium') {
      return { isValid: true, cleanedValue: input.toLowerCase() };
    }
    return { isValid: false, errorMessage: step.error_message || 'Please choose "essential" or "premium".' };

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
    return { isValid: false, errorMessage: step.error_message || 'Please reply "yes", "no", or "menu".' };

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
  const { phoneNumber } = user;
  const messageText = message.type === 'text' ? message.text.body : '';
  let session = await getUserSession(phoneNumber);

  const flow = getFlow(flowId);
  if (!flow) {
    logger.error(`❌ Conversation flow '${flowId}' not found.`);
    await sendMessage(phoneNumber, 'I\'m sorry, I encountered an internal error. Please try again later.');
    return false;
  }

  // Initialize session if not present or if starting a new flow
  if (!session || session.currentFlow !== flowId) {
    session = { currentFlow: flowId, currentStep: flow.start_step, data: {} };
    await setUserSession(phoneNumber, session);
    const startStep = flow.steps[flow.start_step];
    let prompt = startStep.prompt.replace('{userName}', user.name || 'cosmic explorer');
    // Replace other placeholders from session data
    Object.keys(session.data).forEach(key => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), session.data[key]);
    });
    await sendMessage(phoneNumber, prompt);
    return true;
  }

  const currentStepId = session.currentStep;
  const currentStep = flow.steps[currentStepId];

  if (!currentStep) {
    logger.error(`❌ Invalid current step '${currentStepId}' for flow '${flowId}' in user session.`);
    await sendMessage(phoneNumber, 'I\'m sorry, I lost track of our conversation. Let\'s start over.');
    await deleteUserSession(phoneNumber);
    return false;
  }

  // Validate user input for the current step
  const validationResult = await validateStepInput(messageText, currentStep);
  if (!validationResult.isValid) {
    await sendMessage(phoneNumber, validationResult.errorMessage || currentStep.error_message || 'Invalid input. Please try again.');
    return true; // Handled, but input was invalid, so stay on current step
  }

  // Save data from current step
  if (currentStep.data_key) {
    session.data[currentStep.data_key] = validationResult.cleanedValue || messageText;
  } else {
    session.data[currentStepId] = messageText;
  }

  // Determine next step
  const nextStepId = currentStep.next_step;
  if (nextStepId) {
    const nextStep = flow.steps[nextStepId];
    if (nextStep) {
      session.currentStep = nextStepId;
      await setUserSession(phoneNumber, session);
      // If the next step is an action, execute it immediately
      if (nextStep.action) {
        await executeFlowAction(phoneNumber, user, flowId, nextStep.action, session.data);
        return true;
      } else {
        let prompt = nextStep.prompt.replace('{userName}', user.name || 'cosmic explorer');
        // Replace placeholders from session data
        Object.keys(session.data).forEach(key => {
          prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), session.data[key]);
        });
        // Add calculated values like sun sign
        if (session.data.birthDate) {
          const sunSign = vedicCalculator.calculateSunSign(session.data.birthDate);
          prompt = prompt.replace('{sunSign}', sunSign);
        }
        await sendMessage(phoneNumber, prompt);
        return true;
      }
    } else {
      logger.error(`❌ Next step '${nextStepId}' not found in flow '${flowId}'.`);
      await sendMessage(phoneNumber, 'I\'m sorry, I encountered an internal error. Please try again later.');
      await deleteUserSession(phoneNumber);
      return false;
    }
  } else if (currentStep.action) {
    // If current step has an action and no next step, execute action
    await executeFlowAction(phoneNumber, user, flowId, currentStep.action, session.data);
    return true;
  } else {
    logger.warn(`⚠️ Flow '${flowId}' ended unexpectedly at step '${currentStepId}'.`);
    await sendMessage(phoneNumber, 'I\'m sorry, our conversation ended unexpectedly. Please try again.');
    await deleteUserSession(phoneNumber);
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
const executeFlowAction = async(phoneNumber, user, flowId, action, flowData) => {
  switch (action) {
  case 'complete_profile': {
    const birthDate = flowData.birthDate;
    const birthTime = flowData.birthTime;
    const birthPlace = flowData.birthPlace;
    const preferredLanguage = flowData.preferredLanguage || 'english';

    // Update user profile with birth details
    await addBirthDetails(phoneNumber, { birthDate, birthTime, birthPlace });
    await updateUserProfile(phoneNumber, {
      profileComplete: true,
      preferredLanguage,
      onboardingCompletedAt: new Date()
    });

    // Generate comprehensive birth chart analysis
    const chartData = await vedicCalculator.generateDetailedChart({ birthDate, birthTime, birthPlace });

    // Extract key information for prompt replacement
    const sunSign = chartData.sunSign || vedicCalculator.calculateSunSign(birthDate);
    const moonSign = chartData.moonSign || 'Unknown';
    const risingSign = chartData.risingSign || 'Unknown';

    // Generate top 3 life patterns
    const patterns = chartData.lifePatterns || [
      'Strong communication abilities',
      'Natural leadership qualities',
      'Creative problem-solving skills'
    ];

    // Generate 3-day transit preview
    const transits = await vedicCalculator.generateTransitPreview({ birthDate, birthTime, birthPlace }, 3);

    // Replace placeholders in completion message
    let completionMessage = getFlow(flowId).steps.complete_onboarding.prompt;
    completionMessage = completionMessage
      .replace('{sunSign}', sunSign)
      .replace('{moonSign}', moonSign)
      .replace('{risingSign}', risingSign)
      .replace('{pattern1}', patterns[0] || 'Strong communication abilities')
      .replace('{pattern2}', patterns[1] || 'Natural leadership qualities')
      .replace('{pattern3}', patterns[2] || 'Creative problem-solving skills')
      .replace('{todayTransit}', transits.today || 'Today brings opportunities for new connections')
      .replace('{tomorrowTransit}', transits.tomorrow || 'Tomorrow favors focused work and planning')
      .replace('{day3Transit}', transits.day3 || 'Day 3 brings creative inspiration');

    await sendMessage(phoneNumber, completionMessage);

    // Send main menu
    const menu = getMenu('main_menu');
    if (menu) {
      const buttons = menu.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title }
      }));
      await sendMessage(phoneNumber, { type: 'button', body: menu.body, buttons }, 'interactive');
    }

    // Clear onboarding session
    await deleteUserSession(phoneNumber);

    logger.info(`✅ User ${phoneNumber} completed onboarding with comprehensive analysis`);
    break;
  }
  case 'process_subscription': {
    const selectedPlan = flowData.selectedPlan;

    // For now, just acknowledge the subscription request
    // In production, this would integrate with payment processor
    await sendMessage(phoneNumber, `💳 *Subscription Processing*\n\nThank you for choosing the ${selectedPlan} plan!\n\nYour subscription will be activated shortly. You'll receive a confirmation message once it's ready.`);
    await deleteUserSession(phoneNumber);
    break;
  }
  case 'generate_compatibility': {
    const partnerBirthDate = flowData.partnerBirthDate;
    const userSign = vedicCalculator.calculateSunSign(user.birthDate);
    const partnerSign = vedicCalculator.calculateSunSign(partnerBirthDate);

    const compatibilityResult = vedicCalculator.checkCompatibility(userSign, partnerSign);

    const resultMessage = `💕 *Compatibility Analysis*\n\n*Your Sign:* ${userSign}\n*Partner's Sign:* ${partnerSign}\n*Compatibility:* ${compatibilityResult.compatibility}\n\n${compatibilityResult.description}\n\n✨ Remember, compatibility is just one aspect of a relationship!`;

    // Update the flow step prompt with the result
    const flow = getFlow(flowId);
    if (flow && flow.steps.generate_compatibility) {
      let prompt = flow.steps.generate_compatibility.prompt;
      prompt = prompt.replace('{compatibilityResult}', resultMessage);
      await sendMessage(phoneNumber, prompt);
    } else {
      await sendMessage(phoneNumber, resultMessage);
    }
    break;
  }
  default:
    logger.warn(`⚠️ Unknown flow action: ${action}`);
    await sendMessage(phoneNumber, 'I\'m sorry, I encountered an unknown action. Please try again later.');
    await deleteUserSession(phoneNumber);
    break;
  }
};

module.exports = {
  processFlowMessage
};
