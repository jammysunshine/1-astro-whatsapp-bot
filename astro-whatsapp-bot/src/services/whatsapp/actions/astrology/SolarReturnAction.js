const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class SolarReturnAction extends BaseAction {
  static get actionId() { return 'get_solar_return'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Solar Return'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendSolarReturnAnalysis();
      return { success: true, type: 'solar_return' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendSolarReturnAnalysis() {
    const analysis = '☀️ *Solar Return - Your Annual Cosmic Blueprint*\n\n' +
      'The solar return marks your personal New Year when the Sun returns to your natal position. This chart reveals the themes, opportunities, and challenges for your upcoming year.\n\n' +
      '*🌅 SOLAR RETURN SIGNIFICANCE:*\n' +
      '• Annual life themes and lessons\n' +
      '• Major opportunities and challenges\n' +
      '• Career and relationship developments\n' +
      '• Health and spiritual growth areas\n' +
      '• Financial cycles and abundance patterns\n\n' +
      '*🕐 TIMING INSIGHT:*\n' +
      'Your solar return occurs once each year around your birthday. The planetary placements at that moment create your annual destiny blueprint.\n\n' +
      '*✨ UNLOCK YOUR YEAR\'S DESTINY:*\n' +
      'Understanding your solar return chart helps you consciously align with the universe\'s timing for your personal growth journey.\n\n' +
      '*The coming year holds special cosmic gifts for your soul\'s evolution.*';

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
      description: 'Analyze annual solar return for personal yearly cycles',
      keywords: ['solar return', 'annual return', 'yearly cycles', 'birthday chart'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 86400000
    };
  }
}

module.exports = SolarReturnAction;
