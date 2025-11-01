const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class HealthAstrologyAction extends BaseAction {
  static get actionId() {
    return 'get_medical_astrology_analysis';
  }

  async execute() {
    try {
      this.logExecution('start', 'Analyzing medical astrology');

      if (!(await this.validateUserProfile('Medical Astrology'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendHealthAnalysis();
      return { success: true, type: 'health_astrology' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendHealthAnalysis() {
    const analysis =
      '🏥 *Medical Astrology - Body & Spirit Integration*\n\n' +
      'Astrology reveals the cosmic influences on health, vitality, and healing patterns in your life.\n\n' +
      '*🔬 MEDICAL ASTROLOGY INSIGHTS:*\n' +
      '• **1st House** - Overall vitality and physical body\n' +
      '• **6th House** - Daily health routines and service\n' +
      '• **8th House** - Deep healing and transformation\n' +
      '• **12th House** - Chronic conditions and spiritual healing\n\n' +
      '*⭐ KEY PLANETS FOR HEALTH:*\n' +
      '• **Mars** - Energy, surgery, inflammation, vitality\n' +
      '• **Saturn** - Bones, teeth, joints, chronic conditions\n' +
      '• **Moon** - Emotions, stomach, digestion, fluids\n' +
      '• **6th House Ruler** - Daily health and wellness\n\n' +
      '*Note: Medical astrology complements professional healthcare but should not replace medical advice.*';

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
      description: 'Analyze astrological influences on health and well-being',
      keywords: ['health', 'medical astrology', 'healing', 'wellness', 'body'],
      category: 'health',
      subscriptionRequired: true,
      cooldown: 7200000
    };
  }
}

module.exports = HealthAstrologyAction;
