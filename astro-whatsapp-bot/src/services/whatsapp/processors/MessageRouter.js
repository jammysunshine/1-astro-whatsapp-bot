const logger = require('../../../utils/logger');
const KeywordMapper = require('../KeywordMapper');

/**
 * MessageRouter - Routes incoming messages to appropriate actions
 * Handles keyword mapping and decides which action to execute based on message content
 */
class MessageRouter {
  constructor(actionRegistry = null) {
    this.actionRegistry = actionRegistry;
    this.keywordMapper = new KeywordMapper();
    this.keywordMapper.initialize();
    this.logger = logger;
  }

  /**
   * Route a complete user message to appropriate action
   * @param {string} messageText - Message text
   * @param {Object} user - User object
   * @param {string} phoneNumber - Phone number
   * @param {Object} executor - Action executor instance
   * @returns {Promise<boolean>} True if action was executed
   */
  async routeCompleteUserMessage(messageText, user, phoneNumber, executor) {
    // Handle navigation keywords first
    if (this.isNavigationKeyword(messageText)) {
      await executor.executeAction('show_main_menu', user, phoneNumber);
      return true;
    }

    // Check for numbered menu actions (legacy support)
    const numberedAction = await this.getNumberedMenuAction(phoneNumber, messageText);
    if (numberedAction) {
      if (numberedAction === 'back') {
        await executor.executeAction('show_main_menu', user, phoneNumber);
        return true;
      }
      await executor.executeAction(numberedAction, user, phoneNumber);
      return true;
    }

    // Check for compatibility requests with birth dates
    const compatibilityMatch = this.matchCompatibilityRequest(messageText);
    if (compatibilityMatch) {
      await this.handleCompatibilityRequest(phoneNumber, user, compatibilityMatch[1], executor);
      return true;
    }

    // Check for subscription requests
    if (this.isSubscriptionRequest(messageText)) {
      await this.handleSubscriptionRequest(phoneNumber, user, messageText);
      return true;
    }

    // Check for numerology report request
    if (messageText.toLowerCase() === 'numerology report') {
      await this.handleNumerologyRequest(user);
      return true;
    }

    // Try keyword-based action resolution
    const actionId = this.keywordMapper.getActionIdForText(messageText, {
      user,
      language: user.preferredLanguage || 'en'
    });

    if (actionId) {
      await executor.executeAction(actionId, user, phoneNumber);
      return true;
    }

    return false; // No action found, allow fallback
  }

  /**
   * Check if message is a navigation keyword
   * @param {string} messageText - Message text
   * @returns {boolean} True if navigation keyword
   */
  isNavigationKeyword(messageText) {
    const lowerText = messageText.toLowerCase();
    return lowerText === 'back' || lowerText === 'menu';
  }

  /**
   * Get numbered menu action from message
   * @param {string} phoneNumber - Phone number
   * @param {string} messageText - Message text
   * @returns {Promise<string|null>} Action identifier or null
   */
  async getNumberedMenuAction(phoneNumber, messageText) {
    try {
      // Check if message is a number (for numbered menu selections)
      const numberMatch = messageText.match(/^\s*(\d+)\s*$/);
      if (!numberMatch) {
        return null;
      }

      const selectionNumber = parseInt(numberMatch[1]);
      this.logger.info(`🔢 Processing numbered menu selection ${selectionNumber} for ${phoneNumber}`);

      // Get user's last menu from session
      const session = await this.getUserSession(phoneNumber);
      if (!session?.lastMenu) {
        return null;
      }

      // Map numbered selection to action based on menu type
      const actionId = this.mapNumberedSelectionToAction(session.lastMenu, selectionNumber);
      if (actionId) {
        this.logger.info(`🔗 Mapped number ${selectionNumber} to action ${actionId} for menu ${session.lastMenu}`);
        return actionId;
      }

      return null;
    } catch (error) {
      this.logger.error('Error processing numbered menu action:', error);
      return null;
    }
  }

