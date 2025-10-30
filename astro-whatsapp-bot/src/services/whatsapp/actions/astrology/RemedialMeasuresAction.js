const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class RemedialMeasuresAction extends BaseAction {
  static get actionId() { return 'get_remedial_measures'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Remedial Measures'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendRemedialGuide();
      return { success: true, type: 'remedial_measures' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendRemedialGuide() {
    const guide = '🛠️ *Vedic Remedial Measures - Karmic Healing Tools*\n\n' +
      'Vedic astrology offers precise spiritual technologies to harmonize challenging planetary influences. Rather than suffering planetary maleficence, we can practice specific remedies to transform negative karma into positive outcomes.\n\n' +
      '*🌟 REMEDIAL METHODS BY PLANET:*\n' +
      '• **Sun (Confidence, Father):** Wear ruby, donate wheat, respect elders\n' +
      '• **Moon (Emotions, Mother):** Wear pearl, cow milk donations, ocean visits\n' +
      '• **Mars (Energy, Brothers):** Red coral, vegetarian food donation, read Hanuman Chalisa\n' +
      '• **Mercury (Intelligence, Trade):** Green emerald, siddhi ghee donations, Saraswati puja\n' +
      '• **Jupiter (Wisdom, Children):** Yellow sapphire, 14-day fasts, dharma preaching\n' +
      '• **Venus (Love, Arts):** Diamond, white clothes only, Lakshmi worship\n' +
      '• **Saturn (Discipline, Elders):** Blue sapphire, sesame oil donations, Shani puja\n' +
      '• **Rahu (Illusion, Ambition):** Hessonite garnet, abandon fear-based actions\n' +
      '• **Ketu (Spirituality, Liberation):** Cat\'s eye, live in ashram, chanting mantras\n\n' +
      '*📿 MANTRA HEALING POWERS:*\n' +
      '• Basic healing: Chant natural lord\'s mantra (as above)\n' +
      '• Deep transformation: Beej mantras with mala meditation\n' +
      '• Protection: Kavach (armor) mantras daily\n' +
      '• Abundance: Vishnu Gayatri for harmony\n' +
      '• Peace: Shiva mantras for dissolution\n' +
      '• Power: Durga Chalisa for victory over obstacles\n\n' +
      '*🞋 YAGYA & FIRE CEREMONIES:*\n' +
      '• Planetary peace: Chanting 108 names while offering ghee\n' +
      '• Ancestral healing: Narayan Bali sacrifice for debt release\n' +
      '• Marriage karma: Shiva Parvati yagna for union blessing\n' +
      '• Health restoration: Dhanvantari puja to remove disease\n' +
      '• Prosperity: Lakshmi Kubera mantra with yellow flower offerings\n\n' +
      '*🍴 DIETARY & LIFESTYLE REMEDIES:*\n' +
      '• **Yellow foods:** Rice, bananas, honey for Jupiter strengthening\n' +
      '• **White foods:** Milk, sugar for Moon energy balance\n' +
      '• **Sour foods:** Lemon, pickle for Venus harmony\n' +
      '• **Sesame oil:** Abhyanga massage for Saturn relief\n' +
      '• **Cow ghee:** Offerings and intake for purity\n' +
      '• **Honey:** Natural sweetener for balanced fire energy\n\n' +
      '*🏛️ CHARITY & SERVICE (D AAS):*\n' +
      '• Knowledge sharing: Dhan (wealth) through teaching\n' +
      '• Food donations: Anna (food) for nutrition karma\n' +
      '• Temple service: Help maintenance of holy places\n' +
      '• Animal care: Cow protection for lunar health\n' +
      '• Education support: Child literacy help for mercury\n' +
      '• Elder care: Respect and support Saturn lessons\n\n' +
      '*🌅 DAILY ROUTINE ADJUSTMENTS:*\n' +
      '• Sunrise: Surya Namaskar and morning prayers\n' +
      '• Midday: Mantra meditation and charity\n' +
      '• Evening: Temple visits and gratitude practices\n' +
      '• Night: Oil massage and early rest\n' +
      '• Fasting: Ekadashi for soul purification\n' +
      '• Gardening: Vegetable growing for earth connection\n\n' +
      '*✨ ASHTRONOMIC SHOULD BE PRACTICED:*\n' +
      'Don\'t practice mechanical rituals blindly. True remedies transform consciousness. Genuine healing comes from understanding planetary influences as divine teachers guiding soul evolution.\n\n' +
      '*◓ The path of karma correction requires sincerity. What seems like remedy is actually the mechanism of grace transforming destiny.*';

    const userLanguage = this.getUserLanguage();
    const buttons = [{
      id: 'get_mantras',
      titleKey: 'buttons.mantras',
      title: '🪬 Mantras'
    }, {
      id: 'get_gemstones',
      titleKey: 'buttons.gemstones',
      title: '💎 Gemstones'
    }, {
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
      description: 'Provide Vedic remedial measures for planetary balancing and karmic healing',
      keywords: ['remedial measures', 'vedic remedies', 'karma correction', 'planetary healing', 'spiritual remedies'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 1800000
    };
  }
}

module.exports = RemedialMeasuresAction;
