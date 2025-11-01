const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../../core/services/astrology/vedic/VedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../services/i18n/TranslationService');

/**
 * WesternAstrologyAction - Provides overview and navigation for Western astrology features.
 * Western astrology focuses on Tropical Zodiac, aspects, and psychological interpretation.
 */
class WesternAstrologyAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_western_astrology_menu';
  }

  /**
   * Execute the western astrology menu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Showing Western astrology menu');

      // Send Western astrology overview and navigation
      await this.sendWesternAstrologyMenu();

      this.logExecution('complete', 'Western astrology menu sent');
      return {
        success: true,
        type: 'western_astrology_menu',
        category: 'western'
      };
    } catch (error) {
      this.logger.error('Error in WesternAstrologyAction:', error);
      await this.handleExecutionError(error);
      return {
        success: false,
        reason: 'execution_error',
        error: error.message
      };
    }
  }

  /**
   * Send Western astrology features menu
   */
  async sendWesternAstrologyMenu() {
    const userLanguage = this.getUserLanguage();

    const menuMessage =
      '🌟 *Western Astrology - Tropical Wisdom*\n\n' +
      'Western astrology interprets the cosmos through the lens of psychology, mythology, and modern life. Based on the Tropical Zodiac that aligns with the seasons.\n\n' +
      '*🌟 CORE FEATURES:*\n' +
      '• Complete Birth Chart Analysis\n' +
      '• Planetary Aspects & Angles\n' +
      '• House Systems & Life Areas\n' +
      '• Current Transits & Influences\n' +
      '• Solar & Lunar Returns\n' +
      '• Composite Charts for Relationships\n\n' +
      '*🔍 ASTROLOGY APPROACHES:*\n' +
      '• Psychological Astrology (Jungian)\n' +
      '• Evolutionary Astrology\n' +
      '• Horary Astrology (Question-based)\n' +
      '• Electional Astrology (Timing)\n\n' +
      '*What would you like to explore?*';

    const westernButtons = [
      {
        id: 'get_birth_chart',
        titleKey: 'buttons.western_birth_chart',
        title: '📊 Western Birth Chart'
      },
      {
        id: 'get_current_transits',
        titleKey: 'buttons.current_transits',
        title: '🌌 Current Transits'
      },
      {
        id: 'get_secondary_progressions',
        titleKey: 'buttons.secondary_progressions',
        title: '⏳ Progressions'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber,
      menuMessage,
      westernButtons,
      userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage =
      '❌ Sorry, there was an error loading the Western astrology menu. Please try typing "menu" to go back.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Show Western astrology features and navigation menu',
      keywords: [
        'western',
        'western astrology',
        'tropical',
        'modern astrology'
      ],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 60000 // 1 minute between menu accesses
    };
  }
}

module.exports = WesternAstrologyAction;
