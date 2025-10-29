const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class BusinessAstrologyAction extends BaseAction {
  static get actionId() { return 'start_business_partnership_flow'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Business Astrology'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendBusinessAstrology();
      return { success: true, type: 'business_astrology' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendBusinessAstrology() {
    const analysis = `🤝 *Business & Partnership Astrology*\n\n` +
      `Optimize business ventures, partnerships, and financial decisions with cosmic timing and astrological insights.\n\n` +
      `*💼 BUSINESS ASTROLOGY REVEALS:*\n` +
      `• **Partnership Synastry** - Business partner compatibility\n` +
      `• **Financial Astrology** - Money and wealth cycles\n` +
      `• **Business Timing** - Optimal launch periods\n` +
      `• **Team Dynamics** - Staff and client interactions\n` +
      `• **Market Cycles** - Economic astrology patterns\n\n` +
      `*📈 COMMERCIAL ASTROLOGY TOOLS:*\n` +
      `• **Electional Astrology** - Choose perfect business incorporation dates\n` +
      `• **Horary Astrology** - Answer specific business questions\n` +
      `• **Solar Returns** - Annual business planning\n` +
      `• **Transits** - Major business cycle changes\n\n` +
      `*🚀 COSMIC BUSINESS ADVANTAGE:*\n` +
      `When you align your business decisions with cosmic cycles, success becomes predictable and sustainable. Your birth chart reveals your most profitable ventures and ideal business partners.`;

    const userLanguage = this.getUserLanguage();
    const buttons = [
      {
        id: 'get_financial_astrology_analysis',
        titleKey: 'buttons.financial_astrology',
        title: '💰 Financial Astrology'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber, analysis, buttons, userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze business partnerships and entrepreneurial astrology',
      keywords: ['business', 'partnership', 'entrepreneur', 'business astrology', 'commercial'],
      category: 'business',
      subscriptionRequired: true,
      cooldown: 7200000
    };
  }
}

module.exports = BusinessAstrologyAction;