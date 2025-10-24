const { getFlow } = require('./flowLoader');
const { getUserSession, setUserSession, deleteUserSession, addBirthDetails, updateUserProfile } = require('../models/userModel');
const { sendMessage } = require('../services/whatsapp/messageSender');
const logger = require('../utils/logger');
const vedicCalculator = require('../services/astrology/vedicCalculator');
const paymentService = require('../services/payment/paymentService');

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
  if (currentStep.validation_regex) {
    const regex = new RegExp(currentStep.validation_regex);
    if (!regex.test(messageText)) {
      await sendMessage(phoneNumber, currentStep.error_message);
      return true; // Handled, but input was invalid, so stay on current step
    }
  }

  // Save data from current step
  session.data[currentStepId] = messageText;

  // Determine next step
  const nextStepId = currentStep.next_step_on_success;
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
        Object.keys(session.data).forEach(key => {
          prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), session.data[key]);
        });
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
    const birthDate = flowData.ask_birth_date;
    const birthTime = flowData.ask_birth_time.toLowerCase() === 'unknown' ? null : flowData.ask_birth_time;
    const birthPlace = flowData.ask_birth_place;

    await addBirthDetails(phoneNumber, birthDate, birthTime, birthPlace);
    await updateUserProfile(phoneNumber, { profileComplete: true });
    await deleteUserSession(phoneNumber); // Clear onboarding session
    await sendMessage(phoneNumber, getFlow(flowId).steps.complete_onboarding.prompt.replace('{userName}', user.name || 'cosmic explorer'));
    break;
  }
  case 'fetch_daily_horoscope': {
    const sign = flowData.select_sign;
    const horoscope = vedicCalculator.generateDailyHoroscope(sign);
    await sendMessage(phoneNumber, `🌟 *Daily Horoscope for ${sign}*\n\n${horoscope}\n\n✨ Have a wonderful day!`);
    await deleteUserSession(phoneNumber);
    break;
  }
  case 'calculate_compatibility_score': {
    const partnerBirthDate = flowData.ask_partner_birth_date;
    const partnerBirthTime = flowData.ask_partner_birth_time.toLowerCase() === 'unknown' ? null : flowData.ask_partner_birth_time;
    const partnerBirthPlace = flowData.ask_partner_birth_place;

    // Get user's birth details from session data (stored during onboarding)
    const userSign = vedicCalculator.calculateSunSign(session.data.ask_birth_date);
    const partnerSign = vedicCalculator.calculateSunSign(partnerBirthDate);

    const compatibilityResult = vedicCalculator.checkCompatibility(userSign, partnerSign);

    await sendMessage(phoneNumber, `💕 *Compatibility Analysis*\n\n*Your Sign:* ${userSign}\n*Partner's Sign:* ${partnerSign}\n*Compatibility:* ${compatibilityResult.compatibility}\n\n${compatibilityResult.description}\n\n✨ Remember, compatibility is just one aspect of a relationship!`);
    await deleteUserSession(phoneNumber);
    break;
  }
  case 'process_subscription_payment': {
    const selectedPlan = session.data.show_plans;
    const confirmation = session.data.confirm_subscription;

    if (confirmation === 'no') {
      await sendMessage(phoneNumber, 'Subscription cancelled. You can subscribe anytime!');
      await deleteUserSession(phoneNumber);
      return;
    }

    const planId = selectedPlan.toLowerCase(); // essential or premium
    const paymentLink = paymentService.generatePaymentLink(planId, phoneNumber);

    await sendMessage(phoneNumber, `💳 *Subscription Processing*\n\nThank you for choosing the ${selectedPlan} plan!\n\nClick here to complete your payment: ${paymentLink}\n\nOnce payment is confirmed, your subscription will be activated.`);
    await deleteUserSession(phoneNumber);
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
