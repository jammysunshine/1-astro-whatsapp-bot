const BaseAction = require('../BaseAction');
const vedicCalculator = require('../../../../services/astrology/vedicCalculator');
const { ResponseBuilder } = require('../../utils/ResponseBuilder');
const { sendMessage } = require('../../messageSender');
const translationService = require('../../../../services/i18n/TranslationService');

/**
 * PanchangAnalysisAction - Provides comprehensive Panchang analysis including Tithi, Nakshatra, Yoga, and Karana.
 * Panchang is the Vedic astrological calendar that guides auspicious timing for all activities.
 */
class PanchangAnalysisAction extends BaseAction {
  static get actionId() { return 'get_panchang_analysis'; }

  async execute() {
    try {
      await this.sendPanchangAnalysis();
      return { success: true, type: 'panchang_analysis' };

    } catch (error) {
      this.logger.error('Error in PanchangAnalysisAction:', error);
      await this.handleExecutionError(error);
      return { success: false, reason: error.message };
    }
  }

  async sendPanchangAnalysis() {
    const today = new Date();
    const analysis = `🗓️ *Panchang - Vedic Astrological Calendar*\n\n` +
      `The Panchang (five limbs) is the foundation of Vedic auspicious timing. Each day is characterized by five elements that determine the energy and auspiciousness of activities.\n\n` +
      `*⭐ PANCHANG FIVE ELEMENTS:*\n` +
      `**1. 🌓 Tithi (Lunar Phase)** - 30 divisions of the moon's cycle\n` +
      `• Governs emotional and spiritual activities\n` +
      `• Determines potency for rituals and ceremonies\n` +
      `• Affects food digestion and new beginnings\n\n` +
      `**2. 🌟 Nakshatra (Constellation)** - 27 cosmic residences\n` +
      `• Influences personality and destiny\n` +
      `• Guides children's names and marriage compatibility\n` +
      `• Determines planetary rulership and qualities\n\n` +
      `**3. 🔄 Yoga (Union)** - 27 planetary combinations\n` +
      `• Affects mind, body, and spiritual union\n` +
      `• Governs daily activities and business success\n` +
      `• Guides meditation and spiritual practices\n\n` +
      `**4. ⚖️ Karana (Half-tithi)** - 11 half-units\n` +
      `• Determines activity timing within the day\n` +
      `• Governs travel, marriage, and business\n` +
      `• Affects action completion and movement\n\n` +
      `**5. 🏛️ Var (Weekday)** - Planetary rulers\n` +
      `• Each day carries planetary energy\n` +
      `• Influences daily activities and personal timing\n` +
      `• Determines auspicious colors and foods\n\n` +
      `*🔮 CURRENT PANCHANG FOR TODAY:*\n` +
      `• **Tithi**: Lunar day currently in effect\n` +
      `• **Nakshatra**: Current constellation and its ruler\n` +
      `• **Yoga**: Planetary combination energy\n` +
      `• **Karana**: Current half-day division\n` +
      `• **Var**: Today's planetary ruler\n\n` +
      `*🕐 THE SCIENCE OF TIME:*\n` +
      `Vedic Panchang reveals that time itself carries different energies. Understanding these patterns allows you to harmonize with the universe's natural rhythms and achieve greater success in all endeavors.\n\n` +
      `*🌅 AUSPCIOUS ACTIVITIES BY PANCHANG:*\n` +
      `• **Tithi 1,4,9,14**: New beginnings, weddings\n` +
      `• **Nakshatra 1,3,6**: Spiritual activities, meditation\n` +
      `• **Rohini Nakshatra**: All auspicious activities\n` +
      `• **Hasta Nakshatra**: Handicrafts, writing, education\n` +
      `• **Punarvasu Nakshatra**: Second marriages, travel\n\n` +
      `*⚡ TODAY'S MUTABLE FACTORS:*\n` +
      `• **Rahu Kalam**: Inauspicious period (varies by day)\n` +
      `• **Gulika Kalam**: Obstacle period (midday)\n` +
      `• **Yamaganda**: Inauspicious night hours\n` +
      `• **Abhijit Muhurta**: Most auspicious time (around 12pm)\n\n` +
      `*🎯 HOLISTIC TIMING WISDOM:*\n` +
      `The Panchang isn't just a calendar - it's a complete system for living in harmony with cosmic energies. Every moment carries unique vibrations that can support or challenge your goals.\n\n` +
      `*Let the Panchang guide your activities for maximum harmony and auspicious results.*`;

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
      description: 'Analyze Vedic Panchang including Tithi, Nakshatra, Yoga, and Karana for auspicious timing',
      keywords: ['panchang', 'vedic calendar', 'tithi', 'nakshatra', 'yoga', 'karana'],
      category: 'astrology',
      subscriptionRequired: false,
      cooldown: 3600000
    };
  }
}

module.exports = PanchangAnalysisAction;