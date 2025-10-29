const BaseAction = require('../BaseAction');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');

class RelationshipReadingsAction extends BaseAction {
  static get actionId() { return 'start_family_astrology_flow'; }

  async execute() {
    try {
      if (!(await this.validateUserProfile('Family Astrology'))) {
        await this.sendIncompleteProfileMessage();
        return { success: false, reason: 'incomplete_profile' };
      }

      await this.sendRelationshipReadings();
      return { success: true, type: 'relationship_readings' };

    } catch (error) {
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendRelationshipReadings() {
    const analysis = `👪 *Family & Relationship Astrology*\n\n` +
      `Discover the cosmic bonds that connect families and loved ones through astrological synastry and composite charts.\n\n` +
      `*❤️ RELATIONSHIP ASTROLOGY COVERS:*\n` +
      `• **Composite Charts** - Your relationship as an entity\n` +
      `• **Synastry Analysis** - How your planets interact\n` +
      `• **Family Dynamics** - Karmic family patterns\n` +
      `• **Soul Contracts** - Life lessons with relatives\n` +
      `• **Timing Charts** - Best times for family decisions\n\n` +
      `*👨‍👩‍👧 ASTROLOGY FOR EVERY BOND:*\n` +
      `• Romantic partnerships and marriages\n` +
      `• Parent-child relationships and karma\n` +
      `• Sibling connections and rivalry\n` +
      `• Extended family dynamics\n` +
      `• Friendship and soul partnerships\n\n` +
      `*Your birth chart holds the key to understanding every relationship in your life.*`;

    const userLanguage = this.getUserLanguage();
    const buttons = [
      {
        id: 'initiate_compatibility_flow',
        titleKey: 'buttons.compatibility',
        title: '💕 Compatibility'
      },
      {
        id: 'show_main_menu',
        titleKey: 'buttons.main_menu',
        title: '🏠 Main Menu'
      }
    ];

    const message = ResponseBuilder.buildInteractiveButtonMessage(
      this.phoneNumber, analysis, buttons, userLanguage
    );

    await sendMessage(message.to, message.interactive, 'interactive');
  }

  static getMetadata() {
    return {
      id: this.actionId,
      description: 'Analyze family and relationship astrology patterns',
      keywords: ['family', 'relationships', 'family astrology', 'relationships', 'synastry'],
      category: 'relationships',
      subscriptionRequired: true,
      cooldown: 7200000
    };
  }
}

module.exports = RelationshipReadingsAction;