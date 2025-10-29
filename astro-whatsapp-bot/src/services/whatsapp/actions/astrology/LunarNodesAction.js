const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class LunarNodesAction extends BaseAction {
  static get actionId() { return 'get_lunar_nodes_analysis'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Lunar Nodes'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendLunarNodesAnalysis();
      return { success: true, type: 'lunar_nodes' };
    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendLunarNodesAnalysis() {
    const analysis = '🌑 *Lunar Nodes - Karmic Portal to Your Destiny*\n\n' +
      'The Lunar Nodes (Rahu and Ketu) represent the soul\'s karmic crossroads - where past and future lives meet. The North Node (Rahu) points to your life\'s purpose, while the South Node (Ketu) indicates what you must release from past incarnation patterns.\n\n' +
      '*🌟 NORTH NODE (RAHU) - SOUL\'S LIFE PURPOSE:*\n' +
      '• The direction your soul is evolving toward\n' +
      '• New qualities to develop in this lifetime\n' +
      '• Life lessons that bring fulfillment\n' +
      '• The hero\'s journey of your soul\n' +
      '• What makes you feel most alive and purposeful\n\n' +
      '*🌑 SOUTH NODE (KETU) - PAST LIFE PATTERNS:*\n' +
      '• Habits and patterns to release\n' +
      '• Familiar skills that may keep you stuck\n' +
      '• Karmic lessons already learned\n' +
      '• Comfort zones that prevent growth\n' +
      '• The quality your soul no longer needs to develop\n\n' +
      '*🔄 NODES IN YOUR CHART:*\n' +
      '• **North Node House:** Area of life where karma calls you\n' +
      '• **South Node House:** Past life focus to release\n' +
      '• **North Node Sign:** How to approach new development\n' +
      '• **South Node Sign:** How you previously operated\n\n' +
      '*⚡ PLANETARY CONJUNCTIONS:*\n' +
      '• Planets conjunct North Node: Accelerated life purpose\n' +
      '• Planets conjunct South Node: Karmic patterns to transcend\n' +
      '• Aspect patterns reveal the complexity of your soul\'s journey\n\n' +
      '*🎯 NODE LIFE PURPOSE CLARITY:*\n' +
      '• **Aries North Node:** Learning independence and self-discovery\n' +
      '• **Cancer North Node:** Developing emotional wisdom and nurturing\n' +
      '• **Capricorn North Node:** Mastering discipline and leadership\n' +
      '• **Adventurous Aries-Cancer Node:** Self-care through independence\n' +
      '• **Housing Taurus-Scorpio Node:** Transform personal wealth\n' +
      '• **Communication Gemini-Sagittarius Node:** World view through words\n\n' +
      '*✨ The Lunar Nodes reveal your soul\'s GPS coordinates - where you\'ve been and where your highest destiny calls you to go.*';

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
      description: 'Analyze lunar nodes (Rahu/Ketu) for soul purpose and karmic evolution',
      keywords: ['lunar nodes', 'north node', 'south node', 'rahu', 'ketu', 'karmic purpose'],
      category: 'astrology',
      subscriptionRequired: true,
      cooldown: 3600000
    };
  }
}

module.exports = LunarNodesAction;
