const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class FixedStarsAction extends BaseAction {
  static get actionId() { return 'get_fixed_stars_analysis'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Fixed Stars Analysis'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendFixedStarsAnalysis();
      return { success: true, type: 'fixed_stars_analysis' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendFixedStarsAnalysis() {
    const analysis = `⭐ *Fixed Stars - Ancient Cosmic Guardians*\n\n` +
      `Fixed stars are ancient stellar guardians that cast their forever-light upon our planetary movements. These unchanging points reveal our karmic contracts and illuminate the higher purpose of planetary activities.\n\n` +
      `*✨ MAJOR FIXED STARS BY CONSTELLATION:*\n` +
      `• **Aldebaran (Eye of the Bull)** - Ambitious, practical, royal bearing\n` +
      `• **Regulus (Heart of the Lion)** - Leadership, honor, divine rights\n` +
      `• **Spica (Wheat Ear of Virgo)** - Prosperity, healing, abundance\n` +
      `• **Antares (Heart of the Scorpion)** - Transformation, shamanism, power\n` +
      `• **Algol (Demon Star)** - Karmic challenges, spiritual warfare, rebirth\n` +
      `• **Vega (Lyra's Alpha)** - Artistic genius, luxury, romance\n` +
      `• **Sirius (Dog Star)** - Spiritual teachers, guides, cosmic wisdom\n` +
      `• **Vega (Harp Star)** - Musical genius, legal success, artistic mastery\n\n` +
      `*🌟 YOUR STELLAR CONTRACTS:*\n` +
      `• Planets conjunct fixed stars amplify their energy\n` +
      `• Lunar mansions (27 Nakshatras) connect to fixed star energies\n` +
      `• Your birth chart reveals which cosmic guardians oversee your destiny\n` +
      `• Major life events align with fixed star transits\n\n` +
      `*🔮 ANCIENT COSMIC KNOWLEDGE:*\n` +
      `The fixed stars guided the destiny of pharaohs, emperors, and spiritual leaders throughout history. Their influence reveals the divine purpose behind worldly events and personal transformations.\n\n` +
      `*🪐 STELLAR PORTENTS:*\n` +
      `• **Rising Recognition:** Planets conjunct radiation stars\n` +
      `• **Spiritual Guardianship:** Conjunctions with guiding stars\n` +
      `• **Karmic Reckoning:** Associations with demonic stars\n` +
      `• **Divine Grace:** Gestations with benevolent stars\n\n` +
      `*The fixed stars weave the tapestry of cosmic destiny, guiding souls through the grand design of universal evolution.*`;

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
      description: 'Analyze fixed stars conjunctions and karmic stellar influences',
      keywords: ['fixed stars', 'stellar karma', 'cosmic guardians', 'fixed star conjunctions'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000
    };
  }
}

module.exports = FixedStarsAction;