const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class TraditionalHoraryAction extends BaseAction {
  static get actionId() { return 'get_traditional_horary'; }

  async execute() {
    try {
      await this.sendTraditionalHoraryGuide();
      return { success: true, type: 'traditional_horary' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendTraditionalHoraryGuide() {
    const guide = `⏰ *Traditional Horary Astrology - Divine Question Timing*\n\n` +
      `Horary astrology answers specific questions by casting a chart at the exact moment the question is received. This ancient technique provides definite yes/no answers and reveals hidden circumstances surrounding life's uncertainties.\n\n` +
      `*📜 TRADITIONAL HORARY PRINCIPLES:*\n` +
      `• Cast chart at precise question-received time\n` +
      `• Question ruler = Planet ruling the matter\n` +
      `• House system reveals life's departments\n` +
      `• Planetary aspects show the flow of events\n` +
      `• Moon's condition indicates outcome timing\n\n` +
      `*🎯 HORARY APPLICATIONS:*\n` +
      `• Will I get this job/investment/business?\n` +
      `• Should I move/have surgery/travel now?\n` +
      `• What is the outcome of legal matter?\n` +
      `• Will relationship develop into marriage?\n` +
      `• When will I receive money/find missing item?\n` +
      `• Is this partnership/buy trustworthy?\n\n` +
      `*🏛️ HOUSE MEANINGS IN HORARY:*\n` +
      `• **1st House:** Questioner, their appearance/attitude\n` +
      `• **2nd House:** Money, resources, possessions\n` +
      `• **3rd House:** Communication, siblings, neighbors\n` +
      `• **4th House:** Home, family, property, end of matter\n` +
      `• **7th House:** Partner, opponent, legal affairs\n` +
      `• **10th House:** Career, reputation, authority figures\n` +
      `• **12th House:** Hidden things, hospitalization, secrets\n\n` +
      `*⚡ HORARY INDICATIONS:*\n` +
      `• Moon applying to question ruler = YES/positive\n` +
      `• Benefics strong = Success likely\n` +
      `• House lord in angular houses = Quick resolution\n` +
      `• Combustion aspects = Situation unclear\n` +
      `• Retrograde planets = Delays/delays\n\n` +
      `*🎭 TRADITIONAL DIFFERENCES:*\n` +
      `*Unlike modern astrology, horary has strict rules:*\n` +
      `• Must cast at exact query moment\n` +
      `• Never answer trivial/questions you don't care about\n` +
      `• Question not purely astrological\n` +
      `• Casting forbidden in certain situations\n\n` +
      `*🔮 THE SCIENCE OF TIMING:*\n` +
      `Horary astrology proves that time itself carries answers. When the universe asks you to wait for the chart, your question receives a meaningful reply at the perfect moment.\n\n` +
      `*Perfect questions deserve perfect timing.* ✨`;

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
      description: 'Cast horary charts for specific questions at moment of asking',
      keywords: ['horary astrology', 'question charts', 'astrological questions', 'horary predictions'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 1800000
    };
  }
}

module.exports = TraditionalHoraryAction;