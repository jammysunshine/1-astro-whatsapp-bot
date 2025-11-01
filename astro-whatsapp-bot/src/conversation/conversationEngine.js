const { getFlow } = require('./flowLoader');
const {
  getUserSession,
  setUserSession,
  deleteUserSession,
  updateUserProfile
} = require('../models/userModel');
const { sendMessage } = require('../services/whatsapp/messageSender');
const logger = require('../utils/logger');

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

  case 'date': {
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
        return {
          isValid: true,
          cleanedValue: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        };
      }
    }

    // Check for 8-digit format (DDMMYYYY)
    const longDateRegex = /^(\d{2})(\d{2})(\d{4})$/;
    const longMatch = input.match(longDateRegex);
    if (longMatch) {
      [, day, month, year] = longMatch.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date <= new Date() &&
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
      ) {
        return {
          isValid: true,
          cleanedValue: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        };
      }
    }

    // Check for YYYY-MM-DD format (for consistency with internal date handling)
    const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const isoMatch = input.match(isoDateRegex);
    if (isoMatch) {
      [, year, month, day] = isoMatch.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date <= new Date() &&
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
      ) {
        return {
          isValid: true,
          cleanedValue: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        };
      }
    }

    return {
      isValid: false,
      errorMessage:
          'Please provide date in DDMMYY (150690), DDMMYYYY (15061990) or YYYY-MM-DD (1990-06-15) format only, and ensure it is not a future date.'
    };
  }

  case 'time_or_skip':
    if (trimmedInput === 'skip') {
      return { isValid: true, cleanedValue: 'skip' };
    }
    // HHMM format (24-hour)
    const timeRegex = /^([01]?[0-9]|2[0-3])[0-5][0-9]$/;
    if (input.match(timeRegex)) {
      return { isValid: true, cleanedValue: input };
    }
    return {
      isValid: false,
      errorMessage:
          'Please provide time in HHMM (1430) format only, or \'skip\''
    };

  case 'language_choice':
    const supportedLanguages = ['en', 'hi']; // Extend as needed
    if (supportedLanguages.includes(trimmedInput)) {
      return { isValid: true, cleanedValue: trimmedInput };
    }
    return {
      isValid: false,
      errorMessage:
          'Please choose a supported language (e.g., \'en\' for English, \'hi\' for Hindi).'
    };

  case 'plan_choice':
    const supportedPlans = ['essential', 'premium', 'vip']; // Extend as needed
    if (supportedPlans.includes(trimmedInput)) {
      return { isValid: true, cleanedValue: trimmedInput };
    }
    return {
      isValid: false,
      errorMessage:
          'Please choose a valid plan (essential, premium, or vip).'
    };

  case 'yes_no':
    if (trimmedInput === 'yes' || trimmedInput === 'no') {
      return { isValid: true, cleanedValue: trimmedInput };
    }
    return { isValid: false, errorMessage: 'Please reply \'yes\' or \'no\'.' };

  case 'yes_no_or_menu':
    if (
      trimmedInput === 'yes' ||
        trimmedInput === 'no' ||
        trimmedInput === 'menu'
    ) {
      return { isValid: true, cleanedValue: trimmedInput };
    }
    return {
      isValid: false,
      errorMessage: 'Please reply \'yes\', \'no\', or \'menu\'.'
    };

  case 'again_or_menu':
    if (trimmedInput === 'again' || trimmedInput === 'menu') {
      return { isValid: true, cleanedValue: trimmedInput };
    }
    return {
      isValid: false,
      errorMessage: 'Please reply \'again\' or \'menu\'.'
    };

  case 'detailed_or_menu':
    if (trimmedInput === 'detailed' || trimmedInput === 'menu') {
      return { isValid: true, cleanedValue: trimmedInput };
    }
    return {
      isValid: false,
      errorMessage: 'Please reply \'detailed\' or \'menu\'.'
    };

  case 'none':
    return { isValid: true, cleanedValue: input.trim() };

  default:
    logger.warn(`⚠️ Unknown validation type: ${step.validation}`);
    return {
      isValid: false,
      errorMessage: 'An unexpected validation error occurred.'
    };
  }
};

/**
 * Validates and executes a menu action
 * @param {string} phoneNumber - User's phone number
 * @param {Object} user - User object
 * @param {string} action - Menu action to execute
 * @returns {boolean} Success status
 */
const executeMenuAction = async(phoneNumber, user, action) => {
  try {
    // Route to messageProcessor for execution
    const {
      executeMenuAction: executeAction
    } = require('../services/whatsapp/messageProcessor');
    return await executeAction(phoneNumber, user, action);
  } catch (error) {
    logger.error('Error executing menu action:', error);
    return false;
  }
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
        await sendMessage(
          user.phoneNumber,
          'I\'m sorry, I encountered an internal error. Please try again later.'
        );
        await deleteUserSession(user.phoneNumber);
        return false;
      }

      session = {
        currentFlow: flowId,
        currentStep: flow.start_step || 'start', // Provide fallback for start_step
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
    await sendMessage(
      user.phoneNumber,
      'I\'m sorry, I encountered an internal error. Please try again later.'
    );
    await deleteUserSession(user.phoneNumber);
    return false;
  }
};

module.exports = {
  processFlowMessage
};
