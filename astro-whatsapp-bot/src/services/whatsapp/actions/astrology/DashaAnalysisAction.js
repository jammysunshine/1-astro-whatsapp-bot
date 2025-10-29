const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../../services/astrology/vedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * DashaAnalysisAction - Provides Vimshottari Dasha analysis for Vedic astrology timing.
 * Vimshottari Dasha is the most important timing technique in Vedic astrology.
 */
class DashaAnalysisAction extends BaseAction {
  static get actionId() { return 'get_vimshottari_dasha_analysis'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Vimshottari Dasha Analysis'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendDashaAnalysis();
      return { success: true, type: 'vimshottari_dasha_analysis' };

    } catch (error) {
      this.logger.error('Error in DashaAnalysisAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendDashaAnalysis() {
    const analysis = `🕉️ *Vimshottari Dasha - Vedic Timing System*\n\n` +
      `Vimshottari Dasha reveals the cosmic timing of your life's major events and experiences. This 120-year cycle shows when planetary periods activate specific areas of life.\n\n` +
      `*🌟 DASHA SYSTEM STRUCTURE:*\n` +
      `• Mahadasha (Major Period) - 27 constellations × planet rule times\n` +
      `• Antardasha (Sub-period) - Within major period divisions\n` +
      `• Pratyantardasha (Sub-sub period) - Further refined timing\n` +
      `• Sukshma (Micro timing) - Most precise influences\n\n` +
      `*⭐ CURRENT DASHA PERIODS:*\n` +
      `• **Mahadasha** - Your primary life theme (9-20 years)\n` +
      `• **Antardasha** - Current sub-period (1-3 years)\n` +
      `• **Pratyantardasha** - Current theme nuances (months)\n` +
      `• **Remaining time** - How much of current period remains\n\n` +
      `*🌙 NATURAL LIFESPAN IN VEDIC TRADITION:*\n` +
      `• Moon Mahadasha: Age 0-4 (Foundation & nurturing)\n` +
      `• Mars Mahadasha: Age 0-7 (Energy & courage)\n` +
      `• Rahu Mahadasha: Age 12-42 (Ambitious transformation)\n` +
      `• Jupiter Mahadasha: Age 16-52 (Wisdom & expansion)\n` +
      `• Saturn Mahadasha: Age 28-56 (Discipline & structure)\n` +
      `• Mercury Mahadasha: Age 32-56 (Intelligence & versatility)\n` +
      `*Dasha periods vary based on your birth chart moon's position.*\n\n` +
      `*✨ DASHA INTERPRETATION GUIDELINES:*\n` +
      `• Favorable planets strengthen beneficial qualities\n` +
      `• Challenging planets bring learning and growth\n` +
      `• Each period brings focused development opportunities\n` +
      `• Planet+Dasha = focused area of life's curriculum\n\n` +
      `*🔮 Your Current Dasha reflects the universe's teaching plan for you right now. Each planetary period brings specific growth opportunities and soul lessons.*`;

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
      description: 'Analyze Vimshottari Dasha periods for Vedic life timing',
      keywords: ['dasha', 'vimshottari', 'timing', 'vedic timing', 'dasa'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000
    };
  }
}

module.exports = DashaAnalysisAction;