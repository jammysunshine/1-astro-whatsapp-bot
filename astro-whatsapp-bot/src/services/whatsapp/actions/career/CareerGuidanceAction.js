const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class CareerGuidanceAction extends BaseAction {
  static get actionId() { return 'get_career_astrology_analysis'; }

  async execute() {
    try {
      this.logExecution('start', 'Analyzing career astrology');

      if (!(await this.validateUserProfile('Career Analysis'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendCareerAnalysis();
      this.logExecution('complete', 'Career analysis sent');
      return { success: true, type: 'career_analysis' };

    } catch (error) {
      this.logger.error('Error in CareerGuidanceAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  async sendCareerAnalysis() {
    const analysis = `💼 *Career Astrology - Life's Work*\n\n` +
      `Your birth chart reveals your vocational calling, perfect career fields, and optimal timing for professional decisions.\n\n` +
      `*🎯 CAREER INDICATORS:*\n` +
      `• **Midheaven (MC)** - Your public role and career direction\n` +
      `• **10th House** - Professional reputation and achievements\n` +
      `• **2nd/6th/10th** - Money, service, and career houses\n` +
      `• **Saturn** - Work ethic, responsibility, and career timing\n\n` +
      `*❤️ CAREER SATISFACTION FACTORS:*\n` +
      `• Sun - Leadership and self-expression\n` +
      `• Mercury - Communication and analytical roles\n` +
      `• Mars - Action-oriented and competitive fields\n` +
      `• Venus - Beauty, harmony, and creative arts\n\n` +
      `*For personalized career guidance, your birth chart shows the perfect professional path for your soul's journey.*`;

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
      description: 'Analyze astrological influences on career and professional life',
      keywords: ['career', 'job', 'work', 'profession', 'calling'],
      category: 'career',
      subscriptionRequired: true,
      cooldown: 3600000
    };
  }
}

module.exports = CareerGuidanceAction;