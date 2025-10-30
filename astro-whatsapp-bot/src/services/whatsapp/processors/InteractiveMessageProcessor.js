const BaseMessageProcessor = require('./BaseMessageProcessor');
const logger = require('../../../utils/logger');
const ActionRegistry = require('../ActionRegistry');
const { ValidationService } = require('../utils/ValidationService');
const { processFlowMessage } = require('../../../conversation/conversationEngine');
const { getUserSession, updateUserProfile } = require('../../../models/userModel');

/**
 * Specialized processor for handling interactive messages in the astrology bot.
 * Handles button replies, list selections, and other interactive elements.
 */
class InteractiveMessageProcessor extends BaseMessageProcessor {
  constructor(actionRegistry = null) {
    super();
    this.actionRegistry = actionRegistry || new ActionRegistry();
    this.logger = logger;
  }

  /**
   * Process incoming interactive message
   * @param {Object} message - WhatsApp message object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Sender's phone number
   * @returns {Promise<void>}
   */
  async process(message, user, phoneNumber) {
    try {
      const { interactive } = message;
      const { type } = interactive;

      this.logger.info(`🖱️ Processing ${type} interactive message from ${phoneNumber}`);

      // Validate message structure
      if (!ValidationService.validateMessage(message, phoneNumber)) {
        this.logger.warn('⚠️ Invalid interactive message structure');
        return;
      }

      // Handle different interactive types
      switch (type) {
      case 'button_reply':
        await this.processButtonReply(message, user, phoneNumber);
        break;
      case 'list_reply':
        await this.processListReply(message, user, phoneNumber);
        break;
      default:
        this.logger.warn(`⚠️ Unsupported interactive type: ${type}`);
        await this.sendUnsupportedInteractiveTypeResponse(phoneNumber);
      }
    } catch (error) {
      this.logger.error(`❌ Error processing interactive message from ${phoneNumber}:`, error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process button messages (button type, not button_reply)
   * @param {Object} message - Button message object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<void>}
   */
  async processButtonMessage(message, user, phoneNumber) {
    try {
      const { button } = message;
      const { payload, text } = button;

      this.logger.info(`🔘 Processing button message from ${phoneNumber}: ${text} (${payload})`);

      // Handle button payload as text input
      const mockTextMessage = {
        type: 'text',
        text: { body: payload }
      };

      // For button messages, treat as direct action payload
      await this.processButtonPayload(phoneNumber, payload, text, user);
    } catch (error) {
      this.logger.error(`❌ Error processing button message from ${phoneNumber}:`, error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process button reply from interactive message
   * @param {Object} message - Interactive message object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processButtonReply(message, user, phoneNumber) {
    const { interactive } = message;
    const { button_reply } = interactive;
    const { id: buttonId, title } = button_reply;

    this.logger.info(`🟢 Processing button reply from ${phoneNumber}: ${title} (${buttonId})`);

    // Check for special buttons first
    if (await this.handleSpecialButtons(buttonId, phoneNumber, user)) {
      return;
    }

    // Handle clarification buttons specially
    if (this.isClarificationButton(buttonId)) {
      await this.processClarificationButton(buttonId, user, phoneNumber);
      return;
    }

    // Check user session for conversation flows
    const session = await getUserSession(phoneNumber);
    if (this.isUserInFlow(session)) {
      await this.processFlowButton(buttonId, user, session, phoneNumber);
      return;
    }

    // Execute action from registry
    await this.executeAction(buttonId, user, phoneNumber);
  }

  /**
   * Process list reply from interactive message
   * @param {Object} message - Interactive message object
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processListReply(message, user, phoneNumber) {
    const { interactive } = message;
    const { list_reply } = interactive;
    const { id: listId, title, description } = list_reply;

    this.logger.info(`📋 Processing list reply from ${phoneNumber}: ${title} (${listId})`);

    // Get action from list mapping (legacy support)
    const actionId = this.getActionFromListMapping(listId);

    if (actionId) {
      await this.executeAction(actionId, user, phoneNumber);
    } else {
      // Fallback error
      const userLanguage = user.preferredLanguage || 'en';
      await this.sendErrorResponse(phoneNumber, 'unsupported_list_selection', userLanguage, {
        title, description
      });
    }
  }

  /**
   * Process button payload (for button messages)
   * @param {string} phoneNumber - Phone number
   * @param {string} payload - Button payload
   * @param {string} text - Button text
   * @param {Object} user - User object
   */
  async processButtonPayload(phoneNumber, payload, text, user) {
    this.logger.info(`💫 Processing button payload from ${phoneNumber}: ${text} (${payload})`);

    // Handle button payload as direct action
    const mockTextMessage = {
      type: 'text',
      text: { body: payload },
      fromButton: true
    };

    await processFlowMessage(mockTextMessage, user, 'button_action_flow');
  }

  /**
   * Handle special button types
   * @param {string} buttonId - Button ID
   * @param {string} phoneNumber - Phone number
   * @param {Object} user - User object
   * @returns {boolean} True if handled
   */
  async handleSpecialButtons(buttonId, phoneNumber, user) {
    // Handle special navigation buttons
    if (buttonId === 'horoscope_again') {
      await this.executeAction('get_daily_horoscope', user, phoneNumber);
      return true;
    }

    if (buttonId === 'horoscope_menu' || buttonId === 'back') {
      await this.executeAction('show_main_menu', user, phoneNumber);
      return true;
    }

    return false;
  }

  /**
   * Check if button is a clarification button
   * @param {string} buttonId - Button ID
   * @returns {boolean} True if clarification button
   */
  isClarificationButton(buttonId) {
    return buttonId.startsWith('year_') || buttonId.startsWith('time_');
  }

  /**
   * Process clarification button (year/time selection)
   * @param {string} buttonId - Button ID
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async processClarificationButton(buttonId, user, phoneNumber) {
    try {
      // Extract resolved value from button ID
      let resolvedValue;
      if (buttonId.startsWith('year_')) {
        resolvedValue = buttonId.split('_')[1];
      } else if (buttonId.startsWith('time_')) {
        const parts = buttonId.split('_');
        const period = parts[1];
        const timeStr = parts[2];
        const hours24 = period === 'pm' && parseInt(timeStr.substring(0, 2)) !== 12 ?
          parseInt(timeStr.substring(0, 2)) + 12 :
          period === 'am' && parseInt(timeStr.substring(0, 2)) === 12 ?
            0 : parseInt(timeStr.substring(0, 2));
        resolvedValue = `${hours24.toString().padStart(2, '0')}:${timeStr.substring(2)}`;
      }

      // Process as text input
      const mockMessage = { type: 'text', text: { body: resolvedValue } };
      const session = await getUserSession(phoneNumber);
      const currentFlow = session?.currentFlow && session.currentFlow !== 'undefined' ?
        session.currentFlow : 'onboarding';

      await processFlowMessage(mockMessage, user, currentFlow);
    } catch (error) {
      this.logger.error('Error processing clarification button:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Process button within conversation flow context
   * @param {string} buttonId - Button ID
   * @param {Object} user - User object
   * @param {Object} session - User session
   * @param {string} phoneNumber - Phone number
   */
  async processFlowButton(buttonId, user, session, phoneNumber) {
    try {
      // Clear session if step is not interactive or invalid
      if (!session.currentStep || session.currentFlow === 'main_menu') {
        await this.clearUserSession(phoneNumber);
        await this.executeAction(buttonId, user, phoneNumber);
        return;
      }

      // Map button to flow value
      const mappedValue = this.getMappedValueForButton(session, buttonId);
      if (!mappedValue) {
        this.logger.warn(`⚠️ No mapping found for button ID: ${buttonId}`);
        await this.sendErrorResponse(phoneNumber, 'invalid_button_selection', user.preferredLanguage || 'en');
        return;
      }

      // Process mapped value as text input
      const mockMessage = { type: 'text', text: { body: mappedValue } };
      await processFlowMessage(mockMessage, user, session.currentFlow);
    } catch (error) {
      this.logger.error('Error processing flow button:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Get mapped value for button in flow context
   * @param {Object} session - User session
   * @param {string} buttonId - Button ID
   * @returns {string|null} Mapped value or null
   */
  getMappedValueForButton(session, buttonId) {
    try {
      // This would interface with flow configuration
      // For now, return button ID as is
      return buttonId;
    } catch (error) {
      this.logger.error('Error getting mapped value for button:', error);
      return null;
    }
  }

  /**
   * Execute action using the action registry
   * @param {string} actionId - Action identifier
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async executeAction(actionId, user, phoneNumber) {
    try {
      let actualActionId = actionId;
      const actionData = {};

      // Handle special case for language buttons - extract language code from button ID
      if (actionId.startsWith('set_language_')) {
        const languageCode = actionId.replace('set_language_', '');
        actualActionId = 'set_language';  // Use the base action ID
        actionData.languageCode = languageCode;
        this.logger.info(`🌐 Extracting language code ${languageCode} from button ID ${actionId}`);
      }

      if (this.actionRegistry) {
        const action = this.actionRegistry.getAction(actualActionId) ||
                      this.actionRegistry.getActionForButton(actualActionId);

        if (action) {
          await this.actionRegistry.executeAction(actualActionId, user, phoneNumber, actionData);
        } else {
          this.logger.warn(`⚠️ No action found for ${actualActionId}, trying legacy menu action`);
          await this.executeLegacyMenuAction(actualActionId, user, phoneNumber);
        }
      } else {
        await this.executeLegacyMenuAction(actualActionId, user, phoneNumber);
      }
    } catch (error) {
      this.logger.error(`❌ Error executing action ${actionId}:`, error);
      const userLanguage = user.preferredLanguage || 'en';
      await this.sendErrorResponse(phoneNumber, 'action_execution_error', userLanguage);
    }
  }

  /**
   * Execute legacy menu action for backward compatibility
   * @param {string} actionId - Action identifier
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   */
  async executeLegacyMenuAction(actionId, user, phoneNumber) {
    // This would contain the legacy switch-case logic
    // For now, send a generic error
    this.logger.warn(`⚠️ Using legacy menu action for ${actionId}`);
    await this.sendErrorResponse(phoneNumber, 'legacy_action_not_available', user.preferredLanguage || 'en');
  }

  /**
   * Get action from list mapping (legacy support)
   * @param {string} listId - List ID
   * @returns {string|null} Action ID or null
   */
  getActionFromListMapping(listId) {
    // Legacy list action mapping
    const listActionMapping = {
      btn_daily_horoscope: 'get_daily_horoscope',
      btn_birth_chart: 'show_birth_chart',
      btn_compatibility: 'initiate_compatibility_flow',
      btn_synastry: 'get_synastry_analysis',
      btn_lunar_return: 'get_lunar_return',
      btn_tarot: 'get_tarot_reading',
      btn_iching: 'get_iching_reading',
      btn_palmistry: 'get_palmistry_analysis'
    };

    return listActionMapping[listId] || null;
  }

  /**
   * Check if user is currently in a conversation flow
   * @param {Object} session - User session
   * @returns {boolean} True if in flow
   */
  isUserInFlow(session) {
    return session &&
           session.currentFlow &&
           session.currentFlow !== 'undefined' &&
           session.currentFlow !== undefined;
  }

  /**
   * Clear user session
   * @param {string} phoneNumber - Phone number
   */
  async clearUserSession(phoneNumber) {
    try {
      await updateUserProfile(phoneNumber, {
        currentFlow: null,
        currentStep: null
      });
      this.logger.info(`🧹 Cleared session for ${phoneNumber}`);
    } catch (error) {
      this.logger.error('Error clearing user session:', error);
    }
  }

  /**
   * Handle processing errors
   * @param {string} phoneNumber - Phone number
   * @param {Error} error - Error object
   */
  async handleProcessingError(phoneNumber, error) {
    try {
      const { sendMessage } = require('../messageSender');
      await sendMessage(
        phoneNumber,
        '❌ Sorry, I encountered an error processing your selection. Please try again.',
        'text'
      );
      this.logger.error('❌ Error sent to user:', error.message);
    } catch (sendError) {
      this.logger.error('❌ Error sending error message:', sendError.message);
    }
  }

  /**
   * Send error response message
   * @param {string} phoneNumber - Phone number
   * @param {string} errorKey - Translation key
   * @param {string} language - Language code
   * @param {Object} params - Additional parameters
   */
  async sendErrorResponse(phoneNumber, errorKey, language, params = {}) {
    try {
      const { ResponseBuilder } = require('../utils/ResponseBuilder');
      const errorMessage = ResponseBuilder.buildErrorMessage(phoneNumber, errorKey, language, params);
      const { sendMessage } = require('../messageSender');
      await sendMessage(phoneNumber, errorMessage, 'interactive');
    } catch (error) {
      this.logger.error('Error sending error response:', error);
      await this.handleProcessingError(phoneNumber, error);
    }
  }

  /**
   * Send unsupported interactive type response
   * @param {string} phoneNumber - Phone number
   */
  async sendUnsupportedInteractiveTypeResponse(phoneNumber) {
    const language = 'en'; // Default language
    await this.sendErrorResponse(phoneNumber, 'unsupported_interactive_type', language);
  }
}

module.exports = InteractiveMessageProcessor;
