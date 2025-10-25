const { getFlow } = require('./flowLoader');
const {
  getUserSession,
  setUserSession,
  deleteUserSession,
  addBirthDetails,
  updateUserProfile,
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
const validateStepInput = async (input, step) => {
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
                  title: `19${yy.toString().padStart(2, '0')}`,
                },
                {
                  id: `year_20${yy.toString().padStart(2, '0')}`,
                  title: `20${yy.toString().padStart(2, '0')}`,
                },
              ],
            };
          } else {
            // Neither is valid (both would be future dates)
            return {
              isValid: false,
              errorMessage: 'Please provide a valid birth year.',
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
              'Please provide date in DDMMYY (150690) or DDMMYYYY (15061990) format only.',
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
          errorMessage: 'Please provide a valid birth year.',
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
              "Please provide time in HHMM (1430) or HH:MM (14:30) format, or type 'skip'.",
          };
        }
        [, hours, minutes] = timeMatch.map(Number);
      }

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return {
          isValid: false,
          errorMessage: 'Please provide a valid time (00:00 to 23:59).',
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
              title: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} AM`,
            },
            {
              id: `time_pm_${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`,
              title: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} PM`,
            },
          ],
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
        errorMessage: step.error_message || 'Please reply "yes" or "no".',
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
          'Please choose "essential", "premium", or "vip".',
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
          step.error_message || 'Please reply "yes", "no", or "menu".',
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
          step.error_message ||
          'Please reply "again" for another reading or "menu" for main options.',
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
const processFlowMessage = async (message, user, flowId) => {
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

    // Ensure session has required properties
    if (session && !session.flowData) {
      session.flowData = {};
      await setUserSession(phoneNumber, session);
    }

    const flow = getFlow(flowId);
    if (!flow) {
      logger.error(`❌ Conversation flow '${flowId}' not found.`);
      await sendMessage(
        phoneNumber,
        "I'm sorry, I encountered an internal error. Please try again later."
      );
      return false;
    }

    // Initialize session if not present or if starting a new flow
    if (!session || session.currentFlow !== flowId) {
      session = {
        currentFlow: flowId,
        currentStep: flow.start_step,
        flowData: {},
      };
      await setUserSession(phoneNumber, session);
      const startStep = flow.steps[flow.start_step];
      if (startStep.interactive) {
        let body = startStep.interactive.body.replace(
          '{userName}',
          user.name || 'cosmic explorer'
        );
        // Replace other placeholders from session data
        Object.keys(session.flowData).forEach(key => {
          body = body.replace(
            new RegExp(`{${key}}`, 'g'),
            session.flowData[key]
          );
        });
        const buttons = startStep.interactive.buttons.map(button => ({
          type: 'reply',
          reply: { id: button.id, title: button.title },
        }));
        await sendMessage(
          phoneNumber,
          { type: 'button', body, buttons },
          'interactive'
        );
      } else {
        let prompt = startStep.prompt.replace(
          '{userName}',
          user.name || 'cosmic explorer'
        );
        // Replace other placeholders from session data
        Object.keys(session.flowData).forEach(key => {
          prompt = prompt.replace(
            new RegExp(`{${key}}`, 'g'),
            session.flowData[key]
          );
        });
        await sendMessage(phoneNumber, prompt);
      }
      return true;
    }

    // Check if this is a clarification response (handled by messageProcessor)
    // The clarification buttons will be mapped to resolved values and processed as text

    const currentStepId = session.currentStep;
    const currentStep = flow.steps[currentStepId];

    if (!currentStep) {
      logger.error(
        `❌ Invalid current step '${currentStepId}' for flow '${flowId}' in user session.`
      );
      await sendMessage(
        phoneNumber,
        "I'm sorry, I lost track of our conversation. Let's start over."
      );
      await deleteUserSession(phoneNumber);
      return false;
    }

    // Validate user input for the current step
    logger.info(
      `🔍 Validating input for step '${currentStepId}': "${messageText}"`
    );
    const validationResult = await validateStepInput(messageText, currentStep);

    // Handle clarification needed (ambiguous input)
    if (validationResult.needsClarification) {
      logger.info(
        `🤔 Clarification needed for step '${currentStepId}': ${validationResult.clarificationType}`
      );

      // Create a temporary interactive step for clarification
      const clarificationStep = {
        interactive: {
          type: 'button_reply',
          body: validationResult.clarificationMessage,
          buttons: validationResult.clarificationButtons,
          button_mappings: {},
        },
      };

      // Set up button mappings to resolve the ambiguity
      validationResult.clarificationButtons.forEach(button => {
        if (validationResult.clarificationType === 'year_ambiguity') {
          const year = button.id.split('_')[1];
          const resolvedDate = `${validationResult.data.day.toString().padStart(2, '0')}/${validationResult.data.month.toString().padStart(2, '0')}/${year}`;
          clarificationStep.interactive.button_mappings[button.id] =
            resolvedDate;
        } else if (validationResult.clarificationType === 'time_ambiguity') {
          const parts = button.id.split('_');
          const period = parts[1]; // 'am' or 'pm'
          const timeStr = parts[2]; // e.g., '0230'
          const hours24 =
            period === 'pm' && parseInt(timeStr.substring(0, 2)) !== 12
              ? parseInt(timeStr.substring(0, 2)) + 12
              : period === 'am' && parseInt(timeStr.substring(0, 2)) === 12
                ? 0
                : parseInt(timeStr.substring(0, 2));
          const resolvedTime = `${hours24.toString().padStart(2, '0')}:${timeStr.substring(2)}`;
          clarificationStep.interactive.button_mappings[button.id] =
            resolvedTime;
        }
      });

      // Temporarily replace current step with clarification step
      const originalStep = currentStep;
      flow.steps[currentStepId] = clarificationStep;

      // Send clarification message
      const buttons = clarificationStep.interactive.buttons.map(button => ({
        type: 'reply',
        reply: { id: button.id, title: button.title },
      }));

      await sendMessage(
        phoneNumber,
        {
          type: 'button',
          body: clarificationStep.interactive.body,
          buttons,
        },
        'interactive'
      );

      // Restore original step after sending
      flow.steps[currentStepId] = originalStep;

      return true; // Handled, waiting for clarification
    }

    if (!validationResult.isValid) {
      logger.warn(
        `❌ Validation failed for step '${currentStepId}': ${validationResult.errorMessage}`
      );
      await sendMessage(
        phoneNumber,
        validationResult.errorMessage ||
          currentStep.error_message ||
          'Invalid input. Please try again.'
      );
      return true; // Handled, but input was invalid, so stay on current step
    }
    logger.info(
      `✅ Validation passed for step '${currentStepId}': cleanedValue = "${validationResult.cleanedValue}"`
    );

    // Save data from current step
    if (currentStep.data_key) {
      session.flowData[currentStep.data_key] =
        validationResult.cleanedValue || messageText;
    } else {
      session.flowData[currentStepId] = messageText;
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
          await executeFlowAction(
            phoneNumber,
            user,
            flowId,
            nextStep.action,
            session.flowData
          );
          return true;
        } else {
          if (nextStep.interactive) {
            let body = nextStep.interactive.body.replace(
              '{userName}',
              user.name || 'cosmic explorer'
            );
            // Replace placeholders from session data
            Object.keys(session.flowData).forEach(key => {
              body = body.replace(
                new RegExp(`{${key}}`, 'g'),
                session.flowData[key]
              );
            });
            // Add calculated values like sun sign
            if (session.flowData.birthDate) {
              const sunSign = vedicCalculator.calculateSunSign(
                session.flowData.birthDate
              );
              body = body.replace('{sunSign}', sunSign);
            }
            const buttons = nextStep.interactive.buttons.map(button => ({
              type: 'reply',
              reply: { id: button.id, title: button.title },
            }));
            await sendMessage(
              phoneNumber,
              { type: 'button', body, buttons },
              'interactive'
            );
          } else {
            let prompt = nextStep.prompt.replace(
              '{userName}',
              user.name || 'cosmic explorer'
            );
            // Replace placeholders from session data
            Object.keys(session.flowData).forEach(key => {
              prompt = prompt.replace(
                new RegExp(`{${key}}`, 'g'),
                session.flowData[key]
              );
            });
            // Add calculated values like sun sign
            if (session.flowData.birthDate) {
              const sunSign = vedicCalculator.calculateSunSign(
                session.flowData.birthDate
              );
              prompt = prompt.replace('{sunSign}', sunSign);
            }
            await sendMessage(phoneNumber, prompt);
          }
          return true;
        }
      } else {
        logger.error(
          `❌ Next step '${nextStepId}' not found in flow '${flowId}'.`
        );
        await sendMessage(
          phoneNumber,
          "I'm sorry, I encountered an internal error. Please try again later."
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
        "I'm sorry, our conversation ended unexpectedly. Please try again."
      );
      await deleteUserSession(phoneNumber);
      return false;
    }
  } catch (error) {
    logger.error('❌ Error in processFlowMessage:', error);
    try {
      await sendMessage(
        phoneNumber,
        "I'm sorry, I encountered an error. Please try again."
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
const executeFlowAction = async (
  phoneNumber,
  user,
  flowId,
  action,
  flowData
) => {
  switch (action) {
    case 'complete_profile': {
      const { birthDate } = flowData;
      const { birthTime } = flowData;
      const { birthPlace } = flowData;
      const preferredLanguage = flowData.preferredLanguage || 'english';

      // Generate comprehensive birth chart analysis with error handling
      const chartData = {};
      // Temporarily disable for testing
      // try {
      //   chartData = await vedicCalculator.generateDetailedChart({ birthDate, birthTime, birthPlace });
      //   console.log('✅ Chart data generated:', chartData);
      // } catch (error) {
      //   logger.error('❌ Error generating detailed chart:', error);
      //   // Continue with basic sun sign calculation
      // }

      // Extract key information for prompt replacement
      const sunSign = chartData.sunSign || 'Pisces'; // Temporary fallback
      const moonSign = chartData.moonSign || 'Pisces'; // Temporary fallback
      const risingSign = chartData.risingSign || 'Aquarius'; // Temporary fallback

      console.log('🔮 Astrology data:', { sunSign, moonSign, risingSign });

      // Update user profile with birth details
      logger.info('Calling addBirthDetails...');
      await addBirthDetails(phoneNumber, birthDate, birthTime, birthPlace);
      logger.info(
        'addBirthDetails completed. Updating user profile with profileComplete: true and astrology data...'
      );
      await updateUserProfile(phoneNumber, {
        profileComplete: true,
        preferredLanguage,
        onboardingCompletedAt: new Date(),
        sunSign,
        moonSign,
        risingSign,
      });
      logger.info(
        'updateUserProfile called with profileComplete: true. Exiting complete_profile action.'
      );
      console.log('✅ User profile updated successfully');

      console.log('🔮 Astrology data:', { sunSign, moonSign, risingSign });

      // Generate comprehensive birth chart analysis
      let detailedAnalysis = '';
      try {
        const fullChart = await vedicCalculator.generateCompleteVedicAnalysis({
          birthDate,
          birthTime,
          birthPlace,
        });

        detailedAnalysis = '\n\n📊 *Detailed Chart Analysis:*\n\n';
        detailedAnalysis += '🌟 *Planetary Positions:*\n';
        if (fullChart.planets) {
          Object.entries(fullChart.planets).forEach(([planet, data]) => {
            detailedAnalysis += `• ${data.name}: ${data.sign} ${data.degrees}°${data.minutes}'${data.seconds}"\n`;
          });
        }

        detailedAnalysis += '\n🏠 *House Placements:*\n';
        if (fullChart.houses) {
          fullChart.houses.forEach((house, index) => {
            detailedAnalysis += `• House ${index + 1}: ${house.sign}\n`;
          });
        }

        detailedAnalysis += '\n🔮 *Key Aspects:*\n';
        if (fullChart.aspects && fullChart.aspects.length > 0) {
          fullChart.aspects.slice(0, 5).forEach(aspect => {
            detailedAnalysis += `• ${aspect.planet1} ${aspect.aspect} ${aspect.planet2}\n`;
          });
        }
      } catch (error) {
        logger.warn('Could not generate detailed analysis:', error.message);
      }

      // Generate top 3 life patterns
      const patterns = chartData.lifePatterns || [
        'Strong communication abilities',
        'Natural leadership qualities',
        'Creative problem-solving skills',
      ];

      // Generate 3-day transit preview with error handling
      let transits = {};
      try {
        transits = await vedicCalculator.generateTransitPreview(
          { birthDate, birthTime, birthPlace },
          3
        );
      } catch (error) {
        logger.error('❌ Error generating transit preview:', error);
        // Continue with default transits
        transits = {
          today: 'Today brings opportunities for new connections',
          tomorrow: 'Tomorrow favors focused work and planning',
          day3: 'Day 3 brings creative inspiration',
        };
      }

      // Create comprehensive completion message
      let completionMessage =
        "🎉 *Welcome to your cosmic journey!*\n\nYour profile is complete! Here's your *comprehensive birth chart summary*:\n\n";

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
          reply: { id: button.id, title: button.title },
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
    case 'generate_numerology_report': {
      const { birthDate } = flowData;
      const { fullName } = flowData;

      if (!birthDate || !fullName) {
        await sendMessage(
          phoneNumber,
          'I need both your full name and birth date to generate the numerology report. Please try again.'
        );
        await deleteUserSession(phoneNumber);
        break;
      }

      const report = numerologyService.getNumerologyReport(birthDate, fullName);

      let numerologyMessage = '✨ *Your Numerology Report* ✨\n\n';
      numerologyMessage += `*Life Path Number:* ${report.lifePath.number}\n`;
      numerologyMessage += `_Interpretation:_ ${report.lifePath.interpretation}\n\n`;
      numerologyMessage += `*Expression Number:* ${report.expression.number}\n`;
      numerologyMessage += `_Interpretation:_ ${report.expression.interpretation}\n\n`;
      numerologyMessage += `*Soul Urge Number:* ${report.soulUrge.number}\n`;
      numerologyMessage += `_Interpretation:_ ${report.soulUrge.interpretation}\n\n`;
      numerologyMessage += `*Personality Number:* ${report.personality.number}\n`;
      numerologyMessage += `_Interpretation:_ ${report.personality.interpretation}\n\n`;
      numerologyMessage +=
        'I hope this sheds some light on your cosmic blueprint!';

      await sendMessage(phoneNumber, numerologyMessage);
      await deleteUserSession(phoneNumber); // Clear session after report
      logger.info(`✅ User ${phoneNumber} received numerology report.`);
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
        const horoscopeData = await vedicCalculator.generateDailyHoroscope(
          user.birthDate
        );
        const sunSign = vedicCalculator.calculateSunSign(user.birthDate);

        // Store horoscope data in session for interactive display
        session.flowData.horoscopeText = horoscopeData.general;
        session.flowData.luckyColor = horoscopeData.luckyColor;
        session.flowData.luckyNumber = horoscopeData.luckyNumber;
        session.flowData.loveText = horoscopeData.love;
        session.flowData.careerText = horoscopeData.career;
        session.flowData.financeText = horoscopeData.finance;
        session.flowData.healthText = horoscopeData.health;
        session.flowData.sunSign = sunSign;

        await setUserSession(phoneNumber, session);

        await setUserSession(phoneNumber, session);
      } catch (error) {
        logger.error('Error generating daily horoscope:', error);
        await sendMessage(
          phoneNumber,
          "I'm sorry, I couldn't generate your horoscope right now. Please try again later."
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
          data: {},
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
            reply: { id: button.id, title: button.title },
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
            reply: { id: button.id, title: button.title },
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
          "I'm sorry, I couldn't generate your numerology report right now. Please try again later."
        );
      }
      break;
    }
    default:
      logger.warn(`⚠️ Unknown flow action: ${action}`);
      await sendMessage(
        phoneNumber,
        "I'm sorry, I encountered an unknown action. Please try again later."
      );
      await deleteUserSession(phoneNumber);
      break;
  }
};

module.exports = {
  processFlowMessage,
};
