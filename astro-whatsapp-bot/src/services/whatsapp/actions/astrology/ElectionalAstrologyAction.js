const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class ElectionalAstrologyAction extends BaseAction {
  static get actionId() { return 'get_electional_timing'; }

  async execute() {
    try {
      await this.sendElectionalAstrologyGuide();
      return { success: true, type: 'electional_astrology' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendElectionalAstrologyGuide() {
    const guide = `🔮 *Electional Astrology - Cosmic Timing Perfection*\n\n` +
      `Electional astrology chooses the optimal moment for important life events by analyzing planetary placements for success, harmony, and longevity.\n\n` +
      `*📅 PERFECT TIMING FOR:*\n` +
      `• Weddings and marriage ceremonies\n` +
      `• Business launches and incorporations\n` +
      `• Major purchases (homes, vehicles)\n` +
      `• Surgeries and medical procedures\n` +
      `• Starting new ventures or projects\n` +
      `• Important meetings and decisions\n` +
      `• Signature of contracts and agreements\n\n` +
      `*⚡ COSMIC SUCCESS FACTORS:*\n` +
      `• Benefic planets (Venus, Jupiter) in strong positions\n` +
      `• Malefic planets (Mars, Saturn) in weakened positions\n` +
      `• Planetary hours aligned with purpose\n` +
      `• Moon in favorable signs for the activity\n` +
      `• Void-of-course Moon avoided\n\n` +
      `*🕐 EXACT MOMENT MATTERS:*\n` +
      `Even a few minutes difference in timing can dramatically change outcomes. Electional astrology finds the perfect cosmic signature for your important decisions.\n\n` +
      `*✨ Choose Your Perfect Time*\n` +
      `*Let the universe bless your journey with perfect timing.*`;

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
      description: 'Choose optimal timing for important life events using electional astrology',
      keywords: ['electional astrology', 'auspicious timing', 'perfect time', 'cosmic timing'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 1800000
    };
  }
}

module.exports = ElectionalAstrologyAction;