const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class LunarReturnAction extends BaseAction {
  static get actionId() {
    return 'get_lunar_return';
  }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Lunar Return'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendLunarReturnAnalysis();
      return { success: true, type: 'lunar_return' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendLunarReturnAnalysis() {
    const analysis =
      '🌙 *Lunar Return - Monthly Cosmic Rebirth*\n\n' +
      'A Lunar Return occurs when the Moon returns to its natal position, creating a new monthly cycle of emotional and intuitive themes.\n\n' +
      '*🌙 LUNAR CYCLES REVEAL:*\n' +
      '• Emotional cycles and mood patterns\n' +
      '• Intuitive gifts available this month\n' +
      '• Areas of life calling for nurturing\n' +
      '• Emotional healing opportunities\n' +
      '• Connection to unconscious wisdom\n\n' +
      '*🔄 MONTHLY RENEWAL:*\n' +
      'Your lunar return initiates a 28-day cycle of emotional renewal, intuition, and deep inner knowing.\n\n' +
      '*This month, the cosmos supports your emotional intelligence and intuitive guidance.*';

    const userLanguage = this.getUserLanguage();
    const buttons = [
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber,
      analysis,
      buttons,
      userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze monthly lunar return cycles and emotional patterns',
      keywords: ['lunar return', 'moon cycle', 'monthly cycle', 'emotions'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 86400000
    };
  }
}

module.exports = LunarReturnAction;