  /**
   * Map numbered selection to action based on menu type
   * @param {string} menuType - Type of menu that was displayed
   * @param {number} selectionNumber - Number entered by user
   * @returns {string|null} Action ID or null
   */
  mapNumberedSelectionToAction(menuType, selectionNumber) {
    // Define numbered mappings for each menu type
    const numberedMappings = {
      western_astrology_menu: {
        1: 'get_daily_horoscope',
        2: 'show_birth_chart',
        3: 'get_current_transits',
        4: 'get_secondary_progressions',
        5: 'get_solar_arc_directions',
        6: 'get_asteroid_analysis',
        7: 'get_fixed_stars_analysis',
        8: 'get_solar_return_analysis',
        9: 'get_career_astrology_analysis',
        10: 'get_financial_astrology_analysis',
        11: 'get_medical_astrology_analysis',
        12: 'get_event_astrology_analysis',
        13: 'show_main_menu',
        14: 'back' // Navigate back option
      },
      vedic_astrology_menu: {
        1: 'get_hindu_astrology_analysis',
        2: 'get_synastry_analysis',
        3: 'show_nadi_flow',
        4: 'get_vimshottari_dasha_analysis',
        5: 'get_hindu_festivals_info',
        6: 'get_vedic_numerology_analysis',
        7: 'get_ashtakavarga_analysis',
        8: 'get_varga_charts_analysis',
        9: 'get_vedic_remedies_info',
        10: 'get_ayurvedic_astrology_analysis',
        11: 'get_prashna_astrology_analysis',
        12: 'get_muhurta_analysis',
        13: 'get_panchang_analysis',
        14: 'show_main_menu',
        15: 'back' // Navigate back option
      },
      relationships_groups_menu: {
        1: 'start_couple_compatibility_flow',
        2: 'get_synastry_analysis',
        3: 'start_family_astrology_flow',
        4: 'start_business_partnership_flow',
        5: 'start_group_timing_flow',
        6: 'show_main_menu',
        7: 'back' // Navigate back option
      },
      numerology_special_menu: {
        1: 'get_numerology_analysis',
        2: 'get_numerology_report',
        3: 'get_lunar_return',
        4: 'get_future_self_analysis',
        5: 'get_electional_astrology',
        6: 'get_mundane_astrology_analysis',
        7: 'show_main_menu',
        8: 'back' // Navigate back option
      },
      divination_mystic_menu: {
        1: 'get_tarot_reading',
        2: 'get_iching_reading',
        3: 'get_palmistry_analysis',
        4: 'show_chinese_flow',
        5: 'get_mayan_analysis',
        6: 'get_celtic_analysis',
        7: 'get_kabbalistic_analysis',
        8: 'get_hellenistic_astrology_analysis',
        9: 'get_islamic_astrology_info',
        10: 'get_horary_reading',
        11: 'get_astrocartography_analysis',
        12: 'show_main_menu',
        13: 'back' // Navigate back option
      }
    };

    const mapping = numberedMappings[menuType];
    return mapping ? mapping[selectionNumber] : null;
  }

  /**
   * Match compatibility request pattern
   * @param {string} messageText - Message text
   * @returns {Array|null} Match array or null
   */
  matchCompatibilityRequest(messageText) {
    return messageText.match(/(\d{2}\/\d{2}\/\d{4})/);
  }

  /**
   * Handle compatibility analysis request
   * @param {string} phoneNumber - Phone number
   * @param {Object} user - User object
   * @param {string} partnerBirthDate - Partner's birth date
   * @param {Object} executor - Action executor instance
   */
  async handleCompatibilityRequest(phoneNumber, user, partnerBirthDate, executor) {
    const { processFlowMessage } = require('../../../conversation/conversationEngine');
    const { ValidationService } = require('../utils/ValidationService');

    try {
      if (!user.birthDate) {
        await executor.sendErrorResponse(phoneNumber, 'incomplete_profile_for_compatibility', user.preferredLanguage || 'en');
        return;
      }

      // Validate subscription limits
      const limitsValidated = await ValidationService.checkSubscriptionLimits(user, 'compatibility');
      if (!limitsValidated) {
        await executor.sendErrorResponse(phoneNumber, 'compatibility_limit_reached', user.preferredLanguage || 'en');
        return;
      }

      // Start compatibility flow
      const mockMessage = {
        type: 'text',
        text: { body: partnerBirthDate },
        compatibilityMode: true
      };

      await processFlowMessage(mockMessage, user, 'compatibility_flow');
    } catch (error) {
      this.logger.error('Error handling compatibility request:', error);
      throw error;
    }
  }

  /**
   * Check if message is a subscription request
   * @param {string} messageText - Message text
   * @returns {boolean} True if subscription request
   */
  isSubscriptionRequest(messageText) {
    const lowerText = messageText.toLowerCase();
    return lowerText.includes('subscribe') || lowerText.includes('upgrade');
  }

  /**
   * Handle subscription request
   * @param {string} phoneNumber - Phone number
   * @param {Object} user - User object
   * @param {string} messageText - Original message text
   */
  async handleSubscriptionRequest(phoneNumber, user, messageText) {
    const { processFlowMessage } = require('../../../conversation/conversationEngine');

    let planId = 'essential'; // default

    if (messageText.toLowerCase().includes('premium')) {
      planId = 'premium';
    }

    // Start subscription flow instead of direct processing
    const mockMessage = { body: `subscribe_${planId}` };
    await processFlowMessage(mockMessage, user, 'subscription_flow');
  }

  /**
   * Handle numerology request
   * @param {Object} user - User object
   */
  async handleNumerologyRequest(user) {
    const { processFlowMessage } = require('../../../conversation/conversationEngine');
    await processFlowMessage({ body: 'numerology_flow' }, user, 'numerology_flow');
  }

  /**
   * Get user session information
   * @param {string} phoneNumber - Phone number
   * @returns {Object|null} Session data or null
   */
  async getUserSession(phoneNumber) {
    try {
      const { getUserSession } = require('../../../models/userModel');
      return await getUserSession(phoneNumber);
    } catch (error) {
      this.logger.error('Error getting user session:', error);
      return null;
    }
  }
}

module.exports = { MessageRouter };