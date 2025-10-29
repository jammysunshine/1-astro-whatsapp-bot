const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class MuhurtaAction extends BaseAction {
  static get actionId() { return 'get_muhurta_timing'; }

  async execute() {
    try {
      await this.sendMuhurtaGuide();
      return { success: true, type: 'muhurta' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendMuhurtaGuide() {
    const guide = `🗓️ *Muhurta - Vedic Auspicious Timing*\n\n` +
      `Muhurta (electional astrology) is the Vedic art of choosing perfectly auspicious moments for life's important events through planetary alignment and lunar mansions.\n\n` +
      `*🕐 VEDIC TIMING WISDOM:*\n` +
      `• Muhurta = Perfect Time (48-minute window)\n` +
      `• Based on Vedic calendar and lunar positions\n` +
      `• Considers five types of defects (Panchang)\n` +
      `• Aligns with Nakshatras and planetary hours\n` +
      `• Ensures success and blessings for new beginnings\n\n` +
      `*🌟 MUHURTA TIMING FOR:*\n` +
      `• Gruhapravesh (home entering)\n` +
      `• Marriage ceremonies\n` +
      `• Business inauguration\n` +
      `• Religious ceremonies and pujas\n` +
      `• Travel embarkation\n` +
      `• Educational beginnings\n\n` +
      `*✨ MUHURTA CONSIDERATIONS:*\n` +
      `• Tithi (lunar day) favorable potency\n` +
      `• Nakshatra auspicious stars\n` +
      `• Yoga planetary combinations\n` +
      `• Karana half-day lunar influences\n` +
      `• Var weekday strength\n\n` +
      `*🪐 PERFECT VEDIC TIMING:*\n` +
      `When you begin at the right cosmic moment, the entire universe conspires to support your success and bring blessings to your venture.\n\n` +
      `*Let Vedic wisdom bless your important beginnings.*`;

    const userLanguage = this.getUserLanguage();
    const buttons = [{
      id: 'show_main_menu',
      titleKey: 'buttons.main_menu',
      title: '🏠 Main Menu'
    }];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber, guide, buttons, userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Find auspicious Muhurta timing for important events',
      keywords: ['muhurta', 'auspicious timing', 'vedic election', 'perfect moment'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 1800000
    };
  }
}

module.exports = MuhurtaAction;