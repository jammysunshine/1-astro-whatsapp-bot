const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class ColorTherapyAction extends BaseAction {
  static get actionId() {
    return 'get_color_therapy_guide';
  }

  async execute() {
    try {
      await this.sendColorTherapyGuide();
      return { success: true, type: 'color_therapy' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendColorTherapyGuide() {
    const guide =
      '🌈 *Color Therapy - Elemental Healing*\n\n' +
      'Colors carry powerful vibrational energies that can harmonize your chakras, balance elements, and heal through light. Each color connects to planetary energies and elemental forces.\n\n' +
      '*🌈 ELEMENTAL COLORS:*\n' +
      '• Red (Fire) - Mars: Energy, passion, vitality\n' +
      '• Orange (Fire) - Sun: Confidence, creativity, leadership\n' +
      '• Yellow (Earth) - Jupiter: Wisdom, abundance, power\n' +
      '• Green (Earth) - Mercury: Healing, growth, harmony\n' +
      '• Blue (Water) - Venus: Communication, peace, truth\n' +
      '• Indigo (Ether) - Saturn: Intuition, higher wisdom\n' +
      '• Violet (Ether) - Moon: Spirituality, divine connection\n\n' +
      '*🎨 CHAKRA COLORS:* Root (Red), Sacral (Orange), Solar (Yellow),\n' +
      'Heart (Green), Throat (Blue), Third Eye (Indigo), Crown (Violet).\n\n' +
      '*✨ COLOR HEALING APPLICATIONS:*\n' +
      '• Wear colored clothes for energy balancing\n' +
      '• Visualize colors during meditation\n' +
      '• Use colored crystals and gemstones\n' +
      '• Surround yourself with healing colors\n' +
      '• Consume colorful, organic foods\n\n' +
      '*🔮 VEDIC COLOR WISDOM:*\n' +
      'Vedic tradition uses colors (Varna) for auspicious ceremonies. White (purity, Ketu), Red (Mars, Sun), Yellow (Jupiter, Venus), Saffron (spirituality), Green (Mercury).\n\n' +
      '*🌟 Cosmic Colors Transform:* Your aura, emotions, health, and spiritual alignment through the harmonious vibration of elemental light.\n\n' +
      '*Choose colors that resonate with your soul\'s highest vibration.*';

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
      guide,
      buttons,
      userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Get color therapy guides for healing and energy balancing',
      keywords: [
        'color therapy',
        'chromotherapy',
        'elemental colors',
        'healing colors'
      ],
      category: 'utilities',
      subscriptionRequired: false,
      cooldown: 1800000
    };
  }
}

module.exports = ColorTherapyAction;
