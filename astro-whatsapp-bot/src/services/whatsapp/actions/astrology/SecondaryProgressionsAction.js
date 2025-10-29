const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class SecondaryProgressionsAction extends BaseAction {
  static get actionId() { return 'get_secondary_progressions'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Secondary Progressions'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendSecondaryProgressionsAnalysis();
      return { success: true, type: 'secondary_progressions' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendSecondaryProgressionsAnalysis() {
    const analysis = `⏰ *Secondary Progressions - Your Soul's Evolution*\n\n` +
      `Secondary progressions reveal your soul's growth journey by advancing planets one day for each year of life. This technique shows the deep, spiritual evolution of your consciousness.\n\n` +
      `*⭐ SECONDARY PROGRESSION MEANING:*\n` +
      `• Day = Year (1 day equals 1 year)\n` +
      `• Reveals unconscious patterns and soul lessons\n` +
      `• Shows karmic influences and spiritual development\n` +
      `• Indicates major life transformations\n` +
      `• Guides conscious evolution and healing work\n\n` +
      `*🌱 EVOLUTIONARY INSIGHTS:*\n` +
      `• Where you are releasing old patterns\n` +
      `• What gifts your soul is developing now\n` +
      `• The karmic lessons of this lifetime\n` +
      `• Your path of conscious spiritual growth\n` +
      `• The higher purpose of your current challenges\n\n` +
      `*✨ CONSCIOUS EVOLUTION:*\n` +
      `Secondary progressions show the micro-details of your personal cosmic unfolding. They can reveal what your soul came here to learn and master.\n\n` +
      `*Your secondary progressions reveal the divine curriculum of your soul.*`;

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
      description: 'Analyze secondary progressions for spiritual growth and karmic lessons',
      keywords: ['secondary progressions', 'soul evolution', 'spiritual growth', 'consciousness'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000
    };
  }
}

module.exports = SecondaryProgressionsAction;