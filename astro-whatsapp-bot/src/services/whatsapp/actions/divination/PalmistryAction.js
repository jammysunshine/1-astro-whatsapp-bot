const BaseAction = require('../BaseAction');
const palmistryReader = require('../../../../services/astrology/palmistryReader');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * PalmistryAction - Analyzes palm lines and mounts for personality and life insights.
 * Palmistry reveals character traits, emotional patterns, and life potential through hand reading.
 */
class PalmistryAction extends BaseAction {
  static get actionId() { return 'get_palmistry_analysis'; }

  async execute() {
    try {
      this.logExecution('start', 'Performing palmistry analysis');

      if (!(await this.validateUserProfile('Palmistry Analysis'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendPalmistryAnalysis();

      this.logExecution('complete', 'Palmistry analysis sent');
      return { success: true, type: 'palmistry_analysis' };
    } catch (error) {
      this.logger.error('Error in PalmistryAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  async sendPalmistryAnalysis() {
    const analysis = '✋ *Palmistry - The Map of Your Life*\n\n' +
      'Your hands reveal your inner blueprint - past, present, and potential future.\n\n' +
      '*📖 MAJOR PALM FEATURES:*\n' +
      '• *Life Line* - Vitality, general life flow, and major life changes\n' +
      '• *Heart Line* - Emotional nature, relationships, and affection\n' +
      '• *Head Line* - Intellect, reasoning, and approach to problem-solving\n' +
      '• *Fate Line* - Career path, external influences, and life\'s direction\n\n' +
      '*🏔️ MOUNTS OF THE HAND:*\n' +
      '• Sun Mount - Success, creativity, and recognition\n' +
      '• Moon Mount - Intuition, imagination, and spirituality\n' +
      '• Venus Mount - Love, passion, and sensuality\n' +
      '• Mars Mount - Energy, courage, and self-defense\n\n' +
      '*For personalized palmistry analysis, please share a clear photo of your dominant hand (palm facing up).*';

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

  async sendIncompleteProfileMessage() {
    const message = '👤 Palmistry analysis requires a complete profile. Please update your birth details first.';
    await sendMessage(this.phoneNumber, message, 'text');
  }

  async handleExecutionError(error) {
    const errorMessage = '❌ Error analyzing palmistry. Please try again later.';
    await sendMessage(this.phoneNumber, errorMessage, 'text');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze palm lines and mounts for life insights',
      keywords: ['palmistry', 'palm reading', 'hand reading', 'palms'],
      category: 'divination',
      subscriptionRequired: false,
      cooldown: 3600000
    };
  }
}

module.exports = PalmistryAction;
