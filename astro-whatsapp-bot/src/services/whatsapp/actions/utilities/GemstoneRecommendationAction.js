const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class GemstoneRecommendationAction extends BaseAction {
  static get actionId() {
    return 'get_gemstone_recommendations';
  }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Gemstone Recommendations'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendGemstoneGuide();
      return { success: true, type: 'gemstone_recommendations' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendGemstoneGuide() {
    const guide =
      '💎 *Gemstone Recommendations - Cosmic Crystals*\n\n' +
      'Gemstones amplify planetary energies in your birth chart. Based on Vedic tradition and crystal healing, stones can strengthen beneficial planets and balance weak ones.\n\n' +
      '*💫 GEMSTONES BY PLANET:*\n' +
      '• Sun (Leadership): Ruby, Red Garnet, Diamond\n' +
      '• Moon (Emotion): Pearl, Moonstone, Rose Quartz\n' +
      '• Mars (Energy): Red Coral, Bloodstone, Carnelian\n' +
      '• Mercury (Communication): Emerald, Aquamarine, Peridot\n' +
      '• Jupiter (Wisdom): Yellow Sapphire, Citrine, Topaz\n' +
      '• Venus (Love): Diamond, White Sapphire, Opal\n' +
      '• Saturn (Discipline): Blue Sapphire, Lapis, Amethyst\n' +
      '• Rahu (Transformation): Hessonite, Gomed\n' +
      '• Ketu (Spirituality): Cat\'s Eye, Chrysoberyl\n\n' +
      '*🔮 STONE SELECTION GUIDE:*\n' +
      '• Strengthen weak remedies stones\n' +
      '• Wear on appropriate day and time\n' +
      '• Cleans stones regularly with running water\n' +
      '• Combine with proper metals and settings\n' +
      '• Chant mantras while wearing stones\n\n' +
      '*✨ COSMIC CRYSTAL ENERGY:*\n' +
      'Gemstones bridge earthly and cosmic vibrations. They can accelerate spiritual growth, protect from negative influences, and amplify positive planetary energies in your life.\n\n' +
      '*Choose stones that resonate with your birth chart\'s needs.*';

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
      description:
        'Get astrological gemstone recommendations based on birth chart',
      keywords: [
        'gemstones',
        'crystals',
        'stones',
        'ratnas',
        'planetary stones'
      ],
      category: 'utilities',
      subscriptionRequired: true,
      cooldown: 43200000
    };
  }
}

module.exports = GemstoneRecommendationAction;
