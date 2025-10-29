const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * VedicAstrologyAction - Provides overview and navigation for Vedic (Jyotish) astrology features.
 * Vedic astrology emphasizes karma, dharma, and spiritual growth through ancient Indian wisdom.
 */
class VedicAstrologyAction extends BaseAction {
  /**
   * Unique action identifier
   */
  static get actionId() {
    return 'show_vedic_astrology_menu';
  }

  /**
   * Execute the vedic astrology menu action
   * @returns {Promise<Object|null>} Action result
   */
  async execute() {
    try {
      this.logExecution('start', 'Showing Vedic astrology menu');

      // Send Vedic astrology overview and navigation
      await this.sendVedicAstrologyMenu();

      this.logExecution('complete', 'Vedic astrology menu sent');
      return {
        success: true,
        type: 'vedic_astrology_menu',
        category: 'vedic'
      };
    } catch (error) {
      this.logger.error('Error in VedicAstrologyAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Send Vedic astrology features menu
   */
  async sendVedicAstrologyMenu() {
    const userLanguage = this.getUserLanguage();

    const menuMessage = '🕉️ *Vedic Astrology - Ancient Wisdom*\n\n' +
      'Jyotish (Vedic astrology) reveals your karmic path through ancient Indian spiritual science. Using Sidereal Zodiac and lunar-based calculations for profound life guidance.\n\n' +
      '*🕉️ SACRED FEATURES:*\n' +
      '• Complete Vedic Birth Chart (Kundli)\n' +
      '• Vimshottari Dasha Periods\n' +
      '• Nakshatras & Lunar Mansions\n' +
      '• Planetary Strengths (Shadbala)\n' +
      '• Varga Charts & Harmonic Analysis\n' +
      '• Muhurta & Auspicious Timing\n\n' +
      '*🔍 VEDIC SYSTEMS:*\n' +
      '• Parashari System (Classical)\n' +
      '• Jaimini Astrology (Spiritual)\n' +
      '• Nadi Astrology (Remedial)\n' +
      '• Tajika Astrology (Predictive)\n\n' +
      '*🌟 What wisdom shall we explore?*';

    const vedicButtons = [
      {
        id: 'show_birth_chart',
        titleKey: 'buttons.vedic_kundli',
        title: '📊 Vedic Kundli'
      },
      {
        id: 'get_vimshottari_dasha_analysis',
        titleKey: 'buttons.dasha_analysis',
        title: '⏰ Dasha Analysis'
      },
      {
        id: 'get_panchang_analysis',
        titleKey: 'buttons.muhurta',
        title: '🗓️ Muhurta'
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
      vedicButtons,
      userLanguage
    );

    await sendMessage(
      message.to,
      message.interactive,
      'interactive'
    );
  }

  /**
   * Handle execution errors
   * @param {Error} error - Execution error
   */
  async handleExecutionError(error) {
    const errorMessage = '❌ Sorry, there was an error loading the Vedic astrology menu. Please try typing "menu" to return to main navigation.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  /**
   * Get action metadata for registration
   * @returns {Object} Action metadata
   */
  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Show Vedic astrology (Jyotish) features and navigation menu',
      keywords: ['vedic', 'jyotish', 'hindu astrology', 'indian', 'kundli'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 60000 // 1 minute between menu accesses
    };
  }
}

module.exports = VedicAstrologyAction;
