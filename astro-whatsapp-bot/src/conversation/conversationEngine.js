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
        }
        break;
      }
    }
  }

  // Default case - invalid validation type
  return { isValid: false, errorMessage: 'Invalid input format.' };
};

/**
 * Processes a flow message based on user input and current session state
 * @param {Object} message - WhatsApp message object
 * @param {Object} user - User object with phoneNumber and id
 * @param {string} flowId - Flow identifier
 * @returns {boolean} Success status
 */
const processFlowMessage = async(message, user, flowId) => {
  try {
    // Check for phone number
    if (!user || !user.phoneNumber) {
      logger.error('❌ No phone number provided to processFlowMessage');
      return false;
    }

    // Handle interactive messages (buttons, lists) - no validation needed
    if (message.type === 'interactive') {
      return true;
    }

    // Get existing session
    const existingSession = await getUserSession(user.phoneNumber);

    let session;
    if (!existingSession) {
      // Initialize new session
      const flow = getFlow(flowId);
      if (!flow) {
        await sendMessage(user.phoneNumber, 'I\'m sorry, I encountered an internal error. Please try again later.');
        await deleteUserSession(user.phoneNumber);
        return false;
      }

      session = {
        currentFlow: flowId,
        currentStep: flow.start_step,
        flowData: {}
      };
      await setUserSession(user.phoneNumber, session);
    } else {
      session = existingSession;
    }

    // Process the message based on current step
    // TODO: Implement step processing logic

    return true;
  } catch (error) {
    logger.error('Error in processFlowMessage:', error);
    await sendMessage(user.phoneNumber, 'I\'m sorry, I encountered an internal error. Please try again later.');
    await deleteUserSession(user.phoneNumber);
    return false;
  }
};

module.exports = {
  processFlowMessage
};
