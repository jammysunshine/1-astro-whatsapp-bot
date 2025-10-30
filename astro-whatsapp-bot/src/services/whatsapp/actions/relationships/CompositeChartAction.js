const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../services/astrology/vedic/VedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../services/i18n/TranslationService');

/**
 * CompositeChartAction - Creates composite charts that show the relationship as a single entity.
 * Composite charts reveal the dynamics of partnerships, businesses, and creative collaborations.
 */
class CompositeChartAction extends BaseAction {
  static get actionId() { return 'create_composite_chart'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Composite Chart'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendCompositeChartIntro();
      return { success: true, type: 'composite_chart_intro' };
    } catch (error) {
      this.logger.error('Error in CompositeChartAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendCompositeChartIntro() {
    const analysis = '🌟 *Composite Chart - The Soul of Your Relationship*\n\n' +
      'A composite chart shows your relationship as a living entity with its own birth chart. This reveals the relationship\'s purpose, challenges, and potential.\n\n' +
      '*❤️ COMPOSITE CHART REVEALS:*\n' +
      '• The relationship\'s personality and character\n' +
      '• Shared life purpose and karmic lessons\n' +
      '• Natural strengths and relationship dynamics\n' +
      '• Communication style and emotional patterns\n' +
      '• Long-term potential and growth areas\n\n' +
      '*🔮 RELATIONSHIP TYPES:*\n' +
      '• Romantic partnerships and marriages\n' +
      '• Business partnerships and collaborations\n' +
      '• Family relationships and healing\n' +
      '• Creative collaborations and projects\n\n' +
      '*Your composite chart is the blueprint of your relationship\'s soul.*';

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
      description: 'Create composite charts showing relationship dynamics as a single entity',
      keywords: ['composite chart', 'relationship chart', 'partnership chart'],
      category: 'relationships',
      subscriptionRequired: true,
      cooldown: 7200000
    };
  }
}

module.exports = CompositeChartAction;
