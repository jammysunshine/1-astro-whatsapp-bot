const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class MantraRecommendationAction extends BaseAction {
  static get actionId() { return 'get_personal_mantra'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Mantra Recommendations'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendMantraGuide();
      return { success: true, type: 'mantra_recommendations' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendMantraGuide() {
    const guide = `🪬 *Personal Mantra - Cosmic Vibrations*\n\n` +
      `Mantras are sacred sounds that align you with divine planetary energies. Based on your birth chart, specific mantras can harmonize planetary influences and accelerate spiritual growth.\n\n` +
      `*🪬 POWERFUL MANTRAS:*\n` +
      `• Gayatri Mantra - Universal illumination\n` +
      `• Mahamrityunjaya - Healing and protection\n` +
      `• Durga Mantra - Strength and victory\n` +
      `• Vishnu Mantra - Preservation and harmony\n` +
      `• Shiva Mantra - Transformation and dissolution\n\n` +
      `*⭐ PLANETARY MANTRAS:*\n` +
      `• Sun: Om Suryaya Namaha (Leadership & Vitality)\n` +
      `• Moon: Om Chandraya Namaha (Peace & Intuition)\n` +
      `• Mars: Om Mangalaya Namaha (Courage & Action)\n` +
      `• Mercury: Om Budhaya Namaha (Wisdom & Communication)\n` +
      `• Jupiter: Om Gurave Namaha (Expansion & Fortune)\n` +
      `• Venus: Om Shukraya Namaha (Beauty & Harmony)\n` +
      `• Saturn: Om Shanischraya Namaha (Discipline & Structure)\n\n` +
      `*🔊 SIGNIFICANCE POWER TIMES:*\n` +
      `• Dawn & dusk - Maximum spiritual receptivity\n` +
      `• Full moon - Enhanced intuition\n` +
      `• Planetary days - Align with specific energies\n` +
      `• Meditation practice - Deepening connection\n\n` +
      `*✨ SACRED VIBRATIONS:*\n` +
      `Mantras create ripple effects through the cosmos. They purify consciousness, align with universal harmony, and manifest positive planetary influences in your life.\n\n` +
      `*Your personal mantra holds the key to cosmic alignment.*`;

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
      description: 'Get personalized mantra recommendations based on birth chart',
      keywords: ['mantra', 'personal mantra', 'sacred vibrations', 'cosmic sound'],
      category: 'utilities',
      subscriptionRequired: true,
      cooldown: 43200000
    };
  }
}

module.exports = MantraRecommendationAction;