const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../../services/astrology/vedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * BabyNameSuggestionAction - Suggests baby names based on Vedic astrology and numerology.
 * Uses birth chart analysis to recommend names that harmonize with the child's cosmic blueprint.
 */
class BabyNameSuggestionAction extends BaseAction {
  static get actionId() { return 'get_baby_name_suggestions'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Baby Name Suggestions'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendBabyNameIntro();
      return { success: true, type: 'baby_name_suggestions' };

    } catch (error) {
      this.logger.error('Error in BabyNameSuggestionAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendBabyNameIntro() {
    const analysis = `👶 *Vedic Baby Name Suggestions - Cosmic Naming*\n\n` +
      `In Vedic tradition, a child's name carries lifetime influence. Choose names that resonate with their birth chart for maximum harmony.\n\n` +
      `*🔆 VEDIC NAME PRINCIPLES:*\n` +
      `• First letter based on birth star (Nakshatra)\n` +
      `• Sound vibrations align with planetary energies\n` +
      `• Numerology harmonizes with life path\n` +
      `• Cultural significance and family traditions\n\n` +
      `*🌟 NAME CONSIDERATIONS:*\n` +
      `• Nakshatra (27 constellations) influence personality\n` +
      `• Planetary rulers affect life energies\n` +
      `• Number vibrations impact destiny\n` +
      `• Meaning should inspire positive qualities\n\n` +
      `*✨ A perfect name awakens the soul's highest potential.*`;

    const userLanguage = this.getUserLanguage();
    const buttons = [{
      id: 'show_main_menu',
      titleKey: 'buttons.main_menu',
      title: '🏠 Main Menu'
    }];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber, analysis, buttons, userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Suggest baby names based on Vedic astrology and birth chart analysis',
      keywords: ['baby names', 'name suggestions', 'vedic names', 'child naming'],
      category: 'utilities',
      subscriptionRequired: true,
      cooldown: 3600000
    };
  }
}

module.exports = BabyNameSuggestionAction;